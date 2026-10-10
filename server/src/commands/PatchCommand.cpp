#include "PatchCommand.h"
#include "StatusCode.h"

#include <cctype>
#include <string>

/*
 * Constructor
 */
PatchCommand::PatchCommand(UserManager &userManager)
    : AddCommand(userManager) {}

/*
 * Validates input
 */
int PatchCommand::validate(const std::vector<std::string> &args) {
  // 1. Prevent out-of-bounds crash
  if (args.empty()) {
    return 400; // Bad Request
  }

  // 2. Prevent stoi crash
  int userId;
  try {
    userId = std::stoi(args[0]);
  } catch (const std::exception &e) {
    return 400; // Bad Request
  }

  // 3. Logical check for PATCH: User MUST exist
  if (!userManager.checkUserExists(userId)) {
    return 404; // Not Found if user doesn't exist yet
  }

  return 0;
}

std::string PatchCommand::execute(const std::vector<std::string> &args) {
  // Validate commands according to the laws of general AddCommand
  if (AddCommand::validate(args) != 0) {
    return StatusCode::getStatusCode(AddCommand::validate(args));
  }

  // Validate command according to the laws of Patch Command
  if (validate(args) != 0) {
    return StatusCode::getStatusCode(validate(args));
  }

  // Command is valid, execute the base logic to update the data
  AddCommand::execute(args);
  return "204 No Content\n";
}