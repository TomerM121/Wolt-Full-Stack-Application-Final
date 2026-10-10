#ifndef COMMANDPARSER_H
#define COMMANDPARSER_H

#include <string>
#include "CommandData.h"

/**
 * Parser goal is to take a string and transform it into command data.
 * Note, we dont care if the command is valid or not - this class has one goal
 * Take string into "command like" format.
 */
class CommandParser
{
public:
    // Parses the input string and returns a CommandData object
    static CommandData parse(const std::string& input);
};

#endif