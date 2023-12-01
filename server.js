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


app.get('/', (req, res) => {
    res.send('Hi Mom!');
});

// Display the registration form
app.get('/register', (req, res) => {
    res.render('register');
});

// Display the login form
app.get('/login', (req, res) => {
    res.render('login');
});

// Handle logging out
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            console.error('Exit session error:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Handle the registration form submission
app.post('/register', async (req, res) => {
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
        res.render('register', { error: error.message });
    }
});

// Handle the login submission
app.post('/login', async (req, res) => {
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
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('login', { error: error.message });
    }
});




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
