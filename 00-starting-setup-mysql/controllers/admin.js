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
  .then(([rows, fieldsData]) => {
    const product = rows[0];
    
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
  createProduct({
    id: null,
    ...req.body,
  }).then(() => {
    res.redirect('/admin/products');
  })
  .catch((err) => {
    console.log(err);
  });
};

exports.putEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  createProduct({
    id: prodId,
    ...req.body,
  }).then(() => {
    res.redirect('/admin/products');
  })
  .catch((err) => {
    console.log(err);
  });
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([rows, fieldsData]) => {
      res.render('admin/products', {
        prods: rows,
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

  console.log('prodId', prodId)

  Product.deleteById(prodId, () => {
    res.redirect('/admin/products');
  });
};


const createProduct = (productBody) => {
  const prodId = productBody.id;
  const title = productBody.title;
  const imageUrl = productBody.imageUrl;
  const price = productBody.price;
  const description = productBody.description;
  const product = new Product(prodId, title, imageUrl, price, description);
  return product.save();
};
