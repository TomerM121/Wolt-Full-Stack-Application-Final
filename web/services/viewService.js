/**
 * View Service is the place where we manage the interaction with the Ex2 server.
 */

const net = require("net");

const SOCKET_TIMEOUT_MS = 5000; // 5 seconds — fail-fast if the C++ server stalls

class ViewService {
    constructor() {
        this._socket = new net.Socket();
        this._connected = false;

        // Use environment variable for host, fallback to localhost
        const host = process.env.EX2_SERVER_HOST || "localhost";

        // Handle connection errors without crashing the Node.js process.
        // Without this handler an ECONNREFUSED is an unhandled event and kills the process.
        this._socket.on('error', (err) => {
            this._connected = false;
            console.error(`ViewService socket error (host=${host}:8080):`, err.message);
        });

        // Log clean disconnections so they are visible in server output
        this._socket.on('close', () => {
            this._connected = false;
            console.warn('ViewService: socket connection closed');
        });

        this._socket.on('connect', () => {
            this._connected = true;
            console.log(`ViewService: connected to C++ server at ${host}:8080`);
        });

        // port is hard coded - need to be changed
        this._socket.connect(8080, host);
    }

    // wrapper private that sends command and returns the response in string
    _send = (command) => {
        return new Promise((resolve, reject) => {
            // Fail fast if the socket is not connected — avoids hanging indefinitely
            if (!this._connected) {
                return reject(new Error('ViewService: socket is not connected to the C++ server'));
            }

            // Safety timeout: reject if the C++ server takes too long to respond
            const timer = setTimeout(() => {
                reject(new Error(`ViewService: timeout waiting for response to command: ${command.trim()}`));
            }, SOCKET_TIMEOUT_MS);

            this._socket.once('data', (data) => {
                clearTimeout(timer);
                resolve(data.toString().trim());
            });

            this._socket.write(command);
        });
    };

    // Returns true if succeeded or user already existed, throws otherwise
    initUser = async (userId) => {
        // POST needs at least one arg, so we POST with a dummy product
        const postResponse = await this._send(`POST ${userId} 0\n`);

        if (postResponse.startsWith('404')) {
            // User already exists, return
            return true;
        }

        if (!postResponse.startsWith('201')) {
            throw new Error(`Failed to init user ${userId}: ${postResponse}`);
        }

        // POST good, then we remove the dummy product
        const deleteResponse = await this._send(`DELETE ${userId} 0\n`);

        if (!deleteResponse.startsWith('204')) {
            throw new Error(`Failed to remove dummy product for user ${userId}: ${deleteResponse}`);
        }

        return true;
    };

    // Add view to user
    addViewToUser = async (userId, prodId) => {
        const response = await this._send(`PATCH ${userId} ${prodId}\n`);

        if (!response.startsWith('204')) {
            throw new Error(`Failed to add view for user ${userId}, product ${prodId}: ${response}`);
        }

        return true;
    };

    // Remove view from user
    removeViewFromUser = async (userId, prodId) => {
        const response = await this._send(`DELETE ${userId} ${prodId}\n`);

        if (!response.startsWith('204')) {
            throw new Error(`Failed to remove view for user ${userId}, product ${prodId}: ${response}`);
        }

        return true;
    };
}

// Export a single instance
module.exports = new ViewService();