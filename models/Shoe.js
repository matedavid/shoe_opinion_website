const mongoose = require('mongoose');

let comment = mongoose.Schema({
    title: {type: String},
    comment: {type: String, required: true},
    likes: {type: Number},
    dislikes: {type: Number},
    from: {type: String, required: true},
    display: {type: String, required: true},
    date: {type: Date, default: Date.now}
});


let shoeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    uploader: {
        id: {type: String, required: true},
        name: {type: String, required: true}

    },
    
    brand: {
        type: String,
        required: true
    }, 

    comments: [comment],

    stars: {
        type: Number,
        required: true
    },

    timesRated: {
        type: Number,
        required: true
    },

    image: {
        type: Buffer,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    numberComments: {
        type: Number,
        required: true
    }
});

let Shoe = module.exports = mongoose.model('shoes', shoeSchema)
