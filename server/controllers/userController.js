// 📁 server/controllers/userController.js

const userModel = require("../models/userModel");

// Register user
exports.register = (req, res) => {
  const { user_name, email, password, phone_number, address, user_type } = req.body;
  console.log("📩 Register attempt for:", email);

  if (!user_name || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  userModel.register(user_name, email, password, phone_number, address, user_type)
    .then(result => {
      console.log("✅ User registered successfully:", email);
      // We send status 201 (Created) and the user/token data
      res.status(201).json(result); 
    })
    .catch(err => {
      console.error("❌ Register Controller Error:", err.message);
      // Send a specific error message if user exists
      if (err.message === "User already exists") {
        return res.status(409).json({ message: err.message }); // 409 Conflict
      }
      res.status(500).json({ message: "Error registering user", error: err.message });
    });
};

// Login user
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  userModel.login(email, password)
    .then(result => {
      console.log("✅ User logged in successfully:", email);
      // We send status 200 (OK) and the user/token data
      res.status(200).json(result);
    })
    .catch(err => {
      console.error("❌ Login Controller Error:", err.message);
      // Send a specific error for bad credentials
      if (err.message === "Invalid email or password") {
        return res.status(401).json({ message: err.message }); // 401 Unauthorized
      }
      res.status(500).json({ message: "Error logging in", error: err.message });
    });
};