//check if user is registered in Database
const regCheck = (email, database) => {
  for(let id in database) {
    if (database[id].email === email) {
      return true;
    }
  } return false;
};

module.exports = regCheck;