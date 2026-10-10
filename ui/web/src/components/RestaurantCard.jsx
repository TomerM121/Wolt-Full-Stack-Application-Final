import { CONFIG } from '../../../shared/config.js';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../../shared/api/auth.js';

function RestaurantCard({ restaurant }) {
    const navigate = useNavigate();

    const backendUrl = CONFIG.BACKEND_URL;
    const placeholderImg = `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80`;
    
    // Place holder if img doesnt exists
    const image = restaurant.image ? `${backendUrl}/${restaurant.image}` : placeholderImg;
    
    // debug
    console.log(restaurant)

    return (
        <div className="restaurant-card" onClick={() => navigate('/restaurant/' + restaurant.id)}>
            <div className="restaurant-card-image">
                <img 
                    src={image} 
                    alt={restaurant.name} 
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = placeholderImg;
                    }}
                />
                {restaurant.distance !== undefined && (
                    <div className="restaurant-distance">
                        {restaurant.distance.toFixed(1)} km
                    </div>
                )}
            </div>
            <div className="restaurant-card-content">
                <h3>{restaurant.name}</h3>
                {restaurant.description && (
                    <p>{restaurant.description}</p>
                )}
            </div>
        </div>
    );
}

export default RestaurantCard;