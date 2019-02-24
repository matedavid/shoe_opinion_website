// Shoe imaage upload configuration
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { 
        cb(null, path.join(__dirname, "../temp"));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + "-" + req.user.username + "-" + Date.now() + path.extname(file.originalname));
    }
});

// Image converter
function convertImageBinary(imgPath) {
    var image = fs.readFileSync(imgPath);
    const imageData = new Buffer(image).toString('base64');
    image = "data: image/png;base64," + imageData;
    fs.unlinkSync(imgPath);
    return image;
}

const upload = multer({
    storage: storage,
    limits: {fileSize: 160000000},
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extName) {
            return cb(null, true);
        } else {
            cb('Error: Images only', false);
        }
    }
});

module.exports = {
    storage,
    convertImageBinary,
    upload
}