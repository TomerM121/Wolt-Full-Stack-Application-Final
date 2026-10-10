const { Order } = require('../models/ordersModel');

const save = async (newOrder) => {
    return await Order.create(newOrder);
};

// Find an order by its ID and the current user's ID
const findById = async (id, currentUserId) => {
    return await Order.findOne({
        _id: id,
        userId: currentUserId
    });
};

// Find all orders of a specific user
const findAllOfUser = async (currentUserId) => {
    return await Order.find({
        userId: currentUserId
    });
};

// Update an order by its ID and the current user's ID
const update = async (id, fields) => {
    // Prevent updating the userId field.
    if (fields.userId) {
        throw new Error("User ID cannot be updated");
    }

    // Prevent updating the restaurantId field.
    if (fields.restaurantId) {
        throw new Error("Restaurant ID cannot be updated");
    }

    // Prevent updating the totalPrice field.
    if (fields.totalPrice) {
        throw new Error("Total price cannot be updated directly");
    }

    // make sure that the fields object is not empty
    if (!fields || Object.keys(fields).length === 0) {
        throw new Error("No fields provided for update");
    }

    // Update the order in the database and return the updated order.
    // NOTE: totalPrice is intentionally NOT updated here — it is a derived field
    // that should be recalculated by the orders service when items change.
    return await Order.findByIdAndUpdate(
        id,
        fields,
        { new: true, runValidators: true }
    );
};

// Remove an order by its ID and the current user's ID
const remove = async (id, currentUserId) => {
    return await Order.findOneAndDelete({
        _id: id,
        userId: currentUserId
    });
};

module.exports = {
    save,
    findById,
    findAllOfUser,
    update,
    remove
};