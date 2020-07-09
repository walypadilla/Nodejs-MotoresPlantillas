const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderSchema = new Schema({
	products: [
		{
			product: { type: Object, require: true },
			quantity: { type: Number },
		},
	],
	totalOrder: {
		type: Number,
	},

	user: {
		name: {
			type: String,
			require: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
	},
});

module.exports = mongoose.model('Order', orderSchema);
