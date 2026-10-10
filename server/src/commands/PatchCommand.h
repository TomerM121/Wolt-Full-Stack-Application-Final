#ifndef PATCHCOMMAND_H
#define PATCHCOMMAND_H

#include "AddCommand.h"
#include <vector>
#include <string>
#include "../file_system/UserManager.h" // Adjusted path based on typical structure

class PatchCommand : public AddCommand {
public:
    /**
     * Constructor
     */
    PatchCommand(UserManager& userManager);

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