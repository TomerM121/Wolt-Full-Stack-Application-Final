#ifndef SOCKETMENU_H
#define SOCKETMENU_H

#include "IMenu.h"

class SocketMenu : public IMenu {
private:
    int clientSocket;

public:
    SocketMenu(int socket);

    void write(const std::string& message) override;
    void newLine() override;
    std::string read() override;
};

#endif