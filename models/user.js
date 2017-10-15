var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs")

var userSchema = new mongoose.Schema({
    email: String,
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
})
userSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null)
}
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}
module.exports = mongoose.model('User', userSchema);
