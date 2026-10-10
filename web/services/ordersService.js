const ordersRepository = require('../repositories/ordersRepository');
const restaurantsRepository = require('../repositories/restaurantsRepository');
const { Order, OrderStatus } = require('../models/ordersModel');

// create a new order
const createNewOrder = async (orderData) => {
    // Make sure a restaurant with this id exists
    const restaurant = await restaurantsRepository.getRestaurant(orderData.restaurantId);

    if (!restaurant) {
        throw new Error("Restaurant not found");
    }

    // Make sure all of the products ids are in the menu
    const allItemsBelongToRestaurant = orderData.items.every(itemId => {
        return restaurant.products.some(product => String(product.id) === String(itemId));
    });

    // If any of the items do not belong to the restaurant's menu, throw an error
    if (!allItemsBelongToRestaurant) {
        throw new Error("Invalid order: One or more items do not belong to this restaurant's menu");
    }

    // Calculate total price before constructing the document
    const totalPrice = await calculateTotalPrice(orderData.items);

    // Construct the Mongoose document using a plain object.
    // Mongoose models do NOT accept positional constructor args — all fields must be
    // passed as a named-property object, otherwise schema defaults override them silently.
    const newOrder = new Order({
        userId: orderData.userId,
        restaurantId: orderData.restaurantId,
        items: orderData.items,
        status: OrderStatus.ACTIVE, // Explicitly set so it is persisted, not defaulted to 'undefined'
        totalPrice
    });

    // Persist to MongoDB
    return await ordersRepository.save(newOrder);
};


// Get all orders of a specific user
const getAllOrdersOfUser = async (currentUserId) => {
    return await ordersRepository.findAllOfUser(currentUserId);
};

// Get a specific order by its ID and the current user's ID
const getOrderById = async (orderId, currentUserId) => {
    return await ordersRepository.findById(orderId, currentUserId);
};

// Update an order by its ID and the current user's ID
const updateOrder = async (orderId, updates, currentUserId) => {
    const existingOrder = await ordersRepository.findById(orderId, currentUserId);

    if (!existingOrder || existingOrder.userId !== currentUserId) {
        throw new Error("Order not found");
    }

    const fieldsToUpdate = {};

    // Validate and prepare items if provided
    if (updates.items !== undefined) {
        const restaurant = await restaurantsRepository.getRestaurant(existingOrder.restaurantId);
        // Validate that the restaurant exists
        if (!restaurant) {
            throw new Error("Restaurant not found");
        }

        // Ensure the current user is the owner of the order
        if (currentUserId != existingOrder.userId) {
            throw new Error("You are not authorized to update this order");
        }

        // Validate that all items belong to the restaurant's menu
        const allItemsValid = updates.items.every(itemId => {
            return restaurant.products.some(product => String(product.id) === String(itemId));
        });

        if (!allItemsValid) {
            throw new Error("Invalid order: One or more items do not belong to this restaurant's menu");
        }

        fieldsToUpdate.items = updates.items;
    }

    // Validate and prepare status if provided
    if (updates.status !== undefined) {
        const validStatuses = Object.values(OrderStatus);
        if (!validStatuses.includes(updates.status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        fieldsToUpdate.status = updates.status;
    }

    return await ordersRepository.update(orderId, fieldsToUpdate);
};

// Delete an order by its ID and the current user's ID
const deleteOrder = async (orderId, currentUserId) => {
    const orderToDelete = await ordersRepository.findById(orderId, currentUserId);
    if (!orderToDelete) return null;

    await ordersRepository.remove(orderId, currentUserId);
    return orderToDelete;
};

// Calculate the total price of an order based on its items and the restaurant's menu
const calculateTotalPrice = async (products) => {
    let totalPrice = 0;
    for (const product of products) {
        totalPrice += Number(product.price || 0);
    }
    return totalPrice;
};


module.exports = {
    createNewOrder,
    getAllOrdersOfUser,
    getOrderById,
    updateOrder,
    deleteOrder,
    calculateTotalPrice
};