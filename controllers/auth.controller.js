const cryto = require('crypto');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

const { UserModel } = require('../models/index.model');
const { SEND_GRID_KEY } = require('../config/config');

sgMail.setApiKey(SEND_GRID_KEY);

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
			const msg = {
				to: email,
				from: 'walter04padilla@gmail.com',
				subject: 'Signup succeeded!',
				html: '<h1>You successfully signed up!</h1>',
			};
			return sgMail.send(msg);
		})
		.catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
};

exports.getReset = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/reset', {
		path: '/login',
		pageTitle: 'Reset Password',
		errorMessage: message,
	});
};

exports.postReset = (req, res, next) => {
	cryto.randomBytes(32, (err, buffer) => {
		if (err) {
			return res.redirect('/reset');
		}
		const token = buffer.toString('hex');
		UserModel.findOne({ email: req.body.email })
			.then((user) => {
				if (!user) {
					req.flash('error', 'No account with that email found.');
					return res.redirect('/reset');
				}
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 3600000;
				return user.save();
			})
			.then((result) => {
				res.redirect('/');
				const resetMsg = {
					to: req.body.email,
					from: 'walter04padilla@gmail.com',
					subject: 'Password Reset',
					html: `
						<p>Your reseted password </p>
						<p>Click this <a href="http://localhost:3000/reset/${token}">Link</a>
							a <strong>other password</strong>
						</p>
					`,
				};
				return sgMail.send(resetMsg);
			})
			.catch((err) => console.log(err));
	});
};

exports.getNewPassword = (req, res, next) => {
	const token = req.params.token;
	UserModel.findOne({
		resetToken: token,
		resetTokenExpiration: { $gt: Date.now() },
	})
		.then((user) => {
			let message = req.flash('error');
			if (message.length > 0) {
				message = message[0];
			} else {
				message = null;
			}
			res.render('auth/new-password', {
				path: '/new-password',
				pageTitle: 'New Password',
				errorMessage: message,
				userId: user._id.toString(),
				passwordToken: token,
			});
		})
		.catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
	const newPassword = req.body.password;
	const userId = req.body.userId;
	const passwordToken = req.body.passwordToken;
	let resetUser;

	UserModel.findOne({
		resetToken: passwordToken,
		resetTokenExpiration: { $gt: Date.now() },
		_id: userId,
	})
		.then((user) => {
			resetUser = user;
			return bcrypt.hash(newPassword, 12);
		})
		.then((hashedPassword) => {
			resetUser.password = hashedPassword;
			resetUser.resetToken = undefined;
			resetUser.resetTokenExpiration = undefined;
			return resetUser.save();
		})
		.then((result) => {
			res.redirect('/login');
		})
		.catch((err) => {
			console.log(err);
		});
};
