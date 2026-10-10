#include "server/ServerRunner.h"

int main(int argc, char *argv[]) {
  // Ensure only one argument is provided
  if (argc != 2) {
    return 1;
  }

  // Ensure port number is valid
  int port;
  try {
    std::string arg = argv[1];
    size_t pos;
    port = std::stoi(arg, &pos);

    if (pos != arg.size()) {
      throw std::invalid_argument("Extra characters");
    }

    if (port < 1024 || port > 65535) {
      throw std::invalid_argument("Invaild port number");
    }

  } catch (const std::exception &) {
    return 1;
  }

  // Start the server
  ServerRunner runner;
  runner.run(port);
  return 0;
}