import React from 'react';
import Order from './Order';

/**
 * In this class we display all *closed* orders
 * We get our orders to display as an input and we assume they are all closed
 */
export default function OrderHistory({ orders, onOrdersChanged, numberingMap }) {
    // If we get no orders we return matching output
    if (!orders || orders.length === 0) return <p>No past orders</p>;

    return (
        <div>
            <h2>Order History</h2>
            {orders.map((order) => (
                <Order
                    key={order.id}
                    orderId={order.id}
                    userId={order.userId}
                    onOrdersChanged={onOrdersChanged}
                    number={numberingMap[order.id]}
                />
            ))}
        </div>
    );
}