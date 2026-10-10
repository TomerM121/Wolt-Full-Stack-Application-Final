const mongoose = require('mongoose');

/*
 * User schema for MongoDB.
 */
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    logo: {
        type: String,
        required: true
    },

    isOwner: {
        type: Boolean,
        default: false
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
    }
});

module.exports = mongoose.model('User', userSchema);