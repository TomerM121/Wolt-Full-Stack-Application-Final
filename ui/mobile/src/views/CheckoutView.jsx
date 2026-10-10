/**
 * CheckoutView - The confirm order screen.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderCard from '../components/OrderCard';
import handleCheckout from '../services/checkout';
import JwtHelper from '../../../shared/services/JwtHelper';
import { useTheme } from '../context/ThemeContext';

export default function CheckoutView({ route, navigation }) {
    const { orderId } = route?.params || {};
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const { colors } = useTheme();

    const onConfirmOrder = async () => {
        if (!orderId) { Alert.alert("Error", "No order selected for checkout."); return; }
        try {
            setIsCheckingOut(true);
            const userId = await JwtHelper.getUserId();
            const resultMsg = await handleCheckout(userId, orderId);
            if (resultMsg === "Your order has been placed successfully!") {
                Alert.alert("Success", resultMsg);
                navigation.navigate('OrdersView');
            } else {
                Alert.alert("Checkout Failed", resultMsg);
            }
        } catch (err) {
            Alert.alert("Error", "An unexpected error occurred during checkout.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    const s = makeStyles(colors);

    if (!orderId) {
        return <View style={s.centered}><Text style={s.errorText}>No order ID provided.</Text></View>;
    }

    return (
        <SafeAreaView style={s.container}>
            <View style={s.cardContainer}>
                <View style={s.scaledCard}>
                    <OrderCard orderId={orderId} />
                </View>
            </View>
            <TouchableOpacity style={s.confirmButton} onPress={onConfirmOrder} disabled={isCheckingOut}>
                {isCheckingOut ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={s.confirmText}>Confirm Order</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between', padding: 24 },
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        scaledCard: { width: '100%', transform: [{ scale: 1.15 }] },
        confirmButton: { backgroundColor: colors.success, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 },
        confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
        errorText: { fontSize: 16, color: colors.error },
    });
}