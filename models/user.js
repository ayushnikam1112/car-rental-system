const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose").default;

const userSchema = new mongoose.Schema({
    username: String,
    email: {
        type:String,
        required:true,
    },
    phone: {
    type: String,
    required: true
    },
     isAdmin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);