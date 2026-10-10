/**
 * This is the product component. We use it when we want to display a product somewhere in our system
 * i.e. in the restaurant menu and potentially in the orders view.
 */

import React, { useState, useRef } from 'react';

export default function Product({ product }) {
    // Use a nice generic high-quality food/restaurant image for products
    const placeholderImg = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80`;

    return (
        <div className="product-details">
            <div className="product-image">
                <img src={placeholderImg} alt={product.name} />
            </div>
            <div className="product-info">
                <h2>{product.name}</h2>
                {product.description && <p className="product-description">{product.description}</p>}
                {product.price !== undefined && <p className="product-price">${product.price.toFixed(2)}</p>}
            </div>
        </div>
    )
}