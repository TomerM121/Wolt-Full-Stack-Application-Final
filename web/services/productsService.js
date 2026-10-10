/**
 * Product service is the service that manages the requests about products.
 * It will handle those requests using the restaurant (yes restaurant) repository.
 * Make sure you understand why is it handeld through the restaurant repo.
 */

// Include restaurant repo
const restaurantRepo = require("../repositories/restaurantsRepository");
const ex2Server = require("./viewService");


// api/restaurants/:id/products methods

const getMenu = async (restId) => {
    return await restaurantRepo.getMenuFromRestaurant(restId);
};

const addProductToRestaurant = async (restId, product) => {
    return await restaurantRepo.addProductToRestaurant(restId, product);
};

// api/restaurants/:id/products/:productId methods

const getProductFromRestaurant = async (restId, productId) => {
    return await restaurantRepo.getProductFromRestaurant(restId, productId);
};

const updateProductInRestaurant = async (restId, productId, product) => {
    // Validate product
    if (product.name == undefined || product.description == undefined || product.price == undefined) {
        throw new Error("Product must have a name, description and price");
    }
    return await restaurantRepo.updateProductInRestaurant(restId, product, productId);
};

const deleteProductFromRestaurant = async (restId, productId) => {
    return await restaurantRepo.removeProductFromRestaurant(restId, productId);
};

// Export the functions so they can be used in the controller
module.exports = {
    getMenu,
    addProductToRestaurant,
    getProductFromRestaurant,
    updateProductInRestaurant,
    deleteProductFromRestaurant
};