const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { NotFoundController } = require('./controllers/index.controller');
const sequelize = require('./helpers/database.helper');
const {
	ProductModel,
	UserModel,
	CartModel,
	CartItemModel,
	OrderItemModel,
	OrderModel,
} = require('./models/index.model');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	UserModel.findByPk(1)
		.then((user) => {
			req.user = user;
			next();
		})
		.catch((err) => {
			console.log(err);
		});
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(NotFoundController.get404);

ProductModel.belongsTo(UserModel, { constrains: true, onDelete: 'CASCADE' });
UserModel.hasMany(ProductModel);
UserModel.hasOne(CartModel);
CartModel.belongsTo(UserModel);
CartModel.belongsToMany(ProductModel, { through: CartItemModel });
ProductModel.belongsToMany(CartModel, { through: CartItemModel });
OrderModel.belongsTo(UserModel);
UserModel.hasMany(OrderModel);
OrderModel.belongsToMany(ProductModel, { through: OrderItemModel });

sequelize
	// .sync({ force: true })
	.sync()
	.then((result) => {
		return UserModel.findByPk(1);
		// console.log(result);
	})
	.then((user) => {
		if (!user) {
			return UserModel.create({
				name: 'Walter',
				email: 'waly@mail.com',
			});
		}
		return user;
	})
	.then((user) => {
		// console.log(user);
		return user.createCart();
	})
	.then((cart) => {
		app.listen(3000, console.log('Running in PORT', 3000));
	})
	.catch((err) => console.log(err));
