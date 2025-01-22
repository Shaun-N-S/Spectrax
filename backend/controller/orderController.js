const mongoose = require('mongoose')
const Order = require('../models/orderSchema');
const User = require('../models/userModel');
const Product = require('../models/productSchema');
const Cart = require('../models/CartSchema');
const Coupon = require('../models/CouponSchema');
const razorpay = require('../config/razorpayConfig');
const Wallet = require('../models/walletSchema');
const crypto = require('crypto');


const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = "INR" } = req.body;
        
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        
        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).json({
            success: false,
            error: "Payment initialization failed"
        });
    }
};


const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                error: "Payment verification failed"
            });
        }

        // Update the order with payment details
        await Order.findOneAndUpdate(
            { "razorpay.orderId": razorpay_order_id },
            {
                $set: {
                    "razorpay.paymentId": razorpay_payment_id,
                    "razorpay.signature": razorpay_signature,
                    "paymentStatus": "Completed"
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "Payment verified successfully"
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            error: "Payment verification failed"
        });
    }
};


const placeOrder = async (req, res) => {
    try {
        const { userId, products, shippingAddress, paymentMethod, couponCode, totalAmount, finalAmount, razorpayOrderId } = req.body;

        if (!userId || !products || !products.length || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ message: "All fields are required." });
        }

        let appliedCoupon = null;
        let discountAmount = 0;

        if (couponCode) {
            appliedCoupon = await Coupon.findOne({
                name: couponCode,
                isListed: "active",
                expireOn: { $gt: new Date() }
            });

            if (appliedCoupon) {
                if (appliedCoupon.CouponType === 'percentage') {
                    discountAmount = (totalAmount * appliedCoupon.offerPrice) / 100;
                } else {
                    discountAmount = appliedCoupon.offerPrice;
                }
                discountAmount = Math.min(discountAmount, totalAmount);
            }
        }

        const orderData = {
            userId,
            products: products.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                quantity: item.quantity,
                price: item.variant.price,
                variant: item.variant
            })),
            shippingAddress,
            paymentMethod,
            totalAmount,
            coupon: appliedCoupon ? {
                couponId: appliedCoupon._id,
                code: appliedCoupon.name,
                discountType: appliedCoupon.CouponType,
                discountAmount: discountAmount
            } : null,
            discountAmount,
            finalAmount: finalAmount || (totalAmount - discountAmount),
            orderDate: new Date(),
            orderStatus: 'Processing',
            paymentStatus: paymentMethod === 'RazorpayX' ? 'Completed' : 'Pending'
        };

        // Add Razorpay order ID if payment method is RazorpayX
        if (paymentMethod === 'RazorpayX' && razorpayOrderId) {
            orderData.razorpay = {
                orderId: razorpayOrderId
            };
        }

        const newOrder = new Order(orderData);
        await newOrder.save();

        // Clear cart after successful order
        await Cart.findOneAndUpdate(
            { userId: userId },
            { $set: { items: [] } }
        );

        return res.status(201).json({ 
            message: "Order placed successfully.", 
            order: newOrder 
        });

    } catch (error) {
        console.error("Error placing order:", error);
        return res.status(500).json({ 
            message: "Failed to place order", 
            error: error.message 
        });
    }
};

const fetchOrders = async (req, res) => {
    try {
        const { id:userId } = req.params;
        console.log("User ID:", userId);

        // Validate User ID
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Fetch orders for the user
        const orderDetails = await Order.find({ userId }).sort({ orderDate: -1 });

        return res.status(200).json({
            message: "Order details fetched successfully!",
            orderDetails,
        });

    } catch (error) {
        console.error("Error in fetching order:", error);
        return res.status(500).json({ message: "Error in fetching order." });
    }
};


const orderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Order ID is required." });
        }

        const orderDetails = await Order.findById(id);

        if (!orderDetails) {
            return res.status(404).json({ message: "Order not found." });
        }

        return res.status(200).json({
            message: "Order details fetched successfully.",
            orderDetails,
        });

    } catch (error) {
        console.error("Error fetching order by ID:", error);
        return res.status(500).json({
            message: "An error occurred while fetching order details.",
            error: error.message,
        });
    }
};

const orderStatusUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const orderDetails = await Order.findById(id);
        console.log(orderDetails)
        if (!orderDetails) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].includes(status)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        // Handle Cancellation
        if (status === 'Cancelled') {
            if (orderDetails.orderStatus === 'Shipped' || orderDetails.orderStatus === 'Delivered') {
                return res.status(400).json({
                    message: `Cannot cancel the order with current status ${orderDetails.orderStatus}`,
                });
            }

            // Process refund for RazorpayX payments that are completed
            if (orderDetails.paymentMethod === 'RazorpayX' && orderDetails.paymentStatus === 'Completed') {
                await processRefund(orderDetails);
            }
        }

        // Handle Returns
        if (status === 'Returned') {
            // Can only return delivered orders
            if (orderDetails.orderStatus !== 'Delivered') {
                return res.status(400).json({
                    message: "Only delivered orders can be returned",
                });
            }

            // Process refund for both COD and RazorpayX payments that are completed
            if (orderDetails.paymentStatus === 'Completed') {
                await processRefund(orderDetails);
            }
        }

        orderDetails.orderStatus = status;
        if(orderDetails.orderStatus === 'Delivered'){
            orderDetails.paymentStatus = 'Completed'
        }
        const updateOrder = await orderDetails.save();

        const responseData = {
            message: "Order status updated successfully",
            updateOrder: updateOrder,
        };

        // Add wallet information to response if refund was processed
        if ((status === 'Cancelled' || status === 'Returned')) {
            const wallet = await Wallet.findOne({ userId: orderDetails.userId });
            if (wallet) {
                responseData.wallet = {
                    currentBalance: wallet.balance,
                    lastTransaction: wallet.transactions[wallet.transactions.length - 1],
                };
            }
        }

        return res.status(200).json(responseData);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Error updating order status" });
    }
};

// Helper function to process refunds
const processRefund = async (order) => {
    const refundAmount = order.finalAmount;
    let wallet = await Wallet.findOne({ userId: order.userId });

    if (!wallet) {
        wallet = new Wallet({
            userId: order.userId,
            balance: refundAmount,
            transactions: [{
                transaction_id: new mongoose.Types.ObjectId().toString(),
                type: 'refund',
                amount: refundAmount,
                description: `Refund for order ${order._id}`,
                status: 'completed',
                date: new Date()
            }]
        });
    } else {
        wallet.balance += refundAmount;
        wallet.transactions.push({
            transaction_id: new mongoose.Types.ObjectId().toString(),
            type: 'refund',
            amount: refundAmount,
            description: `Refund for order ${order._id}`,
            status: 'completed',
            date: new Date()
        });
    }

    await wallet.save();
    return wallet;
};


const getallorders = async (req,res) =>{
    try {

        const orders = await Order.find()
        if(!orders){
            return res.status(404).json({message:"Orders not found . "});
        };

        return res.status(200).json({message:"Orders found successfully . ",orders});
        

        
    } catch (error) {
        console.log("Error in getting all orders . ",error);
        return res.status(500).json({message:"Internal server error ."})
    }
}



const refundOrders = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if order is eligible for refund
        if (order.paymentMethod !== 'RazorpayX' || order.paymentStatus !== 'Completed') {
            return res.status(400).json({ 
                message: "Order is not eligible for refund. Only completed online payments can be refunded."
            });
        }

        // Check if order status is cancelled
        if (order.orderStatus !== 'Cancelled') {
            return res.status(400).json({ 
                message: "Only cancelled orders can be refunded" 
            });
        }

        const refundAmount = order.finalAmount;

        let wallet = await Wallet.findOne({ userId: order.userId });
        if (!wallet) {
            wallet = new Wallet({
                userId: order.userId
            });
        }

        wallet.balance += refundAmount;
        wallet.transactions.push({
            transaction_id: new mongoose.Types.ObjectId().toString(),
            type: 'refund',
            amount: refundAmount,
            description: `Refund for order ${orderId}`,
            status: 'completed',
            date: new Date()
        });

        await wallet.save();

        return res.status(200).json({
            message: "Refund processed successfully!",
            wallet: {
                balance: wallet.balance,
                lastTransaction: wallet.transactions[wallet.transactions.length - 1]
            }
        });

    } catch (error) {
        console.error("Error in refunding order:", error);
        return res.status(500).json({
            message: "Error in processing refund, please try again later"
        });
    }
};




module.exports = {
    placeOrder,
    fetchOrders,
    orderById,
    orderStatusUpdate,
    getallorders,
    createRazorpayOrder,
    verifyRazorpayPayment,
    refundOrders,
}