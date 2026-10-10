#include "UserManager.h"
#include "../ds/ProductManager.h"
#include "../ds/User.h"
#include "FileHandler.h"

#include <filesystem>
#include <set>
#include <sstream>

UserManager::UserManager() {
  namespace fs = std::filesystem;

  if (!fs::exists(PATH)) {
    return;
  }

  for (const auto &cur : fs::directory_iterator(PATH)) {
    if (!cur.is_regular_file()) {
      continue;
    }

    if (cur.path().extension() != ".txt") {
      continue;
    }

    std::string stem = cur.path().stem().string();

    if (stem.substr(0, 4) != "user") {
      continue;
    }

    try {
      int userId = std::stoi(stem.substr(4));
      FileHandler *userFile = new FileHandler(cur.path().filename().string());

      this->userFiles[userId] = userFile;
    } catch (...) {
      continue;
    }
  }
}

void UserManager::addUser(User user) {
  if (checkUserExists(user)) {
    return;
  }

  std::string name = "user" + std::to_string(user.getId()) + ".txt";

  FileHandler *userFile = new FileHandler(name);

  this->userFiles[user.getId()] = userFile;
}

bool UserManager::checkUserExists(User user) {
  return this->userFiles.find(user.getId()) != this->userFiles.end();
}

std::vector<User> UserManager::getUsers() {
  std::vector<User> allUsers;

  for (std::pair<const int, FileHandler *> &pair : this->userFiles) {
    allUsers.push_back(pair.first);
  }

  return allUsers;
}

void UserManager::addProductToUser(User user, Product product) {
  if (!checkUserExists(user)) {
    return;
  }

  std::vector<Product *> existingProducts = getProducts(user);

  for (Product *existingProduct : existingProducts) {
    if (existingProduct != nullptr &&
        existingProduct->getId() == product.getId()) {
      return;
    }
  }

  if (ProductManager::getProduct(product.getId()) == nullptr) {
    ProductManager::addProduct(new Product(product));
  }

  FileHandler *f = userFiles[user.getId()];

  f->writeToFile(product.getId() + "\n");
}

std::vector<Product *> UserManager::getProducts(User user) {
  auto userFile = userFiles.find(user.getId());

  if (userFile == userFiles.end() || userFile->second == nullptr) {
    return {};
  }

  FileHandler *f = userFile->second;

  std::string prod_str = f->readFromFile();

  std::vector<std::string> prod_id;
  std::stringstream ss(prod_str);
  std::string line;

  while (std::getline(ss, line)) {
    if (!line.empty()) {
      prod_id.push_back(line);
    }
  }

  std::vector<Product *> prod_vector;

  for (const std::string& id : prod_id) {
    Product *product = ProductManager::getProduct(id);

    if (product == nullptr) {
      ProductManager::addProduct(new Product(id));
      product = ProductManager::getProduct(id);
    }

    prod_vector.push_back(product);
  }

  return prod_vector;
}

void UserManager::removeProductsFromUser(
    User user, const std::set<std::string> &productsToDelete) {
  if (!checkUserExists(user)) {
    return;
  }

  std::vector<Product *> products = getProducts(user);

  FileHandler *f = userFiles[user.getId()];

  f->clearFile();

  for (Product *product : products) {
    if (product == nullptr) {
      continue;
    }

    if (productsToDelete.find(product->getId()) == productsToDelete.end()) {
      f->writeToFile(product->getId() + "\n");
    }
  }

  // After you delete a product from a file, the file might be completly removed
  // from the system For example thing of a resturant that sells a special meal
  // that only they make If it is not in the resturant then we dont want in the
  // system at all
  for (const std::string& deletedProdId : productsToDelete) {
    bool isLast = true;

    // Check over all users in the system
    for (const auto &pair : userFiles) {
      // Skip our user
      if (pair.first == user.getId())
        continue;

      User otherUser(pair.first);
      std::vector<Product *> otherUserProducts = getProducts(otherUser);

      // check if other user have this product
      for (Product *p : otherUserProducts) {
        if (p != nullptr && p->getId() == deletedProdId) {
          isLast = false;
          break;
        }
      }

      // If we found even one user who owns it, it's not last
      if (!isLast)
        break;
    }

    // If it is last then it is for removal from the system
    if (isLast) {
      ProductManager::removeProduct(deletedProdId);
    }
  }
}

std::unordered_map<int, FileHandler *> UserManager::getMap() {
  return this->userFiles;
}

UserManager::~UserManager() {
  for (std::pair<const int, FileHandler *> &pair : this->userFiles) {
    delete pair.second;
  }

  ProductManager::cleanMap();
}