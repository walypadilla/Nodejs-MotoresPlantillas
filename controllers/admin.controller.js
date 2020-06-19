const { ProductModel } = require('../models/index.model');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/add-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
	});
};

exports.postAddProduct = (req, res, next) => {
	const { title, imageUrl, price, description } = req.body;
	const product = new ProductModel(title, imageUrl, description, price);
	product.save();
	res.redirect('/');
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
