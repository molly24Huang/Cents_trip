library(ggplot2)
library(ibmdbR)
mycon <- idaConnect("BLUDB","","")
idaInit(mycon)

data_airbnb <- as.data.frame(ida.data.frame('"DASH12869"."AIRBNB"')[ ,c('LATITUDE', 'LONGITUDE', 'NAME', 'PRICE', 'RATING', 'ROOMID')])

data_MRT <- as.data.frame(ida.data.frame('"DASH12869"."MRT"')[ ,c('LATITUDE', 'LONGITUDE', 'NAME')])

data_attractions <- as.data.frame(ida.data.frame('"DASH12869"."TOURISM_ATTRACTIONS"')[ ,c('CATEGORY', 'LATITUDE', 'LONGITUDE', 'NAME', 'POPULARITY', 'RATING')])

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


# Analysis for dataset  
# Cost Performance of Airbnb (price vs ratings and distances (attractions and MRT)) 

# ######
# weight regression
# price ~ ratings + distances_attractions + distances_MRT ## + distances_foodcourt
# wi 反比于 sigmai^2
# ######


# calculate distance function
# calculate distance by latitude and longitude
earth_radius = 6378.137
pi = 3.141592653
# rad <- function(d){
#   return(d * pi / 180)
# }
  
getDistance <- function(latitude1, longitude1, latitude2, longitude2){
  lat1 = as.numeric(latitude1)
  lng1 = as.numeric(longitude1)
  lat2 = as.numeric(latitude2)
  lng2 = as.numeric(longitude2)
  radLat1 = lat1 * pi / 180
  radLat2 = lat2 * pi / 180
  radLng1 = lng1 * pi / 180
  radLng2 = lng2 * pi / 180
  a = radLat1 - radLat2   
  b = radLng1 - radLng2
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
    lat_air_i = data_airbnb[i,"LATITUDE"]
    lng_air_i = data_airbnb[i,"LONGITUDE"]
    dist_cal = 0
    for(j in 1 : nrow(data_for_cal)){
      lat_j = data_for_cal[j,"LATITUDE"]
      lng_j = data_for_cal[j,"LONGITUDE"]
      dist_cal_j = getDistance(lat_air_i, lng_air_i, lat_j, lng_j)
      dist_cal = dist_cal + dist_cal_j
    }
    dist_results = c(dist_results, dist_cal)
  }
  return(dist_results)
}
# ######
# ######

# calculate distance between airbnb and nearest MRT
calculate_dist_MRT <- function(data_airbnb, data_MRT){
  dist_MRT = c()
  for(i in 1:nrow(data_airbnb)){
    dist_MRT_i = c()
    lat_air_i = data_airbnb[i,"LATITUDE"]
    lng_air_i = data_airbnb[i,"LONGITUDE"]
    for (j in 1:nrow(data_MRT)){
      lat_j = data_MRT[j,"LATITUDE"]
      lng_j = data_MRT[j,"LONGITUDE"]
      temp = getDistance(lat_air_i,lng_air_i,lat_j,lng_j)
      dist_MRT_i = c(dist_MRT_i,temp)
    }
    dist_MRT_i = min(dist_MRT_i)
    dist_MRT = c(dist_MRT,dist_MRT_i)
  }
  return(dist_MRT)
}

# pick out attractions with high recommendation
rec_attractions = data_attractions[which(data_attractions$POPULARITY >= 1),]
# calculate distance
dist_attractions = calculate_dist(data_airbnb, rec_attractions)
dist_MRT = calculate_dist_MRT(data_airbnb, data_MRT)
# combind dist_attractions and dist_MRT
data_airbnb = data.frame(data_airbnb, dist_attractions = dist_attractions)
data_airbnb = data.frame(data_airbnb, dist_MRT = dist_MRT)

# ###
name = data_airbnb[,"ROOMID"]
price = data_airbnb[,"PRICE"]
rating = data_airbnb[,"RATING"]
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
# (Intercept)      -1.14619   94.88489  -0.012   0.9904  
# rating           37.67590   20.00109   1.884   0.0606 .
# dist_attractions -0.21220    0.08671  -2.447   0.0150 *
# dist_MRT         -1.93690   15.46080  -0.125   0.9004  
# ---
# Signif. codes:  0 ‘***’ 0.001 ‘**’ 0.01 ‘*’ 0.05 ‘.’ 0.1 ‘ ’ 1


# dist_MRT is not significant, remove it
fit3 = lm(price ~ rating + dist_attractions, data = data_airbnb)
# summary(fit3)
wts2 = 1 / fitted(lm(abs(residuals(fit3)) ~ fitted(fit3)))^2
fit4 = lm(price ~ rating + dist_attractions,
          data = data_airbnb, weights = wts2)
summary(fit4)

# ### fit4 is the final weight regression model

# calculate prediction
new_airbnb = data_airbnb[c("RATING", "dist_attractions")]
price_predict <- predict.lm(fit4, newdata = new_airbnb, type = "response")

# calculate price - price_predict, 
# measure costPerformance by price above/less than intrisic value
# if < 0, the airbnb has a price lower than its value
# sort, recommend
delta_price = as.numeric(price) - as.numeric(price_predict)
costPerformance = as.numeric(delta_price) / as.numeric(price)

data_airbnb = data.frame(data_airbnb, intrisic_value = price_predict, 
                         costPerformance = costPerformance, id = 1:nrow(data_airbnb))
sorted_airbnb = data_airbnb[order(data_airbnb$costPerformance), c("ROOMID", "NAME", "PRICE", "costPerformance")]
#show sorted airbnb
sorted_airbnb
# plot price and intrisic value
ggplot(data=data_airbnb,aes(x=id))+geom_line(data=data_airbnb,aes(y=price),colour="blue")+geom_line(data=data_airbnb,aes(y=intrisic_value),colour="red")
