#ifndef SERVER_RUNNER_H
#define SERVER_RUNNER_H

#include "TCPServer.h"
#include "CommandExecutor.h"
#include "../file_system/UserManager.h"

/**
 * ServerRunner
 * This class only goal is to run the TCPServer.
 */
class ServerRunner {
public:
    void run(int port);
};
#endif // SERVER_RUNNER_H