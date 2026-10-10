#include <gtest/gtest.h>
#include <fstream>
#include <string>
#include <filesystem>

#include "file_system/FileHandler.h"

using namespace std;
namespace fs = std::filesystem;

class FileHandlerTest : public ::testing::Test
{
protected:
    const string TEST_FILE = "testfile.txt";

    void SetUp() override {
        if (fs::exists(string(PATH) + TEST_FILE))
            fs::remove(string(PATH) + TEST_FILE);
    }

    void TearDown() override {
        if (fs::exists(string(PATH) + TEST_FILE))
            fs::remove(string(PATH) + TEST_FILE);
    }
};

// File is open after construction
TEST_F(FileHandlerTest, FileIsOpenAfterConstruction) {
    FileHandler fh(TEST_FILE);
    EXPECT_TRUE(fh.isOpen());
}

// File exists on disk after construction
TEST_F(FileHandlerTest, FileExistsAfterConstruction) {
    FileHandler fh(TEST_FILE);
    EXPECT_TRUE(fs::exists(string(PATH) + TEST_FILE));
}

// Write and read back
TEST_F(FileHandlerTest, WriteAndRead) {
    FileHandler fh(TEST_FILE);
    fh.writeToFile("hello\n");
    string content = fh.readFromFile();
    EXPECT_EQ(content, "hello\n");
}

// Multiple writes accumulate
TEST_F(FileHandlerTest, MultipleWritesAccumulate) {
    FileHandler fh(TEST_FILE);
    fh.writeToFile("line1\n");
    fh.writeToFile("line2\n");
    string content = fh.readFromFile();
    EXPECT_EQ(content, "line1\nline2\n");
}

// Read after close returns empty
TEST_F(FileHandlerTest, ReadAfterCloseReturnsEmpty) {
    FileHandler fh(TEST_FILE);
    fh.writeToFile("data\n");
    fh.closeFile();
    string content = fh.readFromFile();
    EXPECT_TRUE(content.empty());
}

// Write after close does nothing
TEST_F(FileHandlerTest, WriteAfterCloseDoesNothing) {
    FileHandler fh(TEST_FILE);
    fh.closeFile();
    fh.writeToFile("should not appear\n");
    fh.openFile();
    string content = fh.readFromFile();
    EXPECT_TRUE(content.empty());
}

// Open after close works
TEST_F(FileHandlerTest, OpenAfterClose) {
    FileHandler fh(TEST_FILE);
    fh.writeToFile("data\n");
    fh.closeFile();
    EXPECT_FALSE(fh.isOpen());
    fh.openFile();
    EXPECT_TRUE(fh.isOpen());
    string content = fh.readFromFile();
    EXPECT_EQ(content, "data\n");
}

// Read from empty file returns empty string
TEST_F(FileHandlerTest, ReadFromEmptyFile) {
    FileHandler fh(TEST_FILE);
    string content = fh.readFromFile();
    EXPECT_TRUE(content.empty());
}

// Data persists after reopening
TEST_F(FileHandlerTest, DataPersistsAfterReopen) {
    {
        FileHandler fh(TEST_FILE);
        fh.writeToFile("persistent\n");
    }
    // reopen same file
    FileHandler fh2(TEST_FILE);
    string content = fh2.readFromFile();
    EXPECT_EQ(content, "persistent\n");
}

TEST_F(FileHandlerTest, DataPersistsOnDisk) {
    string persistFile = "persistent_test.txt";
    {
        FileHandler fh(persistFile);
        fh.writeToFile("this file stays\n");
        EXPECT_TRUE(fs::exists(string(PATH) + persistFile));
    }
    // cleanup
    fs::remove(string(PATH) + persistFile);
}