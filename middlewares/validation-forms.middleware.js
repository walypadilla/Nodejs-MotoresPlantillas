const { check, body } = require('express-validator');
const { UserModel } = require('../models/index.model');

let validationConditions = [
	check('title')
		.isString()
		.isLength({ min: 3, max: 50 })
		.trim()
		.withMessage('Title must be at least 3 chars and max 50 chars'),
	check('price')
		.isFloat({ min: 0.0, max: 1000000.0 })
		.trim()
		.withMessage('Price can be positve value only'),
	check('description')
		.trim()
		.isLength({ max: 100 })
		.withMessage(
			'Please enter a vlid Product desctription, maxium 100 characters long.'
		),
];

let validationLogin = [
	body('email')
		.isEmail()
		.withMessage('Please enter a valid email address.')
		.normalizeEmail(),
	body('password', 'Password has to be valid.')
		.isLength({ min: 5 })
		.isAlphanumeric()
		.trim(),
];

let validationSignup = [
	check('name')
		.isString()
		.isLength({ min: 1, max: 50 })
		.trim()
		.withMessage('Title must be at least 1 chars and max 50 chars'),
	check('email')
		.isEmail()
		.withMessage('Please enter a valid email.')
		.custom((value, { req }) => {
			// if (value === 'test@test.com') {
			//   throw new Error('This email address if forbidden.');
			// }
			// return true;
			return UserModel.findOne({ email: value }).then((userDoc) => {
				if (userDoc) {
					return Promise.reject(
						'E-Mail exists already, please pick a different one.'
					);
				}
			});
		})
		.normalizeEmail(),
	body(
		'password',
		'Please enter a password with only numbers and text and at least 5 characters.'
	)
		.isLength({ min: 5 })
		.isAlphanumeric()
		.trim(),
	body('confirmPassword')
		.trim()
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Passwords have to match!');
			}
			return true;
		}),
];

let validationResetPassword = [
	check('email')
		.isEmail()
		.withMessage('Please enter a valid email.')
		.custom((value, { req }) => {
			// if (value === 'test@test.com') {
			//   throw new Error('This email address if forbidden.');
			// }
			// return true;
			return UserModel.findOne({ email: value }).then((userDoc) => {
				if (!userDoc) {
					return Promise.reject(
						'Email does not exist, choose a different one.'
					);
				}
			});
		})
		.normalizeEmail(),
];

let validationNewPassword = [
	body(
		'password',
		'Please enter a password with only numbers and text and at least 5 characters.'
	)
		.isLength({ min: 5 })
		.isAlphanumeric()
		.trim(),
];

module.exports = {
	validationConditions,
	validationLogin,
	validationSignup,
	validationResetPassword,
	validationNewPassword,
};
