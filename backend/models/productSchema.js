const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: false, 
    },
    // availableQuantity: {
    //     type: Number,
    //     required: true
    // },
    description: {
        type: String,
        required: false, 
    },
    productImage: {
        type: [String],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: false
    },    
    variants: [
        {
            attributes: [
                {
                  name: String,
                  value: String,
                },
              ],
            sku: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
            },
            availableQuantity: {
                type: Number,
            },
        },
    ],
    specifications: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, 
        required: false, 
    },
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
