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
        required: false, // Optional, based on product type (e.g., not required for all products)
    },
    availableQuantity: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false, // Optional for products like accessories with no description
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
                type: Number, // Optional if you want variant-specific price
            },
            availableQuantity: {
                type: Number, // Optional if you want variant-specific quantity
            },
        },
    ],
    specifications: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, // Supports any data type like string, number, array, etc.
        required: false, // Made optional for products that may not have specifications
    },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
