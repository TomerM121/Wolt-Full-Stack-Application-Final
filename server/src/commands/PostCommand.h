#ifndef POSTCOMMAND_H
#define POSTCOMMAND_H


#include "AddCommand.h"
#include <vector>
#include <string>
#include "../file_system/UserManager.h"

#include "AddCommand.h"

class PostCommand : public AddCommand {
public:
    /**
     * Constructor
     */
    PostCommand(UserManager& userManager);

    /**
     * Override execute method
     */
    std::string execute(const std::vector<std::string>& args) override;

protected:
    /**
     * Override validate method
     */
    int validate(const std::vector<std::string>& args) override;
};

#endif