import { CONFIG } from '../config.js';
/**
 * search.js is here to help us interact with the search-related
 * REST API endpoints from the web server in a simple way.
 */

class SearchApi {
    /**
     * Initialize the SearchApi class with its entry URL
     * and work from there with it in each method.
     */
    get baseURL() {
        return CONFIG.API_URL;
    }

    // Call GET localhost/api/search/:query
    // Returns matching restaurants and products for the given query string
    async search(query) {
        try {
            const response = await fetch(`${this.baseURL}/search/${encodeURIComponent(query)}`);
            const data = await response.json();
            // The backend returns search results straight to result
            return data.result;
        }
        catch {
            throw new Error("Failed to perform search");
        }
    }
}
export default new SearchApi();
