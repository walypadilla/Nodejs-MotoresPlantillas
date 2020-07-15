const { UserModel } = require('../models/index.model');
const { MONGO_URI } = require('../config/config');

// ============================================
//  route protection
// ============================================
let isAuthMiddleware = (req, res, next) => {
	if (!req.session.isLoggedIn) {
		return res.redirect('/login');
	}
	next();
};

// ============================================
//  Session verification
// ============================================
let sessionMidleware = (req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	UserModel.findById(req.session.user._id)
		.then((user) => {
			req.user = user;
			next();
		})
		.catch((err) => console.log(err));
};

module.exports = {
	isAuthMiddleware,
	sessionMidleware,
};
