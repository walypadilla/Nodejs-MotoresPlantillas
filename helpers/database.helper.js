const Sequelize = require('sequelize');
const { PASSWORDSQL } = require('../config/config');

const sequelize = new Sequelize('node-complete', 'root', PASSWORDSQL, {
	dialect: 'mysql',
	host: 'localhost',
});

module.exports = sequelize;
