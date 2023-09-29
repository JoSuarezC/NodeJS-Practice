const express = require('express');
const path = require('path');
const rootDir = require('../helpers/path');
const router = express.Router();
const adminData = require('./admin');
router.get('/', (req, res, next) => {
  console.log('shop', adminData.products);
  //res.sendFile(path.join(rootDir, 'views', 'shop.html'));
  res.render('shop', {
    prods: adminData.products,
    pageTitle: 'Shop',
    path: '/',
    hasProducts: adminData.products.length > 0, //HBS only
    activeShop: true, // HBS only
    productCSS: true,  // HBS only
  });
});

module.exports = router;
