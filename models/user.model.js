const Sequelize = require('sequelize');

const sequelize = require('../helpers/database.helper');

const UserModel = sequelize.define('user', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	name: {
		type: Sequelize.STRING,
	},
	email: {
		type: Sequelize.STRING,
	},
});

module.exports = UserModel;
