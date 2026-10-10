#include "App.h"
#include "commands/ICommand.h"
#include "commands/CommandParser.h"
#include "commands/CommandData.h"

App::App(std::map<std::string, ICommand*> commands, IMenu& menu) : commands(commands), menu(menu) {}

void App::run() {
    std::string input;
    
    while (true) {
        input = menu.read();

        CommandData commandData = CommandParser::parse(input);
        
        if (commands.find(commandData.commandName) != commands.end()) {
			commands[commandData.commandName]->execute(commandData.args);
		}
    }
}