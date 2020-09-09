const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, regCheck, loginCheck, urlsForUsers } = require('./helpers');

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

//check for specific urls for user in database



app.set("view engine", "ejs");

//directs to urls page
app.get("/urls", (req, res) => {
  let userRL = urlsForUsers(req.session.user_id, urlDatabase);
  let templateVars = {
    urls: userRL,
    user_id: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
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

app.get('/', (req,res) => {
  res.redirect('/urls');
});


//adding new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  if (longURL.substring(0,4) !== 'http') {
    longURL = 'http://' + longURL;
  }
  urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id};
  res.redirect(`/urls`);
});
//editing url page
app.get("/urls/:shortURL", (req, res) => {
  let userRL = urlsForUsers(req.session.user_id, urlDatabase);
  if (loginCheck(req.session.user_id) && userRL[req.params.shortURL]) { //check if user is logged in
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
  let userRL = urlsForUsers(req.session.user_id, urlDatabase);
  if (loginCheck(req.session.user_id && userRL[req.params.shortURL])) { //check if user is logged in
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
  let userRL = urlsForUsers(req.session.user_id, urlDatabase);
  if (loginCheck(req.session.user_id && userRL[req.params.shortURL])) {
    let longURL = req.body['longURL'];
    if (longURL.substring(0,4) !== 'http') {
      longURL = 'http://' + longURL;
    }
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id};
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
    return res.status(400).send('email or password empty <a href="/login"> try again</a>');
  } else {
    let user = getUserByEmail(email, users);
    if (user && bcrypt.compareSync(password, users[user].password)) {
      req.session.user_id = users[user].id;
      return res.redirect('/urls');
    } else {
      res.status(403).send('User and Password do not match <a href="/login"> try again</a>');
    }
  }
});

//handle register boxes
app.post('/register', (req,res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('email or password empty <a href="/login"> try again</a>');
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
    req.session.user_id = users[id].id;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

