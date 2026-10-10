import React, { useState, useEffect } from 'react';
import orderApi from '../../../shared/api/order';
import jwtHelper from '../../../shared/services/JwtHelper';
import CurrentOrder from '../components/order/CurrentOrder';
import History from '../components/order/OrderHistory';

/**
 * OrderView is the only place that knows about all orders.
 * It fetches all orders once and passes filtered lists down to child components.
 */
export default function OrderView() {
    // Set state variables
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [update, setUpdate] = useState(0);

    // Runs every time there is an update
    useEffect(() => {
        setLoading(true); // We treat the loading state as a switch
        setError(null);

        const fetchAllOrders = async () => {
            try {
                const userId = await jwtHelper.getUserId();
                const data = await orderApi.getAllOrders(userId);
                setAllOrders(data || []);
            }
            catch (err) {
                console.error('Failed to fetch orders', err);
                setError('Failed to load orders.');
            }
            finally {
                // After we fetch succesfully we close the switch, ready for the next update
                setLoading(false);
            }
        };

        fetchAllOrders();
    }, [update]);

    // The components call this to notify that there is an update
    const handleOrdersChanged = () => setUpdate(c => c + 1);

    // Deal with loading and errors
    if (loading) return <p>Loading orders...</p>;
    if (error) return <p>{error}</p>;

    // Order numbering map
    let numberingMap = {};
    let i = 1;

    // Now we iterate all orders and match a map to them and add to map
    // Very import assumtion: We assume the list is ordered from oldest to newest.
    for (const order of allOrders) {
        numberingMap[order.id] = i++;
    }

    // Filter out irrelevant orders
    const activeOrders = allOrders.filter(o => o.status === 'active');
    const closedOrders = allOrders.filter(o => o.status === 'closed');

    // Create lists of components to display
    return (
        <div>
            <h1>My Orders</h1>
            <CurrentOrder
                orders={activeOrders}
                onOrdersChanged={handleOrdersChanged}
                numberingMap={numberingMap}
            />
            <History
                orders={closedOrders}
                onOrdersChanged={handleOrdersChanged}
                numberingMap={numberingMap}
            />
        </div>
    );
}