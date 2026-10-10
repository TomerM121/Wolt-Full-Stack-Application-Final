import React, { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Pressable, Alert } from "react-native";
import productAPI from '../../../shared/api/product';
import orderAPI from '../../../shared/api/order';
import JwtHelper from '../../../shared/services/JwtHelper';
import { useTheme } from '../context/ThemeContext';

export default function Product({ route }) {
    const productId = route?.params?.productId || -1;
    const restaurantId = route?.params?.restaurantId || -1;
    const userId = route?.params?.userId || -1;
    const hideOrderButton = route?.params?.hideOrderButton || false;

    const { colors } = useTheme();

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const productData = await productAPI.getProduct(restaurantId, productId, userId);
                setData(productData);
            } catch (err) {
                setError(err);
                console.error("Failed to fetch product:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleAddToOrder = async () => {
        try {
            setIsAdding(true);
            const currentUserId = await JwtHelper.getUserId();
            if (!currentUserId || currentUserId === -1) {
                Alert.alert("Error", "You must be logged in to order.");
                return;
            }
            await orderAPI.addProductToOrder(currentUserId, restaurantId, productId);
            Alert.alert("Success", "Product added to order!");
        } catch (err) {
            console.error("Failed to add to order:", err);
            Alert.alert("Error", "Failed to add product to order.");
        } finally {
            setIsAdding(false);
        }
    };

    const s = makeStyles(colors);

    if (error) return <View><Text style={{ color: colors.error }}>Error: {error?.message || String(error)}</Text></View>;
    if (isLoading) return <View><ActivityIndicator size="large" color={colors.primary} /></View>;

    const isLoggedIn = userId !== -1 && userId !== null;

    return (
        <View style={s.container}>
            {data?.name && <Text style={s.name}>{data.name}</Text>}
            {data?.description && <Text style={s.description}>{data.description}</Text>}
            {data?.price !== undefined && <Text style={s.price}>${data.price.toFixed(2)}</Text>}

            {isLoggedIn && !hideOrderButton && (
                <Pressable
                    style={({ pressed }) => [s.addButton, pressed && s.addButtonPressed]}
                    onPress={handleAddToOrder}
                    disabled={isAdding}
                >
                    {isAdding ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={s.addButtonText}>+</Text>
                    )}
                </Pressable>
            )}
        </View>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        container: { padding: 16, backgroundColor: colors.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 12, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
        title: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
        name: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
        description: { fontSize: 14, color: colors.subtext, marginBottom: 8 },
        price: { fontSize: 16, fontWeight: '500', color: colors.primary },
        addButton: { position: 'absolute', bottom: 8, right: 8, backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
        addButtonPressed: { transform: [{ scale: 1.15 }], backgroundColor: '#007bb5' },
        addButtonText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: -2 },
    });
}