import os
import json
import tornado.ioloop
from tornado.web import RequestHandler, Application, StaticFileHandler
from tornado.escape import json_encode

class IndexHandler(RequestHandler):
    def get(self):
        self.render('static/index.html')
        #self.write("hello, world")

class FirstHandler(RequestHandler):
    def get(self):
	   self.render('static/first.html')


class InfoHandler(RequestHandler):
    def get(self):
        self.set_header('Content-Type', 'application/json')

        # fetch data from db and return a json result = {}
        # hotel: id, name, latitude, longitude
        # attraction: id, name, latitude, longitude
        # hawker center: id, latitude, longitude
        self.write(json_encode(result))
        pass

class RecomendationHandler(RequestHandler):
    def post(self):
        self.set_header('Content-Type', 'application/json')
        # get the users' input and return the back-end output
        # self. get user input = input
        # get the list of attraction ID []
        # invoke recommend script and get the result
        # result = output(conn, attra_list)
        # result -> json
        self.write(json_encode(result))
        pass

def make_app(autoreload):
    return Application([
        (r"/", IndexHandler),
        (r"/info", InfoHandler),
	    (r"/recommend",RecommendationHandler),
        (r'/static/*', StaticFileHandler, {'path': os.path.join(os.path.dirname(__file__), 'static')})
        ], autoreload=autoreload, static_path=os.path.join(os.path.dirname(__file__), 'static'))


PORT = int(os.getenv('PORT', 8000))
AUTORELOAD = int(os.getenv('AUTORELOAD', True))
app = make_app(AUTORELOAD)
app.listen(PORT)
print "autoreload--->:%s" % AUTORELOAD
tornado.ioloop.IOLoop.current().start()
