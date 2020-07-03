const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { NotFoundController } = require('./controllers/index.controller');
const mongoConnect = require('./helpers/database.helper').mongoConnect;
const { UserModel } = require('./models/index.model');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	UserModel.findById('5efcf07697b3e516f30be4e1')
		.then((user) => {
			req.user = new UserModel(user.username, user.email, user.cart, user._id);
			next();
		})
		.catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(NotFoundController.get404);

mongoConnect((client) => {
	app.listen(3000, console.log('Server Connect'));
});
