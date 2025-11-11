// server/models/orderModel.js
const pool = require("../database/connection");

// ⭐️ THE MOST IMPORTANT FUNCTION - HANDLES THE TRANSACTION ⭐️
exports.createOrder = async (orderData) => {
    // 1. Get all the data from the controller
    const { 
        buyer_user_id, 
        total_amount, 
        shipping_address, 
        phone_number, 
        items // This is an array: [{ product_id, quantity, price_at_ordertime }, ...]
    } = orderData;

    // 2. Get a single connection from the pool
    // We need one connection for the entire transaction
    let connection;
    try {
        connection = await pool.getConnection();

        // 3. Start the database transaction
        await connection.beginTransaction();

        // 4. Step 1: Insert the main order
        const orderQuery = `
            INSERT INTO orders (buyer_user_id, total_amount, status, shipping_address, phone_number)
            VALUES (?, ?, 'pending', ?, ?)
        `;
        const [orderResult] = await connection.query(orderQuery, [
            buyer_user_id,
            total_amount,
            shipping_address,
            phone_number
        ]);
        
        const newOrderId = orderResult.insertId;

        // 5. Step 2: Loop through items, check stock, and insert them
        for (const item of items) {
            // Check stock *and* lock the row so no one else can buy it
            const [products] = await connection.query(
                "SELECT * FROM product WHERE product_id = ? FOR UPDATE",
                [item.product_id]
            );

            const product = products[0];

            // Check if we have enough stock
            if (product.stock_quantity < item.quantity) {
                // If not, stop everything and throw an error
                throw new Error(`Out of stock for product: ${product.product_name}`);
            }

            // If we have stock, insert the order item
            const orderItemQuery = `
                INSERT INTO order_item (order_id, product_id, quantity, price_at_ordertime)
                VALUES (?, ?, ?, ?)
            `;
            await connection.query(orderItemQuery, [
                newOrderId,
                item.product_id,
                item.quantity,
                item.price_at_ordertime // This should be the price *at the time of checkout*
            ]);

            // And update the product's stock
            const updateStockQuery = `
                UPDATE product SET stock_quantity = stock_quantity - ? WHERE product_id = ?
            `;
            await connection.query(updateStockQuery, [item.quantity, item.product_id]);
        }

        // 6. If all loops succeeded, commit the transaction
        await connection.commit();

        return { message: "Order created successfully!", orderId: newOrderId };

    } catch (err) {
        // 7. If *any* step failed, roll back the transaction
        if (connection) {
            await connection.rollback();
        }
        // Rethrow the error to be caught by the controller
        console.error("❌ Transaction failed:", err.message);
        throw err;

    } finally {
        // 8. Always release the connection back to the pool
        if (connection) {
            connection.release();
        }
    }
};

// --- Other functions (rewritten for your schema) ---

// ✅ Get all orders (admin view)
exports.getAllOrders = async () => {
    // FIX: Using correct columns 'order_id', 'user_name', etc.
    const query = `
        SELECT o.order_id, u.user_name AS buyer_name, o.order_date, o.total_amount, o.status
        FROM orders o
        INNER JOIN users u ON o.buyer_user_id = u.user_id
        ORDER BY o.order_date DESC;
    `;
    const [rows] = await pool.query(query);
    return rows;
};

// ✅ Get a single order's details
exports.getOrderById = async (orderId) => {
    // FIX: Using correct columns
    const query = `
        SELECT o.order_id, o.order_date, o.total_amount, o.status, o.shipping_address,
               u.user_name AS buyer_name, u.email AS buyer_email
        FROM orders o
        INNER JOIN users u ON o.buyer_user_id = u.user_id
        WHERE o.order_id = ?;
    `;
    const [rows] = await pool.query(query, [orderId]);
    return rows[0];
};

// ✅ Get all product line-items for a single order
exports.getProductsByOrder = async (orderId) => {
    // FIX: Querying 'order_item' and joining 'product'
    const query = `
        SELECT p.product_name, oi.quantity, oi.price_at_ordertime
        FROM order_item oi
        INNER JOIN product p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?;
    `;
    const [rows] = await pool.query(query, [orderId]);
    return rows;
};

// ✅ Update an order's status (e.g., 'pending' -> 'shipped')
exports.updateOrder = async (orderId, newData) => {
    // This is simplified to only update status, which is the most common use
    const { status } = newData; 
    const query = "UPDATE orders SET status = ? WHERE order_id = ?";
    const [result] = await pool.query(query, [status, orderId]);
    
    if (result.affectedRows === 0) {
        throw new Error("Order not found or no changes made");
    }
    return { message: "Order status updated successfully" };
};

// ✅ Get all orders for a specific customer
exports.getPastOrdersByCustomerID = async (buyerUserId) => {
    // FIX: The ID is 'buyer_user_id' and we query 'orders'
    const query = `
        SELECT order_id, order_date, total_amount, status
        FROM orders
        WHERE buyer_user_id = ?
        ORDER BY order_date DESC;
    `;
    const [rows] = await pool.query(query, [buyerUserId]);
    return rows;
};