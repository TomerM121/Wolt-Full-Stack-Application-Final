#include "SocketMenu.h"
#include <sys/socket.h>
#include <cstring>

SocketMenu::SocketMenu(int socket) : clientSocket(socket) {}

void SocketMenu::write(const std::string& message) {
    send(clientSocket, message.c_str(), message.length(), 0);
}

void SocketMenu::newLine() {
    write("\n");
}

std::string SocketMenu::read() {
    char buffer[4096];
    memset(buffer, 0, sizeof(buffer));
    
    int read_bytes = recv(clientSocket, buffer, sizeof(buffer), 0);
    
    if (read_bytes <= 0) {
        return "";
    }
    
    return std::string(buffer, read_bytes);
}