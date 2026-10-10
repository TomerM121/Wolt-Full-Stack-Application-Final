const mongoose = require('mongoose');

/*
 * Connect the Node.js server to MongoDB.
 */
async function connectDB() {
    try {
        // Use the MONGO_URI environment variable if available, otherwise default to a local MongoDB instance.
        const mongoUri =
            process.env.MONGO_URI ||
            'mongodb://localhost:27017/wolt';

        // Connect to MongoDB using Mongoose
        await mongoose.connect(mongoUri);

        // Log a success message if the connection is successful
        console.log('MongoDB connected successfully');
    } catch (err) {
        // Log an error message if the connection fails and exit the process
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
}

module.exports = connectDB;