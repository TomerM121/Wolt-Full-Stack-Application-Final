const usersRepository = require('../repositories/usersRepository');
const jwt = require('jsonwebtoken');
const SECRET_KEY = require("../config/jwt");
/*
 * Login user by username and password.
 * Returns the userId so the client can pass it in the X-User-Id header
 * for all subsequent authenticated requests.
 */
async function login(data) {
    const { username, password } = data;

    if (!username || !password) {
        return {
            status: 400,
            body: { error: 'username and password are required' }
        };
    }

    const user = await usersRepository.getByUsername(username);

    // Verify user exists and password matches
    if (!user || user.password !== password) {
        return {
            status: 404,
            body: { error: 'Invalid username or password' }
        };
    }

    // Create token fot 2 hours
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '2h' });

    return {
        status: 200,
        body: { 
            userId: user.id,
            token: token,
            isOwner: user.isOwner
        }
    };
}

module.exports = {
    login
};