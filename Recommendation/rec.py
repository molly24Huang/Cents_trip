import ibm_db
from collections import defaultdict
from collections import ChainMap
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
import numpy as np

def bnb(conn, attra_list):
    #bnb_dist_dict = defaultdict(list)
    bnb_dict = dict()
    for attra in attra_list:
        sql = """SELECT d.ROOMID, a.COSTPERFORMANCE
			   FROM DISTANCE d JOIN AIRBNB a ON d.ROOMID=a.ROOMID
			   WHERE ATTRACTIONID = ?
			   ORDER BY DISTANCE DESC LIMIT 10"""

        stmt = ibm_db.prepare(conn, sql)
        ibm_db.bind_param(stmt, 1, attra)
        if (ibm_db.execute(stmt) is not None):
            dictionary = ibm_db.fetch_assoc(stmt)
            while dictionary != False:
                bnb_RID = dictionary['ROOMID']
                bnb_CP = dictionary['COSTPERFORMANCE']
                bnb_dict[bnb_RID] = bnb_CP
                dictionary = ibm_db.fetch_assoc(stmt)
        #bnb_dist_dict[str(attra)].append(bnb_dict)
    sorted_cp = sorted(bnb_dict.items(), key=lambda x: x[1], reverse=True)
    # list of tuples
    bnb_filtered = sorted_cp[:5]

    # extract specific items corresponding to the roomid from the above list
    rec_bnb = [x[0] for x in bnb_filtered]
    #print(rec_bnb)

    rec_bnb_dict = defaultdict(list)
    # hawker center
    for roomid in rec_bnb:
        sql = "SELECT FOODID FROM DISTANCE_BNB_FOOD WHERE ROOMID =" + str(roomid) + \
              " ORDER BY DISTANCE DESC LIMIT 5"
        stmt = ibm_db.exec_immediate(conn, sql)
        dictionary = ibm_db.fetch_both(stmt)
        while dictionary != False:
            rec_bnb_rsts = dictionary['FOODID']
            rec_bnb_dict[str(roomid)].append(rec_bnb_rsts)
            dictionary = ibm_db.fetch_assoc(stmt)
    rec_bnb_dict = dict(rec_bnb_dict)
    #print(rec_bnb_dict)
    return rec_bnb_dict

def similarity(file):
    select_sim = []
    select_ID = []

    df = pd.read_csv(file)
    data = df.iloc[:, [5, 6, 7]].as_matrix()

    # min-max method to normalize data

    min_value_in_col = np.amin(data, axis=0)
    max_value_in_col = np.amax(data, axis=0)
    diff = max_value_in_col - min_value_in_col
    normalized_data = np.matrix((data - min_value_in_col) * 1.0 / diff)

    tf = TfidfVectorizer(analyzer='word', ngram_range=(1, 2), min_df=0, stop_words='english')
    tfidf = tf.fit_transform(df['DESCRIPTION']).toarray()
    tfidf = np.matrix(tfidf)

    with_txt_features = np.concatenate((normalized_data, tfidf), axis=1)

    similarities = cosine_similarity(with_txt_features, with_txt_features)

    for i in range(0, len(similarities)):
        sim = similarities[i].copy()
        sorted_sim = np.sort(sim)[::-1]
        sorted_ID = np.argsort(sim)[::-1]
        # print(sorted_ID)
        # select the most 20 similar attractions except themselves
        select_sim.append(sorted_sim[1:11])
        sorted_ID = np.array(sorted_ID) + 1
        sorted_ID = list(sorted_ID)
        select_ID.append(sorted_ID[1:11])
        rec_ID = [j for i in select_ID for j in i]
        rec_ID = set(rec_ID)
        rec_ID = list(rec_ID)
    return rec_ID[:11]

def attractions(conn, attra_list):
    attr_dist_dict = defaultdict(list)
    rec_attr_dist_dict = defaultdict(list)
    chose_attr = dict()

    # input attraction
    for attra in attra_list:
        sql = "SELECT FOODID FROM DISTANCE_FOOD_ATTRACTION WHERE ATTRACTIONID =" + str(attra) + \
          " ORDER BY DISTANCE DESC LIMIT 5"
        stmt = ibm_db.exec_immediate(conn, sql)
        dictionary = ibm_db.fetch_both(stmt)
        while dictionary != False:
            attr_rsts = dictionary['FOODID']
            attr_dist_dict[str(attra)].append(attr_rsts)
            dictionary = ibm_db.fetch_assoc(stmt)
    attr_dist_dict = dict(attr_dist_dict)        
    chose_attr['Chosen'] = attr_dist_dict
    #print(chose_attr)
    
    # recommended attraction
    file = '/Users/molly/Documents/NUS/2ndSemester/Projects/CS5224/Cents_trip/dataset/TOURISM_ATTRACTIONS.csv'
    rec_attr_ID = similarity(file)
    for rec_ID in rec_attr_ID:
        sql = "SELECT FOODID FROM DISTANCE_FOOD_ATTRACTION WHERE ATTRACTIONID =" + str(rec_ID) + \
          " ORDER BY DISTANCE DESC LIMIT 5"
        stmt = ibm_db.exec_immediate(conn, sql)
        dictionary = ibm_db.fetch_both(stmt)
        while dictionary != False:
            rec_attr_rsts = dictionary['FOODID']
            rec_attr_dist_dict[str(rec_ID)].append(rec_attr_rsts)
            dictionary = ibm_db.fetch_assoc(stmt)
    rec_attr_dist_dict = dict(rec_attr_dist_dict)
    chose_attr['Rec'] = rec_attr_dist_dict

    return chose_attr

def output(conn, attra_list):
    attr_dict = attractions(conn, attra_list)
    bnb_dict = bnb(conn, attra_list)
    output_dict = dict()
    output_dict['attractions'] = attr_dict
    output_dict['bnbs'] = bnb_dict
    return output_dict

def main():
    conn = ibm_db.connect("DATABASE=BLUDB;HOSTNAME=dashdb-entry-yp-dal09-09.services.dal.bluemix.net;\
    						PORT=50000;PROTOCOL=TCPIP;UID=dash9787;\
              				PWD=X_c03EeYTe#u;", "", "")
    attra_list = [5, 87, 34, 65, 30]
    rec_items = output(conn, attra_list)
    print(rec_items)

if __name__ == "__main__":
    main()
