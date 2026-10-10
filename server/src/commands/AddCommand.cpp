#include "AddCommand.h"
#include "StatusCode.h"

#include <cctype>

/*
 * Constructor
 */
AddCommand::AddCommand(UserManager &userManager) : userManager(userManager) {
  // Empty
}

/*
 * Validates input
 */
int AddCommand::validate(const std::vector<std::string> &args) {
  // Must get at least 2 arguments
  if (args.size() < 2)
    return 400;

  // Validate arguments
  try {
    int userId = std::stoi(args[0]);
  } catch (const std::invalid_argument &) {
    return 400;
  } catch (const std::out_of_range &) {
    return 400;
  }

  return 0;
}

/*
 * Execute command
 */
std::string AddCommand::execute(const std::vector<std::string> &args) {
  if (validate(args) != 0) {
    return StatusCode::getStatusCode(validate(args));
  }

  // First argument is user ID, the rest are product IDs
  int userId = std::stoi(args[0]);
  User user(userId);

  // Add user if not exists
  if (!userManager.checkUserExists(user))
    userManager.addUser(user);

  // Add products to user
  for (size_t i = 1; i < args.size(); i++) {
    std::string productId = args[i];

    Product product(productId);

    userManager.addProductToUser(user, product);
  }

  return "";
}