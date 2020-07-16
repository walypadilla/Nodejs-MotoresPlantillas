const express = require('express');

const { AuthController } = require('../controllers/index.controller');

const router = express.Router();

router.get('/login', AuthController.getLogin);
router.get('/signup', AuthController.getSignup);
router.post('/login', AuthController.postLogin);
router.post('/signup', AuthController.postSignup);
router.post('/logout', AuthController.postLogout);
router.get('/reset', AuthController.getReset);
router.post('/reset', AuthController.postReset);
router.get('/reset/:token', AuthController.getNewPassword);
router.post('/new-password', AuthController.postNewPassword);

module.exports = router;
