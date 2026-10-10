// React and React Native imports
import React, { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, StyleSheet, Image, Pressable } from "react-native";
import restaurantAPI from '../../../shared/api/restaurant';
import { useTheme } from '../context/ThemeContext';
import {CONFIG} from '../../../shared/config';
import { useNavigation } from '@react-navigation/native';

export default function Restaurant({ route }) {
    const navigation = useNavigation();

    const restaurantId = route?.params?.restaurantId || -1;
    const { colors } = useTheme();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                setIsLoading(true);
                const restaurantData = await restaurantAPI.getRestaurantById(restaurantId);
                setData(restaurantData);
            } catch (err) {
                setError(err);
                console.error("Failed to fetch restaurant:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurant();
    }, [restaurantId]);

    const s = makeStyles(colors);

    if (error) {
        return <View style={s.container}><Text style={s.errorText}>Error: {String(error)}</Text></View>;
    }
    if (isLoading) {
        return <View style={s.container}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    const backendUrl = CONFIG.BACKEND_URL;

    return (
        <View style={s.container}>
            <Pressable 
                style={({ pressed }) => [
                    s.backButton, 
                    { opacity: pressed ? 0.6 : 1 }
                ]}
                onPress={() => navigation.goBack()}
                >
                <Text style={{ color: 'black' }}>Back</Text>
            </Pressable>
            <View style={s.infoContainer}>
                {data?.image && (
                <Image 
                    source={{ uri: `${backendUrl}${data.image}` }} 
                    style={s.image} 
                />
                )}
                {data?.name && <Text style={s.name}>{data.name}</Text>}
                {data?.description && <Text style={s.description}>{data.description}</Text>}
                {data?.distance !== undefined && (
                    <Text style={s.distanceText}>{data.distance.toFixed(1)} km away</Text>
                )}
            </View>
        </View>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        container: { padding: 16, backgroundColor: colors.surface, borderRadius: 12, margin: 16, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
        backButton: {
            position: 'absolute',
            top: 40,
            left: 20,
            zIndex: 10,
            padding: 8,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 5,
        },
        image: {
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: 12,
        },
        distanceText: { fontSize: 14, fontWeight: '600', color: colors.primary, marginTop: 8 },
        infoContainer: { paddingTop: 4 },
        name: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
        description: { fontSize: 14, color: colors.subtext },
        errorText: { fontSize: 16, color: colors.error, textAlign: 'center' },
    });
}