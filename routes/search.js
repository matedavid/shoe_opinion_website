const express = require('express');
const router = express.Router();

const Shoe = require("./../models/Shoe")

router.get("/?", (req, res) => {
    if (req.query.shoe_search != undefined) {
        var shoeNameSearch = req.query.shoe_search;
        //console.log(shoeNameSearch);
        Shoe.find({name: {$regex: ".*" + shoeNameSearch + ".*", $options: "i"}}, (err, shoes) => {
            if (err) {
                console.log(err);
            } else {
                let found = true
                res.render('shoes/search', {title: "Search", shoeResults: shoes, found: found, search: shoeNameSearch});
            }
        });
    } else {
        console.log("redirecting")
        res.redirect("/");
    }
});

module.exports = router;
