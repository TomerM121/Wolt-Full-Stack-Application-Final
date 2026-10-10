const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },

    products: {
        type: Array,
        default: []
    },

    /*
     * ownerId stores the MongoDB ObjectId (as a string) of the user who owns this restaurant.
     * Not required so existing documents created before this fix remain valid.
     * Used to rebuild the in-memory restaurantMap on server startup.
     */
    ownerId: {
        type: String,
        required: false,
        default: null
    }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);