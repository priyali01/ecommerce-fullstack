// server/controllers/productController.js
const productModel = require("../models/productModel");

// ✅ Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await productModel.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error("❌ Error fetching products:", error.message);
        res.status(500).json({ message: "Error fetching products" });
    }
};

// ✅ Get product details by ID
exports.getProductDetailsById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.getProductDetailsById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        console.error("❌ Error fetching product:", error.message);
        res.status(500).json({ message: "Error fetching product" });
    }
};

// ✅ Get all orders linked to a specific product
exports.allOrderByProductId = async (req, res) => {
    try {
        const { id } = req.params;
        const orders = await productModel.allOrderByProductId(id);
        // It's okay if there are no orders, just return an empty array.
        res.status(200).json(orders);
    } catch (error) {
        console.error("❌ Error fetching product orders:", error.message);
        res.status(500).json({ message: "Error fetching product orders" });
    }
};

// ✅ Create a new product
exports.createProduct = async (req, res) => {
    try {
        // FIX: We now look for the *correct* data from the body
        const { product_name, price, stock_quantity, category_id, seller_user_id } = req.body;

        // FIX: Stricter validation for the correct columns
        if (!product_name || !price || !stock_quantity || !category_id || !seller_user_id) {
            return res.status(400).json({ message: "Missing required product fields" });
        }

        // We pass the *entire* body to the model
        const result = await productModel.createProduct(req.body); 
        res.status(201).json(result); // Send back the model's response
    } catch (error) {
        console.error("❌ Error creating product:", error.message);
        res.status(500).json({ message: "Error creating product" });
    }
};

// ✅ Update a product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // We just pass the body. The model will pick the fields it needs.
        const { product_name, price, stock_quantity } = req.body;
        
        if (!product_name && !price && !stock_quantity) {
             return res.status(400).json({ message: "No product data provided to update" });
        }

        const result = await productModel.updateProduct(id, req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error updating product:", error.message);
        res.status(500).json({ message: "Error updating product" });
    }
};

// ✅ Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await productModel.deleteProduct(id);
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error deleting product:", error.message);
        res.status(500).json({ message: "Error deleting product" });
    }
};