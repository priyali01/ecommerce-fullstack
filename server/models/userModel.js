// models/userModel.js

const pool = require("../database/connection");
const bcrypt = require("bcryptjs");
const { generateAccessAndRefreshToken } = require("../utils/token"); // Assuming this file exists and works

// Register a new user
exports.register = async (user_name, email, password, phone_number, address, user_type = "buyer") => {
    try {
        // 1. Check if user with email already exists
        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        
        if (users.length > 0) {
            // User already exists
            throw new Error("User already exists");
        }

        // 2. Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert the new user
        const insertQuery = `
          INSERT INTO users (user_name, email, password, phone_number, address, user_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await pool.query(insertQuery, [
            user_name,
            email,
            hashedPassword,
            phone_number,
            address,
            user_type,
        ]);

        // 4. Return success message
        return { message: "User registered successfully!" };

    } catch (err) {
        // Rethrow the error to be caught by the controller
        throw err;
    }
};

// Login existing user
exports.login = async (email, password) => {
    try {
        // 1. Find the user by email
        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            // No user found
            throw new Error("Invalid email or password");
        }

        const user = users[0];

        // 2. Compare the provided password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Passwords don't match
            throw new Error("Invalid email or password");
        }

        // 3. Passwords match! Prepare user data for token
        const userData = {
            user_id: user.user_id,
            user_type: user.user_type,
            email: user.email, // Include email for clarity
        };

        // 4. Generate JWT tokens
        // We assume this util function exists and is synchronous
        const { token, refreshToken } = generateAccessAndRefreshToken(userData);

        // 5. Return all user data and tokens
        return {
            message: "Login successful",
            user: {
                id: user.user_id,
                name: user.user_name,
                email: user.email,
                type: user.user_type,
                token,
                refreshToken,
            },
        };

    } catch (err) {
        // Rethrow the error to be caught by the controller
        throw err;
    }
};