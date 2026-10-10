
/*
#include <gtest/gtest.h>
#include "ds/User.h"
#include "ds/Product.h"

// Testing basic getters and initial state
TEST(UserTests, Getters) {
    User user(1);
    
    EXPECT_EQ(user.getId(), 1);
    
    // Check if products is empty
    EXPECT_TRUE(user.getProducts().empty());
    EXPECT_EQ(user.getProducts().size(), 0);
}

// Testing ID validation logic
TEST(UserTests, NotPositive) {
    EXPECT_THROW(User(0), std::invalid_argument);
    EXPECT_THROW(User(-1), std::invalid_argument);
}

// Adding a product to the user
TEST(UserTests, AddProduct) {
    User user(1);
    Product p1(101);
    
    user.addProduct(p1);
    
    ASSERT(user.getProducts().size(), 1);
    EXPECT_EQ(user.getProducts()[0].getId(), 101);
}

*/