// StatusCode.h

#ifndef STATUSCODE_H
#define STATUSCODE_H

#include <string>

class StatusCode {
public:
    static std::string getStatusCode(int code) {
        switch (code) {
            case 200: 
                return "200 Ok\n";
            case 201: 
                return "201 Created\n";
            case 204: 
                return "204 No Content\n";
            case 400: 
                return "400 Bad Request\n";
            case 404: 
                return "404 Not Found\n";
            default:  
                // Catch unexpected errors and deal with them
                return "999 Unknown Error\n"; 
        }
    }
};
      
#endif // STATUSCODE_H