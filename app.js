// app.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./db/schema'); // Import the database schema

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(session({
    secret: 'your-secret-key', // Provide a secret key for session encryption
    resave: false,
    saveUninitialized: true
}));
// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the homepage');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});

// Registration route
app.post('/regis', (req, res) => {
  const test = { username, password } = req.body;
  console.log(test) // <-- Issue here
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], (err) => {
      if (err) {
          res.status(500).send('Error registering user');
      } else {
          res.send('Registration Successful');
      }
  });
});



app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});


app.post('/log', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
      if (err) {
          console.error('Error logging in:', err);
          res.status(500).send('Error logging in');
      } else if (!user) {
          res.send('User not found'); // Handle case where user is not found
      } else if (user.password !== password) {
          res.send('Invalid password'); // Handle case where password is incorrect
      } else {
        console.log(user)
          req.session.user = user;
          console.log(user)
          res.send('Login Successful');
      }
  });
});;

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logged out successfully');
});

function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

app.get('/profile', requireLogin, (req, res) => {
    res.send('Profile Page');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
