const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function() {
  let ans = Math.random().toString(36).slice(3,9);
  
  return ans;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!',
    username: req.cookies["username"]
  };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const del = req.params.shortURL;
  delete urlDatabase[del];
  res.redirect('/urls');
});

// Edit
app.post('/urls/:shortURL', (req, res) => {
  const long = req.body['longURL'];
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = long;

  res.redirect(`/urls`);
});

//login

app.post('/login', (req,res) => {
  res.cookie("username", req.body['username']);
  res.redirect('/urls');
});

app.post('/logout', (req,res) => {
  res.clearCookie('username', req.body.username);
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});