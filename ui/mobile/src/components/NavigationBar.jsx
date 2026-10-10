import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import jwtHelper from '../../../shared/services/JwtHelper';
import { useTheme } from '../context/ThemeContext';

/**
 * Bottom Navigation Bar — shows Account (logged in) or Guest (not logged in).
 * Automatically re-checks login status each time it renders.
 */
export default function NavigationBar() {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors } = useTheme();

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkLogin = async () => {
            const loggedIn = await jwtHelper.isLoggedIn();
            setIsLoggedIn(loggedIn);
        };
        checkLogin();
    }, [route]);

    const tabs = [
        { name: 'MainView', label: 'Discovery', icon: '🏠' },
        { name: 'SearchView', label: 'Search', icon: '🔍' },
        { name: 'OrdersView', label: 'Orders', icon: '🛵' },
        {
            name: 'AccountView',
            label: isLoggedIn ? 'Account' : 'Guest',
            icon: '👤',
        },
    ];

    return (
        <View style={{ backgroundColor: colors.navBar }}>
            <View style={[styles.container, { backgroundColor: colors.navBar }]}>
                {tabs.map((tab) => {
                    const isActive = route.name === tab.name;
                    return (
                        <TouchableOpacity
                            key={tab.name}
                            style={styles.tabButton}
                            onPress={() => navigation.navigate(tab.name)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.icon, { opacity: isActive ? 1 : 0.7 }]}>
                                {tab.icon}
                            </Text>
                            <Text style={[
                                styles.label,
                                { color: isActive ? colors.navBarTextActive : colors.navBarText },
                                isActive && styles.activeLabel,
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 60,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    icon: {
        fontSize: 22,
        marginBottom: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
    },
    activeLabel: {
        fontWeight: 'bold',
    },
});