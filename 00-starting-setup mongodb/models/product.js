const { ObjectId } = require('mongodb');

const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, _id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = _id ? new ObjectId(_id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOp;

    if (this._id) {
      dbOp = db
        .collection('products')
        .updateOne(
          { _id: this._id },
          { $set: this }
        );
    } else {
      dbOp = db
        .collection('products')
        .insertOne(this);
    }

    return dbOp;
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products')
      .find()
      .toArray()
      .then((products) => {
        console.log(products);
        return products;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(prodId) {
    const db = getDb();
    return db.collection('products')
      .find({_id: new ObjectId(prodId)})
      .next()
      .then((product) => {
        return product;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static deleteById(prodId) {
    const db = getDb();

    return db
      .collection('products')
      .deleteOne({ _id: new ObjectId(prodId) });
  }
};

module.exports = Product;
