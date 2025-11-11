// server/database/connection.js
const mysql2 = require("mysql2/promise"); // Import the promise-wrapper
require("dotenv").config();

// Connection parameters - *Only* read from .env
const connectionParams = {
    host: process.env.DB_SERVER_HOST,
    user: process.env.DB_SERVER_USER,
    password: process.env.DB_SERVER_PASSWORD,
    database: process.env.DB_SERVER_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Create pool using the promise-wrapper
const pool = mysql2.createPool(connectionParams);

// --- Test connection (Async IIFE) ---
// This is a modern, clean way to test an async connection
(async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log(`✅ Database Connection Successful (Connected to ${connectionParams.database})`);
    } catch (err) {
        console.error("❌ Database Connection Failed:", err.message);
    } finally {
        if (connection) connection.release();
    }
})();

module.exports = pool; // Export the promise-based pool