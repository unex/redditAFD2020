
from pymongo import MongoClient
import pymysql

mysql = pymysql.connect("memoria.writhem.com","imposter","itTlxDh5FJx8Ijzi","snekroom")
cursor = mysql.cursor()

mongo = MongoClient()
db = mongo.afd


for doc in db.notes.find():
    sql = "INSERT INTO responses(content, \
           guid, result) \
           VALUES ('%s', '%s', '%s')" % \
          (doc["text"], doc["id"], doc["result"])
    try:
       cursor.execute(sql)
       mysql.commit()
    except Exception as e:
        print(e)
        mysql.rollback()
