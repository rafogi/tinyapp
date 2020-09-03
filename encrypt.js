const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 1);
console.log(password, hashedPassword);

bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); // returns true
bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false