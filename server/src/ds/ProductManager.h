#ifndef PRODUCT_MANAGER_H
#define PRODUCT_MANAGER_H

#include "Product.h"
#include <string>
#include <unordered_map>

// This class basically ensures working with ID and Products will be possible no
// matter what. Great for expansions in the future. Why even implement this
// class: Because of SOLID!

class ProductManager {
  // A shared map that matches between ID's and existing ptr to existing
  // Product.
private:
  static std::unordered_map<std::string, Product *> products;

  // Constructor: ProductManager - should be empty because map is empty at
  // first.
public:
  ProductManager() {}

  // Method to check if product already exist in the system.
  // If doesnt exist return nullptr.
public:
  static Product *getProduct(std::string prod_id);

  // Add Product to map
public:
  static void addProduct(Product *prod);

  // Remove product
  static void removeProduct(std::string prod_id);

  // Pre-Destructor:
public:
  static void cleanMap();
};
#endif