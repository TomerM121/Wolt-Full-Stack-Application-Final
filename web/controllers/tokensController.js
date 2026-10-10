const tokensService = require('../services/tokensService');

/**
 * POST /api/login
 * Authenticates a user by username + password.
 * On success, returns the userId to be used in X-User-Id headers.
 */
async function login(req, res) {
    const result = await tokensService.login(req.body);

    return res.status(result.status).json(result.body);
}

module.exports = {
    login
};