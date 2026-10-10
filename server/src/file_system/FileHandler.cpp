#include "FileHandler.h"

#include <string>
#include <fstream>
#include <sstream>

using namespace std;

FileHandler::FileHandler(string name)
{
    this->fileName = name;

    this->fs.open(PATH + name, ios::in | ios::out);

    if (!this->fs.is_open())
    {
        this->fs.open(PATH + name, ios::in | ios::out | ios::trunc);
    }

    this->openStatus = this->fs.is_open();
}

fstream& FileHandler::getFileStream()
{
    return this->fs;
}

bool FileHandler::isOpen() const
{
    return this->openStatus;
}

fstream FileHandler::createFile(string name)
{
    fstream file(PATH + name, ios::in | ios::out);
    return file;
}

void FileHandler::openFile()
{
    if (!this->fs.is_open())
    {
        this->fs.open(PATH + this->fileName, ios::in | ios::out);
    }

    this->openStatus = this->fs.is_open();
}

void FileHandler::closeFile()
{
    if (this->fs.is_open())
    {
        this->fs.close();
    }

    this->openStatus = false;
}

void FileHandler::writeToFile(string msg)
{
    if (!isOpen())
    {
        return;
    }

    this->fs.clear();
    this->fs.seekp(0, ios::end);
    this->fs << msg;
    this->fs.flush();
}

string FileHandler::readFromFile()
{
    if (!isOpen())
    {
        return "";
    }

    this->fs.clear();
    this->fs.seekg(0, ios::beg);

    stringstream buffer;
    buffer << this->fs.rdbuf();

    return buffer.str();
}

void FileHandler::clearFile()
{
    if (this->fs.is_open()) {
        this->fs.close();
    }
    
    this->fs.open(PATH + this->fileName, std::ios::in | std::ios::out | std::ios::trunc);
    
    this->openStatus = this->fs.is_open();
}

FileHandler::~FileHandler()
{
    if (this->fs.is_open())
    {
        this->fs.close();
    }
}