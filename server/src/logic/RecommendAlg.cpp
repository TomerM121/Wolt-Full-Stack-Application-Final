#include "../logic/RecommendAlg.h"

#include <algorithm>
#include <unordered_set>
#include <unordered_map>

/* READ RecommendAlg.h TO UNDERSTAND ALGORITHM AND METHOD JOBS */
/* HERE YOU WILL FIND EXPLANATION OF IMPLEMENTATION */

RecommendAlg::RecommendAlg(UserManager* users) {
    // We just want to save a ptr to users so it can dyanmically change over runtime
    // Thus we'll have a nice working algorithm through all stages of code.
    this->users = users;
}


std::vector<Product> RecommendAlg::execute(User given_user, std::string prod_id) {
    // Execute is pretty straight forward as explained the header.
    // There are unique private methods that complete each subtask.
    // When the entire sequence runs together we can a valid execution of
    // Our recommandation algorithm that eventually return 
    // Vector of products.

    // Pre calculations
    us_matrix.clear();
    pr_matrix.clear();

    build_us_matrix(given_user, prod_id);
    build_pr_matrix(given_user, prod_id);
    
    // Recover, save and return output
    std::vector<Product> out = findSimilarProducts();
    return out;
}

void RecommendAlg::build_us_matrix(User given_user, std::string prod_id) {
    // Get all users
    std::vector<User> allUsers = users->getUsers();
    std::vector<Product*> given_prods = users->getProducts(given_user);

    // Enter each user to the us_matrix
    // And find how many products does it share with given user
    std::unordered_set<std::string> given_ids;
    for (Product* p : given_prods) given_ids.insert(p->getId());

    // Enter each user to the us_matrix
    // And find how many products does it share with given user
    for (const auto& p : allUsers) {        
        if (p.getId() == given_user.getId()) continue;

        std::vector<Product*> prods = users->getProducts(p);

        bool watched = false;
        for (Product* prod : prods)
            if (prod->getId() == prod_id) { watched = true; break; }
        if (!watched) continue;

        int similarity = 0;
        for (Product* prod : prods)
            if (given_ids.count(prod->getId())) similarity++;

        us_matrix.push_back({p.getId(), similarity});
    }
}

void RecommendAlg::build_pr_matrix(User given_user, std::string prod_id) {
    pr_loadProducts(given_user, prod_id);
    pr_calcRelevence(given_user);
}

void RecommendAlg::pr_loadProducts(User given_user, std::string prod_id) {
    std::vector<User> allUsers = users->getUsers();
    std::unordered_set<std::string> seen;
    std::vector<Product*> given_prods = users->getProducts(given_user);

    // Products target already owns — skip these
    std::unordered_set<std::string> owned;
    for (Product* p : given_prods)
        owned.insert(p->getId());

    for (const auto& user : allUsers) {
        if (user.getId() == given_user.getId()) continue;  // skip given user
        std::vector<Product*> prods = users->getProducts(user);
        for (Product* p : prods) {
            if (p == nullptr) continue;
            if (owned.count(p->getId())) continue;  // skip already owned
            if (p->getId() == prod_id) continue; 

            pr_matrix.insert({p->getId(), 0});
        }
    }
}

void RecommendAlg::pr_calcRelevence(User given_user) {
    // Calculate relevance score by iterating all users and updating accordingly

    // Save all users into vector and REMEMBER to skip given_user.
    std::vector<User> allUsers = users->getUsers();

    allUsers.erase(std::remove_if(allUsers.begin(), allUsers.end(), 
        [&](const User& u) { return u.getId() == given_user.getId(); }), 
        allUsers.end());

    // For all users in the vector take their weight from the us matrix
    // Go over all their products and add them accordingly with the correct
    // Weight from the us matrix.
    for (const auto& user : allUsers) {
        // SKIP the given user
        if (user.getId() == given_user.getId()) { continue; }

        // This is the similarity
        int weight = 0;
        for (const auto& entry : us_matrix) {
            if (entry.first == user.getId()) {
                weight = entry.second;
                break;
            }
        }

        // Now we will add all the products of user to the pr_matrix
        std::vector<Product*> prod = users->getProducts(user);
        for (const auto& product : prod) {
            if (pr_matrix.count(product->getId()))
                pr_matrix[product->getId()] += weight;
        }
    }

    // Eventually, when we iteratae over all users we will have the pr matrix ready 
}

bool compareProductScores(const std::pair<std::string, int>& a, const std::pair<std::string, int>& b) {
    // Higher relevance score should come first.
    if (a.second != b.second) {
        return a.second > b.second;
    }
    
    // If scores are equal, use product ID ascending as a tiebreaker.
    return a.first < b.first;
}

std::vector<Product> RecommendAlg::findSimilarProducts() {
    // This method is equivelent to lookup for specific information.
    // NOTE: We need to return products with the same grade in
    // Assecnding order.

    std::vector<std::pair<std::string,int>> sorted(pr_matrix.begin(), pr_matrix.end());

    // Sort the product relevance matrix by score descending,
    // so the most relevant products appear first.
    std::sort(sorted.begin(), sorted.end(), compareProductScores);

    // Define limiter on amount of products according to matrix size.
    int limit = std::min((int)pr_matrix.size(), 10);
    std::vector<Product> recommended_products;

    for (int i = 0; i < limit; i++) {
        // BUG I FIXED - MISSING COMMENTS
        if (sorted[i].second == 0) break;

        std::string product_id = sorted[i].first;

        // Find a product with matching ID from some user

        Product* p = nullptr;
        std::vector<User> allUsers = users->getUsers();

        for (const auto& user : allUsers) {
            std::vector<Product*> products = users->getProducts(user);

            // Look for hit in products
            for (Product* prod : products) {
                if (prod != nullptr && prod->getId() == product_id) {
                    p = prod;
                    break;
                }
            }
            
            // If found stop the search.
            if (p != nullptr) { break; }
        }

        // Add a product to the result.
        if (p != nullptr) { recommended_products.push_back(*p); }
    }

    return recommended_products;
}