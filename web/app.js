const express = require('express');

// Import routes
const orderRoutes = require('./routes/ordersRoutes');
const productRoutes = require('./routes/product');
const restaurantRoutes = require('./routes/restaurants');
const searchRoutes = require('./routes/search');
const tokensRoutes = require('./routes/tokens');
const usersRoutes = require('./routes/users');
const connectDB = require('./config/db');
const restaurantMap = require('./repositories/restaurantMap');
const app = express();
const PORT = 3000;

// Settings
app.use(express.json());

// Serve static files from the public folder
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));
app.use('/uploads', express.static('uploads'));

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-Id'
    );

    // Handle preflight requests for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Routing
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants/:id/products', productRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/tokens', tokensRoutes);
app.use('/api/users', usersRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);

    res.status(500).json({
        error: 'Internal Server Error'
    });
});

/*
 * Start the server only after MongoDB is connected.
 * This ensures that routes will not run before the database is ready.
 */
async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Restore the in-memory owner→restaurant map from MongoDB.
        // Must run before app.listen() so the first request sees a fully hydrated map.
        await restaurantMap.populateFromDB();

        // Start the Express server
        app.listen(PORT, () => {
            console.log(
                `Node.js server is running on http://localhost:${PORT}`
            );
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
}

// If this file is run directly, start the server.
// This allows for testing and running the server independently.
if (require.main === module) {
    startServer();
}

module.exports = app;