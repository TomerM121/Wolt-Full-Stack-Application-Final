class JwtHelper {
    constructor() {
        this.storage = null;
    }

    initStorage(storageProvider) {
        this.storage = storageProvider;
    }

    // Save login data
    async saveSession(token, userId = null) {
        if (!this.storage) throw new Error("Storage not initialized! Call initStorage first.");
        
        await this.storage.setItem('token', token);
        
        if (userId) {
            await this.storage.setItem('userId', String(userId));
        }
    }

    // Clear login data
    async logout() {
        if (!this.storage) return;
        await this.storage.removeItem('token');
        await this.storage.removeItem('userId');
    }

    // Check if logged in (true if token exists)
    async isLoggedIn() {
        if (!this.storage) return false;
        const token = await this.storage.getItem('token');
        return !!token;
    }

    // Get the JWT token for API requests
    async getToken() {
        if (!this.storage) return null;
        return await this.storage.getItem('token');
    }

    // Get the logged in user's ID
    async getUserId() {
        if (!this.storage) return null;
        return await this.storage.getItem('userId');
    }

    // Decode the JWT locally
    async getUserDetails() {
        if (!this.storage) return null;
        const token = await this.storage.getItem('token');
        if (!token) return null;
        
        try {
            const base64Payload = token.split('.')[1];
            return JSON.parse(atob(base64Payload));
        } catch (error) {
            return null;
        }
    }
}

export default new JwtHelper();