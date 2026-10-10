#ifndef COMMANDDATA_H
#define COMMANDDATA_H

#include <string>
#include <vector>

struct CommandData
{
    std::string commandName;
    std::vector<std::string> args;
};

#endif