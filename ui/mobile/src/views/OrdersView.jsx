/**
 * OrdersView - Container with toggle between Cart and History.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartView from './CartView';
import OrderHistoryView from './OrderHistoryView';
import NavigationBar from '../components/NavigationBar';
import { useTheme } from '../context/ThemeContext';

export default function OrdersView({ navigation }) {
    const [activeTab, setActiveTab] = useState('cart');
    const { colors } = useTheme();
    const s = makeStyles(colors);

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <Text style={s.headerTitle}>My Orders</Text>
                <View style={s.toggleContainer}>
                    <TouchableOpacity
                        style={[s.toggleButton, activeTab === 'cart' && s.activeTab]}
                        onPress={() => setActiveTab('cart')}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.toggleText, activeTab === 'cart' && s.activeText]}>Active Cart</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.toggleButton, activeTab === 'history' && s.activeTab]}
                        onPress={() => setActiveTab('history')}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.toggleText, activeTab === 'history' && s.activeText]}>Past Orders</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={s.contentContainer}>
                {activeTab === 'cart' ? (
                    <CartView navigation={navigation} hideNavBar={true} />
                ) : (
                    <OrderHistoryView navigation={navigation} hideNavBar={true} />
                )}
            </View>
            <NavigationBar />
        </SafeAreaView>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 3, zIndex: 10 },
        headerTitle: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
        toggleContainer: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: 12, padding: 4 },
        toggleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
        activeTab: { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
        toggleText: { fontSize: 16, fontWeight: '600', color: colors.subtext },
        activeText: { color: colors.primary },
        contentContainer: { flex: 1, backgroundColor: colors.background },
    });
}
