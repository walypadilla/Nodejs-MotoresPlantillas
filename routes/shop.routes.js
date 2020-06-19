const path = require('path');

const express = require('express');

const { ProductsController } = require('../controllers/index.controller');

const router = express.Router();

router.get('/', ProductsController.getProducts);

module.exports = router;
