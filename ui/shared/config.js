export const CONFIG = {
    BACKEND_URL: 'http://localhost:3000',
    API_URL: 'http://localhost:3000/api'
};

export const setBaseUrl = (url) => {
    CONFIG.BACKEND_URL = url;
    CONFIG.API_URL = `${url}/api`;
};