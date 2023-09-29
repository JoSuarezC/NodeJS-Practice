const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// One Admin User can Add multiple Products. If User is deleted, deletes all its products.
Product.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE',
});
// 1:N
User.hasMany(Product);
// 1:1
User.hasOne(Cart);
// 1:1
Cart.belongsTo(User);
// N:N One Cart hold Multiple Products
Cart.belongsToMany(Product, {through: CartItem});
// N:N One Product is holded in Multiple Carts
Product.belongsToMany(Cart, {through: CartItem});
// 1:1
Order.belongsTo(User);
// 1:N
User.hasMany(Order);
// N:N
Order.belongsToMany(Product, {through: OrderItem});
// N:N
Product.belongsToMany(Order, {through: OrderItem});

sequelize
  .sync({
    //force: true,
  })
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    return user ? user : User.create({ name: 'Josue', email: 'test@test,com' });
  })
  .then((user) => {
    return user.createCart();
  })
  .then((user) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
