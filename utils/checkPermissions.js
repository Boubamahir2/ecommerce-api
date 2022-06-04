const CustomError = require('../errors');

const chechPermissions = (requestUser, resourceUserId) => {
  // the resourceUserId is the id of the user that is being accessed by the requestUser and its an id object so we need to convert it to a string(userId.toString())
  // console.log(requestUser);
  // console.log(resourceUserId);
  // console.log(typeof resourceUserId);
  if (requestUser.role === 'admin') return; // if the user is an admin, return from the function and do not throw an error, whiwch will allow the admin to access the route and see all users
  if (requestUser.userId === resourceUserId.toString()) return; // if the user is the same as the resource user, return from the function and do not throw an error which let see the user's own profile
  throw new CustomError.UnauthorizedError(
    'Not authorized to access this route'
  );
};

module.exports = chechPermissions;
