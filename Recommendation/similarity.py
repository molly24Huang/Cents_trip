similartiyimport pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np


def select_attract(similarities):
    sorted_sim = []
    select_sim = []
    sorted_index = []
    select_index = []

    for i in range(0, len(similarities)):
        sim = similarities[i].copy()
        sorted_sim = np.sort(sim)[::-1]
        sorted_index = np.argsort(sim)[::-1]
        # print(sorted_index)
        # select the most 20 similar attractions except themselves
        select_sim.append(sorted_sim[1:21])
        select_index.append(sorted_index[1:21])

    return select_sim, select_index


def main():
    file = '/Users/molly/Documents/NUS/2ndSemester/Projects/CS5224/Cents_trip/dataset/TOURISM_ATTRACTIONS.csv'
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

    select_sim, select_index = select_attract(similarities)

    print(select_sim[0])
    print()
    print(select_index[0])


# print(len(df))

#	data = df.iloc[:,[2,3,5,7]].as_matrix()
#
#	similarities = cosine_similarity(data, data)
#	
#	select_sim, select_index = select_attract(similarities)
#	print(select_sim[0])
#	print()
#	print(select_index[0])

if __name__ == "__main__":
    main()
