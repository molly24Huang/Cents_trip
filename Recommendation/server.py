import os
import json
import tornado.ioloop
from tornado.web import RequestHandler, Application, StaticFileHandler
from tornado.escape import json_encode
import ibm_db
from rec import output

class IndexHandler(RequestHandler):
    def get(self):
        self.render('static/index.html')
        # self.write("hello, world")


class FirstHandler(RequestHandler):
    def get(self):
        self.render('static/first.html')


class InfoHandler(RequestHandler):

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')


    def get(self):
        self.set_header('Content-Type', 'application/json')

        # fetch data from db and return a json result = {}
        # hotel: id, name, latitude, longitude
        # attraction: id, name, latitude, longitude
        # hawker center: id, latitude, longitude
        # bnb_dict = dict()
        # attr_dict = dict()
        # food_dict = dict()
        # conn = ibm_db.connect("DATABASE=BLUDB;HOSTNAME=dashdb-entry-yp-dal09-09.services.dal.bluemix.net;\
        # 						PORT=50000;PROTOCOL=TCPIP;UID=dash9787;\
        #           				PWD=X_c03EeYTe#u;", "", "")

        # sql_airbnb = "SELECT ROOMID,NAME,LATITUDE,LONGITUDE FROM AIRBNB"
        # stmt = ibm_db.exec_immediate(conn, sql_airbnb)
        # while ibm_db.fetch_row(stmt) != False:
        #     dict_airbnb = ibm_db.fetch_assoc(stmt)
        #     bnb_RID = dict_airbnb['ROOMID']
        #     bnb_NAME = dict_airbnb['NAME']
        #     bnb_LAT = dict_airbnb['LATITUDE']
        #     bnb_LONG = dict_airbnb['LONGITUDE']
        #     bnb_dict[bnb_RID] = [bnb_NAME, bnb_LAT, bnb_LONG]

        # sql_attr = "SELECT ATTRACTIONID,NAME,LATITUDE,LONGITUDE FROM TOURISM_ATTRACTIONS"
        # stmt = ibm_db.exec_immediate(conn, sql_attr)
        # while ibm_db.fetch_row(stmt) != False:
        #     dict_attr = ibm_db.fetch_assoc(stmt)
        #     attr_RID = dict_attr['ATTRACTIONID']
        #     attr_NAME = dict_attr['NAME']
        #     attr_PRICE = dict_attr['PRICE']
        #     attr_LAT = dict_attr['LATITUDE']
        #     attr_LONG = dict_attr['LONGITUDE']
        #     attr_dict[attr_RID] = [attr_NAME, attr_LAT, attr_LONG]

        # sql_food = "SELECT FOODID,NAME,LATITUDE,LONGITUDE FROM FOOD"
        # stmt = ibm_db.exec_immediate(conn, sql_food)
        # while ibm_db.fetch_row(stmt) != False:
        #     dict_food = ibm_db.fetch_assoc(stmt)
        #     food_RID = dict_food['FOODID']
        #     food_NAME = dict_food['NAME']
        #     food_LAT = dict_food['LATITUDE']
        #     food_LONG = dict_food['LONGITUDE']
        #     food_dict[food_RID] = [food_NAME, food_LAT, food_LONG]

        # Results_bnb = json.dumps(bnb_dict)
        # Results_attr = json.dumps(attr_dict)
        # Results_food = json.dumps(food_dict)
        # dict_all = {**bnb_dict, **attr_dict, **food_dict}
        dict_all={'id':1}
        # results = json.dumps(dict_all)
        self.write(json_encode(dict_all))


class RecommendationHandler(RequestHandler):


    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def post(self):
        # get the users' input and return the back-end output]
        data_json = tornado.escape.json_decode(self.request.body)
        attra_list = list(map(int, data_json.get('attra_list', [])))
        days = int(data_json.get('days'))
        attra_price = int(data_json.get('attra_price'))
        budget = int(data_json.get('budget'))
        print(data_json, attra_list, days, attra_price, budget)
        rst = output(attra_list, days, attra_price, budget)
        self.set_header('Content-Type', 'application/json')
        self.write(json_encode(rst))


def make_app(autoreload):
    return Application([
        (r"/", IndexHandler),
        (r"/info", InfoHandler),
        (r"/recommend", RecommendationHandler),
        (r'/assets/css', StaticFileHandler, {'path': os.path.join(os.path.dirname(__file__), 'static/assets/css')}),
        (r'/*', StaticFileHandler, {'path': os.path.join(os.path.dirname(__file__), 'static')})
    ], autoreload=autoreload, static_path=os.path.join(os.path.dirname(__file__), 'static'))


PORT = int(os.getenv('PORT', 8000))
AUTORELOAD = int(os.getenv('AUTORELOAD', True))
app = make_app(AUTORELOAD)
app.listen(PORT)
print("autoreload--->:%s" % AUTORELOAD)
tornado.ioloop.IOLoop.current().start()
