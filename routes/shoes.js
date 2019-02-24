const express = require('express');
const router = express.Router();

const Shoe = require("./../models/Shoe")
const User = require('./../models/User')

const { storage, upload, convertImageBinary } = require("./upload");

// Add a shoe
router.get('/add', (req, res) => {
    if (req.user) {
        res.render('shoes/addShoe', { title: "Add Shoe" });
    } else {
        req.flash('danger', 'To add a shoe you need to be logged in');
        res.redirect("/users/login");
    }

});

// Add a shoe
router.post('/add', upload.single('image'), (req, res) => {
    if (req.user) {
        // Validation
        const name = req.body.shoeName;
        const brand = req.body.brand;
        const type = req.body.type;
        const image = req.body.image;

        req.checkBody('shoeName', 'Name field is required').notEmpty();
        req.checkBody('brand', 'Brand field is required').notEmpty();
        req.checkBody('type', 'Type field is required').notEmpty();

        let errors = req.validationErrors();

        if (errors) {
            res.render('shoes/addShoe', { title: "Add Shoe", errors: errors });
        } else {
            // Logic of validation and saving
            const imageData = convertImageBinary("temp/" + req.file.filename);
            const newShoe = new Shoe({
                name: name,
                uploader: { id: req.user.id, name: req.user.username },
                brand: brand,
                comments: [],
                stars: 0,
                timesRated: 0,
                image: imageData,
                type: type,
                numberComments: 0
            });

            User.findById(req.user.id, (err, user) => {
                if (err) throw err;
                user.uploadedShoes.push({ shoeId: newShoe.id });
                user.save();
                newShoe.save((err) => {
                    if (err) throw err;
                    else {
                        //console.log(user.uploadedShoes);
                        req.flash('success', "Shoe added succesfully");
                        res.redirect("/");
                    }
                });
            });
        }

    } else {
        req.flash('danger', 'To add a shoe you need to be logged in');
        res.redirect("/users/login")
    }
});

function checkFinished(res, shoe, authors, errors, locals) {
    if (authors.length == shoe.comments.length) {
        if (locals != undefined) {
            res.render("shoes/shoe", { title: shoe.name, shoe: shoe, authors: authors, errors: errors, locals: locals });
        } else {
            res.render("shoes/shoe", { title: shoe.name, shoe: shoe, authors: authors });
        }
    }
}

// EL ASYNC DE LAS NARICES
function getAuthorsAndRender(shoe, res) {
    let authors = []
    for (let i = 0; i < shoe.comments.length; i++) {
        let comment = shoe.comments[i];
        if (comment.from != "false") {
            User.findById(comment.from, (err, user) => {
                if (err) throw err;
                authors.push(user);
                checkFinished(res, shoe, authors);
            });
        } else {
            authors.push({ "id": "false", "username": "false" });
            checkFinished(res, shoe, authors);
        }
    }
}

function getAuthorsAndRenderLocals(shoe, res, locals, errors) {
    let authors = []
    for (let i = 0; i < shoe.comments.length; i++) {
        let comment = shoe.comments[i];
        if (comment.from != "false") {
            User.findById(comment.from, (err, user) => {
                if (err) throw err;
                authors.push(user);
                checkFinished(res, shoe, authors, errors, locals);
            });
        } else {
            authors.push({ "id": "false", "username": "false" });
            checkFinished(res, shoe, authors, errors, locals);
        }
    }
}

// Get shoe route
router.get("/:id", (req, res, next) => {
    Shoe.findOne({ '_id': req.params.id }, (err, shoe) => {
        if (err) throw err;
        if (shoe.comments.length != 0) {
            getAuthorsAndRender(shoe, res);
        } else {
            let authors = []
            res.render('shoes/shoe', { title: shoe.name, shoe: shoe, authors: authors });
        }
    });
});

// Add a comment to a shoe
router.post("/:id", (req, res) => {
    const title = req.body.title;
    const comment = req.body.comment;
    const rating = req.body.starRating;

    Shoe.findOne({ "_id": req.params.id }, (err, shoe) => {
        if (err) {
            console.log(err);
        } else {
            req.validate('title', "A title is required").notEmpty();
            if (!req.user) {
                req.validate('name', 'The from area is required').notEmpty();
            }
            req.validate('comment', 'A comment is required').notEmpty();

            let errors = req.validationErrors();
            if (errors) {
                let locals = { user: req.user };
                if (shoe.comments.length != 0) {
                    getAuthorsAndRenderLocals(shoe, res, locals, errors);
                } else {
                    let authors = [];
                    res.render('shoes/shoe', {
                        title: shoe.name, shoe: shoe, errors: errors,
                        locals: locals, authors: authors
                    });
                }
            } else {
                shoe.comments.push({
                    "title": title,
                    "comment": comment,
                    "likes": 0,
                    "dislikes": 0,
                    "from": req.user ? req.user.id : "false",
                    "display": req.user ? req.user.username : req.body.name
                });
                shoe.numberComments += 1;
                shoe.timesRated += 1;

                // Update star rating
                let newStars = (shoe.stars + parseInt(rating)) / shoe.timesRated;

                // Restart shoe stars (por si acaso :>)
                shoe.stars = 0;

                shoe.stars = Math.round(newStars);
                shoe.save((err) => {
                    if (err) { console.log("ERROR: " + err); }
                    else {
                        //console.log(shoe.comments);
                        req.flash('success', 'Comment added succesfully');
                        res.redirect('/shoes/' + shoe.id);
                    }
                });
            }
        }
    });
});

// Delete a comment (Only if the comment was posted with an account)
router.get("/:id/:commentId/delete", (req, res) => {
    if (req.user) {
        Shoe.findById(req.params.id, (err, shoe) => {
            if (err) throw err;
            for (let i = 0; i < shoe.comments.length; i++) {
                //console.log(i)
                if (req.params.commentId == shoe.comments[i].id) {
                    //console.log(shoe.uploader.id)
                    if (req.user.id == shoe.uploader.id) {
                        shoe.comments.splice(i, 1);
                        shoe.numberComments -= 1;
                        shoe.save((err) => {
                            if (err) throw err;
                            req.flash("success", "Comment deleted succesfully")
                            res.redirect("/shoes/" + shoe.id);
                        });

                    } else {
                        req.flash("danger", "You must have posted the comment to delete it");
                        res.redirect("/shoes/" + shoe.id)
                    }
                }
            }
        })
    } else {
        req.flash("danger", "You must have posted the comment to delete it");
        res.redirect("/shoes/" + req.params.id)
    }
});

module.exports = router;
