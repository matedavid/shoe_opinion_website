const express = require('express');
const mongoose = require('mongoose');

const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

// Sessions (users)
const expressValidator = require('express-validator');
const session = require('express-session');
const passport = require('passport');

// Image uploading
// const multer = require('multer');

// Configuration and shoe model
const Shoe = require('./models/Shoe');

// Initialze express app
const app = express();

// ENV configuration
require('dotenv').config();

// Database configurations
mongoose.connect(process.env.DATABASE, {"useNewUrlParser": true});
let db = mongoose.connection;

db.once('open', () => {
    console.log("Connected to mongodb...");
});

// Views and static configuration
app.use(express.static('./static'));
app.use(bodyParser.urlencoded({"extended": false}))
app.use(bodyParser.json());

app.set('view engine', 'ejs');

// Express session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

// Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  res.locals.errors = null;
  next();
});

// Express validator middleware
app.use(expressValidator());

// Passport Config & Middleware
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

/* ------ */

// User check
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Home Page
app.get('/', (req, res) => {
    Shoe.find({}).sort({stars: -1}).limit(8).exec((err, mostLiked) => {
        if (err) {
            console.log(err);
        } else {
            Shoe.find({}).sort({numberComments: -1}).exec((err, mostCommented) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render('home', {mostLiked: mostLiked, mostCommented: mostCommented, title: "Home"});
                }
            });
        }
    });
});


// Search shoe page
let search = require("./routes/search");
app.use('/search/', search);

// Shoes application
let shoes = require("./routes/shoes");
app.use("/shoes/", shoes);

// Users manegament
let users = require('./routes/users');
app.use("/users/", users);


app.listen(process.env.PORT | 8000, "0.0.0.0", () => console.log('Running on port ' + process.env.PORT +  '...'));
