const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const {
	sessionMidleware,
	csrfTokenMiddleware,
} = require('./middlewares/index.middleware');
const { MONGO_URI, SECRET_SESSION, PORT } = require('./config/config');
const { accessLogStream } = require('./middlewares/accessLogStream');

const app = express();
const store = new MongoDBStore({
	uri: MONGO_URI,
	collection: 'sessions',
});
const csrfProteccion = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

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
// create https key y certificate
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');
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
		// https
		// 	.createServer({ key: privateKey, cert: certificate }, app)
		// 	.listen(PORT || 3000);
		app.listen(PORT || 3000);
		console.log('Connection');
	})
	.catch((err) => {
		console.log(err);
	});
