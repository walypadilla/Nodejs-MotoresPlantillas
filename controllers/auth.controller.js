const cryto = require('crypto');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const { validationResult } = require('express-validator');

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
		oldInput: {
			email: '',
			password: '',
		},
		validationErrors: [],
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
		oldInput: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
		validationErrors: [],
	});
};

exports.postLogin = (req, res, next) => {
	const { email, password } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/login', {
			path: '/login',
			pageTitle: 'Login',
			errorMessage: errors.array()[0].msg,
			oldInput: {
				email: email,
				password: password,
			},
			validationErrors: errors.array(),
		});
	}
	// if no validation errors in the controller
	UserModel.findOne({ email: email })
		.then((user) => {
			// if user does not exist
			if (!user) {
				return res.status(422).render('auth/login', {
					path: '/login',
					pageTitle: 'Login',
					errorMessage: 'Invalid email or password.',
					oldInput: {
						email: email,
						password: password,
					},
					validationErrors: [],
				});
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
						// if password is invalid
						return res.status(422).render('auth/login', {
							path: '/login',
							pageTitle: 'Login',
							errorMessage: 'Invalid email or password.',
							oldInput: {
								email: email,
								password: password,
							},
							validationErrors: [],
						});
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

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render('auth/signup', {
			path: '/signup',
			pageTitle: 'Signup',
			errorMessage: errors.array()[0].msg,
			oldInput: {
				name: name,
				email: email,
				password: password,
				confirmPassword: confirmPassword,
			},
			validationErrors: errors.array(),
		});
	}
	// if no validation errors in the controller
	bcrypt
		.hash(password, 12)
		.then((hashedPassword) => {
			const user = new UserModel({
				name: name,
				email: email,
				password: hashedPassword,
				cart: { items: [], pay: 0 },
			});
			return user.save();
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
		errorMessage: message,
		oldInput: {
			password: '',
		},
		validationErrors: [],
	});
};

exports.postReset = (req, res, next) => {
	cryto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.status(422).render('auth/reset', {
				path: '/reset',
				pageTitle: 'Reset Password',
				errorMessage: 'Invalid email, please enter a different one',
				oldInput: {
					email: req.body.email,
				},
				validationErrors: [],
			});
		}
		// if no validation errors in the controller
		const token = buffer.toString('hex');
		UserModel.findOne({ email: req.body.email })
			.then((user) => {
				// if user does not exist
				if (!user) {
					return res.status(422).render('auth/reset', {
						path: '/reset',
						pageTitle: 'Reset Password',
						errorMessage: 'Unregistered mail, please enter a different one',
						oldInput: {
							email: req.body.email,
						},
						validationErrors: [],
					});
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
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/new-password', {
			path: '/new-password',
			pageTitle: 'New Password',
			errorMessage: message,
			userId: user._id.toString(),
			passwordToken: token,
			errorMessage: errors.array()[0].msg,
			oldInput: {
				password: newPassword,
			},
			validationErrors: errors.array(),
		});
	}

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
