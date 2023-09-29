const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      }
    ],
  },
});

userSchema.methods.addToCart = function(product) {
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

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
