const ordersService = require('../services/ordersService');

const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const currentUserId = req.userId;

        const deletedOrder = await ordersService.deleteOrder(orderId, currentUserId);

        // Check if the order doesnt exists
        if (!deletedOrder) {
            return res.status(404).json({
                success: false,
                error: `Order not found`
            });
        }

        // 5. Return HTTP 200 (OK) with the newly deleted order data
        return res.status(200).json({
            success: true,
            data: deletedOrder
        });

    } catch (error) {
        res.status(500).send("Internal server error");
    }
};

const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const currentUserId = req.userId;

        const { items, status } = req.body;

        // Require at least one field to update
        if (items === undefined && status === undefined) {
            return res.status(400).json({
                success: false,
                error: "Bad Request: Please provide at least one field to update (items or status)"
            });
        }

        if (!currentUserId) {
            return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        const updatedOrder = await ordersService.updateOrder(orderId, { items, status }, currentUserId);

        // Return HTTP 200 (OK) with the newly updated order data
        return res.status(200).json({
            success: true,
            data: updatedOrder
        });

    } catch (error) {
        console.error("Error in updateOrder:", error);

        if (error.message === "Order not found") {
            return res.status(404).json({ success: false, error: error.message });
        }

        if (error.message.includes("Invalid order")) {
            return res.status(400).json({ success: false, error: error.message });
        }

        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const currentUserId = req.userId;

        const order = await ordersService.getOrderById(orderId, currentUserId);

        // Check of order exists
        if (!order) {
            return res.status(404).json({
                success: false,
                error: `Order not found`
            });
        }

        // Return HTTP Status 200 (OK) with the order
        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).send("Internal server error");
    }
}

const getAllOrdersOfCurrentUser = async (req, res) => {
    try {
        const currentUserId = req.userId;

        const orders = await ordersService.getAllOrdersOfUser(currentUserId);

        // Return HTTP Status 200 (OK) with the array of orders
        return res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).send("Internal server error");
    }
}

const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        const currentUserId = req.userId;

        // Basic validation to check if payload exists and contains necessary components
        if (!orderData || !orderData.restaurantId ||
            !orderData.items || !Array.isArray(orderData.items) ||
            orderData.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Bad Request: Missing required order parameters"
            });
        }

        orderData.userId = currentUserId;

        // Delegate the business logic and C++ communication to the service layer
        const newOrder = await ordersService.createNewOrder(orderData);

        // Respond with HTTP Status 201 (Created) and the newly added order object
        return res.status(201).json({
            success: true,
            data: newOrder
        });

    } catch (error) {
        console.error("Error in createOrder:", error);

        if (error.message === "Restaurant not found") {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes("Invalid order: One or more items do not belong to this restaurant's menu")) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

module.exports = {
    createOrder,
    getAllOrdersOfCurrentUser,
    updateOrder,
    deleteOrder,
    getOrderById
};