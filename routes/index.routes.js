const express = require('express');

const app = express();

const adminRoutes = require('./admin.routes');
const shopRoutes = require('./shop.routes');
const authRoutes = require('./auth.routes');
const { NotFoundController } = require('../controllers/index.controller');
const { errorMiddleware } = require('../middlewares/index.middleware');

// routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// error routes
app.use('/500', NotFoundController.get500);
app.use(NotFoundController.get404);

// app.use(errorMiddleware);

module.exports = app;
