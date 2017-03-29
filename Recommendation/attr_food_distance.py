import pandas as pd
from math import sin, cos, sqrt, asin, radians
#import ibm_db

def cal_dist(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    distance = 6378.137 * c
    return distance

food = 'D:\\Dropbox\\Mcomp\\CS5224\\Project\\Cents_trip-master\\dataset\\food.csv'
tourism_attractions = 'D:\\Dropbox\\Mcomp\\CS5224\\Project\\Cents_trip-master\\dataset\\TOURISM_ATTRACTIONS.csv'

food_df = pd.read_csv(food)
tourism_attractions_df = pd.read_csv(tourism_attractions)

food_data = food_df.iloc[:,[0,6,7]]
tourism_attractions_data = tourism_attractions_df.iloc[:,[0,2,3]]
foodid = food_data['FOODID'].as_matrix()
#print(len(roomid))
lat_food = food_data['LATITUDE'].as_matrix()
lng_food = food_data['LONGITUDE'].as_matrix()

attractionid = tourism_attractions_data['ATTRACTIONID'].as_matrix()
#print(attractionid)
lat_attractions = tourism_attractions_data['LATITUDE'].as_matrix()
lng_attractions = tourism_attractions_data['LONGITUDE'].as_matrix()

distances = []
# conn = ibm_db.connect("DATABASE=BLUDB;HOSTNAME=dashdb-entry-yp-dal09-09.services.dal.bluemix.net;\
# 	PORT=50000;PROTOCOL=TCPIP;UID=dash9787;\
#                 PWD=X_c03EeYTe#u;", "", "")

for i in range(len(tourism_attractions_data)):
    for k in range(len(food_data)):
        distance = cal_dist(lng_attractions[i], lat_attractions[i], lng_food[k], lat_food[k])
        # print(distance)
        distances.append(distance)

output = open('rating.txt','w')
k = 1
for i in range(len(tourism_attractions_data)):
    for j in range(len(food_data)):
        this_attractid = str(attractionid[i])
        this_foodid = str(foodid[j])
        this_distance = str(distances[(i + 1)* j])
        output.write(this_attractid)
        output.write('\t')
        output.write(this_foodid)
        output.write('\t')
        output.write(this_distance)
        output.write('\n')

    
output.close()



#print(len(distances))
# k = 1
# for i in range(len(tourism_attractions_data)):
#     for j in range(len(food_data)):
#         this_attractid = attractionid[i]
#         this_foodid = foodid[j]
#         this_distance = distances[(i + 1)* j]
#         sql = r'INSERT INTO DISTANCE_FOOD_ATTRACTION(ATTRACTIONID, FOODID, DISTANCE) VALUES({attractionID}, {foodID}, {distance})'.format(
#             attractionID=this_attractid, foodID=this_foodid, distance=this_distance
#         )
#         print(sql, '>>')
            
#         try:
#             stmt = ibm_db.exec_immediate(conn, sql)
#         except Exception as e:
#             print(e)
#             print("Inserting couldn't be completed.")
#             ibm_db.rollback(conn)
#         else:
#             ibm_db.commit(conn)
#             print("Inserting complete.")
#             print('-----' + str(k) + '-----')
#             k += 1
# # 
            
