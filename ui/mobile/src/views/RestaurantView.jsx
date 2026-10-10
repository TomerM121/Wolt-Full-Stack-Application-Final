import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Restaurant from '../components/Restaurant';
import NavigationBar from '../components/NavigationBar';
import productAPI from '../../../shared/api/product';
import orderAPI from '../../../shared/api/order';
import JwtHelper from '../../../shared/services/JwtHelper';
import { useTheme } from '../context/ThemeContext';

export default function RestaurantView({ route }) {
    const restaurantId = route?.params?.restaurantId || -1;
    const userId = route?.params?.userId || -1;
    const { colors } = useTheme();

    const [menu, setMenu] = useState([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);
    const [error, setError] = useState(null);
    // Track which product IDs are currently being added to an order
    const [addingIds, setAddingIds] = useState({});

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                setIsLoadingMenu(true);
                const menuData = await productAPI.getMenu(restaurantId);
                setMenu(menuData || []);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoadingMenu(false);
            }
        };
        if (restaurantId !== -1) fetchMenu();
        else setIsLoadingMenu(false);
    }, [restaurantId]);

    const handleAddToOrder = async (product) => {
        const productId = product.id || product.productId;
        try {
            const currentUserId = await JwtHelper.getUserId();
            if (!currentUserId || currentUserId === -1) {
                Alert.alert('Login required', 'Please log in to add items to your order.');
                return;
            }
            setAddingIds(prev => ({ ...prev, [productId]: true }));
            await orderAPI.addProductToOrder(currentUserId, restaurantId, productId);
            Alert.alert('Added!', `${product.name} added to your order.`);
        } catch (err) {
            console.error('Failed to add to order:', err);
            Alert.alert('Error', 'Failed to add product to order. Please try again.');
        } finally {
            setAddingIds(prev => ({ ...prev, [productId]: false }));
        }
    };

    const s = makeStyles(colors);

    return (
        <SafeAreaView style={s.container}>
            <ScrollView style={s.scrollContent}>
                <Restaurant route={route} />
                <View style={s.menuSection}>
                    <Text style={s.menuTitle}>Menu</Text>
                    {error ? (
                        <Text style={s.errorText}>Failed to load menu</Text>
                    ) : isLoadingMenu ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : menu.length === 0 ? (
                        <Text style={s.emptyText}>No products available.</Text>
                    ) : (
                        <View style={s.list}>
                            {menu.map((product, index) => {
                                const productId = product.id || product.productId;
                                const isAdding = !!addingIds[productId];
                                return (
                                    // Render inline from the menu data already fetched — do NOT spawn the
                                    // Product detail component here, as it makes a separate getProduct API
                                    // call per item which hits the ViewService TCP socket and fails.
                                    <View key={productId || String(index)} style={s.productCard}>
                                        <View style={s.productInfo}>
                                            <Text style={s.productName}>{product.name}</Text>
                                            {product.description ? (
                                                <Text style={s.productDescription}>{product.description}</Text>
                                            ) : null}
                                            {product.price !== undefined ? (
                                                <Text style={s.productPrice}>${Number(product.price).toFixed(2)}</Text>
                                            ) : null}
                                        </View>
                                        {userId !== -1 && userId !== null && (
                                            <Pressable
                                                style={({ pressed }) => [s.addButton, pressed && s.addButtonPressed]}
                                                onPress={() => handleAddToOrder(product)}
                                                disabled={isAdding}
                                            >
                                                {isAdding
                                                    ? <ActivityIndicator color="#fff" size="small" />
                                                    : <Text style={s.addButtonText}>+</Text>
                                                }
                                            </Pressable>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
            <NavigationBar />
        </SafeAreaView>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        scrollContent: { flex: 1 },
        menuSection: { padding: 16 },
        menuTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
        list: { flexDirection: 'column' },
        listItem: { width: '100%', marginBottom: 16 },
        errorText: { color: colors.error, textAlign: 'center' },
        emptyText: { textAlign: 'center', color: colors.subtext, fontStyle: 'italic' },
        // Inline product card styles (used in menu list — does not trigger extra API calls)
        productCard: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 14,
            marginBottom: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
        },
        productInfo: { flex: 1, marginRight: 12 },
        productName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 },
        productDescription: { fontSize: 13, color: colors.subtext },
        productPrice: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 4 },
        addButton: {
            backgroundColor: colors.primary,
            width: 44, height: 44, borderRadius: 22,
            justifyContent: 'center', alignItems: 'center',
            marginLeft: 10,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2, shadowRadius: 3, elevation: 4,
        },
        addButtonPressed: { transform: [{ scale: 1.15 }] },
        addButtonText: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: -2 },
    });
}