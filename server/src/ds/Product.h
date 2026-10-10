#pragma once

#include <string>

/* Product is a class that represents a product in our system */
class Product {
    // Each product has an id (which is unique)
    private: std::string id;

    public: Product(std::string id);

    public: std::string getId() const;
};