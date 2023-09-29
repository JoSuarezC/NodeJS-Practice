const fs = require('fs');
const path = require('path');

const rootDir = path.dirname(require.main.filename);
const cartFile = path.join(rootDir, 'data', 'cart.json');

class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(cartFile, (err, data) => {
      const cart = err
        ? {products: [], totalPrice: 0}
        : JSON.parse(data);
      
      const existingProductIndex = cart.products.findIndex(product => product.id === id);
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;

      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty++;
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice = cart.totalPrice + Number(productPrice);

      fs.writeFile(cartFile, JSON.stringify(cart), err => {
        console.error('Writing Errors:',err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(cartFile, (err, data) => {
      const cart = err ? null : JSON.parse(data);

      if (!cart) return;

      const existingProductIndex = cart.products.findIndex(product => product.id === id);
      const existingProduct = cart.products[existingProductIndex];

      if (existingProduct) {
        cart.products.splice(existingProductIndex, 1);
        cart.totalPrice = cart.totalPrice - Number(productPrice) * existingProduct.qty;
  
        fs.writeFile(cartFile, JSON.stringify(cart), err => {
          console.error('Writing Errors:', err);
        });
      }
    });
  }

  static getCart(cb) {
    fs.readFile(cartFile, (err, data) => {
      const cart = err ? null : JSON.parse(data);
      cb(cart);
    });
  }
}

module.exports = Cart;