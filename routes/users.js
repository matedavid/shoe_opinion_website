const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');

// Models
const User = require('./../models/User');
const Shoe = require('../models/Shoe');

const { storage, upload, convertImageBinary } = require("./upload");

// Passoword encoding
const saltRounds = 10;

// Preventions
router.get("/", (req, res) => {
    res.redirect("/users/login")
})

// login User
router.get("/login", (req, res) => {
    res.render("users/login", { title: "Log In" });
});

router.post("/login", (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    req.checkBody('username', 'Username field required').notEmpty();
    req.checkBody('password', 'Password field required').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        res.render("users/login", { title: "Log In", errors: errors });
    } else {
        passport.authenticate('local', {
            successRedirect: "/",
            failureRedirect: '/users/login',
            failureFlash: true,
            successFlash: true
        })(req, res, next);
    }
});

// Register view rendering
router.get("/register", (req, res) => {
    res.render('users/register', { title: "Register" });
})

// Registration process
router.post("/register/", (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirmation = req.body.passwordConfirmation;

    req.checkBody('username', 'Username field required').notEmpty();
    req.checkBody('email', 'Email field required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password field required').notEmpty();
    req.checkBody('passwordConfirmation', 'Confirm your password field required').notEmpty();
    req.checkBody('passwordConfirmation', 'Passwords do not match').equals(password);

    let errors = req.validationErrors();

    if (errors) {
        res.render('users/register', { title: "Register", errors: errors });
    } else {
        const newUser = new User({
            username: username,
            email: email,
            password: password,
            shoesLiked: [],
            uploadedShoes: []
        });

        bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                else {
                    newUser.password = hash;
                    newUser.save();
                    req.flash('success', 'User created succesfully, now you can log in');
                    res.redirect('/users/login');
                }
            });
        })
    }

});

// Logout 
router.get('/logout', (req, res) => {
    if (req.user) {
        req.logout();
        req.flash('success', 'Succesfully logged out');

        res.redirect('/');
    } else {
        req.flash('danger', 'Sign in first');
        res.redirect('/users/login');
    }
    res.send();
})

// View of the user
router.get('/:id', (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (err) {
            res.render("users/noFoundUser", { title: "No user" });
        } else {
            let shoes = [];
            if (user.uploadedShoes.length > 0) {
                for (let i = 0; i < user.uploadedShoes.length; i++) {
                    Shoe.findById(user.uploadedShoes[i].shoeId, (err, shoe) => {
                        if (err) throw err;
                        shoes.push(shoe);
                        if (i === user.uploadedShoes.length-1) {
                            setTimeout(() => {
                                res.render('users/userView', { title: user.username, userInput: user, uploaded: shoes });
                                console.log("sended");
                            }, 1000);
                        }
                    });
                }
            } else {
                res.render('users/userView', { title: user.username, userInput: user, uploaded: [] });
            }
        }
    })
});

// Settings view for user
router.get('/:id/settings', (req, res) => {
    if (req.user) {
        User.findById(req.user.id, (err, user) => {
            if (err) throw err;
            res.render('users/userSettings', { title: "Settings", settingsUser: user });
        });
    } else {
        req.flash('danger', "You need to be logged in");
        res.redirect("/users/login");
    }
});

// Change settings
router.post('/:id/settings/:toChange', upload.single('image'), (req, res, next) => {
    if (req.user) {
        User.findById(req.params.id, (err, changeUser) => {
            if (err) throw err;
            if (req.user.id == changeUser.id) {
                next();
            } else {
                req.flash('danger', "An error happened, try again");
                res.redirect("/");
            }
        })
    } else {
        req.flash('danger', "You need to be logged in");
        res.redirect("/users/login");
    }
});

router.post('/:id/settings/username', (req, res) => {
    User.findById(req.params.id, (err, updateUser) => {
        if (err) throw err;
        var newUsername = req.body.newUsername;
        req.checkBody('newUsername', "Username area must be filled").notEmpty();
        let errors = req.validationErrors();
        if (errors) {
            req.flash("danger", "An error occured, try again");
            res.redirect("/user/" + updateUser.id + "/settings")
        }
        updateUser.username = newUsername;
        if (updateUser.uploadedShoes.length > 0) {
            for (let i = 0; i < updateUser.uploadedShoes.length; i++) {
                Shoe.findById(updateUser.uploadedShoes[i].shoeId, (err, shoe) => {
                    if (err) throw err;
                    shoe.uploader.name = updateUser.username;
                    shoe.save();
                })
            }
        }
        updateUser.save((err) => {
            if (err) throw err;
            req.flash("success", "Usename changed succesfully");
            res.redirect("/users/" + updateUser.id);
        });

    })
});

router.post('/:id/settings/password', (req, res) => {
    User.findById(req.params.id, (err, updateUser) => {
        if (err) throw err;
        var oldPassword = req.body.oldPassword;
        var newPassword = req.body.newPassword;
        req.checkBody('oldPassword', "Username area must be filled").notEmpty();
        req.checkBody('newPassword', "New password area must me filled").notEmpty();
        req.checkBody('newPasswordValidation', "Passwords are not the same").equals(newPassword)
        let errors = req.validationErrors();
        if (errors) {
            console.log(errors)
            req.flash("danger", "An error occured, try again");
            res.redirect("/users/" + updateUser.id + "/settings")
        }
        bcrypt.compare(oldPassword, updateUser.password, (err, equal) => {
            if (err) throw err;
            if (equal) {
                bcrypt.genSalt(saltRounds, (err, salt) => {
                    bcrypt.hash(newPassword, salt, (err, hash) => {
                        if (err) throw err;
                        else {
                            updateUser.password = hash;
                            updateUser.save((err) => {
                                if (err) throw err;
                                req.flash('success', 'Password changed succesfully');
                                res.redirect('/users/' + updateUser.id + "/settings");
                            });
                        }
                    });
                })
            } else {
                req.flash("danger", "Old password is not correct, try again");
                res.redirect("/users/" + updateUser.id + "/settings")
            }
        })
    })
});

router.post('/:id/settings/email', (req, res) => {
    User.findById(req.params.id, (err, updateUser) => {
        if (err) throw err;
        let newEmail = req.body.newEmail;
        req.checkBody('newEmail', 'Email area must be filled').notEmpty();
        req.checkBody('newEmail', 'Email area must be filled').isEmail();
        let errors = req.validationErrors();
        if (errors) {
            req.flash("danger", "An error occured, try again");
            res.redirect("/users/" + updateUser.id + "/settings");
        }
        updateUser.email = newEmail;
        updateUser.save((err) => {
            if (err) throw err;
            //req.logout();
            req.flash("success", "Email changed succesfully");
            res.redirect("/users/" + updateUser.id);
        });
    })
});

router.post('/:id/settings/avatar', upload.single('image'), (req, res) => {
    const imageData = convertImageBinary('temp/' + req.file.filename);

    User.findById(req.params.id, (err, updateUser) => {
        if (err) throw err;
        updateUser.avatar = imageData;
        updateUser.save((err) => {
            if (err) throw err;
            else {
                res.redirect("/users/" + updateUser.id);
            }
        })
    });
});

module.exports = router;
