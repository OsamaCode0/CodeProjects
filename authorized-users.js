

function isAuthorizedUser (isAuthorizedUser) {
  return function(id) {
    return isAuthorizedUser(id)
  };
}