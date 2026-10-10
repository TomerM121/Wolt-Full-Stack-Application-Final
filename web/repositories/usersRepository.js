const User = require('../models/User');

/*
 * Create a new user in MongoDB.
 */
async function create(data) {
    return await User.create({
        username: data.username,
        password: data.password,
        name: data.name,
        phone: data.phone,
        location: data.location,
        logo: data.logo,
        isOwner: data.isOwner
    });
}

/*
 * Return all users from MongoDB.
 */
async function getAll() {
    return await User.find();
}

/*
 * Find user by MongoDB id.
 */
async function getById(id) {
    return await User.findById(id);
}

/*
 * Find user by username.
 */
async function getByUsername(username) {
    return await User.findOne({ username });
}

/*
 * Check whether username already exists.
 */
async function existsByUsername(username) {
    const user = await getByUsername(username);
    return user !== null;
}

module.exports = {
    create,
    getAll,
    getById,
    getByUsername,
    existsByUsername
};