import requests
import time
import csv
from datetime import datetime

target_num = 300

url = "https://api.airbnb.com/v2/search_results"
price_max = 1000000
price_min = 0
lat = 1.3521
lng = 103.8198
min_num_pic_urls = 1
limit = 50

search_params={
    "client_id": "3092nxybyb0otqw18e8nh5nty",
    "locale": "en-SG",
    "currency": "SGD",
    "_format": "for_search_results_with_minimal_pricing",
    "_limit": limit,
    "_offset": "0",
    "fetch_facets": "true",
    "guests": "1",
    "ib": "false",
    "ib_add_photo_flow": "true",
    "location": "Singapore",
    "min_bathrooms": "0",
    "min_bedrooms": "0",
    "min_beds": "1",
    "min_num_pic_urls": min_num_pic_urls,
    "price_max": price_max,
    "price_min": price_min,
    "sort": "1",
    "user_lat": lat,
    "user_lng": lng,
}



def getIds(offset=0):
    search_params["_offset"] = offset
    response = requests.get(url, params=search_params)
    response = response.json()
    return map(lambda x: x['listing']['id'], response['search_results'])

def getDetail(roomID):
    params={
           "client_id": "3092nxybyb0otqw18e8nh5nty",
           "locale": "en-SG",
           "currency": "SGD",
           "_format": "v1_legacy_for_p3",
           "_source": "mobile_p3",
           "number_of_guests": "1"}
    url = 'https://api.airbnb.com/v2/listings/{roomID}'.format(roomID=roomID)
    response = requests.get(url, params=params)
    response = response.json()['listing']
    return {
            'roomID': roomID,
            'rating': response['star_rating'] or 0,
            'lat': response['lat'],
            'lng': response['lng'],
            'imgUrl': response['picture_url'],
            'price': response['price_native'],
            'locationMap': response['map_image_url'],
            'roomUrl': 'https://www.airbnb.com.sg/rooms/{roomID}'.format(roomID=roomID),
            'name': response['name'].encode('utf-8'),
            'description': response['summary'].encode('utf-8'),
            'address': response['public_address'].encode('utf-8')
            }


def generate_csv(roomIDs):
    pause_interval = 100
    with file('airbnb_%s.csv' % datetime.now(), 'w') as fout:
        headers = ['roomID', 'rating', 'lat', 'lng', 'imgUrl', 'price', 'locationMap', 'roomUrl', 'name','description', 'address']
        airbnb_writer = csv.DictWriter(fout, fieldnames=headers)
        airbnb_writer.writeheader()

        for index,roomID in enumerate(roomIDs):
            print 'fetch %s' % roomID
            result = getDetail(roomID)
            airbnb_writer.writerow(result)
            if index % pause_interval == 0:
                print '---%s---pause--' % (index+1)
                time.sleep(1)


ids = []
with file('temp.log', 'w') as fout:

    pause_interval = 500

    while len(ids) != target_num:
        incremental = getIds(len(ids))
        fout.write(','.join(map(lambda x:str(x), incremental))+'\n')
        ids.extend(incremental)
        print 'current IDs: %s' % len(ids)
        if len(ids) % pause_interval == 0:
            time.sleep(1)

    generate_csv(ids)





