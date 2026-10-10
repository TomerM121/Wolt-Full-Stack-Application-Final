#ifndef RECOMMEND_COMMAND_H
#define RECOMMEND_COMMAND_H

#include <vector>
#include <string>

#include "ICommand.h"
#include "../file_system/UserManager.h"
#include "../logic/RecommendAlg.h"
#include "../cli/IMenu.h"

/*
 * Recommend command
 */
class RecommendCommand : public ICommand
{
private:
    UserManager& userManager;
    RecommendAlg alg;

    int validate(const std::vector<std::string>& args) override;

public:
    /*
     * Constructor
     */
    RecommendCommand(UserManager& userManager);

    /*
     * Execute command
     */
    std::string execute(const std::vector<std::string>& args) override;
};
#endif // RECOMMEND_COMMAND_H