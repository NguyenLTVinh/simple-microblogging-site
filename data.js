// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); // npm install mysql-await

// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// this is used a bit differently, but I think it's just better -- especially if server is doing heavy work.
var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  host: "127.0.0.1",// this will work
  user: "C4131F23U159",
  database: "C4131F23U159",
  password: "25331", // we really shouldn't be saving this here long-term -- and I probably shouldn't be sharing it with you...
});

async function addUser(username, email, hashedPassword) {
  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  const values = [username, email, hashedPassword];

  try {
      const result = await connPool.awaitQuery(query, values);
      return result;
  } catch (err) {
      console.error(err);
      throw err;
  }
}

async function getUserByUsernameOrEmail(username, email) {
  const query = 'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1';
  const values = [username, email];

  try {
      const results = await connPool.awaitQuery(query, values);
      return results[0];
  } catch (err) {
      console.error(err);
      throw err;
  }
}

async function addPost(userId, content) {
  const query = 'INSERT INTO posts (user_id, content) VALUES (?, ?)';
  const values = [userId, content];

  try {
      const result = await connPool.awaitQuery(query, values);
      return result.insertId;
  } catch (err) {
      console.error(err);
      throw err;
  }
}

module.exports = { addUser, getUserByUsernameOrEmail};
