import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Switch,
    ActivityIndicator, ScrollView, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import auth from '../../../shared/api/auth.js';
import jwtHelper from '../../../shared/services/JwtHelper';
import NavigationBar from '../components/NavigationBar';
import { useTheme } from '../context/ThemeContext';

export default function AccountView() {
    const navigation = useNavigation();
    const { isDark, toggleTheme, colors } = useTheme();

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const data = await auth.getUser();
                setUser(data);
            } catch (err) {
                setError('Could not load account details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await jwtHelper.logout();
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                },
            },
        ]);
    };

    const s = makeStyles(colors);

    if (isLoading) {
        return (
            <View style={[s.container, s.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={s.container}>
            <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={s.header}>
                    <View style={s.avatarCircle}>
                        <Text style={s.avatarText}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                    <Text style={s.userName}>{user?.name || 'Unknown User'}</Text>
                    <Text style={s.userSubtitle}>@{user?.username || ''}</Text>
                </View>

                {/* Details Card */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>Account Details</Text>

                    {error ? (
                        <Text style={s.errorText}>{error}</Text>
                    ) : (
                        <>
                            <View style={s.detailRow}>
                                <Text style={s.detailLabel}>📛  Name</Text>
                                <Text style={s.detailValue}>{user?.name || '—'}</Text>
                            </View>
                            <View style={s.separator} />
                            <View style={s.detailRow}>
                                <Text style={s.detailLabel}>👤  Username</Text>
                                <Text style={s.detailValue}>{user?.username || '—'}</Text>
                            </View>
                            <View style={s.separator} />
                            <View style={s.detailRow}>
                                <Text style={s.detailLabel}>📞  Phone</Text>
                                <Text style={s.detailValue}>{user?.phone || '—'}</Text>
                            </View>
                            <View style={s.separator} />
                            <View style={s.detailRow}>
                                <Text style={s.detailLabel}>📍  Location</Text>
                                <Text style={s.detailValue}>
                                    {user?.location?.latitude != null
                                        ? `${user.location.latitude}, ${user.location.longitude}`
                                        : '—'}
                                </Text>
                            </View>
                            {user?.isOwner && (
                                <>
                                    <View style={s.separator} />
                                    <View style={s.detailRow}>
                                        <Text style={s.detailLabel}>🏪  Role</Text>
                                        <Text style={[s.detailValue, { color: colors.primary }]}>Restaurant Owner</Text>
                                    </View>
                                </>
                            )}
                        </>
                    )}
                </View>

                {/* Preferences Card */}
                <View style={s.card}>
                    <Text style={s.sectionTitle}>Preferences</Text>
                    <View style={s.detailRow}>
                        <Text style={s.detailLabel}>{isDark ? '🌙  Dark Mode' : '☀️  Light Mode'}</Text>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={isDark ? '#fff' : '#fff'}
                        />
                    </View>
                </View>

                {/* Owner Actions */}
                {user?.isOwner && (
                    <TouchableOpacity
                        style={s.ownerButton}
                        onPress={() => navigation.navigate('OwnerView')}
                        activeOpacity={0.85}
                    >
                        <Text style={s.ownerButtonText}>🏪  Manage My Restaurant</Text>
                    </TouchableOpacity>
                )}

                {/* Logout */}
                <TouchableOpacity
                    style={s.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.85}
                >
                    <Text style={s.logoutButtonText}>🚪  Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            <NavigationBar />
        </SafeAreaView>
    );
}

function makeStyles(colors) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        centered: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        scrollContent: {
            paddingHorizontal: 16,
            paddingBottom: 24,
        },
        header: {
            alignItems: 'center',
            paddingVertical: 32,
        },
        avatarCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
        },
        avatarText: {
            fontSize: 36,
            color: '#fff',
            fontWeight: 'bold',
        },
        userName: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4,
        },
        userSubtitle: {
            fontSize: 14,
            color: colors.subtext,
        },
        card: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            shadowColor: colors.cardShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 3,
        },
        sectionTitle: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.subtext,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: 12,
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
        },
        detailLabel: {
            fontSize: 15,
            color: colors.text,
            flex: 1,
        },
        detailValue: {
            fontSize: 15,
            color: colors.subtext,
            flex: 1,
            textAlign: 'right',
        },
        separator: {
            height: 1,
            backgroundColor: colors.border,
        },
        ownerButton: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 12,
        },
        ownerButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        logoutButton: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.error,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 12,
        },
        logoutButtonText: {
            color: colors.error,
            fontSize: 16,
            fontWeight: 'bold',
        },
        errorText: {
            color: colors.error,
            textAlign: 'center',
            paddingVertical: 8,
        },
    });
}
