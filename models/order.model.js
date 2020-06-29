const Sequelize = require('sequelize');

const sequelize = require('../helpers/database.helper');

const OrderModel = sequelize.define('order', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
});

module.exports = OrderModel;
