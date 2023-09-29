const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/user');
const router = express.Router();
const isAuth = require('../middleware/auth');

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Error: Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then((user) => {
            if (user) {
              return Promise.reject('Error: Email address already exists.');
            }
          })
      })
      .normalizeEmail(),
    body('password')
      .isLength({ min: 5 }),
    body('name')
      .not()
      .isEmpty(),
  ],
  authController.signUp,
);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getUserStatus);

router.put(
  '/status',
  isAuth,
  [
    body('status')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.updateUserStatus
);

module.exports = router;
