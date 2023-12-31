const express = require('express');
const path = require('path');
const rootDir = require('../helpers/path');
const router = express.Router();

const products = [];

router.get('/add-product', (req, res, next) => {
  //res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  res.render('add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    activeAddProduct: true, // HBS only
    productCSS: true,  // HBS only
    formsCSS: true,  // HBS only
  })
});

router.post('/add-product', (req, res, next) => {
  products.push({title: req.body.title,});
  res.redirect('/');
});

exports.routes = router;
exports.products = products;
