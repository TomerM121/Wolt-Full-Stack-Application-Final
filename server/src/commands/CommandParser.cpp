#include "CommandParser.h"

#include <algorithm>
#include <cctype>
#include <sstream>

using namespace std;

CommandData CommandParser::parse(const string &input) {
  CommandData cmndData;

  // We need to clean /n/r/0/t from the input
  string fix_input = input;
  size_t p = fix_input.find_last_not_of(" \n\r\t\0");

  if (p != string::npos) {
    fix_input = fix_input.substr(0, p + 1);
  } else {
    fix_input = "";
  }

  // Split the input into command name and arguments
  istringstream stream(fix_input);

  // Read the command name
  if (stream >> cmndData.commandName) {

    // Force command name to be uppercase
    transform(cmndData.commandName.begin(), cmndData.commandName.end(),
              cmndData.commandName.begin(), ::toupper);

    string arg;
    // Read the rest of the line as arguments
    while (stream >> arg) {
      cmndData.args.push_back(arg);
    }
  }

  // Return the command data
  return cmndData;
}