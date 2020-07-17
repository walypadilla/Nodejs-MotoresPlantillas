const express = require('express');

const { AuthController } = require('../controllers/index.controller');
const {
	validationLogin,
	validationSignup,
	validationResetPassword,
	validationNewPassword,
} = require('../middlewares/validation-forms.middleware');

const router = express.Router();

router.get('/login', AuthController.getLogin);
router.get('/signup', AuthController.getSignup);
router.post('/login', validationLogin, AuthController.postLogin);
router.post('/signup', validationSignup, AuthController.postSignup);
router.post('/logout', AuthController.postLogout);
router.get('/reset', AuthController.getReset);
router.post('/reset', validationResetPassword, AuthController.postReset);
router.get('/reset/:token', AuthController.getNewPassword);
router.post(
	'/new-password',
	validationNewPassword,
	AuthController.postNewPassword
);

module.exports = router;
