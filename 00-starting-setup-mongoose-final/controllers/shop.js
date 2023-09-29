const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

const getProductList = (req, res, next, viewRender) => {
  const page = Number(req.query.page) ?? 1;
  let totalItems = 0;

  return Product.find()
    .countDocuments()
    .then((numberProducts) => {
      totalItems = numberProducts;

      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render(viewRender.view, {
        prods: products,
        pageTitle: viewRender.title,
        path: viewRender.path,
        currentPage: page,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      next(new Error(err));
    });
}

exports.getProducts = (req, res, next) => {
  return getProductList(req, res, next, {
    view: 'shop/product-list',
    title: 'All Products',
    path: '/products',
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
  .then((product) => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products',
    });
  })
  .catch((err) => {
    next(new Error(err));
  });
};

exports.getIndex = (req, res, next) => {
  return getProductList(req, res, next, {
    view: 'shop/index',
    title: 'Shop',
    path: '/',
  });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const cartProducts = user.cart.items;
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: cartProducts,
      });
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .removeFromCart(productId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const cartProducts = user.cart.items.map((product) => {
        return {
          quantity: product.quantity,
          product: { ...product.productId._doc },
        };
      });

      return new Order({
        user: {
          name: req.user.name,
          userId: req.user,
        },
        items: cartProducts,
      }).save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.getOrders = (req, res, next) => {
  Order
    .find({ 'user.userId': req.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders: orders,
      });
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order
    .findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No order found'));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text('Invoice', {
        underline: true,
      });
      pdfDoc.text('---------------------------------');
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.fontSize(18).text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`);
      });
      pdfDoc.text('---------------------------------');
      pdfDoc.fontSize(22).text(`Total Price: $${totalPrice}`);
      pdfDoc.end();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
      
      // Reading it in memory and then return. Bad for big files and multiple request since will block thread
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
  
      //   res.send(data);
      // });

      // Node wont preload it in memory, just send stream it to the browser and browser download it by chunks
      // const file = fs.createReadStream(invoicePath);
      // file.pipe(res);
    })
    .catch((err) => {
      next(new Error(err));
    });
};

/*
Implementation of Payments using Stripe.
exports.getCheckout = (req, res, next) => {
  let cartProducts;
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      cartProducts = user.cart.items;

      cartProducts.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cartProducts.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100, // 100 for cents
            currency: 'usd',
            quantity: p.quantity,
          };
        }),
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
      });
    })
    .then((session) => {
      return res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        products: cartProducts,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      next(new Error(err));
    });
};
*/