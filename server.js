const express = require('express');
const app = express();
const pug = require('pug');
const PORT = 8000;
const bcrypt = require('bcrypt');
const data = require('./data');
const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", "templates");
app.set("view engine", "pug");
app.use('/css', express.static('resources/css'));
app.use('/js', express.static('resources/js'));
app.use('/images', express.static('resources/images'));

app.use(session({
    secret: 'pefPBxwf+rqfCcNLoMjzlA==',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error.');
});


app.get('/', async (req, res) => {
    try {
        const userId = req.session.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const sortBy = req.query.sort || 'created_at'; // default
        const posts = await data.getPosts(limit, offset, sortBy, userId);
        const totalPosts = await data.getPostCount();

        const pagination = {
            prev: page > 1 ? page - 1 : null,
            next: totalPosts > offset + limit ? page + 1 : null
        };

        res.render('main', { posts, pagination, userId });
    } catch (error) {
        console.error(error);
        res.status(500).render('main', { error: error.message });
    }
});

// My posts
app.get('/my-posts', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('You need to be logged in to view this page');
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const sortBy = req.query.sort || 'created_at';
        const userId = req.session.userId;
        const posts = await data.getPostsByUserId(userId, limit, offset, sortBy);

        const totalPosts = await data.getUserPostCount(userId);

        const pagination = {
            prev: page > 1 ? page - 1 : null,
            next: totalPosts > offset + limit ? page + 1 : null,
        };

        res.render('myPosts', { posts, pagination, userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// My profile
app.get('/my-profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('You need to be logged in to view this page');
    }
    const userId = req.session.userId;

    try {
        const user = await data.getUserById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('myProfile', { user, userId});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


// Display the registration form
app.get('/register', (req, res) => {
    const userId = req.session.userId;
    res.render('register', { userId });
});

// Display the login form
app.get('/login', (req, res) => {
    const userId = req.session.userId;
    res.render('login', { userId });
});

// Post creation form
app.get('/create-post', (req, res) => {
    const userId = req.session.userId;
    if (!req.session.userId) {
        // User is not logged in, redirect to login page
        res.redirect('/login');
    } else {
        res.render('createPost', { userId });
    }
});

// Viewing an individual post
app.get('/post/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await data.getPostById(postId);
        const userId = req.session.userId;
        res.render('post', { post , userId});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Post edit form
app.get('/edit-post/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await data.getPostById(postId);
        res.render('editPost', { post });
    } catch (error) {
        console.error(error);
        res.status(500).render('editPost', { error: error.message });
    }
});

// Handle logging out
app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            console.error(err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Get the like of a post
app.get('/api/like-counts', async (req, res) => {
    try {
        const likeCounts = await data.getLikeCounts(); 
        res.status(200).json(likeCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


// Handle the registration form submission
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Validation empty fields and correct format
        if (!username || !email || !password) {
            throw new Error('All fields are required');
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            throw new Error('Invalid email format');
        }
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        // Check if username or email already exists
        const existingUser = await data.getUserByUsernameOrEmail(username, email);
        if (existingUser) {
            throw new Error('Username or email already in use');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await data.addUser(username, email, hashedPassword);
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(400).render('register', { error: error.message });
    }
});

// Handle the login submission
app.post('/api/login', async (req, res) => {
    try {
        const { credential, password } = req.body; // credential can be either username or email
        if (!credential || !password) {
            throw new Error('Username/email and password are required');
        }
        // Get user from the database
        const user = await data.getUserByUsernameOrEmail(credential, credential);
        if (!user) {
            throw new Error('Invalid login credentials');
        }
        // Compare provided password with the hashed password in the database
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid login credentials');
        }
        req.session.userId = user.id;
        res.status(200);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(400).render('login', { error: error.message });
    }
});

// Handle post creation
app.post('/api/create-post', async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.session.userId;
        await data.addPost(userId, content);
        res.status(200);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(400).render('createPost', { error: error.message });
    }
});

// Post update handling
app.post('/api/edit-post/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;
        const userId = req.session.userId;
        await data.updatePost(postId, userId, content);
        res.status(200);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(400).render('editPost', { error: error.message });
    }
});

// Handle liking a post
app.post('/api/like-post/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(403).send('You need to be logged in to view this page');
        }

        const alreadyLiked = await data.checkLike(userId, postId);
        if (alreadyLiked) {
            await data.removeLike(userId, postId);
        } else {
            await data.addLike(userId, postId);
        }

        res.status(200).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Update Profile.
app.post('/api/update-profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('You need to be logged in to view this page');
    }

    const { username, email } = req.body;
    const userId = req.session.userId;

    try {
        await data.updateUserProfile(req.session.userId, username, email);
        const user = await data.getUserById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.render('myProfile', { user, userId});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Update password.
app.post('/api/update-password', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('You need to be logged in to view this page');
    }
    
    const userId = req.session.userId;

    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    try {
        // Fetch the current user's hashed password from the database
        const user = await data.getUserById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!newPassword || newPassword === "") {
            res.status(400);
            return res.render('myProfile', { user, error: 'New password is empty', userId });
        }
        if (newPassword !== confirmNewPassword) {
            res.status(400);
            return res.render('myProfile', { user, error: 'New passwords do not match', userId });
        }
        // Compare old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {  
            res.status(400);
            return res.render('myProfile', { user, error: 'Incorrect old password', userId });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await data.updateUserPassword(req.session.userId, hashedPassword);
        res.render('myProfile', { user, userId});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Handling post deletion
app.delete('/api/post/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.userId;
        await data.deletePost(postId, userId);
        res.status(200).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
