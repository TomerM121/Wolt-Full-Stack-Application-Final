import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RestaurantCard from '../components/RestaurantCard';
import restaurantAPI from '../../../shared/api/restaurant';
import NavigationBar from '../components/NavigationBar';
import jwtHelper from '../../../shared/services/JwtHelper';
import { useTheme } from '../context/ThemeContext';

export default function MainView({ navigation, route }) {
    const { colors } = useTheme();

    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const fetchRestaurants = async () => {
                try {
                    setIsLoading(true);
                    const data = await restaurantAPI.getRestaurants();
                    setRestaurants(data || []);
                } catch (err) {
                    setError(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchRestaurants();
        }, [])
    );

    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 4;
    const totalPages = Math.ceil(restaurants.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const currentRestaurants = restaurants.slice(startIndex, startIndex + itemsPerPage);

    const handleNext = () => { if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1); };
    const handlePrev = () => { if (currentPage > 0) setCurrentPage(currentPage - 1); };

    const [userId, setUserId] = useState(null);
    useEffect(() => {
        const fetchUserId = async () => {
            const id = await jwtHelper.getUserId();
            if (id) setUserId(id);
        };
        fetchUserId();
    }, []);

    const handleRestaurantPress = (restaurantId) => {
        if (navigation) navigation.navigate('RestaurantView', { restaurantId, userId });
    };

    const s = makeStyles(colors);

    return (
        <SafeAreaView style={s.container}>
            <View style={s.contentWrapper}>
                <Text style={s.headerTitle}>Discover</Text>

                <View style={s.carouselSection}>
                    <Text style={s.woltTitle}>Wolt</Text>
                <Text style={s.sectionTitle}>Restaurants</Text>

                    {error ? (
                        <Text style={s.errorText}>Failed to load restaurants</Text>
                    ) : isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : restaurants.length === 0 ? (
                        <Text style={s.emptyText}>No restaurants available.</Text>
                    ) : (
                        <View>
                            <View style={s.gridContent}>
                                {currentRestaurants.map((restaurant) => (
                                    <View key={restaurant.id} style={s.gridItem}>
                                        <RestaurantCard
                                            restaurant={restaurant}
                                            onPress={() => handleRestaurantPress(restaurant.id)}
                                        />
                                    </View>
                                ))}
                            </View>
                            <View style={s.paginationControls}>
                                <TouchableOpacity
                                    style={[s.button, currentPage === 0 && s.buttonDisabled]}
                                    onPress={handlePrev}
                                    disabled={currentPage === 0}
                                >
                                    <Text style={s.buttonText}>Back</Text>
                                </TouchableOpacity>
                                <Text style={s.pageIndicator}>Page {currentPage + 1} of {totalPages || 1}</Text>
                                <TouchableOpacity
                                    style={[s.button, currentPage >= totalPages - 1 && s.buttonDisabled]}
                                    onPress={handleNext}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    <Text style={s.buttonText}>Next</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
            <NavigationBar />
        </SafeAreaView>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        contentWrapper: { flex: 1 },
        headerTitle: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginHorizontal: 16, marginBottom: 24 },
        carouselSection: {},
        woltTitle: { fontSize: 42, fontWeight: '900', color: colors.primary, marginHorizontal: 16, marginTop: -10, marginBottom: 12, letterSpacing: -1 },
        sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginHorizontal: 16, marginBottom: 12 },
        gridContent: { flexDirection: 'column', paddingHorizontal: 16, paddingBottom: 16 },
        gridItem: { width: '100%', marginBottom: 12 },
        errorText: { color: colors.error, textAlign: 'center', margin: 16 },
        emptyText: { textAlign: 'center', color: colors.subtext, fontStyle: 'italic', margin: 16 },
        paginationControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 8, marginBottom: 16 },
        button: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
        buttonDisabled: { backgroundColor: colors.buttonDisabled },
        buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
        pageIndicator: { fontSize: 16, color: colors.subtext, fontWeight: '600' },
    });
}