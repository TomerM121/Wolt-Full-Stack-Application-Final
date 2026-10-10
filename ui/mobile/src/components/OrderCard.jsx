/**
 * OrderCard - represents an order in a card view.
 */
import React, { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";
import OrderAPI from '../../../shared/api/order';
import RestaurantAPI from '../../../shared/api/restaurant';
import productAPI from '../../../shared/api/product';
import JwtHelper from '../../../shared/services/JwtHelper';
import { useTheme } from '../context/ThemeContext';

export default function OrderCard({ orderId }) {
    const { colors } = useTheme();
    const [data, setData] = useState(null);
    const [restaurantName, setRestaurantName] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const userId = await JwtHelper.getUserId();
                setIsLoading(true);
                const orderData = await OrderAPI.getOrderById(userId, orderId);
                setData(orderData);
                if (orderData?.restaurantId) {
                    try {
                        const restaurant = await RestaurantAPI.getRestaurantById(orderData.restaurantId);
                        setRestaurantName(restaurant.name);

                        const menu = await productAPI.getMenu(orderData.restaurantId);
                        if (orderData.items && orderData.items.length > 0) {
                            const itemsWithDetails = orderData.items.map((itemId, idx) => {
                                const product = menu.find(p => String(p.id) === String(itemId) || String(p.productId) === String(itemId));
                                return { 
                                    id: itemId, 
                                    name: product ? product.name : 'Unknown Item', 
                                    price: product?.price !== undefined ? Number(product.price) : 0,
                                    idx 
                                };
                            });
                            setOrderItems(itemsWithDetails);
                        } else {
                            setOrderItems([]);
                        }
                    } catch {
                        setRestaurantName("Unknown Restaurant");
                    }
                }
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleRemoveItem = async (indexToRemove) => {
        try {
            setIsLoading(true);
            const userId = await JwtHelper.getUserId();
            const newItems = [...data.items];
            newItems.splice(indexToRemove, 1);
            
            await OrderAPI.updateOrder(userId, orderId, { items: newItems });
            
            // Re-fetch locally
            const updatedOrder = await OrderAPI.getOrderById(userId, orderId);
            setData(updatedOrder);
            
            if (updatedOrder?.restaurantId) {
                const menu = await productAPI.getMenu(updatedOrder.restaurantId);
                if (updatedOrder.items && updatedOrder.items.length > 0) {
                    const itemsWithDetails = updatedOrder.items.map((itemId, idx) => {
                        const product = menu.find(p => String(p.id) === String(itemId) || String(p.productId) === String(itemId));
                        return { 
                            id: itemId, 
                            name: product ? product.name : 'Unknown Item', 
                            price: product?.price !== undefined ? Number(product.price) : 0,
                            idx 
                        };
                    });
                    setOrderItems(itemsWithDetails);
                } else {
                    setOrderItems([]);
                }
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not remove item.");
        } finally {
            setIsLoading(false);
        }
    };

    const s = makeStyles(colors);

    if (error) return <View><Text style={{ color: colors.error }}>Error: {error.message}</Text></View>;
    if (isLoading) return <View><ActivityIndicator size="large" color={colors.primary} /></View>;

    const totalPrice = orderItems.reduce((sum, item) => sum + (item.price || 0), 0);

    return (
        <View style={s.container}>
            <Text style={s.title}>{restaurantName ? `Order from ${restaurantName}` : `Order ID: ${orderId}`}</Text>
            <Text style={s.subText}>Status: {data?.status}</Text>
            <Text style={s.totalPriceText}>Total: ${totalPrice.toFixed(2)}</Text>
            <Text style={[s.subText, { marginTop: 8 }]}>Items:</Text>
            {orderItems.length > 0 ? (
                orderItems.map((item, index) => (
                    <View key={`${item.id}-${index}`} style={s.itemRow}>
                        <View style={s.itemDetails}>
                            <Text style={s.itemName}>- {item.name}</Text>
                            {item.price !== undefined && (
                                <Text style={s.itemPrice}>${item.price.toFixed(2)}</Text>
                            )}
                        </View>
                        {data?.status === 'active' && (
                            <TouchableOpacity onPress={() => handleRemoveItem(item.idx)}>
                                <Text style={s.removeText}>Remove</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))
            ) : (
                <Text style={s.subText}>None</Text>
            )}
        </View>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        container: { padding: 16, backgroundColor: colors.surface, borderRadius: 12, margin: 16, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
        title: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
        subText: { fontSize: 16, color: colors.subtext, marginBottom: 4 },
        totalPriceText: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
        itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingLeft: 8 },
        itemDetails: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: 12 },
        itemName: { fontSize: 15, color: colors.text },
        itemPrice: { fontSize: 15, color: colors.text, fontWeight: '500' },
        removeText: { color: colors.error, fontSize: 14, fontWeight: 'bold' }
    });
}