#include "ProductManager.h"

std::unordered_map<std::string, Product*> ProductManager::products;

Product* ProductManager::getProduct(std::string prod_id) {
    auto pair = products.find(prod_id); // Find the pair in the map.

    // Check if in map
    if (pair != products.end()) {
        // Return the product if exists
        return pair->second;
    }

    // Return nullptr if doesn't exist.
    return nullptr;
}

void ProductManager::addProduct(Product* prod) {
    // Validate input
    if (prod == nullptr)
        return;

    // Check if product is already in the system
    if (getProduct(prod->getId()))
        return;

    // Add it to the map if it doesnt exist in the map
    products[prod->getId()] = prod;
}

void ProductManager::removeProduct(std::string prod_id) {
    // Find who to remove
    auto pair = products.find(prod_id);

    // Remove
    if (pair != products.end()) {
        delete pair->second;
        products.erase(pair);
    }
}

void ProductManager::cleanMap() {
    // Delete everything from the map basically.
    for (auto& pair : products) {
        delete pair.second;
    }

    // Then remove the ptr from map.
    products.clear();
}