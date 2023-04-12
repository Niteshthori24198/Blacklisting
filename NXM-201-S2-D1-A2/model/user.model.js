const mongoose = require('mongoose')

const userSchema = mongoose.Schema({

    Email:{type:String,required:true,unique:true},
    Password:{type:String,required:true},
    Name:{type:String, required:true},
    Gender:{type:String,required:true},
    Location:{type:String,required:true}


},

    {versionKey:false}

)


const UserModel = mongoose.model("user", userSchema)


module.exports = {
    UserModel
}