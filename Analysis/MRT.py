import re
import csv
import requests

key = "AIzaSyC9NQT_ZQiiWx2qUenfwKO-v8cdtcjsf6s"
url="https://maps.googleapis.com/maps/api/place/textsearch/json"


with file('mrt.csv', 'w') as fout:
    headers = ['name', 'lat', 'lng']
    csv_writer = csv.DictWriter(fout, fieldnames=headers)
    csv_writer.writeheader()

    with file('name.txt') as  fin:
        for line in fin:
            name = line.strip()
            print 'name:-->',name

            response = requests.get(url, headers={
                'Content-Type': 'application/json',
                },params={
                    'key': key,
                    'query': name
                    })
            response = response.json()
            if response.get( 'error_message', None ):
                print 'error:', name, response['error_message']
            else:
                row = { 'name':name,
                        'lat':response['results'][0]['geometry']['location']['lat'],
                        'lng':response['results'][0]['geometry']['location']['lng'], 
                        }
                csv_writer.writerow(row)
