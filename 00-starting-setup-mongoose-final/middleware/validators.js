const { check, body } = require('express-validator');

exports.password = () => {
  return body(
    'password',
    'Error: Please enter a password with only numbers and text and at least 5 characters long.',
  ) // Look for password in body only.
    .isLength({ min: 5 })
    .isAlphanumeric()
    .custom((value, { req }) => {
      if (value === 'test@test.com') {
        throw new Error('Error: This email is forbidden');
      }
  
      return true;
    });
};

exports.passwordConfirmation = () => {
  return body('confirmPassword')
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Error: Passwords have to match.');
      }

      return true;
    });
};

exports.email = () => {
  return check('email') // Look for email in body, cookies, header
    .isEmail()
    .withMessage('Error: Please enter a valid email.')
    .normalizeEmail()
};

exports.money = () => {
  return body('price')
    .isCurrency({allow_negatives: false})
    .withMessage('Error: Please enter a valid price.')
};

exports.required = (param) => {
  return body(param)
  .custom((value, {req}) => {
    if (!value) {
      throw new Error(`Error: Field ${param} is required.`);
    }

    return true;
  });
}


