#ifndef ADDCOMMAND_H
#define ADDCOMMAND_H

#include <vector>
#include <string>

#include "ICommand.h"
#include "../file_system/UserManager.h"

/*
 * Add command
 */
class AddCommand : public ICommand
{
protected:
    UserManager& userManager;

    int validate(const std::vector<std::string>& args) override;

public:
    /*
    * Constructor
    */
    AddCommand(UserManager& userManager);

    /*
     * Execute command
     */
    std::string execute(const std::vector<std::string>& args) override;
};

#endif