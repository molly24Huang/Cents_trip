import pandas as pd
from math import sin, cos, sqrt, asin, radians
import csv

def cal_dist(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    distance = 6378.137 * c
    return distance

food = '/Users/molly/Documents/NUS/2ndSemester/Projects/CS5224/Cents_trip/dataset/food.csv'
airbnb = '/Users/molly/Documents/NUS/2ndSemester/Projects/CS5224/Cents_trip/dataset/airbnb.csv'

food_df = pd.read_csv(food)
airbnb_df = pd.read_csv(airbnb)

food_data = food_df.iloc[:,[0,6,7]]
airbnb_data = airbnb_df.iloc[:,[0,2,3]]
foodid = food_data['FOODID'].as_matrix()
#print(type(foodid[0]))
lat_food = food_data['LATITUDE'].as_matrix()
lng_food = food_data['LONGITUDE'].as_matrix()

roomid = airbnb_data['ROOMID'].as_matrix()
#print(type(roomid[0]))
lat_airbnb = airbnb_data['LATITUDE'].as_matrix()
lng_airbnb = airbnb_data['LONGITUDE'].as_matrix()

distances = []

for i in range(len(airbnb_data)):
    for k in range(len(food_data)):
        distance = cal_dist(lng_airbnb[i], lat_airbnb[i], lng_food[k], lat_food[k])
        # print(distance)
        distances.append(distance)

with open('bnb_food.csv', 'w') as fout:
    headers = ['ROOMID', 'FOODID', 'DISTANCE']
    writer = csv.writer(fout)
    writer.writerow(headers)

    for i in range(len(airbnb_data)):
        for j in range(len(food_data)):
            this_roomid = str(roomid[i])
            this_foodid = str(foodid[j])
            this_distance = str(distances[(i + 1)* j])
            writer.writerow([this_roomid, this_foodid, this_distance])
            
