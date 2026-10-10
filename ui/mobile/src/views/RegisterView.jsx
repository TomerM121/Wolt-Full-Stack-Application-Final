import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Button, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import auth from '../../../shared/api/auth.js';
import jwtHelper from '../../../shared/services/JwtHelper.js';
import { useTheme } from '../context/ThemeContext';

const RegisterView = ({ navigation }) => {
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

    const [formData, setFormData] = useState({
        uname: '', name: '', phone: '', latitude: '', longitude: '',
        password: '', confirmPassword: '', isOwner: false
    });

    const [logoFile, setLogoFile] = useState(null);
    const [error, setError] = useState('');

    const handleChangeText = (name, value) => {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSwitchChange = (value) => {
        setFormData((prevData) => ({ ...prevData, isOwner: value }));
    };

    const handleFilePick = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) {
            setLogoFile(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!formData.uname || !formData.name || !formData.phone || !formData.latitude || !formData.longitude || !formData.password || !formData.confirmPassword) {
            setError('Please fill all the fields');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');

        try {
            const logoData = logoFile ? {
                uri: logoFile.uri,
                name: `photo.${logoFile.uri.split('.').pop() || 'jpg'}`,
                type: logoFile.mimeType || 'image/jpeg',
            } : null;

            const data = await auth.register(formData.uname, formData.name, formData.phone, formData.latitude, formData.longitude, formData.password, logoData, formData.isOwner);
            const loginData = await auth.login(formData.uname, formData.password);
            await jwtHelper.saveSession(loginData.token, loginData.userId);
            navigation.navigate('MainView');
        } catch (err) {
            setError(err.message || 'Could not connect to the server.');
        }
    };

    const s = makeStyles(colors);

    return (
        <ScrollView contentContainerStyle={s.pageWrapper}>
            <View style={s.registerContainer}>
                <Text style={s.title}>Register</Text>

                {error ? <Text style={s.errorMessage}>{error}</Text> : null}

                <View style={s.formGroup}>
                    <Text style={s.label}>User name:</Text>
                    <TextInput style={s.input} value={formData.uname} onChangeText={(t) => handleChangeText('uname', t)} placeholder="Enter user name" placeholderTextColor={colors.subtext} autoCapitalize="none" />
                </View>

                <View style={s.formGroup}>
                    <Text style={s.label}>Name:</Text>
                    <TextInput style={s.input} value={formData.name} onChangeText={(t) => handleChangeText('name', t)} placeholder="Enter your name" placeholderTextColor={colors.subtext} />
                </View>

                <View style={s.formGroup}>
                    <Text style={s.label}>Latitude (Y):</Text>
                    <TextInput style={s.input} value={formData.latitude} onChangeText={(t) => handleChangeText('latitude', t)} placeholder="e.g. 31.9639" placeholderTextColor={colors.subtext} keyboardType="numeric" />
                </View>

                <View style={s.formGroup}>
                    <Text style={s.label}>Longitude (X):</Text>
                    <TextInput style={s.input} value={formData.longitude} onChangeText={(t) => handleChangeText('longitude', t)} placeholder="e.g. 34.8015" placeholderTextColor={colors.subtext} keyboardType="numeric" />
                </View>

                <View style={s.formGroup}>
                    <Text style={s.label}>Phone:</Text>
                    <TextInput style={s.input} value={formData.phone} onChangeText={(t) => handleChangeText('phone', t)} placeholder="Enter your phone" placeholderTextColor={colors.subtext} keyboardType="phone-pad" />
                </View>

                <View style={s.formGroup}>
                    <Text style={s.label}>Password:</Text>
                    <TextInput style={s.input} value={formData.password} onChangeText={(t) => handleChangeText('password', t)} placeholder="Enter password" placeholderTextColor={colors.subtext} secureTextEntry />
                </View>

                <View style={s.formGroup}>
                    <Text style={s.label}>Confirm Password:</Text>
                    <TextInput style={s.input} value={formData.confirmPassword} onChangeText={(t) => handleChangeText('confirmPassword', t)} placeholder="Confirm your password" placeholderTextColor={colors.subtext} secureTextEntry />
                </View>

                <View style={s.formGroup}>
                    <Text style={s.label}>User Logo:</Text>
                    <Button title={logoFile ? "Change Image" : "Pick an Image"} onPress={handleFilePick} color={colors.primary} />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Switch value={formData.isOwner} onValueChange={handleSwitchChange} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={formData.isOwner ? '#fff' : '#fff'} />
                    <Text style={{ marginLeft: 10, color: colors.text }}>I am a restaurant owner</Text>
                </View>

                <TouchableOpacity style={s.registerButton} onPress={handleSubmit}>
                    <Text style={s.registerButtonText}>Register</Text>
                </TouchableOpacity>

                <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <Text style={{ color: colors.text }}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={{ color: colors.primary, textDecorationLine: 'underline', marginTop: 4, fontWeight: 'bold' }}>Login here</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

function makeStyles(colors) {
    return StyleSheet.create({
        pageWrapper: { flexGrow: 1, justifyContent: 'center', padding: 16, backgroundColor: colors.background },
        registerContainer: { backgroundColor: colors.surface, padding: 20, borderRadius: 10, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
        title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: colors.text },
        errorMessage: { color: colors.error, backgroundColor: colors.errorBg, padding: 10, borderRadius: 5, textAlign: 'center', marginBottom: 16 },
        formGroup: { marginBottom: 16 },
        label: { fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 8 },
        input: { height: 40, borderColor: colors.border, borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, backgroundColor: colors.inputBg, color: colors.text },
        registerButton: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 5, alignItems: 'center', marginTop: 10 },
        registerButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
    });
}

export default RegisterView;