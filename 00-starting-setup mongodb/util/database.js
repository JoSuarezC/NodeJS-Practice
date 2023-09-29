const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const mongoURL = process.env.DB_URI + 'shop?retryWrites=true&w=majority';

let _db;

const mongoConnect = (cb) => {
  MongoClient.connect(mongoURL)
  .then((client) => {
    console.log('Connected');
    _db = client.db();
    cb();
  })
  .catch((err) => {
    throw err;
  });
};

const getDb = () => {
  if(_db) return _db;
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
