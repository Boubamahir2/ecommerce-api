const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

// authenticateUser is a middleware that checks if the user is authenticated
const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

// authorizePermissions is a middleware that checks if the user has the required permissions
// here we are checking if the user is an admin
//this function must return a callback function or else express will complain 
// the three dots (...) means that we are passing in a several number of arguments
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
