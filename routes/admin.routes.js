const express = require('express');

const { AdminController } = require('../controllers/index.controller');
const { isAuthMiddleware } = require('../middlewares/is-auth.middleware');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuthMiddleware, AdminController.getAddProduct);
router.get('/products', isAuthMiddleware, AdminController.getProducts);
router.post('/add-product', isAuthMiddleware, AdminController.postAddProduct);
router.get(
	'/edit-product/:productId',
	isAuthMiddleware,
	AdminController.getEditProduct
);
router.post('/edit-product', isAuthMiddleware, AdminController.postEditProduct);
router.post(
	'/delete-product',
	isAuthMiddleware,
	AdminController.postDeleteProduct
);

module.exports = router;
