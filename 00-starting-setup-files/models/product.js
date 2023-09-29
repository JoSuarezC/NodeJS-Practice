const Cart = require('../models/cart');

class Product {
  constructor(id, title, imageUrl, price, description) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save() {
  }

  static fetchAll() {
  }

  static findById(id) {
  }

  static deleteById(id) {
  }
};

module.exports = Product;

/*
====================  Data managed by Files ======================

const fs = require('fs');
const path = require('path');
const Cart = require('../models/cart');
const rootDir = path.dirname(require.main.filename);
const productsFile = path.join(rootDir, 'data', 'products.json');

const getProductsFromFile = (callback) => {
  fs.readFile(productsFile, (err, data) => {
    const products = err ? [] : JSON.parse(data);
    callback(products);
  });
};

class Product {
  constructor(id, title, imageUrl, price, description) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save() {
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(prod => prod.id === this.id);
        products[existingProductIndex] = this;
      } else {
        this.id = new Date().getTime().toString();
        products.push(this);
      }

      fs.writeFile(productsFile, JSON.stringify(products), err => {
        console.error('Writing Errors:',err);
      });
    });
  }

  static fetchAll(callback) {
    getProductsFromFile(callback);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      cb(products.find(product => product.id === id));
    });
  }

  static deleteById(id, cb) {
    getProductsFromFile(products => {
      const productIndex = products.findIndex(product => product.id === id)
      const deletedProduct = products.splice(productIndex, 1);
      fs.writeFile(productsFile, JSON.stringify(products), err => {
        console.error('Writing Errors:',err);
        if (!err) {
          Cart.deleteProduct(id, deletedProduct.price);
        }
      });
      cb();
    });
  }
};

module.exports = Product;
*/