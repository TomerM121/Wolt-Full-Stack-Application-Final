// src/views/HomePage.jsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import restaurantApi from '../../../shared/api/restaurant';
import searchApi from '../../../shared/api/search';

import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResult';
import RestaurantList from '../components/RestaurantList';

// The HomePage component is responsible for displaying the list of 
// restaurants and handling the search functionality.
function HomePage() {
    const [restaurants, setRestaurants] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    // Load the list of restaurants when the component mounts
    useEffect(() => {
        async function loadRestaurants() {
            try {
                setError('');

                // Fetch the list of restaurants from the API
                const data = await restaurantApi.getRestaurants();

                // Update the state with the fetched restaurants
                setRestaurants(data);
            } catch (err) {
                setError('Could not load restaurants');
            }
        }

        loadRestaurants();
    }, []);

    const location = useLocation();
    
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchQuery = queryParams.get('search');
        if (searchQuery) {
            handleSearch(searchQuery);
        } else {
            handleClearSearch();
        }
    }, [location.search]);

    // Handle the search functionality when the user submits a search query
    async function handleSearch(query) {
        try {
            setError('');

            const data = await searchApi.search(query);

            setSearchResults(data);
            setIsSearching(true);
        } catch (err) {
            setError('Search failed');
        }
    }

    function handleClearSearch() {
        setSearchResults([]);
        setIsSearching(false);
        setError('');
    }

    return (
        <main className="home-page">
            <h1>Restaurants</h1>

            {isSearching && (
                <button className="clear-search-btn" onClick={handleClearSearch}>
                    Clear search
                </button>
            )}

            {error && <p className="error-message">{error}</p>}

            {isSearching ? (
                <SearchResults results={searchResults} />
            ) : (
                <RestaurantList restaurants={restaurants} />
            )}
        </main>
    );
}

export default HomePage;