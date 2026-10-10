#include "Product.h"

// Constructor: This constructor initializes the product with a given id.
Product::Product(std::string id) {
    this->id = id;
}

// Get id: This method returns the id of the product.
std::string Product::getId() const {
    return id;
}
