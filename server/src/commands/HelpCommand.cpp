#include "HelpCommand.h"
#include "StatusCode.h"

HelpCommand::HelpCommand() {}

/**
 * Right now this is not close for chnage nor open for extensions.
 * Ideally we should store all available commands
 * HelpCommand would just call an iterator to print all commands.
 *
 * We can go with this temprary solution but in the next stage this should be
 * changed ASAP.
 */
std::string HelpCommand::execute(const std::vector<std::string> &args) {
  if (validate(args) != 0) {
    return StatusCode::getStatusCode(validate(args));
  }

  std::string output = "";
  output += "DELETE, arguments: [userid] [productid1] [productid2] ...\n";
  output += "GET, arguments: [userid] [productid]\n";
  output += "PATCH, arguments: [userid] [productid1] [productid2] ...\n";
  output += "POST, arguments: [userid] [productid1] [productid2] ...\n";
  output += "help\n";
  return output;
}

int HelpCommand::validate(const std::vector<std::string> &args) {
  if (args.size() != 0) {
    return 400; // Bad Request`
  }

  return 0;
}