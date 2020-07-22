const path = require('path');

const express = require('express');

const { ShopController } = require('../controllers/index.controller');
const { isAuthMiddleware } = require('../middlewares/is-auth.middleware');

const router = express.Router();

router.get('/', ShopController.getIndex);
router.get('/products', ShopController.getProducts);
router.get('/products/:productId', ShopController.getProduct);
router.get('/cart', isAuthMiddleware, ShopController.getCart);
router.post(
	'/cart-delete-item',
	isAuthMiddleware,
	ShopController.postCartDeleteProduct
);
router.post('/cart', isAuthMiddleware, ShopController.postCart);
router.post('/create-order', isAuthMiddleware, ShopController.postOrder);
router.get('/orders', isAuthMiddleware, ShopController.getOrders);
router.get('/orders/:orderId', isAuthMiddleware, ShopController.getInvoice);

module.exports = router;
