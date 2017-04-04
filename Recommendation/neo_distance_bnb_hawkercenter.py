import requests
import time


bnb_info = []
hawker_center_info = []
with file('./airbnb.csv') as fin_airbnb:
    for line in fin_airbnb:
        line = line.strip()
        info = line.split(',')
        bnb_info.append({
            'ROOMID': int( info[0] ),
            'LAT': float( info[2] ),
            'LNG': float( info[3] )
            })

with file('./food.csv') as fin_food:
    for line in fin_food:
        line = line.strip()
        info = line.split(',')
        hawker_center_info.append({
            "FOODID": int( info[0] ),
            "LAT": float( info[-3] ),
            "LNG": float( info[-2] )
            })

url = 'http://maps.googleapis.com/maps/api/distancematrix/json'
headers = {
        'Content-Type': 'application/json'
        }
origins = []
destinations = []
food_ids=[]
room_ids=[]


already = {}
with file('neo_distance_bnb_hawkercenter.csv') as __fin:
    for line in __fin:
        line=line.strip()
        line = line.split(',')
        already[(int(line[0]), int(line[1]))] = True



print already
count_per_request = 10
with file('neo_distance_bnb_hawkercenter.csv', 'a') as fout:
    for idx_room, room in enumerate( bnb_info ):
        for idx_food, food in enumerate( hawker_center_info ):
            if(idx_food + idx_room) % count_per_request  ==0:
                room_ids = []
                food_ids = []
                origins = []
                destinations = []
            room_ids.append(room['ROOMID'])
            food_ids.append(food['FOODID'])
            if already.get((int(room['ROOMID']), int(food['FOODID'])), False):
                continue
            origins.append('{lat},{lng}'.format(lat=room['LAT'], lng=room['LNG']))
            destinations.append('{lat},{lng}'.format(lat=food['LAT'], lng=food['LNG']))

            if(len(origins)==count_per_request):
                sleep_time = 2
                while True:
                         response = requests.get(url, params={
                             'origins': '|'.join(origins),
                             'destinations': '|'.join(destinations)
                             },
                             headers=headers)
                         print origins, destinations
                         response = response.json()
                         if response['status'] == 'OK':
                            break
                         else:
                            time.sleep(sleep_time)
                            sleep_time *= 2
                            print 'sleeping,%s seconds '% sleep_time
                for index, element in enumerate( response['rows'][0]['elements'] ):
                    distance = element['distance']['value']
                    distance /= 1000.0
                    fout.write('{ROOMID},{FOODID},{DISTANCE}\n'.format(ROOMID=room_ids[index], FOODID=food_ids[index], DISTANCE=distance))
                time.sleep(5)



