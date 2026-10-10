#ifndef IMENU_H
#define IMENU_H

#include <iostream>
#include <string>

class IMenu {
public:
    virtual ~IMenu() = default;
    
    virtual void write(const std::string& message) = 0;
    
    virtual std::string read() = 0;

    virtual void newLine() = 0;

    virtual void writeLine(const std::string& message) {
    write(message);
    newLine();
    }
};

#endif