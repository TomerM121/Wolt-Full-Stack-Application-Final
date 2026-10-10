import React, { useState, useEffect, useRef } from 'react';
import orderApi from '../../../../shared/api/order';
import productApi from '../../../../shared/api/product';
import './Order.css';

/**
 * This is the simpliest form of order - it just displays an order.
 */
export default function Order({ orderId, userId, number, onOrdersChanged }) {
    // Define and initlize states
    const [order, setOrder] = useState(null);
    const [productNames, setProductNames] = useState([]);
    const [error, setError] = useState(null);
    // Define states to handle each action
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isOrderingAgain, setIsOrderingAgain] = useState(false);

    // useRef to ensure once fetch
    const hasFetched = useRef(false);

    // Fetch order, then resolve product IDs to names
    useEffect(() => {
        // Skip if already fetched or missing params
        if (hasFetched.current || !orderId || !userId) {
            return;
        }

        // Set fetch = true since we are about to fetch
        hasFetched.current = true;

        const fetchOrder = async () => {
            try {
                const data = await orderApi.getOrderById(userId, orderId);
                setOrder(data);

                if (data && data.restaurantId && data.items && data.items.length > 0) {
                    // Fetch the restaurant menu
                    const menu = await productApi.getMenu(data.restaurantId);

                    // Build map of productId to productName
                    const productMap = {};
                    menu.forEach(product => {
                        productMap[product.id] = product.name;
                    });

                    // Match each item to its name
                    const names = data.items.map(id => productMap[id] || id);
                    setProductNames(names);
                }
            }
            catch (err) {
                console.error("API failed", err);
                setError("Failed to load order.");
            }
        };

        fetchOrder();
    }, [orderId, userId]);

    // Handle deletion which removes order from the system entriely
    const handleDelete = async () => {
        setIsDeleting(true); // Consider deleted

        try {
            // Call the API to delete the order
            await orderApi.deleteOrder(userId, orderId);

            // Notify OrderView to fetch again, therefore update the UI
            if (onOrdersChanged) onOrdersChanged();
        }
        catch (err) {
            console.error('Delete failed', err);
            setError('Failed to delete order.');
            setIsDeleting(false);
        }
    };

    // Handle checkout which moves order to history by setting status to closed
    const handleCheckout = async () => {
        setIsCheckingOut(true);

        try {
            // Call API to update order
            await orderApi.updateOrder(userId, orderId, { status: 'closed' });

            // Notify OrderView to fetch again, therefore update the UI
            if (onOrdersChanged) onOrdersChanged();
        }
        catch (err) {
            console.error('Checkout failed', err);
            setError('Failed to checkout.');
            setIsCheckingOut(false);
        }
    };

    // Handle order again which creates a new active order with the same restaurant and items
    const handleOrderAgain = async () => {
        setIsOrderingAgain(true);

        try {
            // Call API to create order
            await orderApi.createOrder(userId, order.restaurantId, order.items);

            // Notify OrderView to fetch again, therefore update the UI
            if (onOrdersChanged) onOrdersChanged();
        }
        catch (err) {
            console.error('Order again failed', err);
            setError('Failed to place order again.');
            setIsOrderingAgain(false);
        }
    };

    // Handle errors
    if (error) {
        return <p>{error}</p>;
    }

    // Handle loading state
    if (!order) {
        return <p>Loading order...</p>;
    }

    // Return the order in UI
    return (
        <div className="order-card">
            <h2>Order #{number}</h2>
            <p>Status: {order.status}</p>
            <p>Items: {productNames.length > 0 ? productNames.join(', ') : (order.items ? order.items.join(', ') : '')}</p>

            <div className="order-actions">
                {/* Checkout - only for active orders */}
                {order.status === 'active' && (
                    <button className="order-checkout-btn" onClick={handleCheckout} disabled={isCheckingOut}>
                        {isCheckingOut ? 'Checking out...' : 'Checkout'}
                    </button>
                )}

                {/* Order Again - only for closed orders */}
                {order.status === 'closed' && (
                    <button className="order-again-btn" onClick={handleOrderAgain} disabled={isOrderingAgain}>
                        {isOrderingAgain ? 'Placing order...' : 'Order Again'}
                    </button>
                )}

                {/* Delete - available for all orders */}
                <button className="order-delete-btn" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
}