#ifndef COMMAND_EXECUTOR_H
#define COMMAND_EXECUTOR_H

#include "../commands/ICommand.h"
#include "../commands/CommandData.h"
#include "../commands/HelpCommand.h"
#include "../commands/RecommendCommand.h"
#include "../commands/AddCommand.h"
#include "../logic/RecommendAlg.h"
#include "../commands/PostCommand.h"
#include "../commands/PatchCommand.h"
#include "../commands/DeleteCommand.h"

#include <unordered_map>

/**
 * The command executor is responssible to map the commands name to the 
 * matching command instance and execute it.
 * It returns the result to the server.
 * CommandExecutor is "dummy" is trusts the business logic to provide
 * it with the correct output.
 */
class CommandExecutor {
private:
    UserManager& userManager;

    std::unordered_map<std::string, ICommand*> commandMap = {
        {"HELP", new HelpCommand()},
        {"GET", new RecommendCommand(userManager)},
        {"POST", new PostCommand(userManager)},
        {"PATCH", new PatchCommand(userManager)},
        {"DELETE", new DeleteCommand(userManager)} 
    };
public:
    CommandExecutor(UserManager& userManager);

    std::string execute(const CommandData& commandData);
};
#endif // COMMAND_EXECUTOR_H