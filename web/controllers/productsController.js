/**
 * Products controller handles HTTP requests related to products.
 */

const mongoose = require('mongoose');
const productsService = require("../services/productsService");
const restaurantsService = require("../services/restaurantsService");
const viewService = require("../services/viewService");
const { generateId } = require("../utils/idGenerator");
const Product = require("../models/Product");
const restaurantMap = require('../repositories/restaurantMap');


/**
 * GET /api/restaurants/:id/products
 * Returns all products (menu) of the restaurant with given id
 */
const getMenu = async (req, res) => {
    // Recover id from the request
    const { id } = req.params;

    // Ensure id is a valid MongoDB ObjectId — numeric IDs are no longer used after the MongoDB migration
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Bad Request: Invalid restaurant ID." });
    }

    // Keep id as a string — Mongoose / MongoDB accept ObjectId strings natively
    const validatedId = id;

    // Using service, run command - catch unexpected errors
    try {
        const restaurantObj = await restaurantsService.getRestaurantById(validatedId);
        // Ensure we are working with a restaurant that exists
        if (!restaurantObj) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        // Get the menu using the service
        const menu = await productsService.getMenu(validatedId);

        // Send output in JSON format
        res.status(200).json({ menu });
    }
    catch (err) {
        console.error("getMenu error:", err);
        res.status(500).send("Internal server error");
    }
};

/**
 * POST /api/restaurants/:id/products
 * Adds a new product to the restaurant with given id
 */
const addProduct = async (req, res) => {
    // Recover id from the request
    const id = req.params.id;
    const tokenUserId = req.userId;

    // Ensure id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Bad Request: Invalid restaurant ID." });
    }

    // Keep id as a string
    const validatedId = id;

    // Is the user the owner of the restaurant?
    // Both values are strings (MongoDB ObjectId) — compare with ===
    const actualOwnerRestaurantId = restaurantMap.getRestaurantId(tokenUserId);
    if (String(validatedId) !== String(actualOwnerRestaurantId)) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
    }

    // Extract product fields from request body
    const { name, description, price } = req.body;

    // Validate required fields
    if (name === undefined || description === undefined || price === undefined) {
        return res.status(400).json({ error: "Bad Request: name, price and description are required." });
    }

    const priceNumber = Number(price);

    if (Number.isNaN(priceNumber) || priceNumber < 0) {
        return res.status(400).json({ error: "Bad Request: price must be a non-negative number." });
    }

    // Using service, run command - catch unexpected errors
    try {
        // Build a Product instance with a unique ID
        const product = new Product(generateId(), name, description, priceNumber);

        const restaurantObj = await restaurantsService.getRestaurantById(validatedId);
        // Ensure we are working with a restaurant that exists
        if (!restaurantObj) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        // Add product to restaurant
        const result = await productsService.addProductToRestaurant(validatedId, product);

        // Send output in JSON format
        res.status(201).json({ result });
    }
    catch (err) {
        console.error("addProduct error:", err);
        res.status(500).send("Internal server error");
    }
};

/**
 * GET /api/restaurants/:id/products/:pId
 * Returns the product with the given pId from the restaurant
 */
const getProduct = async (req, res) => {
    // Recover id and pId from the request, and userId from the auth header
    const id = req.params.id, pId = req.params.pId;
    const userId = req.header('X-User-Id');

    // Ensure restaurant id is a valid MongoDB ObjectId (pId is a UUID string — no validation needed)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Bad Request: Invalid restaurant ID." });
    }

    // Keep id as a string
    const validatedId = id;

    // Using service, run command - catch unexpected errors
    try {
        const restaurantObj = await restaurantsService.getRestaurantById(validatedId);
        // Ensure we are working with a restaurant that exists
        if (!restaurantObj) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        // Get the product using the service
        const product = await productsService.getProductFromRestaurant(validatedId, pId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Add a view to the product if a userId header was provided
        // userId here is a MongoDB ObjectId string — validate with isValid()
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            await viewService.addViewToUser(userId, pId);
        }

        // Send output in JSON format
        res.status(200).json({ product });
    }
    catch (err) {
        console.error("getProduct error:", err);
        res.status(500).send("Internal server error");
    }
};


