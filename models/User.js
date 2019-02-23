const mongoose = require('mongoose');

let shoesLikedSchema = mongoose.Schema({
    shoeId: {
        type: String,
        required: true
    }
});

let shoeUploaded = mongoose.Schema({
    shoeId: {
        type: String,
        required: true
    }
});

let userSchema = mongoose.Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },

    username: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }, 
    shoesLiked: [shoesLikedSchema],
    
    uploadedShoes: [shoeUploaded],

    avatar: {
        type: Buffer
    }
});

let User = module.exports = mongoose.model('users', userSchema)
