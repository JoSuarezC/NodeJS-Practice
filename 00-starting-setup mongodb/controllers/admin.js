const Product = require('../models/product');

exports.getAddProducts = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    product: null,
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
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddProducts = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  new Product(
    title,
    price,
    description,
    imageUrl,
    null,
    req.user._id,
  ).save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.putEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  new Product(
    req.body.title,
    req.body.price,
    req.body.description,
    req.body.imageUrl,
    prodId,
  ).save()
    .then((result) => {
      console.log('Updated Product', result);
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.deleteById(prodId)
    .then((result) => {
      console.log('Deleted Product', result);
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};
