#include "User.h"

// Constructor: This constructor initializes the user with a given id.
User::User(int id) {
    this->id = id;
}

// Get id: This method returns the id of the user.
int User::getId() const {
    return id;
}