import React from 'react';
import { useNavigate } from 'react-router-dom';

// The ProductCard component is responsible for displaying the details of a single product
// and providing a button to view the associated restaurant.
function ProductCard({ product }) {
    const navigate = useNavigate();

    // Handle the "View Product" button click to navigate to the specific product's page
    function handleViewProduct() {
        navigate(`/restaurant/${product.restaurantId}/product/${product.id}`);
    }

    return (
        <div className="menu-item-card">
            <div>
                <h3>{product.name}</h3>

            {product.restaurantName && (
                <p>
                    Restaurant: {product.restaurantName}
                </p>
            )}

            {product.description && (
                <p>{product.description}</p>
            )}

            {product.price !== undefined && (
                <p>Price: ${product.price.toFixed(2)}</p>
            )}
            </div>

            {/* Button to navigate to the product's page */}
            <button className="btn-primary" onClick={handleViewProduct} style={{ marginTop: '16px' }}>
                View Product
            </button>
        </div>
    );
}

export default ProductCard;