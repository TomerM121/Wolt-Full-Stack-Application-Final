/**
 * checkout.js is repossible to handle order checkout cleanly.
 * As of now, checkout process takes an active order and turns it into a closed order
 * and returns an appropriate message.
 */
import OrderAPI from '../../../shared/api/order'

/**
 * handleCheckout - performs a checkout on orderId
 * by using the API and returns a msg to display
 */
export default async function handleCheckout(userId, orderId) {
    try {
        // Attempt to close order
        const res = await OrderAPI.updateOrder(userId, orderId, { status: "closed" });

        // Return output matching result
        if (!res || res.status !== "closed") {
            return "We are sorry, we are having trouble finilzing your order.";
        }
        return "Your order has been placed successfully!";
    } catch (err) {
        return err.message;
    }
}