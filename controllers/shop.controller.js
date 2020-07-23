const { STRIPE_KEY } = require('../config/config');

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')(STRIPE_KEY);

const { ProductModel, OrderModel } = require('../models/index.model');
const ITEMS_PER_PAGE = 6;

// ============================================
//  Get all product
// ============================================
exports.getProducts = (req, res, next) => {
	const page = +req.query.page || 1;
	let totalItems;

	ProductModel.find()
		.countDocuments()
		.then((numProduct) => {
			totalItems = numProduct;
			return ProductModel.find()
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
		})
		.then((products) => {
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'Products',
				path: '/products',
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Get product for id
// ============================================
exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	ProductModel.findById(prodId)
		.then((product) => {
			res.render('shop/product-detail', {
				product: product,
				pageTitle: product.title,
				path: '/products',
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Get all product
// ============================================
exports.getIndex = (req, res, next) => {
	const page = +req.query.page || 1;
	let totalItems;

	ProductModel.find()
		.countDocuments()
		.then((numProducts) => {
			totalItems = numProducts;
			return ProductModel.find()
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
		})
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
			});
		})

		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Get Cart
// ============================================
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
				totalXProduct: products.price * user.cart.quantity,
				totalSum: pay,
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Get Post Cart
// ============================================
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
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Deleting product the cart
// ============================================
exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.deleteItemCart(prodId)
		.then((result) => {
			res.redirect('/cart');
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Get Checkout
// ============================================
exports.getCheckout = (req, res, next) => {
	let products;
	let pay = 0;
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then((user) => {
			products = user.cart.items;
			pay = user.cart.pay;
			return stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				line_items: products.map((p) => {
					return {
						name: p.productId.title,
						description: p.productId.description,
						amount: p.productId.price * 100,
						currency: 'usd',
						quantity: p.quantity,
					};
				}),
				success_url:
					req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
				cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
			});
		})
		.then((session) => {
			res.render('shop/checkout', {
				path: '/checkout',
				pageTitle: 'Your Checkout',
				products: products,
				totalSum: pay,
				sessionId: session.id,
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getCheckoutSuccess = (req, res, next) => {
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
					email: req.user.email,
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
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Get Orders per user
// ============================================
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
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Get Invoice per order
// ============================================
exports.getInvoice = (req, res, next) => {
	const orderId = req.params.orderId;
	OrderModel.findById(orderId).then((order) => {
		if (!order) {
			return next(new Error('No order found.'));
		}
		if (order.user.userId.toString() !== req.user._id.toString()) {
			return next(new Error('Unauthorized'));
		}
		const invoiceName = 'invoice-' + orderId + '.pdf';
		const invoicePath = path.join('data', 'invoices', invoiceName);

		const pdfDoc = new PDFDocument();
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader(
			'Content-Disposition',
			'inline; filename="' + invoiceName + '"'
		);
		pdfDoc.pipe(fs.createWriteStream(invoicePath));
		pdfDoc.pipe(res);

		pdfDoc.fontSize(26).text('Invoice', {
			underline: true,
		});
		pdfDoc.text('-------------------------');
		let totalProduct = 0;
		order.products.forEach((prod) => {
			totalProduct = prod.quantity * prod.product.price;
			pdfDoc
				.fontSize(14)
				.text(
					prod.product.title +
						' - ' +
						prod.quantity +
						' X ' +
						'$' +
						prod.product.price +
						' -- Total: $' +
						totalProduct
				);
		});
		pdfDoc.text('--------------------------------');
		pdfDoc.text('Total Price: $' + order.totalOrder);

		pdfDoc.end();
		// fs.readFile(invoicePath, (err, data) => {
		// 	if (err) {
		// 		return next(err);
		// 	}
		// 	res.setHeader('Content-Type', 'application/pdf');
		// 	res.setHeader(
		// 		'Content-Disposition',
		// 		'inline; filename="' + invoiceName + '"'
		// 	);
		// 	res.send(data);
		// });
		// const file = fs.createReadStream(invoicePath);

		// file.pipe(res);
	});
};
