// orderController.js
const orderModel = require("../models/orderModel");

// ⭐️ ADDED THIS FUNCTION - The most important one for your project
exports.createOrder = async (req, res) => {
    try {
        // We will get all the order data from the request body
        // This includes buyer_user_id, total_amount, shipping_address,
        // and an 'items' array.
        const orderData = req.body;

        // Basic validation
        if (!orderData.buyer_user_id || !orderData.total_amount || !orderData.items) {
            return res.status(400).json({ message: "Missing required order data." });
        }

        if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
            return res.status(400).json({ message: "Items array cannot be empty." });
        }

        // We pass the entire data blob to the model,
        // which will handle the complex database transaction.
        const result = await orderModel.createOrder(orderData);

        res.status(201).json(result); // 201 = Created
        
    } catch (err) {
        console.error("❌ Error in createOrder controller:", err.message);
        // Handle specific errors, like "out of stock"
        if (err.message.includes("out of stock")) {
             return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Error creating order." });
    }
};

// 🔄 CONVERTED TO ASYNC/AWAIT
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.getAllOrders();
        res.status(200).json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Error fetching orders." });
    }
};

// 🔄 CONVERTED TO ASYNC/AWAIT
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderModel.getOrderById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Error fetching order." });
    }
};

// 🔄 CONVERTED TO ASYNC/AWAIT
exports.getProductsByOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await orderModel.getProductsByOrder(id);
        res.status(200).json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Error fetching order products." });
    }
};

// 🔄 CONVERTED TO ASYNC/AWAIT
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const newData = req.body;
        const result = await orderModel.updateOrder(id, newData);
        res.status(200).json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Error updating order." });
    }
};

// 🔄 CONVERTED TO ASYNC/AWAIT
exports.getPastOrdersByCustomerID = async (req, res) => {
    try {
        // FIX: The 'id' from the route is the buyer_user_id
        const { id: buyer_user_id } = req.params;
        const orders = await orderModel.getPastOrdersByCustomerID(buyer_user_id);
        res.status(200).json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Error fetching past orders." });
    }
};