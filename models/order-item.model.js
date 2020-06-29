const Sequelize = require('sequelize');

const sequelize = require('../helpers/database.helper');

const OrderItemModel = sequelize.define('orderItem', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	quantity: {
		type: Sequelize.INTEGER,
	},
});

module.exports = OrderItemModel;
