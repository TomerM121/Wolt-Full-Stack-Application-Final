#include <gtest/gtest.h>
#include "server/TCPServer.h"
#include "server/CommandExecutor.h"
#include "file_system/UserManager.h"
#include <filesystem>
#include <memory>

namespace fs = std::filesystem;

// ==========================================
// Global Test Environment - Backup & Restore runs before EACH test class
// ==========================================
class FileSystemEnvironment : public ::testing::Environment {
    std::string getSafePath() {
        std::string p = PATH;
        if (!p.empty() && p.back() == '/') p.pop_back();
        return p;
    }
public:
    void SetUp() override {
        std::string realPath = getSafePath();
        std::string backupPath = realPath + "_backup";
        std::error_code ec;
        
        if (fs::exists(backupPath, ec)) fs::remove_all(backupPath, ec);
        if (fs::exists(realPath, ec)) {
            fs::copy(realPath, backupPath, fs::copy_options::recursive | fs::copy_options::overwrite_existing, ec);
        }
    }

    void TearDown() override {
        std::string realPath = getSafePath();
        std::string backupPath = realPath + "_backup";
        std::error_code ec;
        
        if (fs::exists(realPath, ec)) fs::remove_all(realPath, ec);
        if (fs::exists(backupPath, ec)) {
            fs::copy(backupPath, realPath, fs::copy_options::recursive | fs::copy_options::overwrite_existing, ec);
            fs::remove_all(backupPath, ec);
        } else {
            fs::create_directories(realPath, ec);
        }
    }
};

testing::Environment* const fileEnv = testing::AddGlobalTestEnvironment(new FileSystemEnvironment);


// Class Defenition
class TCPServerTests : public ::testing::Test {
protected:
    std::unique_ptr<UserManager> userManager;
    std::unique_ptr<CommandExecutor> commandExecutor;
    std::unique_ptr<TCPServer> server;

    static std::string getSafePath() {
        std::string p = PATH;
        if (!p.empty() && p.back() == '/') {
            p.pop_back();
        }
        return p;
    }

    inline static const std::string realPath = getSafePath();
    inline static const std::string backupPath = realPath + "_backup";

    void SetUp() override {
        std::error_code ec;
        if (fs::exists(realPath, ec)) {
            fs::remove_all(realPath, ec);
        }
        fs::create_directories(realPath, ec);

        userManager = std::make_unique<UserManager>();
        commandExecutor = std::make_unique<CommandExecutor>(*userManager);
        server = std::make_unique<TCPServer>(8080, *commandExecutor);
    }

    void TearDown() override {
        server.reset();
        commandExecutor.reset();
        userManager.reset();
    }
};

// Actual Tests:

TEST_F(TCPServerTests, PostCommand) {
    // Try non valid syntax
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("PoSt"));
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("PoSt 1"));
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("PoSt 1 101 b"));
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("PoSt b 101 102"));

    // Try creating a new user
    EXPECT_EQ(StatusCode::getStatusCode(201), server->handleRequest("PoSt  1    1"));
    // Try to add the same user
    EXPECT_EQ(StatusCode::getStatusCode(404), server->handleRequest("PoSt 1 1"));
    EXPECT_EQ(StatusCode::getStatusCode(404), server->handleRequest("PoSt 1 101"));

    // Trying to add the same product twice
    EXPECT_EQ(StatusCode::getStatusCode(201), server->handleRequest("PoSt 2 101 102 101"));
}

TEST_F(TCPServerTests, PatchCommand) {
    // Try non valid syntax
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("patch"));
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("patch 1"));
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("patch b 101 102"));

    // Try patch to non existent user
    EXPECT_EQ(StatusCode::getStatusCode(404), server->handleRequest("PAtCh 1 1"));

    // Try to patch to existing user
    server->handleRequest("post 1 10");

    // Try non valid syntax
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("patch 1 101 b"));

    EXPECT_EQ(StatusCode::getStatusCode(204), server->handleRequest("PAtCh  1 1"));
    EXPECT_EQ(StatusCode::getStatusCode(204), server->handleRequest("PAtCh  1  3    5"));

    // Try adding already existing product to user
    EXPECT_EQ(StatusCode::getStatusCode(204), server->handleRequest("PAtCh 1 1"));

    // Try adding 2 same products to user
    EXPECT_EQ(StatusCode::getStatusCode(204), server->handleRequest("PAtCh 1 4 4"));
}

TEST_F(TCPServerTests, DeleteCommand) {
    // Try non valid syntax
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("delete"));
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("delete 1"));
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("delete b 101"));

    // Try deleting from non-existent user
    EXPECT_EQ(StatusCode::getStatusCode(404), server->handleRequest("DeLeTe 1 1"));

    // Try deleting from existing user (user exists but doesnt have this product)
    server->handleRequest("post 1 10");
    EXPECT_EQ(StatusCode::getStatusCode(404), server->handleRequest("DeLeTe 1 1"));

    // Try non valid syntax
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("delete 1 b"));

    // Add products first using PATCH so we can test successful deletion
    server->handleRequest("PAtCh 1 1");
    server->handleRequest("PAtCh 1 2");
    server->handleRequest("PAtCh 1 3");

    // Try to delete an existing product from the user
    EXPECT_EQ(StatusCode::getStatusCode(204), server->handleRequest("DeLeTe  1   1"));
    
    // Try to delete multiple existing products from the user
    EXPECT_EQ(StatusCode::getStatusCode(204), server->handleRequest("DeLeTe  1   2   3"));

    // Try deleting a product that was already deleted
    EXPECT_EQ(StatusCode::getStatusCode(404), server->handleRequest("DeLeTe 1 1"));

    // Try deleting a product that the user never had
    EXPECT_EQ(StatusCode::getStatusCode(404), server->handleRequest("DeLeTe 1 99"));

    // Try delete twice same exsiting product
    server->handleRequest("PAtCh 1 4");
    EXPECT_EQ(StatusCode::getStatusCode(404), server->handleRequest("DeLeTe 1 4 4"));
}

TEST_F(TCPServerTests, GetCommand) {
    // Try non valid syntax
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("get"));
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("get 1"));
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("get b 101"));

    // Try getting from non existing
    EXPECT_EQ(StatusCode::getStatusCode(404), server->handleRequest("GeT 1 1"));

    // Trying getting like the example on ex1
    server->handleRequest("post 1 100 101 102 103");

    // Trying non valid syntax
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("get 1  b"));
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("get  1 101   102"));

    server->handleRequest("post 2 101 102 104 105 106");
    server->handleRequest("post 3 100 104 105 107 108");
    server->handleRequest("post 4 101 105 106 107 109 110");
    server->handleRequest("post 5 100 102 103 105 108 111");
    server->handleRequest("post 6 100 103 104 110 111 112 113");
    server->handleRequest("post 7 102 105 106 107 108 109 110");
    server->handleRequest("post 8 101 104 105 106 109 111 114");
    server->handleRequest("post 9 100 103 105 107 112 113 115");
    server->handleRequest("post 10 100 102 105 106 107 109 110 116");

    std::string expectedResult = "200 Ok\n\n105 106 111 110 112 113 107 108 109 114\n";
    EXPECT_EQ(expectedResult, server->handleRequest("get  1   104"));

    // Trying to get with non existent product
    EXPECT_EQ("200 Ok\n\n", server->handleRequest("GeT 1  200"));
}

TEST_F(TCPServerTests, NonCommands) {
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("\n"));
    EXPECT_EQ(StatusCode::getStatusCode(400), server->handleRequest("aa"));
}


