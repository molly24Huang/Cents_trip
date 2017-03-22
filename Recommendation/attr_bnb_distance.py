import pandas as pd
from math import sin, cos, sqrt, asin, radians
import ibm_db

def cal_dist(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    distance = 6373 * c
    return distance

airbnb = '/Users/molly/Documents/NUS/2ndSemester/Projects/CS5224/Cents_trip/dataset/airbnb.csv'
tourism_attractions = '/Users/molly/Documents/NUS/2ndSemester/Projects/CS5224/Cents_trip/dataset/TOURISM_ATTRACTIONS.csv'

airbnb_df = pd.read_csv(airbnb)
tourism_attractions_df = pd.read_csv(tourism_attractions)

airbnb_data = airbnb_df.iloc[:,[0,2,3]]
tourism_attractions_data = tourism_attractions_df.iloc[:,[0,2,3]]
roomid = airbnb_data['ROOMID'].as_matrix()
#print(len(roomid))
lat_airbnb = airbnb_data['LATITUDE'].as_matrix()
lng_airbnb = airbnb_data['LONGITUDE'].as_matrix()

attractionid = tourism_attractions_data['ATTRACTIONID'].as_matrix()
#print(attractionid)
lat_attractions = tourism_attractions_data['LATITUDE'].as_matrix()
lng_attractions = tourism_attractions_data['LONGITUDE'].as_matrix()

distances = []
conn = ibm_db.connect("DATABASE=BLUDB;HOSTNAME=dashdb-entry-yp-dal09-09.services.dal.bluemix.net;\
	PORT=50000;PROTOCOL=TCPIP;UID=dash9787;\
                PWD=X_c03EeYTe#u;", "", "")

for i in range(len(tourism_attractions_data)):
    for k in range(len(airbnb_data)):
        distance = cal_dist(lng_attractions[i], lat_attractions[i], lng_airbnb[k], lat_airbnb[k])
        # print(distance)
        distances.append(distance)

#print(len(distances))
k = 1
for i in range(len(tourism_attractions_data)):
    for j in range(len(airbnb_data)):
        this_attractid = attractionid[i]
        this_nameid = roomid[j]
        this_distance = distances[(i + 1)* j]
        sql = r'INSERT INTO DISTANCE(ATTRACTIONID, ROOMID, DISTANCE) VALUES({attractionID}, {nameID}, {distance})'.format(
            attractionID=this_attractid, nameID=this_nameid, distance=this_distance
        )
        print(sql, '>>')
            
        try:
            stmt = ibm_db.exec_immediate(conn, sql)
        except Exception as e:
            print(e)
            print("Inserting couldn't be completed.")
            ibm_db.rollback(conn)
        else:
            ibm_db.commit(conn)
            print("Inserting complete.")
            print('-----' + str(k) + '-----')
            k += 1

            
