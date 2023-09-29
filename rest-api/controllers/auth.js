const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { SECRET_KEY } = require('../constants/auth');
const handleError = require('../helpers/error-handler');

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  bcrypt.hash(password, 12)
    .then((hashedPassword) => {
      return new User({
        email: email,
        password: hashedPassword,
        name: name,
      }).save()
    })
    .then((result) => {
      return res.status(201).json({
        message: 'User created successfully!',
        userId: result._id.toString(),
      });
    })
    .catch((err) => {
      handleError(err, next);
    });
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  return User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error('Error: User cannot be found');
        error.statusCode = 404;
        throw error;
      }
      loadedUser = user;

      return bcrypt.compare (password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error('Error: Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.status(201).json({
        message: 'User logged!',
        userId: loadedUser._id.toString(),
        token: token,
      });
    })
    .catch((err) => {
      handleError(err, next);
      return err;
    });
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      const error = new Error('Error: User Not Found');
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      message: 'Fetched user status successfully',
      status: user.status,
    });
  } catch (error) {
    handleError(error, next);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      const error = new Error('Error: User Not Found');
      error.statusCode = 404;
      throw error;
    }

    user.status = newStatus;
    await user.save();
    
    return res.status(200).json({
      message: 'Status updated successfully',
      status: user.status,
    });
  } catch (error) {
    handleError(error, next);
  }
};