const express = require('express');

const adminController = require('../controllers/admin');
const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProducts);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProducts);

router.get('/products', adminController.getProducts);

router.get('/edit-product/:productId', adminController.getEditProducts);

router.post('/edit-product/:productId', adminController.putEditProduct);

router.post('/delete-product/:productId', adminController.deleteProduct);

module.exports = router;
