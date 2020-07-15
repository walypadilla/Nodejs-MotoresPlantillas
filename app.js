const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const { NotFoundController } = require('./controllers/index.controller');
const {
	sessionMidleware,
	csrfTokenMiddleware,
} = require('./middlewares/index.middleware');
const { MONGO_URI, SECRET_SESSION } = require('./config/config');

const app = express();
const store = new MongoDBStore({
	uri: MONGO_URI,
	collection: 'sessions',
});
const csrfProteccion = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');
const authRoutes = require('./routes/auth.routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// create session
app.use(
	session({
		secret: SECRET_SESSION,
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);
// // csrf Token for security
app.use(csrfProteccion);
// session Midleware
app.use(sessionMidleware);
// csrfToken Middleware
app.use(csrfTokenMiddleware);
// using flash
app.use(flash());

// routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(NotFoundController.get404);

mongoose
	.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((result) => {
		app.listen(3000);
		console.log('Connection');
	})
	.catch((err) => {
		console.log(err);
	});
