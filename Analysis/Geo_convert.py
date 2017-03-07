import pandas as pd 
import geocoder
import re

#filename = '/Users/molly/Documents/NUS/2ndSemester/Projects/CS5224/dataset/hawker_centre.csv'

fl2 = '/Users/molly/Downloads/foodcourt.txt'
#df2 = pd.read_csv(f2)
#result = {}

#df = pd.read_csv(fl2)
#print(len(df))
f_handle = open(fl2, 'r')
f_lines = f_handle.readlines()
#f = '/Users/molly/Documents/NUS/2ndSemestzer/Projects/CS5224/dataset/location.txt'
f2 = '/Users/molly/Documents/NUS/2ndSemester/Projects/CS5224/dataset/location2.txt'

#file_handle = open(f, 'a')
f2_handle = open(f2, 'a')
#location = df.iloc[:,4].as_matrix()
i = 0
for line in f_lines:
	code = line.rstrip('\n')
	#print(code)
	g = geocoder.google(code)
	#result[code] = g.latlng
	loc_list = g.latlng
	#print(loc_list)
	if(len(loc_list) != 0):
		latitude = loc_list[0]
		#print(latitude)
		longtitude = loc_list[1]
		#print(longtitude)
	#file_handle.write(str(i+1) + ',' + str(latitude) + ',' + str(longtitude) + '\n')
	f2_handle.write(code + ',' + str(latitude) + ',' + str(longtitude) + '\n')
	#print(str(i+1) ','+ str(latitude) + ',' + str(longtitude))
	i += 1
#file_handle.close()
f2_handle.close()
