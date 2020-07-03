const mongodb = require('mongodb');
const getDb = require('../helpers/database.helper').getDb;

const ObjectId = mongodb.ObjectId;

class UserModel {
	constructor(username, email, cart, id) {
		this.username = username;
		this.email = email;
		this.cart = cart; // {items: []}, Total
		this._id = id;
	}

	save() {
		const db = getDb();
		db.collection('users').isertOne(this);
	}

	addToCart(product) {
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
				Number(this.cart.items[cartProductIndex].totalPrice) +
				Number(product.price);
			updatedCartItems[cartProductIndex].totalPrice = newPrice;
		} else {
			updatedCartItems.push({
				productId: new ObjectId(product._id),
				title: product.title,
				quantity: newQuantity,
				totalPrice: newPrice,
			});
		}
		let pay = 0;
		updatedCartItems.forEach((product) => {
			pay = Number(pay) + Number(product.totalPrice);
			console.log(pay);
		});

		const updatedCart = {
			items: updatedCartItems,
			orderPay: { totalPay: pay },
		};
		const db = getDb();
		return db
			.collection('users')
			.updateOne(
				{ _id: new ObjectId(this._id) },
				{ $set: { cart: updatedCart } }
			);
	}

	getCart() {
		const db = getDb();
		const productIds = this.cart.items.map((i) => {
			return i.productId;
		});

		return db
			.collection('products')
			.find({ _id: { $in: productIds } })
			.toArray()
			.then((products) => {
				return products.map((p) => {
					const totalPay = this.cart.orderPay.totalPay;
					return {
						...p,
						quantity: this.cart.items.find((i) => {
							return i.productId.toString() === p._id.toString();
						}).quantity,
						totalPrice: this.cart.items.find((i) => {
							return i.productId.toString() === p._id.toString();
						}).totalPrice,
						totalPay,
					};
				});
			});
	}

	deleteItemCart(productId) {
		const updatedCartItems = this.cart.items.filter((item) => {
			return item.productId.toString() !== productId.toString();
		});

		const db = getDb();
		return db
			.collection('users')
			.updateOne(
				{ _id: new ObjectId(this._id) },
				{ $set: { cart: { items: updatedCartItems } } }
			);
	}

	addOrder() {
		const db = getDb();
		return this.getCart()
			.then((products) => {
				const order = {
					items: products,
					user: {
						_id: new ObjectId(this._id),
						username: this.username,
					},
				};
				return db.collection('orders').insertOne(order);
			})
			.then((result) => {
				this.cart = { items: [], payOrder: {} };
				return db
					.collection('orders')
					.updateOne(
						{ _id: new ObjectId(this._id) },
						{ $set: { cart: { items: [], payOrder: {} } } }
					);
			});
	}

	getOrders() {
		const db = getDb();
		return db
			.collection('orders')
			.find({ 'user._id': new ObjectId(this._id) })
			.toArray();
	}

	static findById(userId) {
		const db = getDb();
		return db
			.collection('users')
			.findOne({ _id: new ObjectId(userId) })
			.then((user) => {
				console.log(user);
				return user;
			})
			.catch((err) => console.log(err));
	}
}

module.exports = UserModel;
