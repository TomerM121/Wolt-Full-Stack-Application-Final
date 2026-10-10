#ifndef TCPSERVER_H
#define TCPSERVER_H

#include <iostream>
#include <string>
#include <thread>
#include <vector>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>
#include "CommandExecutor.h"

/**
 * TCPServer is a class responsible for creating the TCP server for our sysytem.
 * This server will listen for client (=users of our system)
 * and it will pass the requests to the appropriate handler to process them.
 */
class TCPServer {
private:
    int port;
    int serverSocket;
    CommandExecutor& commandExecutor;
    /**
     * After we connect with a client we need to take the data that he send
     * and process it in order to return a response.
     * Right now our strategy (which is primitive and will be upgraded)
     * it takes a string (ensures it is a command) and exectues it and return
     * a string as response to the client.
     */
    void processRequest(int clientSocket);

public:
    /**
     * Constructor for TCPServer.
     * This method ONLY receive the port number to listen on.
     */
    TCPServer(int port, CommandExecutor& executor) 
        : port(port), commandExecutor(executor) {
        this->serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    }
    /**
     * Starts the TCP server.
     * Define the key parameters to run the server (port, ip).
     */
    void start();
    /**
     * Runs the TCP server.
     * Listen for clients and process requests in a loop until server is closed.
     */
    void run(); 
    /**
     * Stops the TCP server.
     * Closes the server socket and releases resources.
     */
    void stop();

    
    /**
     * This method ensures that the specific command that the client wants to execute
     * actually runs - It bridges between the client request to our API and logic.
     * It does so using a thing called Command Parser.
     */
    std::string handleRequest(const std::string& request);
};
#endif