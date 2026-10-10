import { CONFIG } from '../config.js';
/**
 * restaurant.js is here to help us interact with the restaurant-related
 * REST API endpoints from the web server in a simple way.
 */
import jwtHelper from '../services/JwtHelper.js';

class RestaurantApi {
    /**
     * Initialize the RestaurantApi class with its entry URL
     * and work from there with it in each method.
     */
    get baseURL() {
        return CONFIG.API_URL;
    }

    // Call GET localhost/api/restaurants
    async getRestaurants() {
        try {
            const response = await fetch(`${this.baseURL}/restaurants`);
            const data = await response.json();
            // The backend returns an array of restaurants
            return data;
        }
        catch {
            throw new Error("Failed to fetch restaurants");
        }
    }

    // Call GET localhost/api/restaurants/:restaurantID
    async getRestaurantById(restaurantID) {
        try {
            const response = await fetch(`${this.baseURL}/restaurants/${restaurantID}`);
            const data = await response.json();
            // The backend returns the restaurant object
            return data;
        }
        catch {
            throw new Error("Failed to fetch restaurant");
        }
    }

    // Get the logged in user restaurant
    async getMyRestaurant() {
        try {
            const token = await jwtHelper.getToken();

            const response = await fetch(`${this.baseURL}/restaurants/my`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
            });            

            if (!response.ok) {
                throw new Error(`Server returned status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }
        catch {
            throw new Error("Failed to fetch restaurant");
        }
    }

    // Call POST localhost/api/restaurants
    async createRestaurant(restaurantData) {
        try {
            // Fetch the token from your JwtHelper
            const token = await jwtHelper.getToken();

            const response = await fetch(`${this.baseURL}/restaurants`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(restaurantData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            return data;
        }
        catch (err) {
            throw new Error(`Failed to create restaurant: ${err.message}`);
        }
    }

    /// Call PATCH localhost/api/restaurants/:restaurantId
    async updateRestaurant(restaurantId, updatedData) {
        try {
            const token = await jwtHelper.getToken();

            const response = await fetch(`${this.baseURL}/restaurants/${restaurantId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

           return response.ok;
        }
        catch (err) {
            throw new Error(`Failed to update restaurant: ${err.message}`);
        }
    }

    // Call DELETE localhost/api/restaurants/:restaurantId
    async deleteRestaurant(restaurantId) {
        try {
            // Fetch the token from your JwtHelper
            const token = await jwtHelper.getToken();

            const response = await fetch(`${this.baseURL}/restaurants/${restaurantId}`, {
                method: "DELETE",
                headers: { 
                    "Authorization": `Bearer ${token}`
                }
            });
  
            return response.ok;
        }
        catch (err) {
            throw new Error("Failed to delete restaurant: " + err.message);
        }
    }

    // Call POST localhost/api/restaurants/:restaurantId/products
    async addProduct(restaurantId, productData) {
        try {
            // Fetch token
            const token = await jwtHelper.getToken();

            const response = await fetch(`${this.baseURL}/restaurants/${restaurantId}/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            return response.ok;
        }
        catch (err) {
            throw new Error(`Failed to add product: ${err.message}`);
        }
    }

    // Delete product
    async deleteProduct(restaurantId, productId) {
        try {
            const token = await jwtHelper.getToken();
            const response = await fetch(`${this.baseURL}/restaurants/${restaurantId}/products/${productId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            return response.ok;
        } catch (err) {
            throw new Error("Failed to delete product: " + err.message);
        }
    }

    async updateProduct(restaurantId, productId, productData) {
        const token = await jwtHelper.getToken();
        const response = await fetch(`${this.baseURL}/restaurants/${restaurantId}/products/${productId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }
    }
}
export default new RestaurantApi();
