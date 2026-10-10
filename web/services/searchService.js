/**
 * searchSerivce.js is a class that manages the search requests (such as
 * the query descrbied in Ex3.pdf)
 * A search request is a request that acts upon the name or description of some object
 * (such as restaurants, users and orders).
 * As of now, the only search request we defined is a search upon restaurant's name or
 * description.
 * 
 * The searchRepository.js supports only read functions.
 */

// Include restaurant repo
const restaurantRepo = require("../repositories/restaurantsRepository");

class searchService {
    query = async (str, domain) => {
        /**
         * The control flow would look something like this
         * Side note: At this stage we only need to query restaurant or products
         * This control flow logic allows a general function to act upon any object
         * Logic can be wrapped into a method inside each repo or can be implemented here
         */

        if (domain == Domains.RESTAURANT) {
            return await restaurantRepo.searchRestaurants(str);
        }

        if (domain == Domains.PRODUCT) {
            return await restaurantRepo.searchProducts(str);
        }

        // Default output
        return [];
    }
}

const Domains = Object.freeze({
    RESTAURANT: "restaurant",
    ORDER: "order",
    USER: "user",
    PRODUCT: "product"
});

// Export a single instance and the domains enum
module.exports = {
    Domains: Domains,
    searchService: new searchService()
}; 