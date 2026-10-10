import React, { useState, useRef, useEffect } from 'react';
import { useParams } from "react-router-dom";
import productApi from '../../../shared/api/product';
import Product from '../components/Product';
import jwtHelper from '../../../shared/services/JwtHelper';
import orderApi from '../../../shared/api/order';
import NotFound from '../components/NotFound';


export default function ProductView() {
    // Recover the id from the router
    /**
     * id = restaurant id
     * pId = product id
     */
    const { id, pId } = useParams();

    // Define state variables for all products
    const [product, setProduct] = useState(null);

    // Error handling
    const [error, setError] = useState(null);

    // We use ref here because we want to render the API once,
    // Ref prevents double calls to the API.     
    const hasFetched = useRef(false);

    // Use useEffect to fetch once after the component mounts
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchProduct = async () => {
            try {
                const data = await productApi.getProduct(id, pId);
                setProduct(data);
            } catch {
                console.error("API Failed");
                setError(true);
            }
        };

        fetchProduct();
    }, [id, pId]);

    // If product not found, spawn not found component
    if (error) {
        return (
            <NotFound />
        );
    }

    if (!product) {
        return (
            <div>No Product</div>
        );
    }

    // Return the final JSX
    return (
        <div className="product-view-container">
            <Product product={product} />
            <div className="product-actions">
                <button className="btn-primary" onClick={async () => {
                    if (!(await jwtHelper.isLoggedIn())) {
                    alert("Please log in to add items to your order.");
                    return;
                    }
                    try {
                        await orderApi.addProductToOrder(await jwtHelper.getUserId(), id, pId);
                        alert("Added to order!");
                    } catch {
                        setError(true);
                    }
                }}>
                    Add to Order
                </button>
            </div>
        </div>
    );
}
