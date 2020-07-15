const express = require('express');

const { AuthController } = require('../controllers/index.controller');

const router = express.Router();

router.get('/login', AuthController.getLogin);
router.get('/signup', AuthController.getSignup);
router.post('/login', AuthController.postLogin);
router.post('/signup', AuthController.postSignup);
router.post('/logout', AuthController.postLogout);

module.exports = router;
