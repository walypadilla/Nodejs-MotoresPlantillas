const path = require('path');

const express = require('express');

const { ShopController } = require('../controllers/index.controller');

const router = express.Router();

router.get('/', ShopController.getIndex);
router.get('/products', ShopController.getProducts);
router.get('/cart', ShopController.getCart);
router.get('/orders', ShopController.getOrders);
router.get('/chechkout', ShopController.getCheckout);

module.exports = router;
