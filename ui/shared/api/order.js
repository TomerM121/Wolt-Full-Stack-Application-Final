import { CONFIG } from '../config.js';
/**
 * order.js is here to help us interact with the order-related
 * REST API endpoints from the web server in a simple way.
 *
 * All order endpoints require an authenticated user:
 * the userId is passed via the X-User-Id request header.
 */

import Auth from '../services/JwtHelper';

class OrderApi {
    /**
     * Initialize the OrderApi class with its entry URL
     * and work from there with it in each method.
     */
    get baseURL() {
        return CONFIG.API_URL;
    }

    // Call POST localhost/api/orders
    // Body: { restaurantId, items: [{ productId, ... }] }
    async createOrder(userId, restaurantId, items) {
        try {
            const response = await fetch(`${this.baseURL}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": userId,
                    "Authorization": `Bearer ${await Auth.getToken()}`
                },
                body: JSON.stringify({ restaurantId, items })
            });
            const data = await response.json();
            // The backend returns { success: true, data: <new order> }
            return data.data;
        }
        catch {
            throw new Error("Failed to create order");
        }
    }

    // Call GET localhost/api/orders
    // Returns all orders belonging to the current user
    async getAllOrders(userId) {
        try {
            const response = await fetch(`${this.baseURL}/orders`, {
                headers: { 
                    "X-User-Id": userId,
                    "Authorization": `Bearer ${await Auth.getToken()}`
                }
            });
            const data = await response.json();
            // The backend returns { success: true, data: [...] }
            return data.data;
        }
        catch {
            throw new Error("Failed to fetch orders");
        }
    }

    // Call GET localhost/api/orders/:orderId
    async getOrderById(userId, orderId) {
        try {
            const response = await fetch(`${this.baseURL}/orders/${orderId}`, {
                headers: { 
                    "X-User-Id": userId,
                    "Authorization": `Bearer ${await Auth.getToken()}`
                }
            });
            const data = await response.json();
            // The backend returns { success: true, data: <order> }
            return data.data;
        }
        catch {
            throw new Error("Failed to fetch order");
        }
    }

    // Call PATCH localhost/api/orders/:orderId
    // updates: object with any of { items: [...], status: "active", "closed" }
    async updateOrder(userId, orderId, updates) {
        try {
            const response = await fetch(`${this.baseURL}/orders/${orderId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": userId,
                    "Authorization": `Bearer ${await Auth.getToken()}`
                },
                body: JSON.stringify(updates)
            });
            const data = await response.json();
            // The backend returns { success: true, data: <updated order> }
            return data.data;
        }
        catch {
            throw new Error("Failed to update order");
        }
    }

    // Call DELETE localhost/api/orders/:orderId
    async deleteOrder(userId, orderId) {
        try {
            const response = await fetch(`${this.baseURL}/orders/${orderId}`, {
                method: "DELETE",
                headers: { 
                    "X-User-Id": userId,
                    "Authorization": `Bearer ${await Auth.getToken()}`
                }
            });
            const data = await response.json();
            // The backend returns { success: true, data: <deleted order> }
            return data.data;
        }
        catch {
            throw new Error("Failed to delete order");
        }
    }

    // Helper Method for adding a product to an order
    // Checks if there is an active order for the restaurant, if not creates one
    async addProductToOrder(userId, restaurantId, productId) {
        const orders = await this.getAllOrders(userId);

        // If an active order exists for this restaurant then add the product to it
        for (let order of orders) {
            if (order.restaurantId === restaurantId && order.status === "active") {
                // Add the product ID to the order
                return this.updateOrder(userId, order.id, {
                    items: [...(order.items || []), productId]
                });
            }
        }

        // Create new order, note that if we reach this part, for sure
        // We know that there isn't any active order for this restaurant
        return this.createOrder(userId, restaurantId, [productId]);
    }
}
export default new OrderApi();
