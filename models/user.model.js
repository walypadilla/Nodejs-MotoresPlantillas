const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	cart: {
		items: [
			{
				productId: {
					type: Schema.Types.ObjectId,
					ref: 'Product',
					required: true,
				},
				quantity: { type: Number, required: true },
				totalPay: { type: Number },
			},
		],
		pay: { type: Number },
	},
});

userSchema.methods.addToCart = function (product) {
	const cartProductIndex = this.cart.items.findIndex((cp) => {
		return cp.productId.toString() === product._id.toString();
	});
	let newQuantity = 1;
	let newPrice = product.price;

	const updatedCartItems = [...this.cart.items];

	if (cartProductIndex >= 0) {
		newQuantity = this.cart.items[cartProductIndex].quantity + 1;
		updatedCartItems[cartProductIndex].quantity = newQuantity;

		newPrice =
			Number(this.cart.items[cartProductIndex].totalPay) +
			Number(product.price);
		updatedCartItems[cartProductIndex].totalPay = newPrice;
	} else {
		updatedCartItems.push({
			productId: product._id,
			title: product.title,
			quantity: newQuantity,
			totalPay: newPrice,
		});
	}
	let pay = 0;
	updatedCartItems.forEach((product) => {
		pay = Number(pay) + Number(product.totalPay);
	});

	const updatedCart = {
		items: updatedCartItems,
		pay: pay,
	};

	this.cart = updatedCart;
	return this.save();
};

userSchema.methods.deleteItemCart = function (productId) {
	let pay = 0;
	const updatedCartItems = this.cart.items.filter((item) => {
		return item.productId.toString() !== productId.toString();
	});

	updatedCartItems.forEach((product) => {
		pay = Number(pay) + Number(product.totalPay);
	});

	const updatedCart = {
		items: updatedCartItems,
		pay: pay,
	};

	this.cart = updatedCart;
	return this.save();
};

userSchema.methods.clearCart = function () {
	this.cart = { items: [] };
	return this.save();
};

module.exports = mongoose.model('User', userSchema);
