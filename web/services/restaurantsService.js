const restaurantsRepository = require('../repositories/restaurantsRepository');
const distance = require('../utils/distance');
const usersRepository = require('../repositories/usersRepository');
const restaurantMap = require('../repositories/restaurantMap');
const userRepo = require('../repositories/usersRepository');


// A helper function
const enrichRestaurantWithImage = async (restaurant) => {
    if (!restaurant) return null;

    const plainRestaurant = restaurant.toObject
        ? restaurant.toObject()
        : restaurant;

    const restaurantId = plainRestaurant._id?.toString() || plainRestaurant.id;

    const ownerId = plainRestaurant.ownerId || restaurantMap.getOwnerIdByRestaurantId(restaurantId);

    const owner = ownerId ? await userRepo.getById(ownerId) : null;

    return {
        ...plainRestaurant,
        id: restaurantId,
        image: owner && owner.logo
            ? owner.logo.replace('public/', '').replace('public\\', '')
            : null
    };
};

// Service functions for restaurant-related operations
async function getAllRestaurants(userLocation = null) {
    // Get all restaurants from the repository
    const restaurants = await restaurantsRepository.getAllRestaurants();

    // If user location is not provided, return restaurants in the order they are stored
    if (!userLocation) {
        return restaurants;
    }

    // Sort restaurants by distance to the user
    return restaurants.slice().sort((a, b) =>
        distance(userLocation, a.location) -
        distance(userLocation, b.location)
    );
}

// Get a single restaurant by ID
async function getRestaurantById(id) {
    return restaurantsRepository.getRestaurant(id);
}

// Create a new restaurant
async function createRestaurant(data, userId) {
    const user = await usersRepository.getById(userId);
    // Check if owner
    if (!user || !user.isOwner) {
        return { status: 403, body: { error: 'Only owners can create a restaurant' } };
    }

    // Check if already has restaurant
    if (restaurantMap.getRestaurantId(userId) !== null) {
        return { status: 400, body: { error: 'User already owns a restaurant' } };
    }

    // Validate required fields
    if (!data.name || !data.description || !data.location || data.location.latitude == undefined || data.location.longitude == undefined) {
        return {
            status: 400,
            body: { error: 'Name, description and location are required' }
        };
    }

    // Create the restaurant in the repository, storing ownerId for durable restart recovery
    const restaurant = await restaurantsRepository.createRestaurant({
        name: data.name,
        description: data.description,
        location: {
            latitude: data.location.latitude,
            longitude: data.location.longitude
        },
        ownerId: userId    // persisted to MongoDB so restaurantMap can be rebuilt on startup
    });

    // Add to map
    restaurantMap.setRestaurantId(userId, restaurant.id);

    // Return the created restaurant with a 201 status and location header
    return {
        status: 201,
        body: restaurant,
        location: `/api/restaurants/${restaurant.id}`
    };
}

// Update an existing restaurant
async function updateRestaurant(id, data) {
    const allowedFields = ['name', 'location', 'description'];
    const updateData = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    }

    if (Object.keys(updateData).length === 0) {
        return {
            status: 400,
            body: { error: 'No valid fields to update' }
        };
    }

    const restaurant = await restaurantsRepository.updateRestaurant(id, updateData);

    if (!restaurant) {
        return {
            status: 404,
            body: { error: 'Restaurant not found' }
        };
    }

    return {
        status: 204,
        body: null
    };
}

// Delete a restaurant by ID
async function deleteRestaurant(id) {
    const deleted = await restaurantsRepository.deleteRestaurant(id);

    if (!deleted) {
        return {
            status: 404,
            body: { error: 'Restaurant not found' }
        };
    }

    return {
        status: 204,
        body: null
    };
}

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    enrichRestaurantWithImage
};