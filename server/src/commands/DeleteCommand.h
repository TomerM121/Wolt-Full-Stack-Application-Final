#pragma once

#include "ICommand.h"
#include "../file_system/UserManager.h"
#include "../ds/User.h"
#include "../ds/Product.h"
#include "StatusCode.h"

#include <string>
#include <vector>

class DeleteCommand : public ICommand
{
private:
    UserManager& userManager;

    bool isNumber(const std::string& str) const;

protected:
    int validate(const std::vector<std::string>& args) override;

public:
    DeleteCommand(UserManager& userManager);

    std::string execute(const std::vector<std::string>& args) override;
};