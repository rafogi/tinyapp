//functions
const generateRandomString = function() {
  let ans = Math.random().toString(36).slice(3,9);
  
  return ans;
};

//check database if any users are already registered with that name
const regCheck = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
      return true;
    }
  } return false;
};

//check if user is registered in Database
const getUserByEmail = function(email, database) {
  let user;
  for(let id in database) {
    if (database[id].email === email) {
      user = database[id].id;
    }
  } return user;
};

//check for specific urls for user in database

const urlsForUsers = (id, database) => {
  let newOb = {};
  for (let urls in database) {
    if (id === database[urls].userID) {
      newOb[urls] = database[urls];
    }
  }
  return newOb;
};

//check if the user is logged in
const loginCheck = (id) => {
  if (id) {
    return true;
  } else {
    return false;
  }
};

module.exports = { getUserByEmail, generateRandomString, regCheck, loginCheck, urlsForUsers}