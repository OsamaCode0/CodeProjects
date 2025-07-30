


function isAuthorizedUser(authList) {
  return function(idToCheck) {
    return authList.includes(idToCheck);
  };
}
