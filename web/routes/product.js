const express = require("express");
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * mergeParams: true is required so this router can access :id 
 * from the parent route (e.g. /api/restaurants/:id/products)
 */
const router = express.Router({ mergeParams: true });

const productsController = require("../controllers/productsController");

// /api/restaurants/:id/products
router.get("/", productsController.getMenu);
router.post("/", authMiddleware, productsController.addProduct);

// /api/restaurants/:id/products/:pId
router.get("/:pId", productsController.getProduct);
router.patch("/:pId", authMiddleware, productsController.updateProduct);
router.delete("/:pId", authMiddleware, productsController.deleteProduct);

module.exports = router;