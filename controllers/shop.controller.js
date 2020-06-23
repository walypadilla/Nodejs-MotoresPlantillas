const { ProductModel, CartModel } = require('../models/index.model');

exports.getProducts = (req, res, next) => {
	ProductModel.fetchAll((products) => {
		res.render('shop/product-list', {
			prods: products,
			pageTitle: 'All Products',
			path: '/products',
		});
	});
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	ProductModel.findById(prodId, (product) => {
		res.render('shop/product-detail', {
			product: product,
			pageTitle: 'Detail Product',
			path: '/products',
		});
	});
};

exports.getIndex = (req, res, next) => {
	ProductModel.fetchAll((products) => {
		res.render('shop/index', {
			prods: products,
			pageTitle: 'Shop',
			path: '/',
		});
	});
};

exports.getCart = (req, res, next) => {
	CartModel.getCart((cart) => {
		ProductModel.fetchAll((products) => {
			const cartProducts = [];
			for (product of products) {
				const cartProductData = cart.products.find(
					(prod) => prod.id === product.id
				);
				if (cartProductData) {
					cartProducts.push({ productData: product, qty: cartProductData.qty });
				}
			}
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: cartProducts,
			});
		});
	});
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	ProductModel.findById(prodId, (product) => {
		CartModel.addProduct(prodId, product.price);
	});
	res.redirect('/cart');
};
exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	ProductModel.findById(prodId, (product) => {
		CartModel.deleteProduct(prodId, product.price);
		res.redirect('/cart');
	});
};

exports.getOrders = (req, res, next) => {
	res.render('shop/orders', {
		path: '/orders',
		pageTitle: 'Orders',
	});
};

exports.getCheckout = (req, res, next) => {
	res.render('shop/checkout', {
		path: '/checkout',
		pageTitle: 'Checkout',
	});
};
