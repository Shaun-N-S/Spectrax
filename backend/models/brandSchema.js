const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    status:{
        type:String,
        enum:['active','blocked'],
        default:'active',
    },
},{
    timestamps:true,
});

module.exports = mongoose.models.Brand || mongoose.model('Brand', brandSchema);