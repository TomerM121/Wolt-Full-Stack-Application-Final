import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function RestaurantCard({ restaurant, onPress }) {
    const { colors } = useTheme();
    const s = makeStyles(colors);
    return (
        <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
            <View style={s.infoContainer}>
                <Text style={s.name} numberOfLines={1}>{restaurant.name}</Text>
                {restaurant.description && (
                    <Text style={s.description} numberOfLines={2}>{restaurant.description}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        card: { width: '100%', backgroundColor: colors.surface, borderRadius: 12, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginVertical: 8 },
        infoContainer: { padding: 16 },
        name: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
        description: { fontSize: 14, color: colors.subtext, marginBottom: 8 },
    });
}
