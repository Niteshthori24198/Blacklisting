const mongoose = require('mongoose')

const vlogSchema = mongoose.Schema({

    AuthorID:{type:String,required:true},
    Title:{type:String,required:true},
    Description:{type:String,required:true}

},

    {versionKey:false}

)


const VlogModel = mongoose.model("vlog",vlogSchema);

module.exports = {
    VlogModel
}