const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      variantId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      variant: {
        name: String,
        price: Number,
        attributes: [
          {
            name: String,
            value: String,
          },
        ],
      },
    },
  ],
  shippingAddress: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    pinCode: {
      type: Number,
      required: true,
    },
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'RazorpayX'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  },
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String,
  },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Processing',
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  coupon: {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    code: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
    },
    discountAmount: Number,
  },
  offer: {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer', // Reference to the Offer model
    },
    name: String, // Name of the applied offer
    discountAmount: {
      type: Number,
      default: 0, // Discount amount due to the offer
    },
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Fix: Check if model already exists, and if so, use that, otherwise define it
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
