const express = require("express");

const router = express.Router();

const searchController = require("../controllers/searchController");

// /api/search/
router.get("/:query", searchController.searchByRestaurantsAndProducts);

module.exports = router;