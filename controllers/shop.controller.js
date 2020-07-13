const { ProductModel, OrderModel } = require('../models/index.model');

exports.getProducts = (req, res, next) => {
	ProductModel.find()
		.then((products) => {
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'All Products',
				path: '/products',
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	ProductModel.findById(prodId)
		.then((product) => {
			res.render('shop/product-detail', {
				product: product,
				pageTitle: product.title,
				path: '/products',
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
	ProductModel.find()
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then((user) => {
			const products = user.cart.items;
			const pay = user.cart.pay;
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: products,
				totalPay: pay,
				isAuthenticated: req.session.isLoggedIn,
			});
		})

		.catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	ProductModel.findById(prodId)
		.then((product) => {
			return req.user.addToCart(product);
		})
		.then((result) => {
			res.redirect('/cart');
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.deleteItemCart(prodId)
		.then((result) => {
			res.redirect('/cart');
		})
		.catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then((user) => {
			const products = user.cart.items.map((i) => {
				return {
					quantity: i.quantity,
					product: { ...i.productId._doc },
					totalPay: i.totalPay,
				};
			});
			const order = new OrderModel({
				user: {
					name: req.user.name,
					userId: req.user,
				},
				products: products,
				totalOrder: req.user.cart.pay,
			});
			return order.save();
		})
		.then((result) => {
			return req.user.clearCart();
		})
		.then(() => {
			res.redirect('/orders');
		})
		.catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
	OrderModel.find({ 'user.userId': req.user._id })
		.then((order) => {
			let total = 0;
			order.forEach((order) => {
				total = total + Number(order.totalOrder);
			});
			res.render('shop/orders', {
				path: '/orders',
				pageTitle: 'Your Orders',
				orders: order,
				totalAmount: total,
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => console.log(err));
};
