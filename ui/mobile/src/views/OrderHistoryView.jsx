/**
 * Display all past orders for the user.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import OrderCard from '../components/OrderCard';
import OrderAPI from '../../../shared/api/order';
import NavigationBar from '../components/NavigationBar';
import JwtHelper from '../../../shared/services/JwtHelper';
import { useTheme } from '../context/ThemeContext';

export default function OrderHistoryView({ navigation, hideNavBar }) {
    const { colors } = useTheme();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderingStates, setOrderingStates] = useState({});

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            const userId = await JwtHelper.getUserId();
            const allOrders = await OrderAPI.getAllOrders(userId);
            const pastOrders = allOrders.filter(o => o.status === 'closed');
            pastOrders.reverse();
            setOrders(pastOrders);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOrderAgain = async (order) => {
        try {
            setOrderingStates(prev => ({ ...prev, [order.id]: true }));
            const userId = await JwtHelper.getUserId();
            await OrderAPI.createOrder(userId, order.restaurantId, order.items);
            Alert.alert("Success", "Your order has been placed again!");
        } catch {
            Alert.alert("Error", "Failed to place order again.");
        } finally {
            setOrderingStates(prev => ({ ...prev, [order.id]: false }));
        }
    };

    const s = makeStyles(colors);

    if (error) return <View style={s.centered}><Text style={{ color: colors.error }}>Error: {error.message}</Text></View>;
    if (isLoading) return <View style={s.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    if (orders.length === 0) return <View style={s.centered}><Text style={s.emptyText}>No past orders found.</Text></View>;

    const renderItem = ({ item }) => (
        <View style={s.orderContainer}>
            <OrderCard orderId={item.id} />
            <TouchableOpacity
                style={s.orderAgainButton}
                onPress={() => handleOrderAgain(item)}
                disabled={orderingStates[item.id]}
            >
                <Text style={s.orderAgainText}>
                    {orderingStates[item.id] ? 'Placing Order...' : 'Order Again'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={s.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={s.listContainer}
            />
            {!hideNavBar && <NavigationBar />}
        </View>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        listContainer: { paddingBottom: 20, paddingTop: 8 },
        orderContainer: { marginBottom: 8 },
        orderAgainButton: { backgroundColor: colors.primary, padding: 14, borderRadius: 8, marginHorizontal: 16, alignItems: 'center', marginTop: 8, marginBottom: 16, elevation: 3 },
        orderAgainText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
        emptyText: { fontSize: 16, color: colors.subtext },
    });
}