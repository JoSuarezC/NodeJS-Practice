const express = require('express');
const validator = require('../middleware/validators');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');
const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProducts);

router.post(
  '/add-product',
  isAuth,
  [
    body('title', 'Error: Please enter a alpha-numeric title.')
      .isString()
      .isLength({ min: 3 }),
   body('imageUrl')
    .isURL()
    .withMessage('Error: Please enter a valid url.'),
   validator.money(),
   body('description')
    .isLength({ min: 5, max: 400 })
    .withMessage('Error: Please enter a more than 5 characters description.'),
  ],
  adminController.postAddProducts
);

router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProducts);

router.post(
  '/edit-product/:productId',
  isAuth,
  [
    body('title', 'Error: Please enter a alpha-numeric title.')
      .isString()
      .isLength({ min: 3 }),
    validator.money(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .withMessage('Error: Please enter a more than 5 characters description.'),
  ],
  adminController.putEditProduct
);

//router.post('/delete-product/:productId', isAuth, adminController.deleteProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
