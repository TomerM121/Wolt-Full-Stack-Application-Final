#include "CommandExecutor.h"

CommandExecutor::CommandExecutor(UserManager& userManager) : userManager(userManager) {
    // EMPTY
}

std::string CommandExecutor::execute(const CommandData& commandData) {
    auto it = commandMap.find(commandData.commandName);
    
    if (it == commandMap.end() || it->second == nullptr) {
        return "400 Bad Request\n";
    }

    return it->second->execute(commandData.args);
}