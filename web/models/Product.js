/**
 * Product model is the model that represernt product in the system.
 */

class Product {
    /**
     * Constructor for product
     */
    constructor(id, name, description, price) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
    }
}

module.exports = Product;