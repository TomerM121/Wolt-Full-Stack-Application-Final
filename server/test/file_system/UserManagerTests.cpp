#include <filesystem>
#include <fstream>
#include <gtest/gtest.h>
#include <memory>
#include <string>

#include "ds/ProductManager.h"
#include "file_system/UserManager.h"

using namespace std;
namespace fs = std::filesystem;

class UserManagerLoadTest : public ::testing::Test {
protected:
  const string DATA_PATH = "data/user_files/";

  void createUserFile(int userId, vector<string> productIds) {
    ofstream file(DATA_PATH + "user" + to_string(userId) + ".txt");
    for (const string &id : productIds)
      file << id << "\n";
  }

  void cleanupFiles() {
    for (const auto &entry : fs::directory_iterator(DATA_PATH))
      if (entry.is_regular_file() && entry.path().extension() == ".txt")
        fs::remove(entry.path());
  }

  void SetUp() override {
    fs::create_directories(DATA_PATH);
    cleanupFiles();
    ProductManager::cleanMap();
  }

  void TearDown() override {
    ProductManager::cleanMap();
    cleanupFiles();
  }
};

// UserManager loads existing user from disk
TEST_F(UserManagerLoadTest, LoadsExistingUser) {
  createUserFile(1, {"100", "101", "102"});

  UserManager um;
  EXPECT_TRUE(um.checkUserExists(User(1)));
}

// UserManager loads correct products for user
TEST_F(UserManagerLoadTest, LoadsCorrectProducts) {
  createUserFile(1, {"100", "101", "102"});

  UserManager um;
  auto products = um.getProducts(User(1));

  EXPECT_EQ(products.size(), 3);
  EXPECT_EQ(products[0]->getId(), "100");
  EXPECT_EQ(products[1]->getId(), "101");
  EXPECT_EQ(products[2]->getId(), "102");
}

// UserManager loads multiple users
TEST_F(UserManagerLoadTest, LoadsMultipleUsers) {
  createUserFile(1, {"100"});
  createUserFile(2, {"200"});

  UserManager um;
  EXPECT_TRUE(um.checkUserExists(User(1)));
  EXPECT_TRUE(um.checkUserExists(User(2)));
}

// UserManager ignores non-user files
TEST_F(UserManagerLoadTest, IgnoresNonUserFiles) {
  ofstream file(DATA_PATH + "random.txt");
  file << "123\n";
  file.close();

  UserManager um;
  EXPECT_EQ(um.getUsers().size(), 0);
}

// UserManager starts empty if no files exist
TEST_F(UserManagerLoadTest, StartsEmptyWithNoFiles) {
  UserManager um;
  EXPECT_TRUE(um.getUsers().empty());
}

// UserManager loads user then can add more products
TEST_F(UserManagerLoadTest, LoadThenAddProducts) {
  createUserFile(1, {"100"});

  UserManager um;
  um.addProductToUser(User(1), Product("200"));

  auto products = um.getProducts(User(1));
  EXPECT_EQ(products.size(), 2);
}