const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const { ProductModel, OrderModel } = require('../models/index.model');

exports.getProducts = (req, res, next) => {
	ProductModel.find()
		.then((products) => {
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'All Products',
				path: '/products',
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

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

exports.getIndex = (req, res, next) => {
	ProductModel.find()
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getCart = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then((user) => {
			const products = user.cart.items;
			console.log(products);
			const pay = user.cart.pay;
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: products,
				totalPay: pay,
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
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
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

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
