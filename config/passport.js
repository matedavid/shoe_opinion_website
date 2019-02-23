const localStrategy = require('passport-local').Strategy;
const User = require('./../models/User');
const config = require('./database');
const bcrypt = require('bcrypt');

module.exports = function(passport) {
    passport.use(new localStrategy((username, password, done) => {
        let query = {username: username};
        User.findOne(query, (err, user) => {
            if (err) throw err;
            if (!user) return done(null, false, {message: 'User or password incorrect'});
            
            // Match password
            bcrypt.compare(password, user.password, (err, matches) => {
                if (err) throw err;

                if (matches) {
                    return done(null, user, {message: "Succesfully logged in"});
                } else {
                    return done(null, false, {message: 'User or password incorrect'});
                }
            });
        });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}
