import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Menu from './views/MenuView';
import Login from './views/LoginView';
import Home from './views/HomePage';
import Register from './views/RegisterView';
import Owner from './views/OwnerView';
import Navbar from './components/NavBar';
import Product from './views/ProductView';
import Order from './views/OrderView';
import ManageView from './views/ManageView';
import OwnerView from './views/OwnerView';
import HomeView from './views/HomeView';
import Profile from './views/ProfileView';

//Init the JwtHelper to work with local storage
import jwtHelper from '../../shared/services/JwtHelper';
const webStorage = {
    setItem: (key, val) => Promise.resolve(localStorage.setItem(key, val)),
    getItem: (key) => Promise.resolve(localStorage.getItem(key)),
    removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};
jwtHelper.initStorage(webStorage);

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomeView />} />
                <Route path="/restaurant/:id/product/:pId" element={<Product />} />
                <Route path="/restaurant/:id" element={<Menu />} />
                <Route path="/restaurant" element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/owner' element={<Owner />} />
                <Route path='/order' element={<Order />} />
                <Route path='/profile' element={<Profile />} />
                <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;