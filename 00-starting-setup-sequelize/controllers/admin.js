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

  //Product.findByPk(prodId)
  req.user.getProducts({where : {
    id: prodId,
  }}).then((products) => {
    const product = products[0];
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

  req.user.createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
  }).then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.putEditProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findByPk(prodId)
    .then((product) => {
      product.title = req.body.title;
      product.imageUrl = req.body.imageUrl;
      product.price = req.body.price;
      product.description = req.body.description;
      return product.save();
    })
    .then((result) => {
      console.log('Updated Product');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  // Product.findAll()
  req.user.getProducts()
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

  Product.findByPk(prodId)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      console.log('Deleted Product');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};
