const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const { NotFoundController } = require('./controllers/index.controller');
const { UserModel } = require('./models/index.model');
const { MONGO_URI, SECRET_SESSION } = require('./config/config');

const app = express();
const store = new MongoDBStore({
	uri: MONGO_URI,
	collection: 'sessions',
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');
const authRoutes = require('./routes/auth.routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	session({
		secret: SECRET_SESSION,
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	UserModel.findById(req.session.user._id)
		.then((user) => {
			req.user = user;
			next();
		})
		.catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

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
