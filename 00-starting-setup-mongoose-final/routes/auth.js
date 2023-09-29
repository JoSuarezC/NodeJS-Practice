const express = require('express');
const authController = require('../controllers/auth');
const User = require('../models/user');
const validators = require('../middleware/validators');
const router = express.Router();
const { body } = require('express-validator');

// GET

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

// POST

router.post(
  '/new-password',
  [
    validators.password(),
    validators.passwordConfirmation(),
  ],
  authController.postNewPassword
);

router.post('/reset', authController.postReset);

router.post(
  '/login',
  [
    validators.email(),
    validators.required('password'),
  ],
  authController.postLogin,
);

router.post(
  '/signup',
  [
    validators.required('name'),
    validators.email()
      .custom((value, { req }) => {
        if (!checkEmailExists) 
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('Error: E-Mail already exists.');
          }
        });
      }),
    validators.password(),
    validators.passwordConfirmation(),
  ],
  authController.postSignup,
);

router.post('/logout', authController.postLogout);

module.exports = router;