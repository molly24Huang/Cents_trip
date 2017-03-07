# #######
# Dataset:
# Attractions data (KML to CSV) 
# (name, postcode (location), ticket price, description, opening hours, category, ratings)
# Airbnb 
# (name, image, price, rating, location)
# Hawker center 
# (name, location, price)
# Food court
# (name, location, price)
# ######

# dictionary
# e_airbnb <- new.env()
# e_airbnb$id <- 10
# ls(e_airbnb)
# e_airbnb$id

# Analysis for dataset	
# Cost Performance of Airbnb (price vs ratings and distances (attractions and MRT)) 

# ######
# weight regression
# price ~ ratings + distances_attractions + distances_MRT ## + distances_foodcourt
# wi 反比于 sigmai^2
# ######

# load datasets
setwd('/Users/ted/Documents/NUS/Cloud Computing/Project')
f_airbnb = read.csv('airbnb.csv')
f_attractions = read.csv('TOURISM_ATTRACTIONS2.csv')
f_MRT = read.csv('mrt.csv')
# create data
# data column: name, price，ratings + distances_attractions + distances_MRT ## + distances_foodcourt
# data_airbnb =
data_airbnb = f_airbnb[,c("roomID","price","rating","Latitude","Longitude")]
data_attractions = f_attractions[,c("Name","Longitude","Latitude","Category","Index.of.recommendation")]
data_MRT = f_MRT[,c("name","Latitude","Longitude")]

# calculate distance function
# calculate distance by latitude and longitude
earth_radius = 6378.137
pi = 3.141592653
rad <- function(d){
  return(d * pi / 180)
}
  
getDistance <- function(lat1, lng1, lat2, lng2){
  radLat1 = rad(lat1)
  radLat2 = rad(lat2)   
  a = radLat1 - radLat2   
  b = rad(lng1) - rad(lng2)
  s = 2 * asin(sqrt(sin(a/2)^2 + cos(radLat1)* cos(radLat2) * sin(b/2)^2));   
  s = s * earth_radius;   
  s = round(s * 10000) / 10000;   
  return(s) 
}

# #######
# calculate distances between airbnb and data_for_calculation function
calculate_dist <- function(data_airbnb, data_for_cal){
  dist_results = c()
  for(i in 1 : nrow(data_airbnb)){
    lat_air_i = data_airbnb[i,"Latitude"]
    lng_air_i = data_airbnb[i,"Longitude"]
    dist_cal = 0
    for(j in 1 : nrow(data_for_cal)){
      lat_j = data_for_cal[j,"Latitude"]
      lng_j = data_for_cal[j,"Longitude"]
      dist_cal_j = getDistance(lat1 = lat_air_i, lng1 = lng_air_i,
                                lat2 = lat_j, lng2 = lng_j)
      dist_cal = dist_cal + dist_cal_j
    }
    dist_results = c(dist_results, dist_cal)
  }
  return(dist_results)
}
# ######

# calculate distance between airbnb and nearest MRT
calculate_dist_MRT <- function(data_airbnb, data_MRT){
  dist_MRT = c()
  for(i in 1:nrow(data_airbnb)){
    dist_MRT_i = c()
    lat_air_i = data_airbnb[i,"Latitude"]
    lng_air_i = data_airbnb[i,"Longitude"]
    for (j in 1:nrow(data_MRT)){
      lat_j = data_MRT[j,"Latitude"]
      lng_j = data_MRT[j,"Longitude"]
      temp = getDistance(lat_air_i,lng_air_i,lat_j,lng_j)
      dist_MRT_i = c(dist_MRT_i,temp)
    }
    dist_MRT_i = min(dist_MRT_i)
    dist_MRT = c(dist_MRT,dist_MRT_i)
  }
  return(dist_MRT)
}

# pick out attractions with high recommendation
rec_attractions = data_attractions[which(data_attractions$Index.of.recommendation >= 4),]
# calculate distance
dist_attractions = calculate_dist(data_airbnb, rec_attractions)
dist_MRT = calculate_dist_MRT(data_airbnb, data_MRT)
# combind dist_attractions and dist_MRT
data_airbnb = data.frame(data_airbnb, dist_attractions = dist_attractions)
data_airbnb = data.frame(data_airbnb, dist_MRT = dist_MRT)

# ###
name = data_airbnb[,"roomID"]
price = data_airbnb[,"price"]
rating = data_airbnb[,"rating"]
dist_attractions = data_airbnb[,"dist_attractions"]
dist_MRT = data_airbnb[,"dist_MRT"]

# weight regression (nonconstant variance and weighted least squares)
# using residuals 1/sigma^2 as weights
# first fit ols, then fit wlse
fit1 = lm(price ~ rating + dist_attractions + dist_MRT,
         data = data_airbnb)
# summary(fit1)
# using fitted value of residuals as sigma, then apply weight = 1/sigma^2
wts = 1 / fitted(lm(abs(residuals(fit1)) ~ fitted(fit1)))^2
fit2 = lm(price ~ rating + dist_attractions + dist_MRT,
          data = data_airbnb, weights = wts)
summary(fit2)
# Coefficients:
#   Estimate Std. Error t value Pr(>|t|)   
# (Intercept)      -67.24878   95.85386  -0.702  0.48349   
# rating            52.44992   20.38987   2.572  0.01059 * 
#   dist_attractions  -0.27432    0.09288  -2.954  0.00339 **
#   dist_MRT           5.04505   14.90553   0.338  0.73525   
# ---

# dist_MRT is not significant, remove it
fit3 = lm(price ~ rating + dist_attractions, data = data_airbnb)
# summary(fit3)
wts2 = 1 / fitted(lm(abs(residuals(fit3)) ~ fitted(fit3)))^2
fit4 = lm(price ~ rating + dist_attractions,
          data = data_airbnb, weights = wts2)
summary(fit4)

# ### fit4 is the final weight regression model

# calculate prediction
new_airbnb = data_airbnb[c("rating", "dist_attractions")]
price_predict <- predict.lm(fit4, newdata = new_airbnb, type = "response")

# calculate price - price_predict, 
# measure costPerformance by price above/less than intrisic value
# if < 0, the airbnb has a price lower than its value
# sort, recommend
delta_price = price - price_predict
costPerformance = delta_price / price

data_airbnb = data.frame(data_airbnb, intrisic_value = price_predict, costPerformance = costPerformance)
data_airbnb[order(data_airbnb$costPerformance), c("roomID","price","costPerformance")]
