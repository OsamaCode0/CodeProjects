

function isAuthorizedUser (AuthorizedUser) {
  return function(id) {
    return AuthorizedUser(id)
  };
}