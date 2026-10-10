import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import productApi from '../../../shared/api/product';
import restaurantApi from '../../../shared/api/restaurant';

export default function MenuView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const [restData, menuItems] = await Promise.all([
                    restaurantApi.getRestaurantById(id),
                    productApi.getMenu(id)
                ]);
                setRestaurant(restData);
                setProducts(menuItems);
            } catch (err) {
                console.error("Failed to fetch menu data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuData();
    }, [id]);

    if (loading) return <div className="menu-loading">Loading menu...</div>;
    if (!restaurant) return <div className="menu-error">Restaurant not found.</div>;

    return (
        <div className="menu-view">
            <h1 className="menu-title">{restaurant.name} Menu</h1>
            {restaurant.description && <p className="menu-subtitle">{restaurant.description}</p>}
            
            {products.length === 0 ? (
                <p>No items found on this menu.</p>
            ) : (
                <div className="menu-grid">
                    {products.map((product) => (
                        <div key={product.id} className="menu-item-card" onClick={() => navigate(`/restaurant/${id}/product/${product.id}`)}>
                            <h3>{product.name}</h3>
                            {product.description && <p>{product.description}</p>}
                            {product.price !== undefined && <span className="menu-item-price">${product.price.toFixed(2)}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
