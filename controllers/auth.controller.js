const { UserModel } = require('../models/index.model');

exports.getLogin = (req, res, next) => {
	// const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
	console.log(req.session.isLoggedIn);
	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		isAuthenticated: false,
	});
};

exports.postLogin = (req, res, next) => {
	// req.isLoggedIn = true;
	UserModel.findById('5f04ed8a71c45b296c07c08b')
		.then((user) => {
			req.session.isLoggedIn = true;
			req.session.user = user;
			req.session.save((err) => {
				res.redirect('/');
			});
		})
		.catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
};
