import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import auth from '../../../shared/api/auth.js';
import jwtHelper from '../../../shared/services/JwtHelper.js';
import { useTheme } from '../context/ThemeContext';

const LoginView = ({ navigation }) => {
    const { colors } = useTheme();

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = await jwtHelper.isLoggedIn();
            if (token) {
                navigation.navigate('MainView');
            }
        };
        checkLoginStatus();
    }, [navigation]);

    const [formData, setFormData] = useState({ uname: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (name, value) => {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.uname || !formData.password) {
            setError('Please fill all the fields');
            return;
        }
        setError('');
        try {
            const data = await auth.login(formData.uname, formData.password);
            await jwtHelper.saveSession(data.token, data.userId);
            navigation.navigate('MainView');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Could not connect to the server.');
        }
    };

    const s = makeStyles(colors);

    return (
        <View style={s.container}>
            <Text style={s.title}>Login</Text>

            {error ? <Text style={s.errorMessage}>{error}</Text> : null}

            <View style={s.form}>
                <View style={s.formGroup}>
                    <Text style={s.label}>User name:</Text>
                    <TextInput
                        style={s.input}
                        value={formData.uname}
                        onChangeText={(text) => handleChange('uname', text)}
                        placeholder="Enter user name"
                        placeholderTextColor={colors.subtext}
                        autoCapitalize="none"
                    />
                </View>

                <View style={s.formGroup}>
                    <Text style={s.label}>Password</Text>
                    <TextInput
                        style={s.input}
                        value={formData.password}
                        onChangeText={(text) => handleChange('password', text)}
                        placeholder="Enter password"
                        placeholderTextColor={colors.subtext}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={s.loginButton} onPress={handleSubmit}>
                    <Text style={s.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <View style={s.registerContainer}>
                    <Text style={s.registerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={s.registerLink}>Register here</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

function makeStyles(colors) {
    return StyleSheet.create({
        container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: colors.background },
        title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: colors.text },
        errorMessage: { color: colors.error, backgroundColor: colors.errorBg, padding: 10, borderRadius: 5, textAlign: 'center', marginBottom: 16 },
        form: { backgroundColor: colors.surface, padding: 20, borderRadius: 10, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
        formGroup: { marginBottom: 16 },
        label: { fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 8 },
        input: { height: 40, borderColor: colors.border, borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, backgroundColor: colors.inputBg, color: colors.text },
        loginButton: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 5, alignItems: 'center', marginTop: 10 },
        loginButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
        registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
        registerText: { color: colors.subtext, fontSize: 14 },
        registerLink: { color: colors.primary, fontSize: 14, fontWeight: 'bold' },
    });
}

export default LoginView;