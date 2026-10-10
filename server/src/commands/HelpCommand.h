#ifndef HELP_COMMAND_H
#define HELP_COMMAND_H

#include "../cli/IMenu.h"
#include "ICommand.h"

class HelpCommand : public ICommand {
private:
  int validate(const std::vector<std::string> &args) override;

public:
  HelpCommand();
  std::string execute(const std::vector<std::string> &args) override;
};

#endif