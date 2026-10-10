#include "ConsoleMenu.h"

ConsoleMenu::ConsoleMenu(std::ostream& outputStream, std::istream& inputStream) 
    : out(outputStream), in(inputStream) {}

void ConsoleMenu::write(const std::string& message) {
    out << message;
}

void ConsoleMenu::newLine() {
    out << std::endl;
}

std::string ConsoleMenu::read() {
    // Read a full line
    std::string line;
    std::getline(in, line);
    return line;
}