const mongoose = require('mongoose')
const Order = require('../models/orderSchema');
const User = require('../models/userModel');
const Product = require('../models/productSchema');
const Cart = require('../models/CartSchema')


const placeOrder = async (req, res) => {
    try {
        const { userId, products, shippingAddress, paymentMethod } = req.body;

        // Validate Required Fields
        if (!userId || !products || !products.length || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Validate User
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        let totalAmount = 0;

        // Validate Products and Variants
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ 
                    message: `Product with ID ${item.productId} not found.` 
                });
            }

            if (!item.variantId) {
                return res.status(400).json({ 
                    message: `Variant ID is required for product: ${product.title}` 
                });
            }

            const selectedVariant = product.variants.find(
                variant => variant._id.toString() === item.variantId
            );

            if (!selectedVariant) {
                return res.status(404).json({
                    message: `Variant not found for product: ${product.title}`
                });
            }

            if (!selectedVariant.availableQuantity || selectedVariant.availableQuantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for variant: ${selectedVariant.name || 'Selected variant'} of product: ${product.title}`
                });
            }

            // Calculate total amount using the variant's price
            totalAmount += item.quantity * selectedVariant.price;

            // Update stock
            selectedVariant.availableQuantity -= item.quantity;

            await product.save()
        }

        // Create new order
        const newOrder = new Order({
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
            orderDate: new Date(),
            status: 'pending'
        });

        await newOrder.save();

        

        // Save the updated product quantities
        for (const item of products) {
            const product = await Product.findById(item.productId);
            await product.save();
        }

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
        const { status, role } = req.body;
        console.log("ID:", id, "Status:", status, "Role:", role);

        // Input validation
        if (!status || !role) {
            return res.status(400).json({ message: "Status and role are required." });
        }

        const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid order status provided." });
        }

        const orderDetails = await Order.findById(id);
        if (!orderDetails) {
            return res.status(404).json({ message: "Order details not found." });
        }


        

        
        orderDetails.orderStatus = status;
        const updatedOrder = await orderDetails.save();

        return res.status(200).json({
            message: "Order status updated successfully",
            updatedOrder: updatedOrder
        });
    } catch (error) {
        console.error("Error in updating order status:", error);
        return res.status(500).json({ 
            message: "Error in updating order status.", 
            error: error.message 
        });
    }
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

module.exports = {
    placeOrder,
    fetchOrders,
    orderById,
    orderStatusUpdate,
    getallorders,
}