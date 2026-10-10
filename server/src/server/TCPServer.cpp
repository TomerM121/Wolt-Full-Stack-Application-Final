#include "TCPServer.h"
#include "../commands/CommandParser.h"
#include "CommandExecutor.h"
#include "cli/SocketMenu.h"

std::string TCPServer::handleRequest(const std::string& request) {
    // Parse command into command data
    CommandData commandData = CommandParser::parse(request);

    // Execute the command and return the response
    return commandExecutor.execute(commandData);
}

void TCPServer::processRequest(int clientSocket) {
    // Create socket menu
    SocketMenu menu(clientSocket);

    while (true) {
        // Read trough the interface
        std::string request = menu.read();

        // Empty string means the client stopped the connection
        if (request.empty()) {
            break; 
        }

        // Create a respone
        std::string response = handleRequest(request);

        // Pass the respone through the interface
        menu.write(response);
    }

    // Close the socket when the client is done
    close(clientSocket);
}

void TCPServer::start() {
    // Ensure server socket was created
    if (serverSocket < 0) {
        //std::cerr << "MAJOR PROBLEM: Server socket failed to create" << std::endl;
        return;
    }

    // Define the server parameters (port, ip) and start listening for clients.
    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = INADDR_ANY;
    sin.sin_port = htons(port);

    // Bind the socket to the port and ensure successful
    if (bind(serverSocket, (struct sockaddr *)&sin, sizeof(sin)) < 0) {
        //std::cerr << "MAJOR PROBLEM: Failed to bind server socket" << std::endl;
        return;
    }

    // Start listening for clients and ensure successful
    if (listen(serverSocket, 5) < 0) {
        //std::cerr << "MAJOR PROBLEM: Failed to listen on server socket" << std::endl;
        return;
    }
}

void TCPServer::run() {
    while (true) {
        struct sockaddr_in client_sin;
        unsigned int addr_len = sizeof(client_sin);

        int client_sock = accept(serverSocket, (struct sockaddr *)&client_sin, &addr_len);

        if (client_sock < 0) {
            //perror("MAJOR PROBLEM: Failed to accept client connection");
            return;
        }

        processRequest(client_sock);    
    }   
}

void TCPServer::stop() {
    // This method doesn't work properly yet, the problem is - right now it 
    // Is never reached and it doesnt check for edge cases and error handling.
    // But in the targil it is also stated the SERVER NEVER STOPS

    close(serverSocket);
}