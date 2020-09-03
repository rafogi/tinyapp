const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));

app.use(bodyParser.urlencoded({extended: true}));

//global
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "1234" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "1234" }
};

const users = {
  "1234": {
    id: "1234",
    email: "goku@saiyan.com",
    password: bcrypt.hashSync("food",1)
  },
  "4567": {
    id: "4567",
    email: "gohan@saiyan.com",
    password: bcrypt.hashSync("dog",1)
  }
};

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


//check for specific urls for user in database

const urlsForUsers = (id) => {
  let newOb = {};
  for (let urls in urlDatabase) {
    if (id === urlDatabase[urls].userID) {
      newOb[urls] = urlDatabase[urls];
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


app.set("view engine", "ejs");

//directs to urls page
app.get("/urls", (req, res) => {
  let userRL = urlsForUsers(req.session.user_id);
  let templateVars = {
    urls: userRL,
    user_id: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});
//the hello world page
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!',
    user_id: users[req.session.user_id]
  };
  res.render("hello_world", templateVars);
});
//new url page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  } else {
    let templateVars = {
      user_id: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});
//adding new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id};
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});
//editing url page
app.get("/urls/:shortURL", (req, res) => {
  if (loginCheck(req.session.user_id)) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user_id: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
    return;
  } else {
    res.status(403).send('you shall not pass');
    res.redirect('login');
  }
});

// Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  if (loginCheck(req.session.user_id)) {
    const del = req.params.shortURL;
    delete urlDatabase[del];
    res.redirect('/urls');
    return;
  } else {
    res.status(403).send('you shall not pass');
    res.redirect('login');
  }
});

// Edit
app.post('/urls/:shortURL', (req, res) => {
  if (loginCheck(req.session.user_id)) {
    const long = req.body['longURL'];
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = {longURL: long, userID: req.session.user_id};
    res.redirect(`/urls`);
    return;
  } else {
    res.status(403).send('you shall not pass');
    res.redirect('login');
  }
});


//logout
app.post('/logout', (req,res) => {
  req.session = null;
  res.redirect('/urls');
});

//linking to actual url page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//register

app.get('/register', (req,res) => {
  res.render('register');
});

//login page
app.get('/login', (req,res) => {
  res.render('login');
});

//handle login boxes

app.post('/login', (req,res) => {
  const { email, password } = {email: req.body.email, password: req.body.password};
  if (!req.body.email || !req.body.password) { //if my boxes are empty
    return res.status(400).send('email or passowrd empty <a href="/login"> try again</a>');
  } else {
    
    for (let id in users) {
      if (users[id].email === email && bcrypt.compareSync(password, users[id].password)) {
        req.session.user_id = users[id].id;
        return res.redirect('/urls');
      }
    }
  }
  res.status(403).send('User and Password do not match <a href="/login"> try again</a>');
});

//handle register boxes
app.post('/register', (req,res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('email or passowrd empty <a href="/login"> try again</a>');
  } else if (regCheck(req.body.email, users)) { //check if email is already in database
    return res.status(403).send('email already in database try a different email <a href="/register"> try again</a>');
  } else {
    const id = generateRandomString().slice(2);
    const { email, password } = {email: req.body.email, password: req.body.password};
    const hashword = bcrypt.hashSync(password, 1);
    users[id] = {
      id: id,
      email: email,
      password: hashword
    };
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

