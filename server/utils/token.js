const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

// Secret keys for JWT from .env file
const JWT_SECRET_KEY_ACCESS_TOKEN = process.env.JWT_SECRET_KEY_ACCESS_TOKEN;
const JWT_SECRET_KEY_REFRESH_TOKEN = process.env.JWT_SECRET_KEY_REFRESH_TOKEN;

// Check if secrets are loaded
if (!JWT_SECRET_KEY_ACCESS_TOKEN || !JWT_SECRET_KEY_REFRESH_TOKEN) {
  console.error("FATAL ERROR: JWT secret keys are not defined in .env file");
  process.exit(1); // Stop the server if keys are missing
}

// Generate JWT tokens
exports.generateAccessAndRefreshToken = (payload) => {
  // payload should be { user_id: ..., user_type: ... }
  
  // FIX 1: Access token is short (15 minutes)
  let token = jwt.sign(payload, JWT_SECRET_KEY_ACCESS_TOKEN, { expiresIn: '15m' }); 
  
  // FIX 2: Refresh token is long (7 days)
  let refreshToken = jwt.sign(payload, JWT_SECRET_KEY_REFRESH_TOKEN, { expiresIn: '7d' }); 
  
  return { token, refreshToken };
};


// Verify JWT token
exports.verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET_KEY_ACCESS_TOKEN, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

// Refresh JWT token
exports.refreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, JWT_SECRET_KEY_REFRESH_TOKEN, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        // FIX 3: Use the correct payload keys from your userModel
        const { user_id, user_type } = decoded;
        
        // Check if payload is valid
        if (!user_id || !user_type) {
            return reject(new Error("Invalid refresh token payload"));
        }

        // Re-sign with the original payload
        const newTokens = this.generateAccessAndRefreshToken({ user_id, user_type });
        resolve(newTokens);
      }
    });
  });
};