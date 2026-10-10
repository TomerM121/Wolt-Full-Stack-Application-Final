#ifndef APP_H
#define APP_H

#include <map>
#include <string>
#include "commands/ICommand.h"
#include "cli/IMenu.h"

class App {
public:
    App(std::map<std::string, ICommand*> commands, IMenu& menu);

    void run();

private:
    std::map<std::string, ICommand*> commands;
    IMenu& menu;
};

#endif
