const { MONGO_URI } = require('../config/config');

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
	MongoClient.connect(MONGO_URI, { useUnifiedTopology: true })
		.then((client) => {
			console.log('Connected! MongoDB');
			_db = client.db();
			callback();
		})
		.catch((err) => {
			console.log(err);
			throw err;
		});
};

const getDb = () => {
	if (_db) {
		return _db;
	}
	throw 'No database Found!';
};

module.exports = {
	mongoConnect: mongoConnect,
	getDb: getDb,
};
