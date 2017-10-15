var mongoose = require("mongoose");

var order = new mongoose.Schema({
   user : {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User"
   },
   cart: {type: Object, required: true},
   address: String,
   name: String,
   paymentId: String
});

module.exports = mongoose.model('Order', order);