#include <gtest/gtest.h>

#include "../../src/commands/DeleteCommand.h"
#include "../../src/commands/PostCommand.h"
#include "../../src/config/Config.h"
#include "../../src/file_system/UserManager.h"
#include "../../src/file_system/FileHandler.h"
#include "../../src/ds/ProductManager.h"
#include "../../src/commands/StatusCode.h"

#include <filesystem>
#include <fstream>
#include <string>
#include <vector>

using namespace std;
namespace fs = std::filesystem;

class DeleteCommandTest : public ::testing::Test
{
protected:
    UserManager* userManager;
    PostCommand* postCommand;
    DeleteCommand* deleteCommand;

    const int USER1 = 123000;
    const int USER2 = 234000;
    const int USER3 = 345000;

    DeleteCommandTest()
        : userManager(new UserManager()),
          postCommand(new PostCommand(*userManager)),
          deleteCommand(new DeleteCommand(*userManager))
    {
        Config::setBasePath("");
    }

    string userFile(int userId)
    {
        return PATH + string("user") + to_string(userId) + ".txt";
    }

    vector<string> readLines(const string& fileName)
    {
        ifstream in(fileName);

        vector<string> lines;
        string line;

        while (getline(in, line))
        {
            if (!line.empty())
            {
                lines.push_back(line);
            }
        }

        return lines;
    }

    void TearDown() override
    {
        delete deleteCommand;
        delete postCommand;
        delete userManager;

        ProductManager::cleanMap();

        vector<string> files =
        {
            userFile(USER1),
            userFile(USER2),
            userFile(USER3)
        };

        for (const string& file : files)
        {
            if (fs::exists(file))
            {
                fs::remove(file);
            }
        }
    }
};

TEST_F(DeleteCommandTest, DeleteExistingProducts)
{
    postCommand->execute(
    {
        to_string(USER1),
        "2",
        "3",
        "4",
        "5"
    });

    string result = deleteCommand->execute(
    {
        to_string(USER1),
        "2",
        "3",
        "4"
    });

    EXPECT_EQ(result, StatusCode::getStatusCode(204));

    vector<string> lines = readLines(userFile(USER1));

    ASSERT_EQ(lines.size(), 1);
    EXPECT_EQ(lines[0], "5");
}

TEST_F(DeleteCommandTest, DeleteProductThatDoesNotBelongToUser)
{
    postCommand->execute(
    {
        to_string(USER1),
        "2",
        "3",
        "4",
        "5"
    });

    string result = deleteCommand->execute(
    {
        to_string(USER1),
        "2",
        "999"
    });

    EXPECT_EQ(result, StatusCode::getStatusCode(404));

    vector<string> lines = readLines(userFile(USER1));

    ASSERT_EQ(lines.size(), 4);
    EXPECT_EQ(lines[0], "2");
    EXPECT_EQ(lines[1], "3");
    EXPECT_EQ(lines[2], "4");
    EXPECT_EQ(lines[3], "5");
}

TEST_F(DeleteCommandTest, DeleteFromNonExistingUser)
{
    string result = deleteCommand->execute(
    {
        "999999",
        "1"
    });

    EXPECT_EQ(result, StatusCode::getStatusCode(404));
}

TEST_F(DeleteCommandTest, DeleteWithMissingProductIds)
{
    string result = deleteCommand->execute(
    {
        to_string(USER1)
    });

    EXPECT_EQ(result, StatusCode::getStatusCode(400));
}

TEST_F(DeleteCommandTest, DeleteWithNonNumericInput)
{
    string result = deleteCommand->execute(
    {
        "abc",
        "10"
    });

    EXPECT_EQ(result, StatusCode::getStatusCode(400));
}

TEST_F(DeleteCommandTest, DeleteAllProducts)
{
    postCommand->execute(
    {
        to_string(USER2),
        "10",
        "20",
        "30"
    });

    string result = deleteCommand->execute(
    {
        to_string(USER2),
        "10",
        "20",
        "30"
    });

    EXPECT_EQ(result, StatusCode::getStatusCode(204));

    vector<string> lines = readLines(userFile(USER2));

    EXPECT_TRUE(lines.empty());
}

// According to forum delete 1 101 101 is NOT allowed (so it's 404)
TEST_F(DeleteCommandTest, DeleteDuplicateIdsInSameCommand)
{
    postCommand->execute(
    {
        to_string(USER3),
        "10",
        "20",
        "30"
    });

    string result = deleteCommand->execute(
    {
        to_string(USER3),
        "10",
        "10",
        "20"
    });

    EXPECT_EQ(result, StatusCode::getStatusCode(404));
}