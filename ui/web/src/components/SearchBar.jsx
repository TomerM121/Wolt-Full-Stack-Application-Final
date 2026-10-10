import React, { useState } from 'react';

function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');

    // Handle the search button click
    function handleSearch() {
        // Call the onSearch function passed from the parent component with the search query
        onSearch(query);
    }

    return (
        <div className="search-bar">
            <input
                className="search-input"
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                }}
            />
            <button className="search-button" onClick={handleSearch}>
                Search
            </button>
        </div>
    );
}

export default SearchBar;