#ifndef ICOMMAND_H
#define ICOMMAND_H

#include <vector>
#include <string>

class ICommand
{
protected:
    virtual int validate(const std::vector<std::string>& args) = 0;
public:
    virtual ~ICommand() = default;

    // Execute command with arguments
    virtual std::string execute(const std::vector<std::string>& args) = 0;
};

#endif