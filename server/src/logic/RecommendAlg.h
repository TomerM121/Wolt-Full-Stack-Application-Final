#ifndef RECOMMENDALG_H
#define RECOMMENDALG_H

#include "../file_system/UserManager.h"
#include <unordered_map>


class RecommendAlg {
    // Allow Recommend Algorithm with access to userManager. NOTE: IT MUST NOT CHANGE IT ONLY VIEW IT.
    // We want it as a ptr so it will get upadted overtime when using the UserManager in different places in code.
    private: UserManager* users;

    // Constructor of algorithm
    // It is directly connected to UserManager
    // The algorithm should ONLY READ the contens of UserManager
    public: RecommendAlg(UserManager* users);

    // The algorithm's API.
    // We only want to run the algorithm without really digging into it.
    // This method ensures a general implementation of the algorithm
    // Without bothering user with logic.
    // Potential Improvement - In the future we may include an algorithm interface and include
    // Variety of algorithms. Right now this is not going to be done, but this sits in our mind.
    // One major flaw of design is execute returns a vector of products, we need to generlize it.
    public: std::vector<Product> execute(User given_user, std::string prod_id);

    // The Recommendation Algorithm:
    // Given: User (user_id), Product (prod_id)
    // Return: A vector (of size upto 10) of products that User is likely to like/add as well.

    // Here we gonna have a bunch of private methods
    // Those methods make the algorithm run.
    // Those methods will be used by the method execute in order to run the algorithm.

    // Stage 1 : Calculate the similarity between each user with given user.
    // We construct a matrix of two columns
    // column one - for user id's
    // column two - how many products does cur_user share share with given_user.
    // We call this matrix the User-Similarity matrix 
    // You may visiulize it as follows:
    // UserID | Products Watched
    //   1    |  100, 101, 102 
    //   2    |  101, 102, 103
    //  ...   |      ...
    private: std::vector<std::pair<int,int>> us_matrix;

    // Calculate the similarity between each user with given user
    private: void build_us_matrix(User given_user, std::string prod_id);

    // Stage 2 : The Product-Relevance Matrix
    // In this stage we conduct 4 simple calculations
    //  2.1 Adding all products ID to the matrix
    //  2.2 For each product we find all users that have the product
    //  2.3 Using the similarity matrix with define weights in the following way:
    //      If user X watched product Y and X and given user have S similarity score
    //      Then in the Y'th row user X will have S score
    //  2.4 Define the RELEVANCE of product Y score to be the sum of all S scores in the Y'th row
    private: std::unordered_map<std::string,int> pr_matrix;

    // Call methods that do the job for this
    private: void build_pr_matrix(User given_user, std::string prod_id);

    // Load products into the pr_matrix
    private: void pr_loadProducts(User given_user, std::string prod_id);

    // Calculate relevence score
    private: void pr_calcRelevence(User given_user);

    // Stage 3: Return output
    // Search for the 10 most relevent products in the pr matrix
    private: std::vector<Product> findSimilarProducts();
};

#endif