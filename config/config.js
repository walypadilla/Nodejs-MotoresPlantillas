if (process.env.NODE_ENV !== 'production') {
	const dotenv = require('dotenv');
	const result = dotenv.config();
	if (result.error) {
		throw result.error;
	}
}

module.exports = {
	PASSWORDSQL: process.env.PASSWORDSQL,
	MONGO_URI: process.env.MONGO_URI,
	SECRET_SESSION: process.env.SECRET_SESSION,
	SEND_GRID_KEY: process.env.SEND_GRID_KEY,
	STRIPE_KEY: process.env.STRIPE_KEY,
	PORT: process.env.PORT,
};
