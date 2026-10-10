import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import the views
import Login from './src/views/LoginView';
import Register from './src/views/RegisterView';
import MainView from './src/views/MainView';
import OrdersView from './src/views/OrdersView';
import CartView from './src/views/CartView';
import OrderHistoryView from './src/views/OrderHistoryView';
import SearchView from './src/views/SearchView';
import RestaurantView from './src/views/RestaurantView';
import CheckoutView from './src/views/CheckoutView';
import AccountView from './src/views/AccountView';
import OwnerView from './src/views/OwnerView';

// Theme
import { ThemeProvider } from './src/context/ThemeContext';

// Init the JwtHelper to work with async storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtHelper from '../shared/services/JwtHelper';
jwtHelper.initStorage(AsyncStorage);

// Init the config url according to android or ios
import { Platform } from 'react-native';
import { setBaseUrl } from '../shared/config';
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
setBaseUrl(BASE_URL);

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <ThemeProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    {/* Authentication */}
                    <Stack.Screen name="Login" component={Login} options={{ title: 'Login', headerShown: false }} />
                    <Stack.Screen name="Register" component={Register} options={{ title: 'Register', headerShown: false }} />

                    {/* Main Application */}
                    <Stack.Screen name="MainView" component={MainView} options={{ title: 'Discovery', headerShown: false }} />
                    <Stack.Screen name="RestaurantView" component={RestaurantView} options={{ title: 'Restaurant', headerShown: false }} />
                    <Stack.Screen name="SearchView" component={SearchView} options={{ title: 'Search', headerShown: false }} />
                    <Stack.Screen name="OrdersView" component={OrdersView} options={{ title: 'Active Orders', headerShown: false }} />
                    <Stack.Screen name="CartView" component={CartView} options={{ title: 'Cart', headerShown: false }} />
                    <Stack.Screen name="OrderHistoryView" component={OrderHistoryView} options={{ title: 'Order History', headerShown: false }} />
                    <Stack.Screen name="checkout" component={CheckoutView} options={{ title: 'Checkout', headerShown: false }} />
                    <Stack.Screen name="AccountView" component={AccountView} options={{ title: 'Account', headerShown: false }} />
                    <Stack.Screen name="OwnerView" component={OwnerView} options={{ title: 'Owner Dashboard', headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    );
}