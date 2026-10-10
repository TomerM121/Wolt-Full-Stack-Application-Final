#include "ServerRunner.h"

void ServerRunner::run(int port) {
    UserManager userManager = UserManager();
    CommandExecutor executor = CommandExecutor(userManager);
    TCPServer server(port, executor);
    server.start();
    server.run();
}