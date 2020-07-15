const { UserModel } = require('../models/index.model');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
	// const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		errorMessage: message,
	});
};

exports.getSignup = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/signup', {
		path: '/signup',
		pageTitle: 'Signup',
		errorMessage: message,
	});
};

exports.postLogin = (req, res, next) => {
	const { email, password } = req.body;
	UserModel.findOne({ email: email })
		.then((user) => {
			if (!user) {
				req.flash('error', 'Invalid email or password');
				res.redirect('/login');
			}
			bcrypt
				.compare(password, user.password)
				.then((doMacth) => {
					if (doMacth) {
						req.session.isLoggedIn = true;
						req.session.user = user;
						return req.session.save((err) => {
							console.log(err);
							res.redirect('/');
						});
					} else {
						req.flash('error', 'Invalid email or password');
						res.redirect('/login');
					}
				})
				.catch((err) => {
					console.log(err);
					res.redirect('/login');
				});
		})
		.catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
	const { name, email, password, confirmPassword } = req.body;
	UserModel.findOne({ email: email })
		.then((userDoc) => {
			if (userDoc) {
				req.flash('error', 'Email is already registered ');
				return res.redirect('/signup');
			}
			return bcrypt.hash(password, 12).then((hashedPassword) => {
				if (password === '' || confirmPassword == '') {
					req.flash('error', 'password is required');
					return res.redirect('/signup');
				}
				if (confirmPassword === password) {
					const user = new UserModel({
						name: name,
						email: email,
						password: hashedPassword,
						cart: { items: [], pay: 0 },
					});
					return user.save();
				} else {
					req.flash('error', 'passwords are not the same');
					return res.redirect('/signup');
				}
			});
		})

		.then((result) => {
			res.redirect('/login');
		})
		.catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
};
