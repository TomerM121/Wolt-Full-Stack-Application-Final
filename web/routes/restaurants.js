const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const restaurantsController = require('../controllers/restaurantsController');

router.get('/', restaurantsController.getAllRestaurants);
router.post('/', authMiddleware, restaurantsController.createRestaurant);

router.get('/my', authMiddleware, restaurantsController.getMyRestaurant);
router.get('/:id', restaurantsController.getRestaurantById);
router.patch('/:id', authMiddleware, restaurantsController.updateRestaurant);
router.delete('/:id', authMiddleware, restaurantsController.deleteRestaurant);

module.exports = router;