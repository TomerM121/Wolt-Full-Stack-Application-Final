#ifndef USER_MANAGER_H
#define USER_MANAGER_H

#include "FileHandler.h"
#include "../ds/User.h"
#include "../ds/Product.h"
#include "../ds/ProductManager.h"
#include <iostream>
#include <unordered_map>
#include <string>
#include <filesystem>
#include <vector>
#include <set>

/* userManager is a class that matches User to a file */
// This system is responsible for managing files of users.
// User creation is also done through here, thus this system is responsible for any
// Duplicates in users, and file management of users.
// Also products are added through here as well, thus this system is also responsibble
// for correct prodcut management of users.

// This is the only class that DIRECTLY interacts with fileHandler, User, Product.
// If components in our system wants to interact with such classes, they must interact with this class.

class UserManager {
    // Using unordered_map to store pairs. Key is user id (unique), Value is ptr file handler.
    // Note we must save the ptr to file handler rather than the object itself.
    private: std::unordered_map<int, FileHandler*> userFiles;
    
    // We want to access to all product which exist in the system
    // Lets define a field for that as well called prodManager
    private: ProductManager prodManager;

    // Constructor: This constructor initializes the userFiles map.
    public: UserManager(); 

    // Add user: This method adds a new user and creates a corresponding file for them.
    // User user - The user to be added.
    // NOTE: WILL NOT ALLOW TO ADD USER THAT DOES ALREADY EXIST.
    public: void addUser(User user);

    // Check if user exists: This method checks if a user exists in the map.
    // User user - The user to check.
    // Returns (bool): True if the user exists, false otherwise.
    public: bool checkUserExists(User user);

    // Get all users in the system.
    // Returns vector<User>: A vector containing all users in the system.
    public: std::vector<User> getUsers();

    // Add product to user: This method adds a product to a user's file.
    // User user - The user to whom the product will be added.
    // Product product - The product to be added to the user's file.
    // If product is new add it to the system.
    // If user is new refush to do it.
    public: void addProductToUser(User user, Product product);

    // Get Products: This methods return the products of a user by reading from their file.
    // User user - The user whose products we want to retrieve.
    // Returns (string): The products of the user.
    public: std::vector<Product*> getProducts(User user);

    // For testing purposes only! The use of this method is not allowed besides for testing.
    public: std::unordered_map<int, FileHandler*> getMap();

    // Remove products from user: This method removes products from a user's file.
    // User user - The user from whom the products will be removed.
    public: void removeProductsFromUser(User user, const std::set<std::string>& productsToDelete);


    // Destructor: This destructor ensures that all files are properly closed when the object is destroyed.
    public: ~UserManager();
};
#endif