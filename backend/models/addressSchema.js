const mongoose = require('mongoose');
const user = require('./userModel');

const addressSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    street:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    pinCode:{
        type:Number,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
},{
    timestamps:true
})