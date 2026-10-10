// Map from userId (string) to restaurantId (string)
const ownerToRestaurantMap = new Map();

function setRestaurantId(userId, restaurantId) {
    ownerToRestaurantMap.set(String(userId), restaurantId ? String(restaurantId) : null);
}

function getRestaurantId(userId) {
    return ownerToRestaurantMap.get(String(userId)) || null;
}

function getOwnerIdByRestaurantId(targetRestaurantId) {
    // Both stored restaurantIds and the incoming targetRestaurantId are MongoDB ObjectId strings.
    // Casting to Number() produces NaN for any ObjectId, so we must compare as strings.
    const targetStr = String(targetRestaurantId);

    for (let [userId, restaurantId] of ownerToRestaurantMap.entries()) {
        if (String(restaurantId) === targetStr) {
            return userId;
        }
    }

    return null;
}

/**
 * Rebuilds the in-memory owner→restaurant map from MongoDB.
 * Must be called once at server startup after connectDB() succeeds.
 * This ensures owners can access their restaurants after a process restart,
 * even though the map itself is in-memory and does not survive restarts.
 */
async function populateFromDB() {
    try {
        const Restaurant = require('../models/Restaurant');
        const restaurants = await Restaurant.find({ ownerId: { $ne: null } });

        let count = 0;
        for (const restaurant of restaurants) {
            if (restaurant.ownerId && restaurant.id) {
                ownerToRestaurantMap.set(
                    String(restaurant.ownerId),
                    String(restaurant.id)
                );
                count++;
            }
        }

        console.log(`restaurantMap: restored ${count} owner→restaurant mapping(s) from MongoDB`);
    } catch (err) {
        // Log clearly but do not crash — the server can still run, owners just need
        // to re-create their restaurant entries which will repopulate the map at runtime.
        console.error('restaurantMap: failed to populate from DB on startup:', err.message);
    }
}

module.exports = {
    setRestaurantId,
    getRestaurantId,
    getOwnerIdByRestaurantId,
    populateFromDB
};