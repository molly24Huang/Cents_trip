import pandas as pd 
import numpy as np 

df = pd.read_csv('/Users/molly/Documents/NUS/2ndSemester/Projects/CS5224/Cents_trip/dataset/airbnb.csv', encoding='ISO-8859-1')

cost_per = df.iloc[:,11].as_matrix()

Q1 = np.percentile(cost_per, 25)
Q2 = np.percentile(cost_per, 50)
Q3 = np.percentile(cost_per, 75)
min_value = np.min(cost_per)
max_value = np.max(cost_per)

for i in range(0, len(cost_per)):
	this_data = cost_per[i]
	if(this_data >= min_value and this_data <= Q1):
		cost_per[i] = 1
	elif(this_data <= Q2):
		cost_per[i] = 2
	elif(this_data <= Q3):
		cost_per[i] = 3
	else:
		cost_per[i] = 4

df.to_csv('/Users/molly/Downloads/airbnb.csv', index=False)

