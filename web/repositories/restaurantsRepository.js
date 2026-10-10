const Restaurant = require('../models/Restaurant');

/**
 * Repository for restaurant-related database operations.
 * This repository uses MongoDB through the Restaurant Mongoose model.
 */
class RestaurantRepository {
    /**
     * Create a new restaurant in MongoDB.
     */
    async createRestaurant(data) {
        return await Restaurant.create({
            name: data.name,
            description: data.description,
            location: data.location,
            products: [],
            // Persist ownerId when provided so the restaurantMap can be
            // rebuilt from MongoDB on startup after a server restart.
            ownerId: data.ownerId || null
        });
    }

    /**
     * Get all restaurants from MongoDB.
     */
    async getAllRestaurants() {
        return await Restaurant.find();
    }

    /**
     * Get a specific restaurant by MongoDB ObjectId.
     */
    async getRestaurant(id) {
        return await Restaurant.findById(id);
    }

    /**
     * Update a restaurant by MongoDB ObjectId.
     */
    async updateRestaurant(id, data) {
        // If no fields are provided for update, return null to indicate no update was performed.
        if (!data.name && !data.description && !data.location) {
            return null;
        }
        // Use findByIdAndUpdate to update the restaurant and return the updated document.
        return await Restaurant.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );
    }

    /**
     * Delete a restaurant by MongoDB ObjectId.
     */
    async deleteRestaurant(id) {
        const deleted = await Restaurant.findByIdAndDelete(id);
        return deleted !== null;
    }

    /**
     * Get all products from a specific restaurant.
     */
    async getMenuFromRestaurant(restID) {
        const restaurant = await this.getRestaurant(restID);

        if (!restaurant) {
            return null;
        }

        return restaurant.products;
    }

    /**
     * Add a product to a restaurant.
     */
    async addProductToRestaurant(restID, product) {
        const restaurant = await this.getRestaurant(restID);

        if (!restaurant) {
            return false;
        }

        const productToSave = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: Number(product.price)
        };

        // Validate product price is valid before saving.
        if (
            productToSave.price === undefined ||
            Number.isNaN(productToSave.price) ||
            productToSave.price < 0
        ) {
            return false;
        }

        restaurant.products.push(productToSave);
        await restaurant.save();

        return productToSave;
    }

    /**
     * Get a specific product from a restaurant.
     */
    async getProductFromRestaurant(restID, prodID) {
        const restaurant = await this.getRestaurant(restID);

        if (!restaurant) {
            return null;
        }

        return restaurant.products.find(
            product => String(product.id) === String(prodID)
        ) || null;
    }

    /**
     * Update a product inside a restaurant.
     * Validates the price before saving and explicitly marks the products array
     * as modified so Mongoose persists nested array changes.
     */
    async updateProductInRestaurant(restID, newProduct, prodID) {
        const restaurant = await this.getRestaurant(restID);

        if (!restaurant) {
            return false;
        }

        const product = restaurant.products.find(
            product => String(product.id) === String(prodID)
        );

        if (!product) {
            return false;
        }

        // Update only the fields that are provided in newProduct.
        if (newProduct.name !== undefined) {
            product.name = newProduct.name;
        }

        if (newProduct.description !== undefined) {
            product.description = newProduct.description;
        }

        if (newProduct.price !== undefined) {
            const numericPrice = Number(newProduct.price);

            if (Number.isNaN(numericPrice) || numericPrice < 0) {
                return false;
            }

            product.price = numericPrice;
        }

        // Mongoose may not always detect nested array mutations automatically.
        restaurant.markModified('products');

        await restaurant.save();
        return true;
    }

    /**
     * Remove a product from a restaurant.
     */
    async removeProductFromRestaurant(restID, prodID) {
        const restaurant = await this.getRestaurant(restID);

        if (!restaurant) {
            return false;
        }

        const originalLength = restaurant.products.length;

        restaurant.products = restaurant.products.filter(
            product => String(product.id) !== String(prodID)
        );

        if (restaurant.products.length === originalLength) {
            return false;
        }

        await restaurant.save();
        return true;
    }

    /**
     * Search restaurants by name or description.
     */
    async searchRestaurants(str) {
        const query = str.toLowerCase();
        const restaurants = await Restaurant.find();

        return restaurants
            .filter(restaurant =>
                restaurant.name.toLowerCase().includes(query) ||
                (
                    restaurant.description &&
                    restaurant.description.toLowerCase().includes(query)
                )
            )
            .map(restaurant => {
                const plainRestaurant = restaurant.toObject();

                return {
                    ...plainRestaurant,
                    id: plainRestaurant._id.toString(),
                    type: 'restaurant'
                };
            });
    }

    /**
     * Search products across all restaurants by name or description.
     */
    async searchProducts(str) {
        const query = str.toLowerCase();
        const restaurants = await Restaurant.find();
        const results = [];

        for (const restaurant of restaurants) {
            for (const product of restaurant.products) {
                if (
                    product.name.toLowerCase().includes(query) ||
                    (
                        product.description &&
                        product.description.toLowerCase().includes(query)
                    )
                ) {
                    const plainProduct = product.toObject
                        ? product.toObject()
                        : product;

                    results.push({
                        ...plainProduct,
                        type: 'product',
                        restaurantId: restaurant._id.toString(),
                        restaurantName: restaurant.name
                    });
                }
            }
        }

        return results;
    }
}

module.exports = new RestaurantRepository();