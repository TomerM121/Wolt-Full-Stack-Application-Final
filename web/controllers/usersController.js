const usersService = require('../services/usersService');

async function createUser(req, res) {
try {
        const logoPath = req.file ? `/uploads/${req.file.filename}` : "";

        const result = await usersService.createUser(req.body, logoPath);

        if (result.location) {
            res.location(result.location);
        }

        if (result.body) {
            return res.status(result.status).json(result.body);
        }

        res.status(result.status).end();
        
    } catch (error) {
        console.error("Error in createUser:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getUserById(req, res) {
    try {
        // Keep the ID as a string — MongoDB ObjectIds must not be cast to Number()
        const requestedId = req.params.id;
        const tokenUserId = req.userId;

        // Make sure that the id in the URL matches the authenticated user's id from the token
        if (requestedId !== tokenUserId) {
            console.error(
                `getUserById: ID mismatch — URL param: "${requestedId}" (${typeof requestedId}),` +
                ` token userId: "${tokenUserId}" (${typeof tokenUserId})`
            );
            return res.status(403).json({ error: "Forbidden: You can only access your own profile" });
        }
        
        const result = await usersService.getUserById(requestedId);

        if (result.body) {
            return res.status(result.status).json(result.body);
        }

        res.status(result.status).end();
        
    } catch (error) {
        console.error("Error in getUserById:", error);
        
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    createUser,
    getUserById
};