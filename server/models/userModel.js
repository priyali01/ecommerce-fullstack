// userModel.js

const pool = require("../database/connection");
const bcrypt = require("bcryptjs");
const { generateAccessAndRefreshToken } = require("../utils/token");

// Register a new user
exports.register = (user_name, email, password, phone_number, address, user_type = "buyer") => {
  return new Promise((resolve, reject) => {
    // Check if user with email already exists
    pool.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) return reject(err);
      if (results.length > 0) return reject(new Error("User already exists"));

      // Hash the password before saving
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) return reject(hashErr);

        const query = `
          INSERT INTO users (user_name, email, password, phone_number, address, user_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        pool.query(
          query,
          [user_name, email, hashedPassword, phone_number, address, user_type],
          (insertErr, result) => {
            if (insertErr) return reject(insertErr);
            resolve({ message: "User registered successfully!" });
          }
        );
      });
    });
  });
};

// Login existing user
exports.login = (email, password) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE email = ?";
    pool.query(query, [email], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error("Invalid email or password"));

      const user = results[0];

      bcrypt.compare(password, user.password, (compareErr, isMatch) => {
        if (compareErr) return reject(compareErr);
        if (!isMatch) return reject(new Error("Invalid email or password"));

        const userData = {
          user_id: user.user_id,
          user_type: user.user_type,
        };

        // Generate JWT tokens
        const { token, refreshToken } = generateAccessAndRefreshToken(userData);
        userData.token = token;
        userData.refreshToken = refreshToken;

        resolve({
          message: "Login successful",
          user: {
            id: user.user_id,
            name: user.user_name,
            email: user.email,
            type: user.user_type,
            token,
            refreshToken,
          },
        });
      });
    });
  });
};
