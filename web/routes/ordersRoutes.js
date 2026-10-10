const express = require('express');
const router = express.Router();

const orderController = require('../controllers/ordersController');
const authMiddleware = require('../middlewares/authMiddleware'); // Import the middleware

// Any request coming here MUST have the X-User-Id header
router.use(authMiddleware);
// /api/orders
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrdersOfCurrentUser);

// /api/orders/:id
router.get('/:id', orderController.getOrderById);
router.patch('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;