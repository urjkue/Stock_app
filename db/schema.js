// schema.js
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('./database.db'); // File-based SQLite database

// Create users table if not exists
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS stocks (id INTEGER PRIMARY KEY, stocks TEXT[], user_id INTEGER, FOREIGN KEY (user_id) REFERENCES users(id))");

});

// Export the database object
module.exports = db;
