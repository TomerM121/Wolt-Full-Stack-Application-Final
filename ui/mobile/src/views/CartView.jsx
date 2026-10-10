/**
 * Display the current order for the user and handle checkout.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderCard from '../components/OrderCard';
import orderAPI from '../../../shared/api/order';
import NavigationBar from '../components/NavigationBar';
import JwtHelper from '../../../shared/services/JwtHelper';
import { useTheme } from '../context/ThemeContext';

export default function CartView({ navigation, hideNavBar }) {
    const { colors } = useTheme();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { fetchActiveOrders(); }, []);

    const fetchActiveOrders = async () => {
        try {
            setIsLoading(true);
            const userId = await JwtHelper.getUserId();
            const allOrders = await orderAPI.getAllOrders(userId);
            setOrders(allOrders.filter(o => o.status === 'active'));
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckout = (order) => {
        navigation.navigate('checkout', { orderId: order.id });
    };

    const s = makeStyles(colors);

    if (error) return <View style={s.centered}><Text style={{ color: colors.error }}>Error: {error.message}</Text></View>;
    if (isLoading) return <View style={s.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    if (orders.length === 0) return <View style={s.centered}><Text style={s.emptyText}>No active orders found.</Text></View>;

    const renderItem = ({ item }) => (
        <View style={s.orderContainer}>
            <OrderCard orderId={item.id} />
            <TouchableOpacity style={s.checkoutButton} onPress={() => handleCheckout(item)}>
                <Text style={s.checkoutText}>Checkout</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={s.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={s.listContainer}
            />
            {!hideNavBar && <NavigationBar />}
        </SafeAreaView>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        listContainer: { paddingBottom: 20, paddingTop: 8 },
        orderContainer: { marginBottom: 8 },
        checkoutButton: { backgroundColor: colors.success, padding: 14, borderRadius: 8, marginHorizontal: 16, alignItems: 'center', marginTop: 8, marginBottom: 16, elevation: 3 },
        checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
        emptyText: { fontSize: 16, color: colors.subtext },
    });
}