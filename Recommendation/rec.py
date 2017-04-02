import ibm_db
from collections import defaultdict
from collections import ChainMap
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
import numpy as np

def bnb(conn, attra_list, days, attra_price, budget):
    #bnb_dist_dict = defaultdict(list)
    bnb_dict = dict()
    for attra in attra_list:
        sql = """SELECT d.ROOMID, a.PRICE, a.COSTPERFORMANCE
			   FROM DISTANCE d JOIN AIRBNB a ON d.ROOMID=a.ROOMID
			   WHERE ATTRACTIONID = ?
			   ORDER BY DISTANCE ASC LIMIT 20"""

        stmt = ibm_db.prepare(conn, sql)
        ibm_db.bind_param(stmt, 1, attra)
        if (ibm_db.execute(stmt) is not None):
            dictionary = ibm_db.fetch_assoc(stmt)
            while dictionary != False:
                bnb_RID = dictionary['ROOMID']
                bnb_CP = dictionary['COSTPERFORMANCE']
                bnb_PRICE = dictionary['PRICE']

                # bnb_dict[bnb_RID] = bnb_CP
                #print((int(bnb_PRICE) * days + attra_price) * 0.12)
                if ((int(bnb_PRICE) * days + attra_price) * 0.12 <= budget):
                    bnb_dict[bnb_RID] = bnb_CP
                else:
                    pass
                dictionary = ibm_db.fetch_assoc(stmt)
        #bnb_dist_dict[str(attra)].append(bnb_dict)

    sorted_cp = sorted(bnb_dict.items(), key=lambda x: x[1], reverse=True)
    # list of tuples
    bnb_filtered = sorted_cp[:5]

    # extract specific items corresponding to the roomid from the above list
    rec_bnb = [x[0] for x in bnb_filtered]
    #print(rec_bnb)

    rec_bnb_list = []
    # hawker center
    for roomid in rec_bnb:
        sql = "SELECT FOODID FROM DISTANCE_BNB_FOOD WHERE ROOMID =" + str(roomid) + "AND DISTANCE <= 2"\
              " ORDER BY DISTANCE ASC LIMIT 3"
        stmt = ibm_db.exec_immediate(conn, sql)
        dictionary = ibm_db.fetch_both(stmt)

        roomid_list = []
        bnbs_dict = dict()

        while dictionary != False:
            rec_roomid = dictionary['FOODID']
            roomid_list.append(int(rec_roomid))
            bnbs_dict['id'] = int(roomid)
            bnbs_dict['hawkerCenters'] = roomid_list
            dictionary = ibm_db.fetch_assoc(stmt)
        rec_bnb_list.append(bnbs_dict)
    
    return rec_bnb_list

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
    attr_dict = dict()
    
    # input attraction
    chose_attr_list = []
    for attra in attra_list:
        sql_chosen = "SELECT FOODID FROM DISTANCE_FOOD_ATTRACTION WHERE ATTRACTIONID =" + str(attra) + "AND DISTANCE <= 2"\
          " ORDER BY DISTANCE ASC LIMIT 3"
        stmt1 = ibm_db.exec_immediate(conn, sql_chosen)
        dictionary1 = ibm_db.fetch_both(stmt1)

        chose_foodid_list = []
        chose_attr_dict = dict()

        while dictionary1 != False:
            foodid = dictionary1['FOODID']
            chose_foodid_list.append(int(foodid))
            chose_attr_dict['id'] = int(attra)
            chose_attr_dict['hawkerCenters'] = chose_foodid_list
            dictionary1 = ibm_db.fetch_assoc(stmt1) 
        chose_attr_list.append(chose_attr_dict)
    attr_dict['chosen'] = chose_attr_list
    #print(attr_dict)
    
    # recommended attraction
    rec_attr_list = []
    file = '../dataset/TOURISM_ATTRACTIONS.csv'
    rec_attr_ID = similarity(file)
    for rec_ID in rec_attr_ID:
        sql_rec = "SELECT FOODID FROM DISTANCE_FOOD_ATTRACTION WHERE ATTRACTIONID =" + str(rec_ID) + "AND DISTANCE <= 2"\
          " ORDER BY DISTANCE ASC LIMIT 3"
        stmt2 = ibm_db.exec_immediate(conn, sql_rec)
        dictionary2 = ibm_db.fetch_both(stmt2)

        rec_foodid_list = []
        rec_attr_dict = dict()

        while dictionary2 != False:
            rec_foodid = dictionary2['FOODID']
            rec_foodid_list.append(int(rec_foodid))
            rec_attr_dict['id'] = int(rec_ID)
            rec_attr_dict['hawkerCenters'] = rec_foodid_list
            dictionary2 = ibm_db.fetch_assoc(stmt2)
        rec_attr_list.append(rec_attr_dict)
    attr_dict['rec'] = rec_attr_list

    return attr_dict

def output(attra_list, days, attra_price, budget):
    conn = ibm_db.connect("DATABASE=BLUDB;HOSTNAME=dashdb-entry-yp-dal09-09.services.dal.bluemix.net;\
                            PORT=50000;PROTOCOL=TCPIP;UID=dash9787;\
                            PWD=X_c03EeYTe#u;", "", "")
    attr_dict = attractions(conn, attra_list)
    bnb_list = bnb(conn, attra_list, days, attra_price, budget)
    output_dict = dict()
    output_dict['attractions'] = attr_dict
    output_dict['hotels'] = bnb_list
    return output_dict

def main():
    #attra_list = [75, 31, 24, 65, 3]
    attra_list = [30, 57, 3, 28, 54]
    days = 3
    attra_price = 200
    budget = 2000
    rec_items = output(attra_list, days, attra_price, budget)
    print(rec_items)


if __name__ == "__main__":
    main()
