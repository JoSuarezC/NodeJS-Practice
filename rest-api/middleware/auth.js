const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../constants/auth');
const handleError = require('../helpers/error-handler');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    const error = new Error('Error: Not Authenticated.');
    error.statusCode = 401;
    throw error;
    return handleError(error, next);
  }

  const token = authHeader.split(' ')[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, SECRET_KEY);
  } catch(error) {
    throw error;
    return handleError(error, next);
  }

  if (!decodedToken) {
    const error = new Error('Error: Not Authenticated.');
    error.statusCode = 401;
    throw error;
    return handleError(error, next);
  }

  req.userId = decodedToken.userId;
  next();
};