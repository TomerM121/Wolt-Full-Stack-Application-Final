#include "PostCommand.h"
#include "StatusCode.h"

#include <cctype>
#include <string>

/*
 * Constructor
 */
PostCommand::PostCommand(UserManager &userManager) : AddCommand(userManager) {}

/*
 * Validates input
 */
int PostCommand::validate(const std::vector<std::string> &args) {
  int userId = stoi(args[0]);

  if (userManager.checkUserExists(userId))
    return 404;

  return 0;
}

std::string PostCommand::execute(const std::vector<std::string> &args) {
  // Validate commands according to the laws of general AddCommand
  if (AddCommand::validate(args) != 0) {
    return StatusCode::getStatusCode(AddCommand::validate(args));
  }

  // Validate command according to the laws of Post Command
  if (validate(args) != 0) {
    return StatusCode::getStatusCode(validate(args));
  }

  // Command is valid
  AddCommand::execute(args);
  return StatusCode::getStatusCode(201); // Created
}
