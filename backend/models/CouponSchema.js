const mongoose = require('mongoose');
const { Schema } = mongoose;

const CouponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    createdOn: {
        type: Date,
        default: Date.now,
        required: true,
    },
    CouponType: {
        type: String,
        enum: ['fixed', 'percentage'],
    },
    expireOn: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    offerPrice: {
        type: Number,
        required: true,
    },
    minimumPrice: { 
        type: Number,
        required: true,
    },
    isListed: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active',
    },
    userId: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
});

const Coupon = mongoose.model('coupon', CouponSchema);
module.exports = Coupon;
