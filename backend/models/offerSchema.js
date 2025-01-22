const mongoose = require('mongoose');
const {Schema} = mongoose;

const OfferSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    discountPercent:{
        type:Number,
        required:true,
        min:0,
        max:100,
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true,
    },
    targetId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    targetType:{
        type:String,
        required:true,
        enum:['product','category'],
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
})


module.exports = mongoose.model('Offer',OfferSchema);