const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { NotFoundController } = require('./controllers/index.controller');
const { UserModel } = require('./models/index.model');
const { MONGO_URI } = require('./config/config');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	UserModel.findById('5f04ed8a71c45b296c07c08b')
		.then((user) => {
			req.user = user;
			next();
		})
		.catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(NotFoundController.get404);

mongoose
	.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((result) => {
		UserModel.findOne().then((user) => {
			if (!user) {
				const user = new UserModel({
					name: 'Waly',
					email: 'waly@gmail',
					cart: {
						items: [],
						pay: '',
					},
				});
				user.save();
			}
		});

		app.listen(3000);
		console.log('Connection');
	})
	.catch((err) => {
		console.log(err);
	});
