const express = require('express');
const app = express();
const pug = require('pug');
const PORT = 4131;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", "templates");
app.set("view engine", "pug");
app.use('/css', express.static('resources/css'));
app.use('/js', express.static('resources/js'));
app.use('/images', express.static('resources/images'));


app.get('/', (req, res) => {
    res.send('Hi Mom!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
