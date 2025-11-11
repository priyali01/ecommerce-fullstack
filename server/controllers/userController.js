// userController.js

const userModel = require("../models/userModel");

// Register user
exports.register = (req, res) => {
    const { user_name, email, password, phone_number, address, user_type } = req.body;
    console.log("📩 Received data:", req.body);

    if (!user_name || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    userModel.register(user_name, email, password, phone_number, address, user_type)
        .then(result => {
            console.log("✅ User registered successfully");
            res.status(201).json({ message: "User registered successfully", result });
        })
        .catch(err => {
        console.error("❌ Error details:", err);
        res.status(500).send("Error registering user.");
        });

    
};

// Login user
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Missing email or password" });
    }

    userModel.login(email, password)
        .then(result => res.status(200).json(result))
        .catch(err => {
            console.error("❌ Login error:", err.message);
            res.status(500).send("Error logging in.");
        });
};
