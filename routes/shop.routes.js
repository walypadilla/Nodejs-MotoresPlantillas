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
router.get('/orders', isAuthMiddleware, ShopController.getOrders);
router.get('/orders/:orderId', isAuthMiddleware, ShopController.getInvoice);
router.get('/checkout', isAuthMiddleware, ShopController.getCheckout);
router.get(
	'/checkout/success',
	isAuthMiddleware,
	ShopController.getCheckoutSuccess
);
router.get('/checkout/cancel', isAuthMiddleware, ShopController.getCheckout);

module.exports = router;
