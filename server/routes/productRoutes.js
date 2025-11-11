// server/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// 📦 Get all products
router.get("/", productController.getAllProducts);

// 🛍️ Get product details by ID
router.get("/:id", productController.getProductDetailsById);

// 📑 Get all orders related to a product
router.get("/orders/:id", productController.allOrderByProductId);

// ➕ Create a new product
router.post("/", productController.createProduct);

// ✏️ Update a product by ID
router.put("/:id", productController.updateProduct);

// 🗑️ Delete a product by ID
router.delete("/:id", productController.deleteProduct);

module.exports = router;
