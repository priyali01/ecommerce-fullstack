// server/models/productModel.js
const pool = require("../database/connection");

// ✅ Get all products
exports.getAllProducts = async () => {
    try {
        const [rows] = await pool.query("SELECT * FROM product");
        return rows;
    } catch (err) {
        console.error("❌ Error fetching all products:", err.message);
        throw err;
    }
};

// ✅ Get product details by ID
exports.getProductDetailsById = async (productId) => {
    try {
        // FIX: Column name is 'product_id'
        const [rows] = await pool.query("SELECT * FROM product WHERE product_id = ?", [productId]);
        return rows[0];
    } catch (err) {
        console.error("❌ Error fetching product details:", err.message);
        throw err;
    }
};

// ✅ Get all orders that include a specific product
exports.allOrderByProductId = async (productId) => {
    try {
        // FIX: This query is completely rewritten to match your schema
        const query = `
          SELECT 
            o.order_id, 
            u.user_name AS buyer_name, 
            o.order_date, 
            oi.quantity, 
            oi.price_at_ordertime
          FROM users u
          INNER JOIN orders o ON u.user_id = o.buyer_user_id
          INNER JOIN order_item oi ON o.order_id = oi.order_id
          WHERE oi.product_id = ?;
        `;
        const [rows] = await pool.query(query, [productId]);
        return rows;
    } catch (err) {
        console.error("❌ Error fetching orders for product:", err.message);
        throw err;
    }
};

// ✅ Create new product
exports.createProduct = async (productData) => {
    try {
        // FIX: Using all the correct columns from your schema
        const { 
            product_name, 
            price, 
            stock_quantity, 
            is_available = true, 
            img_url, 
            category_id, 
            seller_user_id 
        } = productData;

        const [result] = await pool.query(
            `INSERT INTO product (product_name, price, stock_quantity, is_available, img_url, category_id, seller_user_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [product_name, price, stock_quantity, is_available, img_url, category_id, seller_user_id]
        );
        return { message: "Product created successfully", productId: result.insertId };
    } catch (err) {
        console.error("❌ Error creating product:", err.message);
        throw err;
    }
};

// ✅ Update existing product
exports.updateProduct = async (productId, productData) => {
    try {
        // FIX: Using correct columns. This only updates these three.
        const { product_name, price, stock_quantity } = productData;

        const [result] = await pool.query(
            "UPDATE product SET product_name = ?, price = ?, stock_quantity = ? WHERE product_id = ?",
            [product_name, price, stock_quantity, productId]
        );

        if (result.affectedRows === 0) {
            return { message: "Product not found or no changes made" };
        }
        return { message: "Product updated successfully" };
    } catch (err) {
        console.error("❌ Error updating product:", err.message);
        throw err;
    }
};

// ✅ Delete product
exports.deleteProduct = async (productId) => {
    try {
        // FIX: Column name is 'product_id'
        const [result] = await pool.query("DELETE FROM product WHERE product_id = ?", [productId]);

        if (result.affectedRows === 0) {
            return { message: "Product not found" };
        }
        return { message: "Product deleted successfully" };
    } catch (err) {
        console.error("❌ Error deleting product:", err.message);
        throw err;
    }
};