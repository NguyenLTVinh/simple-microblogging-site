const express = require('express');
const app = express();
const pug = require('pug');
const PORT = 4131;
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

        res.render('main', { posts, pagination });
    } catch (error) {
        console.error(error);
        res.status(500).render('main', { error: error.message });
    }
});
// Display the registration form
app.get('/register', (req, res) => {
    res.render('register');
});

// Display the login form
app.get('/login', (req, res) => {
    res.render('login');
});

// Post creation form
app.get('/create-post', (req, res) => {
    if (!req.session.userId) {
        // User is not logged in, redirect to login page
        res.redirect('/login');
    } else {
        res.render('createPost');
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
        res.status(500).render('error', { error: error.message });
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
        res.status(500).json({ error: 'Error fetching like counts' });
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
        console.log(content);
        console.log(postId);
        console.log(userId);
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
            return res.status(403).send('User not logged in');
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
        res.status(500).send({ error: error.message });
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
        res.status(500).send({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
