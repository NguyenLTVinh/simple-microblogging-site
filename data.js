// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); // npm install mysql-await

// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// this is used a bit differently, but I think it's just better -- especially if server is doing heavy work.
var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  host: "cse-mysql-classes-01.cse.umn.edu",// this will work
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

async function getPosts(limit = 10, offset = 0, sortBy = 'created_at', userId = null) {
  const query = `
      SELECT posts.*, users.username,
             (SELECT COUNT(*) FROM user_likes WHERE post_id = posts.id AND user_id = ?) as liked
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY ${sortBy} DESC
      LIMIT ? OFFSET ?`;
  const values = [userId, limit, offset];

  try {
      const posts = await connPool.awaitQuery(query, values);
      return posts;
  } catch (err) {
      console.error(err);
      throw err;
  }
}

async function getPostsByUserId(userId, limit = 10, offset = 0, sortBy = 'created_at') {
  const validSortFields = ['created_at', 'like_count'];
  if (!validSortFields.includes(sortBy)) {
      sortBy = 'created_at'; // Default sort
  }

  const query = `
      SELECT posts.*, users.username,
             (SELECT COUNT(*) FROM user_likes WHERE post_id = posts.id) as like_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.user_id = ?
      ORDER BY ${sortBy} DESC
      LIMIT ? OFFSET ?`;
  const values = [userId, limit, offset];

  try {
      const posts = await connPool.awaitQuery(query, values);
      return posts;
  } catch (err) {
      console.error(err);
      throw err;
  }
}

async function getUserPostCount(userId) {
  const query = 'SELECT COUNT(*) AS count FROM posts WHERE user_id = ?';

  try {
      const results = await connPool.awaitQuery(query, [userId]);
      return results[0].count;
  } catch (err) {
      console.error('Error in getUserPostCount:', err);
      throw err;
  }
}

async function updatePost(postId, userId, newContent) {
  const query = 'UPDATE posts SET content = ? WHERE id = ? AND user_id = ?';
  const values = [newContent, postId, userId];

  try {
      await connPool.awaitQuery(query, values);
  } catch (err) {
      console.error(err);
      throw err;
  }
}

async function deletePost(postId, userId) {
  const child_query = 'DELETE FROM user_likes WHERE post_id = ?';
  const parent_query = 'DELETE FROM posts WHERE id = ? AND user_id = ?';
  const values = [postId, userId];

  try {
      await connPool.awaitQuery(child_query, values);
      await connPool.awaitQuery(parent_query, values);
  } catch (err) {
      console.error(err);
      throw err;
  }
}

async function getPostById(postId) {
  const query = 'SELECT * FROM posts WHERE id = ?';
  const values = [postId];

  try {
      const results = await connPool.awaitQuery(query, values);
      return results[0];
  } catch (err) {
      console.error('Error in getPostById:', err);
      throw err;
  }
}

async function getPostCount() {
  const query = 'SELECT COUNT(*) AS count FROM posts';

  try {
      const results = await connPool.awaitQuery(query);
      return results[0].count;
  } catch (err) {
      console.error('Error in getPostCount:', err);
      throw err;
  }
}

// Check if a user has already liked a post
async function checkLike(userId, postId) {
  const query = 'SELECT * FROM user_likes WHERE user_id = ? AND post_id = ?';
  const values = [userId, postId];

  try {
      const results = await connPool.awaitQuery(query, values);
      return results.length > 0;
  } catch (err) {
      console.error(err);
      throw err;
  }
}

// Add a like to a post
async function addLike(userId, postId) {
  const likeQuery = 'INSERT INTO user_likes (user_id, post_id) VALUES (?, ?)';
  const likeValues = [userId, postId];

  const updateQuery = 'UPDATE posts SET like_count = like_count + 1 WHERE id = ?';
  const updateValues = [postId];

  try {
      await connPool.awaitQuery(likeQuery, likeValues);
      await connPool.awaitQuery(updateQuery, updateValues);
  } catch (err) {
      console.error(err);
      throw err;
  }
}

// Remove a like from a post
async function removeLike(userId, postId) {
  const unlikeQuery = 'DELETE FROM user_likes WHERE user_id = ? AND post_id = ?';
  const unlikeValues = [userId, postId];

  const updateQuery = 'UPDATE posts SET like_count = like_count - 1 WHERE id = ?';
  const updateValues = [postId];

  try {
      await connPool.awaitQuery(unlikeQuery, unlikeValues);
      await connPool.awaitQuery(updateQuery, updateValues);
  } catch (err) {
      console.error(err);
      throw err;
  }
}

async function getLikeCounts() {
  const query = 'SELECT id, like_count FROM posts';
  try {
      const results = await connPool.awaitQuery(query);
      const likeCounts = {};
      results.forEach(post => {
          likeCounts[post.id] = post.like_count;
      });
      return likeCounts;
  } catch (err) {
      console.error(err);
      throw err;
  }
}

async function getUserById(userId) {
  const query = 'SELECT id, username, email, password, created_at FROM users WHERE id = ?';

  try {
      const results = await connPool.awaitQuery(query, [userId]);
      if (results.length > 0) {
          return results[0];
      } else {
          return null;
      }
  } catch (err) {
      console.error(err);
      throw err;
  }
}


async function updateUserProfile(userId, username, email) {
  const query = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
  const values = [username, email, userId];

  try {
      await connPool.awaitQuery(query, values);
  } catch (err) {
      console.error(err);
      throw err;
  }
}

async function updateUserPassword(userId, newPasswordHash) {
  const query = 'UPDATE users SET password = ? WHERE id = ?';
  const values = [newPasswordHash, userId];

  try {
      await connPool.awaitQuery(query, values);
  } catch (err) {
      console.error(err);
      throw err;
  }
}

module.exports = { 
  addUser, 
  getUserByUsernameOrEmail, 
  updatePost, 
  addPost, 
  getPosts, 
  deletePost,
  getPostById,
  getPostCount,
  getLikeCounts,
  checkLike,
  addLike,
  removeLike,
  getPostsByUserId,
  getUserById,
  getUserPostCount,
  updateUserProfile,
  updateUserPassword,
};
