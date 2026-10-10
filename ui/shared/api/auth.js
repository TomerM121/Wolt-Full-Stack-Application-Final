import { CONFIG } from '../config.js';
import jwtHelper from '../services/JwtHelper';

class AuthApi {
    get baseURL() {
        return CONFIG.API_URL;
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/tokens`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to login");
            }

            const data = await response.json();
            return data; 
        }
        catch (error) {
            throw error;
        }
    }

    async register(username, name, phone, latitude, longitude, password, logoData, isOwner) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("name", name);
            formData.append("phone", phone);
            formData.append("latitude", String(latitude));
            formData.append("longitude", String(longitude));
            formData.append("password", password);
            formData.append("isOwner", String(isOwner));

            if (logoData) {
                // Check if it's from React Native (has a uri property)
                if (logoData.uri) {
                    formData.append("logo", {
                        uri: logoData.uri,
                        name: logoData.name || 'photo.jpg',
                        type: logoData.type || 'image/jpeg',
                    });
                } else {
                    // It's a standard Web File object from an <input>
                    formData.append("logo", logoData);
                }
            }

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${this.baseURL}/users`);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch {
                        resolve({});
                    }
                } else {
                    try {
                        const err = JSON.parse(xhr.responseText);
                        reject(new Error(err.message || "Failed to register user"));
                    } catch {
                        reject(new Error("Failed to register user"));
                    }
                }
            };
            xhr.onerror = () => reject(new Error("Network error during registration"));
            xhr.send(formData);
        });
    }

    async getUser() {
        try {
            // get the token and id from local storage
            const token = await jwtHelper.getToken();
            const userId = await jwtHelper.getUserId();

            if (!(await jwtHelper.isLoggedIn())) {
                return null;
            }

            const response = await fetch(`${this.baseURL}/users/${userId}`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to fetch user");
            }

            return await response.json();
        }
        catch (error) {
            throw error;
        }
    }
}

export default new AuthApi();