/**
 * PATCH /api/restaurants/:id/products/:pId
 * Updates the product with the given pId in the restaurant
 */
const updateProduct = async (req, res) => {
    // Extract IDs from request parameters
    const { id, pId } = req.params;
    const tokenUserId = req.userId;

    // Validate that the restaurant ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Bad Request: Invalid restaurant ID." });
    }

    // Keep id as a string
    const validatedRestaurantId = id;

    // Ensure the logged user owns this restaurant — compare as strings
    const usersRestaurantId = restaurantMap.getRestaurantId(tokenUserId);
    if (String(validatedRestaurantId) !== String(usersRestaurantId)) {
        return res.status(403).json({ error: "Forbidden: You don't own this restaurant" });
    }

    try {
        // Verify that the restaurant exists
        const restaurantObj = await restaurantsService.getRestaurantById(validatedRestaurantId);
        if (!restaurantObj) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        // Retrieve the current product details
        const existingProduct = await productsService.getProductFromRestaurant(validatedRestaurantId, pId);
        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Extract potential updates from request body
        const { name, description, price } = req.body;

        // Validate price if provided and ensure it's a non-negative number
        if (price !== undefined) {
            const priceNumber = Number(price);

            if (Number.isNaN(priceNumber) || priceNumber < 0) {
                return res.status(400).json({
                    error: "Bad Request: price must be a non-negative number."
                });
            }
        }
        // Ensure at least one field is provided for update
        if (name === undefined && description === undefined && price === undefined) {
            return res.status(400).json({ error: "Bad Request: Please provide at least one field (name, description or price) to update." });
        }

        // Use new values if provided, otherwise keep existing values
        const updatedName = name !== undefined ? name : existingProduct.name;
        const updatedDescription = description !== undefined ? description : existingProduct.description;
        const updatedPrice = price !== undefined ? price : existingProduct.price;

        // Create an updated Product instance
        const updatedProduct = new Product(pId, updatedName, updatedDescription, updatedPrice);

        // Save the updated product via the service
        const result = await productsService.updateProductInRestaurant(validatedRestaurantId, pId, updatedProduct);

        // Respond with 204 No Content for successful update
        res.status(204).end();
    }
    catch (error) {
        // Log the error for server-side debugging
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * DELETE /api/restaurants/:id/products/:pId
 * Deletes the product with the given pId from the restaurant
 */
const deleteProduct = async (req, res) => {
    const tokenUserId = req.userId;
    const { id, pId } = req.params;

    const productId = pId;

    // Validate restaurant ID is a valid MongoDB ObjectId and productId is present
    if (!mongoose.Types.ObjectId.isValid(id) || !productId) {
        return res.status(400).json({ error: "Bad Request: Invalid ID format." });
    }

    // Keep as strings
    const validatedRestaurantId = id;
    const validatedProductId = productId;

    // Check if the user owns the restaurant — compare as strings
    const usersRestaurantId = restaurantMap.getRestaurantId(tokenUserId);
    if (String(validatedRestaurantId) !== String(usersRestaurantId)) {
        return res.status(403).json({ error: "Forbidden: You don't own this restaurant" });
    }

    try {
        const restaurantObj = await restaurantsService.getRestaurantById(validatedRestaurantId);
        if (!restaurantObj) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        // Delete
        const result = await productsService.deleteProductFromRestaurant(validatedRestaurantId, validatedProductId);
        if (!result) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Remove from views — userId is a MongoDB ObjectId string, validate before forwarding
        if (tokenUserId && mongoose.Types.ObjectId.isValid(tokenUserId)) {
            try {
                await viewService.removeViewFromUser(tokenUserId, validatedProductId);
            } catch (err) {
                console.warn("deleteProduct: view removal skipped:", err.message);
            }
        }

        res.status(204).end();
    }
    catch (err) {
        console.error("deleteProduct error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Export the functions
module.exports = {
    getMenu,
    addProduct,
    getProduct,
    updateProduct,
    deleteProduct
};