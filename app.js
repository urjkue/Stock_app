const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Redis = require('ioredis'); // Import the Redis module
const RedisStore = require('connect-redis')(session);
const bcrypt = require('bcryptjs');
const db = require('./db/schema'); // Import the database schema

const app = express();
const PORT = process.env.PORT || 3000;

// Create a Redis client
const redisClient = new Redis({
  host: 'localhost', // Redis server host
  port: 6379, // Redis server port
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    store: new RedisStore({ client: redisClient }), // Pass the Redis client to the RedisStore
    secret: 'your-secret-key',
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
  const { username, password } = req.body;
  console.log({ username, password });
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function(err) {
    if (err) {
      res.status(500).send('Error registering user');
    } else {
      const user_id = this.lastID; // Get the last inserted row ID
      console.log('User ID:', user_id);
      db.run("INSERT INTO stocks (stocks, user_id) VALUES (?, ?)", [JSON.stringify([]), user_id], function(err) {
        if (err) {
          res.status(500).send('Error creating stock record for user');
        } else {
          res.send('Registration Successful');
        }
      });
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

app.post('/data',requireLogin,(req,res)=>{

  const userId = req.session.user.id;
  db.get("SELECT stocks FROM stocks WHERE user_id = ?;",userId, (err, row) => {
    if (err) {
        console.error("Error:", err);
    } else {
        console.log(row);
        res.send(row.stocks);
    }
});

})

app.get('/profile', requireLogin, (req, res) => {
  res.sendFile(__dirname + '/public/profile.html');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
