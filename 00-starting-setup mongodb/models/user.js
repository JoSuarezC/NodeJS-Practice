const { ObjectId } = require('mongodb');
const Product = require('./product');

const getDb = require('../util/database').getDb;

class User {
  constructor(name, email, cart, _id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this._id = new ObjectId(_id);
  }

  save() {
    const db = getDb();

    return db.collection('users').insertOne(this);
  }

  updateCart(updatedCart) {
    const db = getDb();
    return db.collection('users').updateOne(
      {
        _id: this._id,
      },
      {
        $set: {
          cart: updatedCart,
        },
      }
    );
  }

  addToCart(product) {
    let updatedCart = { ...this.cart };
    const existingProductIndex = updatedCart?.items?.findIndex(
      (cartProduct) => {
        return cartProduct.productId.toString() === product._id.toString();
      }
    );

    if (existingProductIndex >= 0) {
      const oldQty = updatedCart.items[existingProductIndex].quantity;
      updatedCart.items[existingProductIndex].quantity = oldQty + 1;
    } else {
      updatedCart.items.push({
        productId: product._id,
        quantity: 1,
      });
    }

    return this.updateCart(updatedCart);
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((cp) => {
      return cp.productId;
    });
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then(products => {
        if (products.length > 0) {
          return products.map((p) => {
            const cartProduct = this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            });

            if (cartProduct) {
              return {
                ...p,
                quantity: cartProduct.quantity,
              };
            } else {
              return this.deleteItemFromCart(cartProduct.productId).then(() => null);
            }
          }).filter(prod => prod);
        }
        
        return this.updateCart({ items: [] }).then(() => []);
      });
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });

    return this.updateCart({ items: updatedCartItems });
  }

  addOrder() {
    const db = getDb();

    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name,
          },
        };

        return db.collection('orders').insertOne(order);
      })
      .then(() => {
        this.cart = {items: []};
        return this.updateCart({ items: [] });
      });
  }

  getOrders() {
    const db = getDb();

    return db
      .collection('orders')
      .find({ 'user._id': this._id })
      .toArray();
  }

  static findById(userId) {
    const db = getDb();

    return db.collection('users').findOne({ _id: new ObjectId(userId) });
  }
}

module.exports = User;
