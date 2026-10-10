import { CONFIG } from '../config.js';
/**
 * product.js is here to help us interact with the product-related
 * REST API endpoints from the web server in a simple way.
 */

class ProductApi {
    /**
     * Initialize the ProductApi class with its entry URL
     * and work from there with it in each method.
     */
    get baseURL() {
        return CONFIG.API_URL;
    }

    // Call GET localhost/api/restaurants/:restaurantId/products
    async getMenu(restaurantId) {
        try {
            const response = await fetch(`${this.baseURL}/restaurants/${restaurantId}/products`);
            const data = await response.json();
            // The backend returns { menu: [...] }
            return data.menu;
        }
        catch {
            throw new Error("Failed to fetch menu");
        }
    }

    // Call POST localhost/api/restaurants/:restaurantId/products
    async addProduct(restaurantId, name, description) {
        try {
            const response = await fetch(`${this.baseURL}/restaurants/${restaurantId}/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description })
            });
            const data = await response.json();
            // The backend returns { result: <new product> }
            return data.result;
        }
        catch {
            throw new Error("Failed to add product");
        }
    }

    // Call GET localhost/api/restaurants/:restaurantId/products/:productId
    // userId is required - the C++ server needs it to record the product view.
    async getProduct(restaurantId, productId, userId) {
        try {
            const response = await fetch(
                `${this.baseURL}/restaurants/${restaurantId}/products/${productId}`,
                { headers: { "X-User-Id": String(userId) } }
            );
            const data = await response.json();
            // The backend returns { product: {...} }
            return data.product;
        }
        catch {
            throw new Error("Failed to fetch product");
        }
    }

    // Call PATCH localhost/api/restaurants/:restaurantId/products/:productId
    async updateProduct(restaurantId, productId, fields) {
        try {
            // fields is an object with at least one of: { name, description }
            const response = await fetch(
                `${this.baseURL}/restaurants/${restaurantId}/products/${productId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(fields)
                }
            );
            // Backend responds with 204 No Content on success
            return response.ok;
        }
        catch {
            throw new Error("Failed to update product");
        }
    }

    // Call DELETE localhost/api/restaurants/:restaurantId/products/:productId
    async deleteProduct(restaurantId, productId, userId = null) {
        try {
            const headers = {};
            // If the user is authenticated, pass their id in the X-User-Id header
            if (userId !== null) {
                headers["X-User-Id"] = String(userId);
            }
            const response = await fetch(
                `${this.baseURL}/restaurants/${restaurantId}/products/${productId}`,
                {
                    method: "DELETE",
                    headers
                }
            );
            // Backend responds with 204 No Content on success
            return response.ok;
        }
        catch {
            throw new Error("Failed to delete product");
        }
    }
}

export default new ProductApi();