import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RestaurantCard from '../components/RestaurantCard';
import restaurantAPI from '../../../shared/api/restaurant';
import NavigationBar from '../components/NavigationBar';
import jwtHelper from '../../../shared/services/JwtHelper';
import { useTheme } from '../context/ThemeContext';

export default function SearchView({ navigation }) {
    const { colors } = useTheme();

    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const id = await jwtHelper.getUserId();
                if (id) setUserId(id);

                const data = await restaurantAPI.getRestaurants();
                setRestaurants(data || []);
                const all = (data || []).map(r => ({ type: 'restaurant', id: `res-${r.id}`, data: r }));
                setFilteredRestaurants(all);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Filter restaurants when searchQuery changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            const all = restaurants.map(r => ({ type: 'restaurant', id: `res-${r.id}`, data: r }));
            setFilteredRestaurants(all);
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered = [];

        restaurants.forEach(restaurant => {
            let restaurantMatches = false;
            // Check restaurant name and description
            if (restaurant.name && restaurant.name.toLowerCase().includes(query)) restaurantMatches = true;
            if (restaurant.description && restaurant.description.toLowerCase().includes(query)) restaurantMatches = true;

            if (restaurantMatches) {
                filtered.push({ type: 'restaurant', id: `res-${restaurant.id}`, data: restaurant });
            }

            // Check products within the restaurant (if they exist)
            if (restaurant.products && Array.isArray(restaurant.products)) {
                for (let product of restaurant.products) {
                    let productMatches = false;
                    if (product.name && product.name.toLowerCase().includes(query)) productMatches = true;
                    if (product.description && product.description.toLowerCase().includes(query)) productMatches = true;

                    if (productMatches) {
                        filtered.push({
                            type: 'product',
                            id: `prod-${product.id || product.productId}`,
                            data: product,
                            restaurantId: restaurant.id,
                            restaurantName: restaurant.name
                        });
                    }
                }
            }
        });

        setFilteredRestaurants(filtered);
    }, [searchQuery, restaurants]);

    const handleRestaurantPress = (restaurantId) => {
        navigation.navigate('RestaurantView', { restaurantId, userId });
    };

    const s = makeStyles(colors);

    const renderItem = ({ item, index }) => {
        if (item.type === 'restaurant') {
            return (
                <View style={s.gridItem}>
                    <Text style={s.badge}>Restaurant</Text>
                    <RestaurantCard
                        restaurant={item.data}
                        onPress={() => handleRestaurantPress(item.data.id)}
                    />
                </View>
            );
        } else if (item.type === 'product') {
            // Check if the previous item was also a product from the same restaurant
            const prevItem = index > 0 ? filteredRestaurants[index - 1] : null;
            const showLabel = !(prevItem && prevItem.type === 'product' && prevItem.restaurantId === item.restaurantId);

            return (
                <TouchableOpacity
                    style={s.gridItem}
                    onPress={() => handleRestaurantPress(item.restaurantId)}
                    activeOpacity={0.8}
                >
                    {showLabel && <Text style={s.badgeProduct}>{item.restaurantName} Menu</Text>}
                    {/* Render inline — Product component calls getProduct per item (hits ViewService socket) */}
                    <View style={s.productCard}>
                        <View style={s.productInfo}>
                            <Text style={s.productName}>{item.data.name}</Text>
                            {item.data.description ? (
                                <Text style={s.productDescription}>{item.data.description}</Text>
                            ) : null}
                        </View>
                        {item.data.price !== undefined ? (
                            <Text style={s.productPrice}>${Number(item.data.price).toFixed(2)}</Text>
                        ) : null}
                    </View>
                </TouchableOpacity>
            );
        }
        return null;
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <Text style={s.headerTitle}>Search</Text>
                <TextInput
                    style={s.searchInput}
                    placeholder="Search for restaurants, dishes..."
                    placeholderTextColor={colors.subtext}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                />
            </View>

            <View style={s.content}>
                {error ? (
                    <Text style={s.errorText}>Failed to load data</Text>
                ) : isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={s.loader} />
                ) : filteredRestaurants.length === 0 ? (
                    <Text style={s.emptyText}>No matches found for "{searchQuery}".</Text>
                ) : (
                    <FlatList
                        data={filteredRestaurants}
                        keyExtractor={item => String(item.id)}
                        renderItem={renderItem}
                        contentContainerStyle={s.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <NavigationBar />
        </SafeAreaView>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.background, zIndex: 1 },
        headerTitle: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
        searchInput: { backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: colors.text, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
        content: { flex: 1 },
        loader: { marginTop: 40 },
        listContainer: { paddingHorizontal: 12, paddingBottom: 20 },
        gridItem: { marginHorizontal: 4, marginBottom: 8 },
        errorText: { color: colors.error, textAlign: 'center', margin: 16, marginTop: 40 },
        emptyText: { textAlign: 'center', color: colors.subtext, fontStyle: 'italic', margin: 16, marginTop: 40 },
        badge: { fontSize: 12, fontWeight: 'bold', color: '#fff', backgroundColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: -4, marginLeft: 8, overflow: 'hidden', zIndex: 1 },
        badgeProduct: { fontSize: 16, fontWeight: 'bold', color: colors.text, backgroundColor: 'transparent', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 8, marginBottom: -8, marginLeft: 8, zIndex: 1 },
        // Inline product card for search results
        productCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
        productInfo: { flex: 1, marginRight: 12 },
        productName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 },
        productDescription: { fontSize: 13, color: colors.subtext },
        productPrice: { fontSize: 14, fontWeight: '700', color: colors.primary },
    });
}
