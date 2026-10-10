import React from 'react';
import RestaurantCard from './RestaurantCard';
import ProductCard from './ProductCard';

// SearchResults component displays the search results based on the user's query.
// It handles both restaurant and product results.
function SearchResults({ results }) {
    // Result may contain values we cannot process so we should filter them out safely
    const cleanResult = (results || []).filter((item) => {
        return item && (item.type === 'restaurant' || item.type === 'product');
    });

    // Ensure *filtered* result is valid (not empty or null)
    if (cleanResult.length === 0) {
        return <p>No results found.</p>;
    }

    // Display search result using predefiend item cards
    const restaurants = cleanResult.filter(item => item.type === 'restaurant');
    const products = cleanResult.filter(item => item.type === 'product');

    return (
        <div className="search-results-container" style={{ width: '100%' }}>
            {restaurants.length > 0 && (
                <div className="restaurants-container" style={{ alignItems: 'flex-start' }}>
                    <h2 style={{ marginBottom: '20px' }}>Matching Restaurants</h2>
                    <div className="restaurants-list">
                        {restaurants.map(item => (
                            <RestaurantCard
                                key={`restaurant-${item.id}`}
                                restaurant={item}
                            />
                        ))}
                    </div>
                </div>
            )}

            {products.length > 0 && (
                <div className="menu-view" style={{ alignItems: 'flex-start', marginTop: '20px' }}>
                    <h2 style={{ marginBottom: '20px' }}>Matching Products</h2>
                    <div className="menu-grid">
                        {products.map(item => (
                            <ProductCard
                                key={`product-${item.id}`}
                                product={item}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchResults;