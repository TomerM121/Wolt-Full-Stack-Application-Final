#include "RecommendCommand.h"

#include <cctype>

#include "../file_system/UserManager.h"
#include "StatusCode.h"
#include "../ds/Product.h"

/*
 * Constructor
 */
RecommendCommand::RecommendCommand(UserManager& userManager)
    : userManager(userManager), alg(&userManager) {
        // Empty
}

/*
 * Execute command
 */
std::string RecommendCommand::execute(const std::vector<std::string>& args) {
    // Validate command
    if (validate(args) != 0) {
        return StatusCode::getStatusCode(validate(args));
    }

    // assumming output is correct and valid since we checked so in validate
    int user_id = std::stoi(args[0]);
    std::string prod_id = args[1];

    // Execute the algorithm
    User user(user_id);
    std::vector<Product> results = alg.execute(user, prod_id);

    // Build output string
    std::string output = StatusCode::getStatusCode(200);
      
    if (!results.empty()) {
        output += "\n";
        for (size_t i = 0; i < results.size(); i++) {
            output += results[i].getId();
            if (i + 1 < results.size())
                output += " ";
        }
        output += "\n";
    } else {
        // Must include two \n - one comes fron status code and the other is here
        output += "\n";
        // Then we display the output from previous excercise which is nothing
    }

    return output;
}

int RecommendCommand::validate(const std::vector<std::string>& args) {
    // Recommend must accept only 2 arguments
    if (args.size() != 2)
        return 400;

    // Ensure arguments are legal
    int user_id;
    try {
        user_id = std::stoi(args[0]);
    } catch (const std::invalid_argument&) {
        return 400;
    } catch (const std::out_of_range&) {
        return 400;
    }

    // Ensure user exists
    if (!userManager.checkUserExists(user_id))
        return 404;

    return 0;
}
