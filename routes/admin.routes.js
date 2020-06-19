const path = require('path');

const express = require('express');

const { AdminController } = require('../controllers/index.controller');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', AdminController.getAddProduct);
// /admin/products =>GET
router.get('/products', AdminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', AdminController.postAddProduct);

module.exports = router;
