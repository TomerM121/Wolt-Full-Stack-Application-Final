const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    throw new Error('JWT_SECRET environment variable is required');
}

module.exports = SECRET_KEY;
