#ifndef CONSOLE_MENU_H
#define CONSOLE_MENU_H

#include "IMenu.h"
#include <iostream>

class ConsoleMenu : public IMenu {
private:
    std::ostream& out;
    std::istream& in;

public:
    ConsoleMenu(std::ostream& outputStream = std::cout, std::istream& inputStream = std::cin);

    void write(const std::string& message) override;
    void newLine() override;
    std::string read() override;
};

#endif