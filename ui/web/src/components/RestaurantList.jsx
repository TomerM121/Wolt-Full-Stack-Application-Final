// src/components/RestaurantList.jsx

import React, { useState } from 'react';
import RestaurantCard from './RestaurantCard';

function RestaurantList({ restaurants }) {
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 16; // 4x4 grid

    if (!restaurants || restaurants.length === 0) {
        return <p>No restaurants found.</p>;
    }

    const totalPages = Math.ceil(restaurants.length / ITEMS_PER_PAGE);
    
    // In case the filtered list gets smaller and the current page is out of bounds
    const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));

    const startIndex = safePage * ITEMS_PER_PAGE;
    const currentRestaurants = restaurants.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="restaurants-container">
            <div className="restaurants-list">
                {currentRestaurants.map((restaurant) => (
                    <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                    />
                ))}
            </div>
            
            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button 
                        disabled={safePage === 0} 
                        onClick={() => setCurrentPage(safePage - 1)}
                    >
                        Prev
                    </button>
                    <span>Page {safePage + 1} of {totalPages}</span>
                    <button 
                        disabled={safePage === totalPages - 1} 
                        onClick={() => setCurrentPage(safePage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default RestaurantList;