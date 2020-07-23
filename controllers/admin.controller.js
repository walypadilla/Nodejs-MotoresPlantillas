const { ProductModel } = require('../models/index.model');
const { validationResult } = require('express-validator');
const { fileMiddleware } = require('../middlewares/index.middleware');
const productModel = require('../models/product.model');

// ============================================
//  Get add Product
// ============================================
exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		hasError: false,
		errorMessage: null,
		validationErrors: [],
	});
};

// ============================================
//  Post new Product
// ============================================
exports.postAddProduct = (req, res, next) => {
	let { title, price, description } = req.body;
	const image = req.file;
	// If the image doest not exist
	if (!image) {
		return res.status(402).render('admin/edit-product', {
			pageTitle: 'Add Products',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: {
				title: title,
				price: price,
				description: description,
			},
			errorMessage: 'Attached file is not an image.',
			validationErrors: [],
		});
	}
	// storing image path
	const imageUrl = image.path;

	const product = new ProductModel({
		title: title,
		price: price,
		description: description,
		imageUrl: imageUrl,
		userId: req.user,
	});
	// collect the validation errors from the router
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(402).render('admin/edit-product', {
			pageTitle: 'Add Products',
			path: '/admin/add-product',
			editing: false,
			errors: errors.array(),
			hasError: true,
			product: {
				title: title,
				imageUrl: imageUrl,
				price: price,
				description: description,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}
	// if no validation errors in the controller
	product
		.save()
		.then((result) => {
			// console.log(result);
			console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Get edit Product
// ============================================
exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;
	ProductModel.findById(prodId)
		.then((product) => {
			if (!product) {
				return res.redirect('/');
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product: product,
				hasError: false,
				errorMessage: null,
				validationErrors: [],
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Post edit Product
// ============================================
exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const image = req.file;
	const updatedDesc = req.body.description;

	// collect the validation erros from the controller
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(402).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: true,
			hasError: true,
			product: {
				title: updatedTitle,
				price: updatedPrice,
				description: updatedDesc,
				_id: prodId,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}
	// if no validation errors in the controller
	ProductModel.findById(prodId)
		.then((product) => {
			if (product.userId.toString() != req.user._id.toString()) {
				return res.redirect('/');
			}
			product.title = updatedTitle;
			product.price = updatedPrice;
			if (image) {
				// deleted image the product when is updated by another
				fileMiddleware.deleteFile(product.imageUrl);
				product.imageUrl = image.path;
			}
			product.description = updatedDesc;
			return product.save().then((result) => {
				console.log('UPDATE PRODUCT');
				res.redirect('/admin/products');
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Get all product for user
// ============================================
exports.getProducts = (req, res, next) => {
	ProductModel.find({ userId: req.user._id })
		// .select('title price -_id')
		// .populate('userId', 'name')
		.then((products) => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// ============================================
//  Post Delete product
// ============================================
exports.deleteProduct = (req, res, next) => {
	const prodId = req.params.productId;
	productModel
		.findById(prodId)
		.then((product) => {
			if (!product) {
				return next(new Error('Product not found.'));
			}
			// deleted image the product when is deleted
			fileMiddleware.deleteFile(product.imageUrl);
			return ProductModel.deleteOne({ _id: prodId, userId: req.user._id });
		})
		.then(() => {
			console.log('DESTROYED PRODUCT');
			res.status(200).json({ message: 'Success!' });
		})
		.catch((err) => {
			res.status(500).json({ message: 'Deleting product failed' });
		});
};
