// // app.js
// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const pool = require("./database/connection"); 

// const userRoutes = require("./routes/userRoutes");
// const productRoutes = require("./routes/productRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const cartRoutes = require("./routes/cartRoutes");
// const userToken = require("./routes/userTokenRoute");

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Root route
// app.get("/", (req, res) => {
//   res.send("✅ E-commerce backend is running...");
// });

// // Mount routes
// app.use("/api/users", userRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/token", userToken);

// // Start server
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));


// server/app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./database/connection"); // Ensure DB connects properly

// Import Routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const tokenRoutes = require("./routes/userTokenRoute"); // renamed for consistency

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Health Check Route =====
app.get("/", (req, res) => {
  res.status(200).json({
    message: "✅ E-commerce backend is running successfully!",
    database: pool ? "Connected" : "Not Connected",
  });
});

// ===== API Routes =====
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/token", tokenRoutes);

// ===== Global Error Handling =====
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ===== Start Server =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));


