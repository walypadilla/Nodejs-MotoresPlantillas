const { ProductModel } = require('../models/index.model');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
	});
};

exports.postAddProduct = (req, res, next) => {
	const { title, imageUrl, price, description } = req.body;
	const product = new ProductModel(null, title, imageUrl, description, price);
	product.save();
	res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;
	ProductModel.findById(prodId, (product) => {
		if (!product) {
			return res.redirect('/');
		}

		res.render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: editMode,
			product: product,
		});
	});
};

exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedImageUrl = req.body.imageUrl;
	const updatedDesc = req.body.description;
	const updatedProduct = new ProductModel(
		prodId,
		updatedTitle,
		updatedImageUrl,
		updatedDesc,
		updatedPrice
	);
	updatedProduct.save();
	res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
	ProductModel.fetchAll((products) => {
		res.render('admin/products', {
			prods: products,
			pageTitle: 'Admin Products',
			path: '/admin/products',
		});
	});
};

exports.postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	ProductModel.deleteById(prodId);
	res.redirect('/admin/products');
};
