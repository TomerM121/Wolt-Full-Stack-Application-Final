/**
 * idGenerator.js - Generates unique IDs for use across the system.
 */

const { randomUUID } = require("crypto");

/**
 * Generates a unique UUID string
 */
const generateId = () => {
    return randomUUID();
};

module.exports = { generateId };