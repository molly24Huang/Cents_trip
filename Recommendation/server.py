import os
import json
import tornado.ioloop
from tornado.web import RequestHandler, Application, StaticFileHandler
from tornado.escape import json_encode
import ibm_db
from rec import output

class IndexHandler(RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

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
        bnb_dict = {}
        attr_dict = {}
        hawker_center_dict = {}
        conn = ibm_db.connect("DATABASE=BLUDB;HOSTNAME=dashdb-entry-yp-dal09-09.services.dal.bluemix.net;\
        					PORT=50000;PROTOCOL=TCPIP;UID=dash9787;\
                  				PWD=X_c03EeYTe#u;", "", "")

        sql_airbnb = "SELECT ROOMID,NAME,LATITUDE,LONGITUDE,PRICE,RATING,IMGURL,ROOMURL FROM AIRBNB"
        stmt = ibm_db.exec_immediate(conn, sql_airbnb)
        while True:
            dict_airbnb = ibm_db.fetch_assoc(stmt)
            if dict_airbnb is False:
                break
            bnb_dict[int(dict_airbnb['ROOMID'].strip())] = {
                'id': int( dict_airbnb['ROOMID'].strip() ),
                'name': dict_airbnb['NAME'].strip(),
                'price':  float( dict_airbnb['PRICE'].strip()),
                'rating': float( dict_airbnb['RATING'].strip()),
                'lat': float( dict_airbnb['LATITUDE'].strip()),
                'lng': float( dict_airbnb['LONGITUDE'].strip()) ,
                'img': dict_airbnb['IMGURL'],
                'roomURL': dict_airbnb['ROOMURL'],
                }

        sql_attr = "SELECT ATTRACTIONID,NAME,LATITUDE,LONGITUDE,POPULARITY, RATING, CATEGORY,TICKET_PRICE FROM TOURISM_ATTRACTIONS"
        stmt = ibm_db.exec_immediate(conn, sql_attr)
        while True:
            dict_attr = ibm_db.fetch_assoc(stmt)
            if dict_attr is False:
                break
            attr_dict[int( dict_attr['ATTRACTIONID'].strip() )] = {
                    'ATTRACTIONID': int( dict_attr['ATTRACTIONID'].strip() ),
                    'NAME': dict_attr['NAME'].strip(),
                    'TICKET_PRICE': float( dict_attr['TICKET_PRICE'].strip() ),
                    'LATITUDE':  float( dict_attr['LATITUDE'].strip() ),
                    'LONGITUDE': float( dict_attr['LONGITUDE'].strip() ),
                    'CATEGORY': dict_attr['CATEGORY'],
                    'POPULARITY': dict_attr['POPULARITY'],
                    'RATING': dict_attr['RATING'],
                    }


        sql_food = "SELECT FOODID,NAME,LATITUDE,LONGITUDE FROM FOOD"
        stmt = ibm_db.exec_immediate(conn, sql_food)
        while True:
            dict_food = ibm_db.fetch_assoc(stmt)
            if dict_food is False:
                break
            hawker_center_dict[dict_food['FOODID']] = {
                    'id': dict_food['FOODID'],
                    'name': dict_food['NAME'],
                    'lat': float( dict_food['LATITUDE'].strip()  ),
                    'lng': float( dict_food['LONGITUDE'].strip() ),
                    }
        dict_all={
                'hotels': bnb_dict,
                'attractions': attr_dict,
                'hawker_centers': hawker_center_dict
                }
        self.write(json_encode(dict_all))


class RecommendationHandler(RequestHandler):

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.set_header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")

    def options(self):
        # just for cors
        self.set_status(204)
        self.finish()

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
        (r"/travel-planning", IndexHandler),
        (r"/result", IndexHandler),
        (r"/auto", IndexHandler),
        (r"/manual", IndexHandler),
        #(r'/assets/css', StaticFileHandler, {'path': os.path.join(os.path.dirname(__file__), 'static/assets/css')}),
        (r'/(.*)', StaticFileHandler, {'path': os.path.join(os.path.dirname(__file__), 'static')})
    ], autoreload=autoreload, static_path=os.path.join(os.path.dirname(__file__), 'static'))

PORT = int(os.getenv('PORT', 8000))
AUTORELOAD = int(os.getenv('AUTORELOAD', True))
app = make_app(AUTORELOAD)
app.listen(PORT)
print("autoreload--->:%s" % AUTORELOAD)
tornado.ioloop.IOLoop.current().start()
