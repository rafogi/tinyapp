const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));


//global 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "1234": {
    id: "1234", 
    email: "goku@saiyan.com", 
    password: "food"
  },
 "4567": {
    id: "4567", 
    email: "gohan@saiyan.com", 
    password: "dog"
  }
};

//functions 
const generateRandomString = function() {
  let ans = Math.random().toString(36).slice(3,9);
  
  return ans;
};

//check registration

const regCheck = (email) => {
  for(let id in users) {
    if (users[id].email === email) {
      return true;
    }
  } return false;
}

app.set("view engine", "ejs");

//directs to urls page
app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user_id: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});
//the hello world page
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!',
    user_id: users[req.cookies.user_id]
  };
  res.render("hello_world", templateVars);
});
//new url page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});
//adding new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});
//editing url page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
     user_id: users[req.cookies.user_id]
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


//logout
app.post('/logout', (req,res) => {
  res.clearCookie('user_id', req.body.user_id);
  res.redirect('/urls');
});

//linking to actual url page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
  if(!req.body.email || !req.body.password){ //if my boxes are empty
    return res.status(400).send('email or passowrd empty <a href="/login"> try again</a>');
  } else {
  for(let id in users) {
    if(users[id].email === email && users[id].password === password) {
      res.cookie('user_id', users[id].id);
      return res.redirect('/urls');
    }
  }
}
  res.status(403).send('User and Password do not match <a href="/login"> try again</a>');
})

//handle register boxes
app.post('/register', (req,res) => {
  if(!req.body.email || !req.body.password){
    return res.status(400).send('email or passowrd empty <a href="/login"> try again</a>');
  } else if (regCheck(req.body.email)) { //check if email is already in database
    return res.status(403).send('email already in database try a different email <a href="/register"> try again</a>');
  } else {
  const id = generateRandomString().slice(2);
  const { email, password } = {email: req.body.email, password: req.body.password}

  users[id] = {
    id: id,
    email: email,
    password: password
  };
  res.redirect('/login');
}
});








app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});