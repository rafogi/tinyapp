//check if user is registered in Database
const getUserByEmail = function(email, database) {
  let user;
  for(let id in database) {
    if (database[id].email === email) {
      user = database[id].id;
    }
  } return user;
};

module.exports = getUserByEmail;