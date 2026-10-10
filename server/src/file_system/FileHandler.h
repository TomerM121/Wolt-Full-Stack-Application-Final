#ifndef FILE_HANDLER_H
#define FILE_HANDLER_H

#include <iostream>
#include <fstream>
#include <string>

// Define the path where user files will be stored.
// #define PATH "/usr/src/app/data/user_files/"
#define PATH "data/user_files/"

/* === File Class ===
 * This class represents a file in the file system, in its purest form.
 * It provides methods for creating, opening, closing, writing to, and reading from a file.
 * This class bridges between the developer and the OS, allowing simple and efficient file handling.
 * Later, it will be used by more complicated classes that will handle userFiles and userSystem.
 */
class FileHandler {
    // File name: This variable holds the name of the file.
    private: std::string fileName;

    // File stream: This variable is used to interact with OS for file operations.
    private: std::fstream fs;

    // File status: open or closed.
    private: bool openStatus;

    // Constructor: This constructor initializes the file with a given name.
    public: FileHandler(std::string name);

    // Clear file: This method clears the contents of the file.
    public: void clearFile();

    // Getter for file stream: This methods returns the stream.
    // This method should never be used besides for testing purposes only!
    public: std::fstream& getFileStream();

    // Getter for file status: This method returns true if the file is open, false otherwise.
    public: bool isOpen() const;

    // Create file: This method is responsible for creating a new file with the given name.
    // string name - The name of the file to be created.
    private: std::fstream createFile(std::string name);

    // Open file: This method allows opening an existing file for reading or writing.
    public: void openFile();

    // Close file: This method is responsible for closing the file after operations are completed.
    public: void closeFile();

    // Write to file: This method allows writing data (of any kind) to the file.
    // string msg - The text we want to write to file.
    public: void writeToFile(std::string msg);

    // Read from file: This method allows reading data from the file.
    // Returns (string): The text read from the file.
    public: std::string readFromFile();

    // Destructor: This destructor ensures that the file is properly closed when the object is destroyed.
    public: ~FileHandler();
};
#endif