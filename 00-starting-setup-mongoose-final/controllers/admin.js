const Product = require('../models/product');
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');

exports.getAddProducts = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    product: null,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.getEditProducts = (req, res, next) => {
  const editMode = req.query['edit'];
  const prodId = req.params.productId;

  if (!editMode) {
    return res.redirect('/');
  }

  Product.findById(prodId)
    .then((product) => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.postAddProducts = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: {...req.body},
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: {...req.body},
      errorMessage: 'Error: Please enter a valid image.',
      validationErrors: [],
    });
  }

  // Is inefficient to store images in DB. So we save path only.
  new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: image.path,
    userId: req.user,
  }).save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.putEditProduct = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product: {...req.body},
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }

      product.title = req.body.title;
      product.price = req.body.price;
      product.description = req.body.description;
      console.log('req.file', req.file)
      const image = req.file;

      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }

      return product.save().then((result) => {
        res.redirect('/admin/products');
      });
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user })
    //select('title price -_id') //Return title, price and exclude id
    //.populate('userId', 'name') // Add More User Data (name)
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
  .then((product) => {
    if (!product) {
      return next(new Error('Error: Product not found'));
    }

    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({
      _id: prodId,
      userId: req.user,
    });
  })
  .then((result) => {
    res.status(200).json({
      message: 'Success',
    });
  })
  .catch((err) => {
    res.status(500).json({
      message: 'Deletion failed',
    });
  });
};
