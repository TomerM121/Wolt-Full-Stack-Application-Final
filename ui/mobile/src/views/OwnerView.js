import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import auth from '../../../shared/api/auth.js';
import restaurantApi from '../../../shared/api/restaurant.js';
import jwtHelper from '../../../shared/services/JwtHelper';
import { useTheme } from '../context/ThemeContext';
import NavigationBar from '../components/NavigationBar';

const OwnerView = () => {
    const { colors } = useTheme();

    const [restaurant, setRestaurant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);

    const navigation = useNavigation();

    const [formData, setFormData] = useState({ name: '', description: '', latitude: '', longitude: '' });
    const [editData, setEditData] = useState({ name: '', description: '', latitude: '', longitude: '' });
    const [productData, setProductData] = useState({ name: '', description: '', price: '' });
    const [editProductData, setEditProductData] = useState({ name: '', description: '', price: '' });

    useEffect(() => {
        const checkOwnerStatus = async () => {
            try {
                if (!(await jwtHelper.isLoggedIn())) {
                    navigation.navigate('Login');
                    return;
                }
                const userDetails = await auth.getUser();
                if (!userDetails) {
                    setError('Access Denied: No details found.');
                    setIsLoading(false);
                    return;
                }
                if (!userDetails.isOwner) {
                    setError('Access Denied: You are not a restaurant owner.');
                    setIsLoading(false);
                    return;
                }
                await fetchRestaurantDetails();
            } catch (err) {
                console.error("Authentication failed:", err.message);
                navigation.navigate('Login');
            }
        }
        checkOwnerStatus();
    }, [navigation]);

    const fetchRestaurantDetails = async () => {
        try {
            const data = await restaurantApi.getMyRestaurant();
            setRestaurant(data);
        } catch (err) {
            setRestaurant(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSubmit = async () => {
        try {
            const newRestaurant = {
                name: formData.name,
                description: formData.description,
                location: { latitude: Number(formData.latitude), longitude: Number(formData.longitude) }
            };
            await restaurantApi.createRestaurant(newRestaurant);
            setIsLoading(true);
            await fetchRestaurantDetails();
        } catch (err) {
            setError('Failed to create restaurant: ' + err.message);
        }
    };

    const handleStartEditing = () => {
        setEditData({
            name: restaurant.name,
            description: restaurant.description,
            latitude: restaurant.location?.latitude ? String(restaurant.location.latitude) : '',
            longitude: restaurant.location?.longitude ? String(restaurant.location.longitude) : ''
        });
        setIsEditing(true);
    };

    const handleEditSubmit = async () => {
        try {
            setIsLoading(true);
            const updatedRestaurant = {
                name: editData.name,
                description: editData.description,
                location: { latitude: Number(editData.latitude), longitude: Number(editData.longitude) }
            };
            await restaurantApi.updateRestaurant(restaurant.id, updatedRestaurant);
            await fetchRestaurantDetails();
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update restaurant: ' + err.message);
            setIsLoading(false);
        }
    };

    const handleAddProductSubmit = async () => {
        const priceNum = Number(productData.price);
        if (!productData.price || isNaN(priceNum) || priceNum < 0) {
            Alert.alert("Error", "Please enter a valid price (must be 0 or greater).");
            return;
        }
        try {
            setIsLoading(true);
            await restaurantApi.addProduct(restaurant.id, {
                name: productData.name,
                description: productData.description,
                price: priceNum
            });
            setProductData({ name: '', description: '', price: '' });
            setIsAddingProduct(false);
            await fetchRestaurantDetails();
        } catch (err) {
            setError('Failed to add product: ' + err.message);
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = (productId) => {
        Alert.alert("Confirm Deletion", "Are you sure you want to delete this product?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive",
                onPress: async () => {
                    try {
                        setIsLoading(true);
                        await restaurantApi.deleteProduct(restaurant.id, productId);
                        await fetchRestaurantDetails();
                    } catch (err) {
                        setError('Failed to delete product: ' + err.message);
                        setIsLoading(false);
                    }
                }
            }
        ]);
    };

    const startEditProduct = (product) => {
        setEditingProductId(product.id);
        setEditProductData({ 
            name: product.name, 
            description: product.description,
            price: product.price !== undefined ? String(product.price) : ''
        });
    };

    const handleUpdateProduct = async (productId) => {
        if (editProductData.price !== undefined && editProductData.price !== '') {
            const priceNum = Number(editProductData.price);
            if (isNaN(priceNum) || priceNum < 0) {
                Alert.alert("Error", "Please enter a valid price (must be 0 or greater).");
                return;
            }
        }
        try {
            setIsLoading(true);
            const payload = {
                name: editProductData.name,
                description: editProductData.description,
                ...(editProductData.price !== '' && { price: Number(editProductData.price) })
            };
            await restaurantApi.updateProduct(restaurant.id, productId, payload);
            setEditingProductId(null);
            await fetchRestaurantDetails();
        } catch (err) {
            setError('Failed to update product: ' + err.message);
            setIsLoading(false);
        }
    };

    const handleCloseRestaurant = () => {
        Alert.alert("Close Restaurant", "Are you sure you want to close your restaurant? This action cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Close It", style: "destructive",
                onPress: async () => {
                    try {
                        setIsLoading(true);
                        await restaurantApi.deleteRestaurant(restaurant.id);
                        setRestaurant(null);
                    } catch (err) {
                        setError('Failed to delete restaurant: ' + err.message);
                    } finally {
                        setIsLoading(false);
                    }
                }
            }
        ]);
    };

    const s = makeStyles(colors);

    if (isLoading) {
        return (
            <View style={s.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={s.loadingText}>Loading your dashboard...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={s.errorContainer}>
                <Text style={s.errorText}>{error}</Text>
            </View>
        );
    }

    if (!restaurant) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <ScrollView contentContainerStyle={s.container}>
                    <Text style={s.heading}>Welcome! Let's set up your new restaurant.</Text>
                    <View style={s.formContainer}>
                        <TextInput style={s.input} placeholderTextColor={colors.subtext} placeholder="Restaurant Name" value={formData.name} onChangeText={text => setFormData({ ...formData, name: text })} />
                        <TextInput style={[s.input, s.textArea]} placeholderTextColor={colors.subtext} placeholder="Description" multiline value={formData.description} onChangeText={text => setFormData({ ...formData, description: text })} />
                        <TextInput style={s.input} placeholderTextColor={colors.subtext} placeholder="Latitude" keyboardType="numeric" value={formData.latitude} onChangeText={text => setFormData({ ...formData, latitude: text })} />
                        <TextInput style={s.input} placeholderTextColor={colors.subtext} placeholder="Longitude" keyboardType="numeric" value={formData.longitude} onChangeText={text => setFormData({ ...formData, longitude: text })} />
                        <TouchableOpacity style={s.primaryButton} onPress={handleCreateSubmit}>
                            <Text style={s.buttonText}>Create My Restaurant</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (isEditing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <ScrollView contentContainerStyle={s.container}>
                    <Text style={s.heading}>Edit Restaurant Details</Text>
                    <View style={s.formContainer}>
                        <Text style={s.label}>Name:</Text>
                        <TextInput style={s.input} value={editData.name} onChangeText={text => setEditData({ ...editData, name: text })} />
                        <Text style={s.label}>Description:</Text>
                        <TextInput style={[s.input, s.textArea]} multiline value={editData.description} onChangeText={text => setEditData({ ...editData, description: text })} />
                        <Text style={s.label}>Latitude:</Text>
                        <TextInput style={s.input} keyboardType="numeric" value={editData.latitude} onChangeText={text => setEditData({ ...editData, latitude: text })} />
                        <Text style={s.label}>Longitude:</Text>
                        <TextInput style={s.input} keyboardType="numeric" value={editData.longitude} onChangeText={text => setEditData({ ...editData, longitude: text })} />

                        <View style={s.buttonRow}>
                            <TouchableOpacity style={s.successButton} onPress={handleEditSubmit}>
                                <Text style={s.buttonText}>Save Changes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.defaultButton} onPress={() => setIsEditing(false)}>
                                <Text style={s.defaultButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (isAddingProduct) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <ScrollView contentContainerStyle={s.container}>
                    <Text style={s.heading}>Add New Product</Text>
                    <View style={s.formContainer}>
                        <TextInput style={s.input} placeholderTextColor={colors.subtext} placeholder="Product Name" value={productData.name} onChangeText={text => setProductData({ ...productData, name: text })} />
                        <TextInput style={[s.input, s.textArea]} placeholderTextColor={colors.subtext} placeholder="Description" multiline value={productData.description} onChangeText={text => setProductData({ ...productData, description: text })} />
                        <TextInput style={s.input} placeholderTextColor={colors.subtext} placeholder="Price (e.g. 9.99)" keyboardType="numeric" value={productData.price} onChangeText={text => setProductData({ ...productData, price: text })} />

                        <View style={s.buttonRow}>
                            <TouchableOpacity style={s.successButton} onPress={handleAddProductSubmit}>
                                <Text style={s.buttonText}>Save Product</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.defaultButton} onPress={() => setIsAddingProduct(false)}>
                                <Text style={s.defaultButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={s.container}>
                <Text style={s.title}>Manage: {restaurant.name}</Text>
                <Text style={s.infoText}><Text style={s.boldText}>Description:</Text> {restaurant.description}</Text>
                <Text style={s.infoText}><Text style={s.boldText}>Location:</Text> {restaurant.location?.latitude}, {restaurant.location?.longitude}</Text>

                <View style={s.hr} />

                <View style={s.menuSection}>
                    <Text style={s.subHeading}>Menu</Text>
                    {!restaurant.products || restaurant.products.length === 0 ? (
                        <Text style={s.emptyText}>The menu is empty.</Text>
                    ) : (
                        <View>
                            {restaurant.products.map(product => (
                                <View key={product.id} style={s.listItem}>
                                    {editingProductId === product.id ? (
                                        <View style={s.productEditForm}>
                                            <TextInput style={s.input} value={editProductData.name} onChangeText={text => setEditProductData({ ...editProductData, name: text })} />
                                            <TextInput style={[s.input, s.textArea]} multiline value={editProductData.description} onChangeText={text => setEditProductData({ ...editProductData, description: text })} />
                                            <TextInput style={s.input} keyboardType="numeric" placeholder="Price" value={editProductData.price} onChangeText={text => setEditProductData({ ...editProductData, price: text })} />
                                            <View style={s.buttonRow}>
                                                <TouchableOpacity style={s.primaryButton} onPress={() => handleUpdateProduct(product.id)}>
                                                    <Text style={s.buttonText}>Save Update</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={s.defaultButton} onPress={() => setEditingProductId(null)}>
                                                    <Text style={s.defaultButtonText}>Cancel</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={s.productRow}>
                                            <View style={s.productInfo}>
                                                <Text style={s.boldText}>{product.name}</Text>
                                                <Text style={s.productDescription}>{product.description}</Text>
                                                {product.price !== undefined && (
                                                    <Text style={s.productPrice}>${Number(product.price).toFixed(2)}</Text>
                                                )}
                                            </View>
                                            <View style={s.productActions}>
                                                <TouchableOpacity style={s.smallButton} onPress={() => startEditProduct(product)}>
                                                    <Text style={s.smallButtonText}>Edit</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={s.dangerSmallButton} onPress={() => handleDeleteProduct(product.id)}>
                                                    <Text style={s.buttonText}>Delete</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={s.hr} />

                <View style={s.adminActions}>
                    <TouchableOpacity style={s.primaryButton} onPress={() => setIsAddingProduct(true)}>
                        <Text style={s.buttonText}>Add Product</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.primaryButton} onPress={handleStartEditing}>
                        <Text style={s.buttonText}>Edit Restaurant Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.dangerButton} onPress={handleCloseRestaurant}>
                        <Text style={s.buttonText}>Close Restaurant</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <NavigationBar />
        </SafeAreaView>
    );
};

function makeStyles(colors) {
    return StyleSheet.create({
        container: { flexGrow: 1, padding: 20, backgroundColor: colors.background, paddingBottom: 40 },
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
        loadingText: { marginTop: 10, fontSize: 16, color: colors.subtext },
        errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.background },
        errorText: { color: colors.error, fontSize: 16, textAlign: 'center' },
        heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: colors.text, textAlign: 'center' },
        title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: colors.text },
        subHeading: { fontSize: 22, fontWeight: '600', marginBottom: 15, color: colors.text },
        infoText: { fontSize: 16, marginBottom: 5, color: colors.text },
        boldText: { fontWeight: 'bold', color: colors.text },
        hr: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
        formContainer: { backgroundColor: colors.surface, padding: 20, borderRadius: 10, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
        label: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: colors.text },
        input: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, color: colors.text, marginBottom: 15 },
        textArea: { minHeight: 100, textAlignVertical: 'top' },
        buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
        primaryButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
        successButton: { backgroundColor: colors.success, paddingVertical: 14, borderRadius: 8, alignItems: 'center', flex: 1, marginRight: 10 },
        dangerButton: { backgroundColor: colors.error, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
        defaultButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, borderRadius: 8, alignItems: 'center', flex: 1, marginLeft: 10 },
        buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
        defaultButtonText: { color: colors.text, fontSize: 16, fontWeight: '600' },
        menuSection: { marginBottom: 20 },
        emptyText: { fontStyle: 'italic', color: colors.subtext, fontSize: 16 },
        listItem: { backgroundColor: colors.surface, borderRadius: 8, padding: 15, marginBottom: 10, shadowColor: colors.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
        productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        productInfo: { flex: 1, paddingRight: 10 },
        productDescription: { color: colors.subtext, marginTop: 4, fontSize: 14 },
        productPrice: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 4 },
        productActions: { flexDirection: 'row', alignItems: 'center' },
        productEditForm: { width: '100%' },
        smallButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginRight: 8 },
        smallButtonText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
        dangerSmallButton: { backgroundColor: colors.error, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
        adminActions: { marginTop: 10 },
    });
}

export default OwnerView;