from socket import socket, AF_INET, SOCK_STREAM, error
import sys

def main():
    if len(sys.argv) != 3:
        return 1

    host = sys.argv[1]

    # Make sure port is a number
    try:
        port = int(sys.argv[2])
    except ValueError:
        return 1

    # Make sure port is in the correct range
    if port < 1024 or port > 65535:
        return 1

    # Connect the client with the server. Make sure it's inside try-catch
    with socket(AF_INET, SOCK_STREAM) as client:
        try:
            client.connect((host, port))
        except (error, OSError):
            return 1

        while True:
            # Get user input
            command = input()
            # turn command to lowercase
            command = command.lower()
            # Send command to server
            client.sendall((command + "\n").encode("utf-8"))
            # Receive response from server
            response = client.recv(4096).decode("utf-8")
            # Print response
            print(response, end="")

if __name__ == "__main__":
    sys.exit(main())