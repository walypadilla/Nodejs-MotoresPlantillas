const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

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

app.use(bodyParser.urlencoded({ extended: false }));

// multer config import
app.use(require('./middlewares/imageLoaded.middleware'));

// path static config
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// create session
app.use(
	session({
		secret: SECRET_SESSION,
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);
// csrf Token for security
app.use(csrfProteccion);
// using flash
app.use(flash());
// csrfToken Middleware
app.use(csrfTokenMiddleware);
// session Midleware
app.use(sessionMidleware);

// module routes import
app.use(require('./routes/index.routes'));

mongoose
	.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((result) => {
		app.listen(3000);
		console.log('Connection');
	})
	.catch((err) => {
		console.log(err);
	});
