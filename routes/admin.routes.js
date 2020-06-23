const path = require('path');

const express = require('express');

const { AdminController } = require('../controllers/index.controller');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', AdminController.getAddProduct);
router.get('/products', AdminController.getProducts);
router.post('/add-product', AdminController.postAddProduct);
router.get('/edit-product/:productId', AdminController.getEditProduct);
router.post('/edit-product', AdminController.postEditProduct);
router.post('/delete-product', AdminController.postDeleteProduct);

module.exports = router;
