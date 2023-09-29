const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'otpfiora@gmail.com',
    pass: 'hxkleksbyhldmvfs',
  },
});

exports.getLogin = (req, res, next) => {
  let msg = req.flash('error');
  msg = msg.length > 0 ? msg[0] : null;

  req.session.isLoggedIn
    ? res.redirect('/')
    : res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: msg,
        oldInput: null,
        validationErrors: [],
      });
};

exports.getSignup = (req, res, next) => {
  let msg = req.flash('error');
  msg = msg.length > 0 ? msg[0] : null;
  
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: msg,
    oldInput: null,
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      errorMessage: errors.array()[0].msg,
      oldInput: {...req.body},
      validationErrors: errors.array(),
    });
  }
  
  const email = req.body.email;
  const password = req.body.password;
  
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
          path: '/login',
          errorMessage: 'Error: Invalid email or password.',
          oldInput: {...req.body},
          validationErrors: [],
        });
      }

      return bcrypt.compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            });
          }

          return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: 'Error: Invalid email or password.',
            oldInput: {...req.body},
            validationErrors: [],
          });
        });
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.postSignup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {...req.body},
      validationErrors: errors.array(),
    });
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password; 

  bcrypt.hash(password, 12)
    .then((hashedPassword) => {
      return new User({
        name: name,
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      }).save();
    })
    .then(() => {
      res.redirect('/login');

      transporter.sendMail({
        to: email,
        from: 'otpfiora@gmail.com',
        subject: 'Successful Registration!',
        text: 'Easy',
      }).catch((err) => {
        console.log(err);
      });
    })
    .catch((err) => {
      next(new Error(err));
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    return res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let msg = req.flash('error');
  msg = msg.length > 0 ? msg[0] : null;

  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    path: '/reset',
    errorMessage: msg,
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');

    User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Error: E-Mail does not exists.');
        return res.redirect('/reset');
      }

      const oneHourInMiliseconds = 3600000;
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + oneHourInMiliseconds;
      return user.save();
    })
    .then((result) => {
      res.redirect('/');
      transporter.sendMail({
        to: email,
        from: 'otpfiora@gmail.com',
        subject: 'Password Reset',
        html: `
          <h1>Password Reset</h1>
          <p>You requested a password reset.</p>
          <p>Click <a href="http://localhost:3000/reset/${token}">here to set a new password.</a></p>
        `,
      }).catch((err) => {
        console.log(err);
      });
    })
    .catch((err) => {
      next(new Error(err));
    });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now()
    },
  }).then((user) => {
    let msg = req.flash('error');
    msg = msg.length > 0 ? msg[0] : null;
  
    res.render('auth/new-password', {
      pageTitle: 'New Password',
      path: '/new-password',
      errorMessage: msg,
      userId: user._id.toString(),
      passwordToken: token,
    });
  })
  .catch((err) => {
    next(new Error(err));
  });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/new-password', {
      pageTitle: 'New Password',
      path: '/new-password',
      errorMessage: errors.array()[0].msg,
      userId: userId,
      passwordToken: passwordToken,
    });
  }

  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: {
      $gt: Date.now()
    },
  }).then((user) => {
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
      return res.redirect('/login');
    })
    .catch((err) => {
      next(new Error(err));
    });
};
