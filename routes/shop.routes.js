const path = require('path');

const express = require('express');

const rootDir = require('../helpers/path.helper');
const adminData = require('./admin.routes');

const router = express.Router();

router.get('/', (req, res, next) => {
	const products = adminData.products;
	res.render('shop', { prods: products, pageTitle: 'My Shop', path: '/' });
});

module.exports = router;
