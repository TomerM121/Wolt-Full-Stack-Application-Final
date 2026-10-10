#include "DeleteCommand.h"
#include "../commands/StatusCode.h"

#include <set>
#include <cctype>

using namespace std;

/*
 * Constructor
 */
DeleteCommand::DeleteCommand(UserManager& userManager)
    : userManager(userManager)
{
}

/*
 * Check whether a string contains only digits
 */
bool DeleteCommand::isNumber(const string& str) const
{
    if (str.empty())
    {
        return false;
    }

    for (char c : str)
    {
        if (!isdigit(static_cast<unsigned char>(c)))
        {
            return false;
        }
    }

    return true;
}

/*
 * Validate delete command arguments
 */
int DeleteCommand::validate(
    const vector<string>& args)
{
    /*
     * delete requires:
     * delete [userId] [productId1] ...
     */
    if (args.size() < 2)
    {
        return 400;
    }

    /*
     * Ensure user ID is numeric
     */
    if (!isNumber(args[0]))
    {
        return 400;
    }

    User user(stoi(args[0]));

    /*
     * Ensure user exists
     */
    if (!userManager.checkUserExists(user))
    {
        return 404;
    }

    /*
     * Build set of products to delete
     */
    set<string> productsToDelete;

    for (size_t i = 1; i < args.size(); i++)
    {
        productsToDelete.insert(args[i]);
    }

    /*
    * Make sure that all products are differnet
    */
    if (productsToDelete.size() != args.size() -1) {
        return 404;
    }

    /*
     * Get existing user products
     */
    vector<Product*> existingProducts =
        userManager.getProducts(user);

    /*
     * Build set of existing product ids
     */
    set<string> existingIds;

    for (Product* product : existingProducts)
    {
        if (product)
        {
            existingIds.insert(product->getId());
        }
    }

    /*
     * Ensure all requested products exist
     */
    for (const string& productId : productsToDelete)
    {
        if (existingIds.find(productId) ==
            existingIds.end())
        {
            return 404;
        }
    }

    return 0;
}

/*
 * Execute delete command
 */
string DeleteCommand::execute(
    const vector<string>& args)
{
    int status = validate(args);

    /*
     * Validation failed
     */
    if (status != 0)
    {
        return StatusCode::getStatusCode(status);
    }

    User user(stoi(args[0]));

    /*
     * Build set of products to delete
     */
    set<string> productsToDelete;

    for (size_t i = 1; i < args.size(); i++)
    {
        productsToDelete.insert(args[i]);
    }

    /*
     * Remove products from user
     */
    userManager.removeProductsFromUser(
        user,
        productsToDelete);

    return StatusCode::getStatusCode(204);
}