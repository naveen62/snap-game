var mongoose = require("mongoose");

var shopping = new mongoose.Schema({
    imgpath: String,
    title: String,
    desc: String,
    price: Number
});

module.exports = mongoose.model('Product', shopping);