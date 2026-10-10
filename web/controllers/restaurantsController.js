/// Restaurants Controller.
// Responsible for handling HTTP requests related to restaurants and delegating
// the business logic to the restaurants service.
const mongoose = require('mongoose');
const restaurantsService = require('../services/restaurantsService');
const restaurantMap = require('../repositories/restaurantMap');

/**
 * Get all restaurants sorted by distance to the user if location is available
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
async function getAllRestaurants(req, res) {
    try {
        const userLocation = req.user?.location || null;

        const restaurants = await restaurantsService.getAllRestaurants(userLocation);

        const enrichedRestaurants = await Promise.all(
            restaurants.map(restaurant => restaurantsService.enrichRestaurantWithImage(restaurant))
        );

        res.status(200).json(enrichedRestaurants);
    } catch(error) {
        console.error("Error in getAllRestaurants:", error); 
        res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Get a restaurant by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
async function getRestaurantById(req, res) {
    try {
        const restaurant = await restaurantsService.getRestaurantById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                error: 'Restaurant not found'
            });
        }

        // join with the logo
        const restaurantResponse = await restaurantsService.enrichRestaurantWithImage(restaurant);

        res.status(200).json(restaurantResponse);
    } catch (error) {
        console.error("Error in getAllRestaurants:", error); 
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getMyRestaurant(req, res) {
    try {
            const userId = req.userId;

        const myRestaurantId = restaurantMap.getRestaurantId(userId);

        if (!myRestaurantId) {
            return res.status(404).json({ error: 'No restaurant found for this user' });
        }

        const restaurant = await restaurantsService.getRestaurantById(myRestaurantId);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant details not found' });
        }

        // Join the logo
        const restaurantResponse = await restaurantsService.enrichRestaurantWithImage(restaurant);

        res.status(200).json(restaurantResponse);
    } catch(error) {
        console.error("Error in getMyRestaurant:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Create a new restaurant
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
async function createRestaurant(req, res) {
    const result = await restaurantsService.createRestaurant(req.body, req.userId);

    if (result.location) {
        res.location(result.location);
    }

    if (result.body) {
        return res.status(result.status).json(result.body);
    }

    res.status(result.status).end();
}

/**
 * Update a restaurant
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
async function updateRestaurant(req, res) {
    // Keep the restaurant ID as a string — MongoDB ObjectIds are strings after migration
    const requestedRestaurantId = req.params.id;
    const tokenUserId = req.userId;

    // Validate it is a well-formed ObjectId before any DB call
    if (!mongoose.Types.ObjectId.isValid(requestedRestaurantId)) {
        return res.status(400).json({ error: "Bad Request: Invalid restaurant ID." });
    }

    const actualOwnerRestaurantId = restaurantMap.getRestaurantId(tokenUserId);

    // Compare as strings — both values are MongoDB ObjectId strings
    if (String(requestedRestaurantId) !== String(actualOwnerRestaurantId)) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
    }

    // Update restaurant
    const result = await restaurantsService.updateRestaurant(
        requestedRestaurantId,
        req.body
    );

    if (result.body) {
        return res.status(result.status).json(result.body);
    }

    res.status(result.status).end();
}

/**
 * Delete a restaurant
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
async function deleteRestaurant(req, res) {
    // Keep as string — MongoDB ObjectIds must not be cast to Number()
    const requestedRestaurantId = req.params.id;
    const tokenUserId = req.userId;

    // Validate well-formed ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestedRestaurantId)) {
        return res.status(400).json({ error: "Bad Request: Invalid restaurant ID." });
    }

    const actualOwnerRestaurantId = restaurantMap.getRestaurantId(tokenUserId);

    // Compare as strings
    if (String(requestedRestaurantId) !== String(actualOwnerRestaurantId)) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
    }

    const result = await restaurantsService.deleteRestaurant(requestedRestaurantId);

    if (result.status === 200 || result.status === 204) {
        restaurantMap.setRestaurantId(tokenUserId, null);
    }

    if (result.body) {
        return res.status(result.status).json(result.body);
    }

    res.status(result.status).end();
}

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getMyRestaurant
};