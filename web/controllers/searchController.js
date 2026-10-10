/**
 * search controller - handles the http requests
 */

const searchService = require("../services/searchService");

const searchByRestaurantsAndProducts = async (req, res) => {
    // Recover input
    const query = req.params.query;

    // Validate string
    if (!query) {
        return res.status(400).json({ error: "missing query" });
    }

    try {
        // Search restaurants
        const result1 = await searchService.searchService.query(query, searchService.Domains.RESTAURANT);

        // Search products
        const result2 = await searchService.searchService.query(query, searchService.Domains.PRODUCT);

        // Combine result
        const result = result1.concat(result2);

        // Return result
        //debug
        console.log("Search Results Debug:", result);
        return res.status(200).json({ result });
    }
    // Catch unexpected errors
    catch (err) {
        return res.status(500).json({ error: "internal server error" });
    }
};

// Export the functions
module.exports = {
    searchByRestaurantsAndProducts
};