import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import auth from '../../../shared/api/auth';
import jwtHelper from '../../../shared/services/JwtHelper';
import restaurantApi from '../../../shared/api/restaurant';

import SearchBar from './SearchBar';
import SignoutButton from './SignoutButton';
import LoginButton from './LoginButton';
import RegisterButton from './RegisterButton';

/**
 * Navbar component.
 *
 * Responsibilities:
 * - Navigate between main pages.
 * - Display the search bar.
 * - Forward search requests to the parent component.
 *
 * The actual search logic is handled by HomePage.
 */
const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOwner, setIsOwner] = useState(false);
    const [restaurantId, setRestaurantId] = useState(null);

    // Dark mode state
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Apply theme to html root and save
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Re-run the owner check on every page navigation so login state is always fresh
    useEffect(() => {
        const checkOwnerStatus = async () => {
            const loggedIn = await jwtHelper.isLoggedIn();
            setIsLoggedIn(loggedIn);
            if (!loggedIn) {
                setIsOwner(false);
                setRestaurantId(null);
                return;
            }

            try {
                const userDetails = await auth.getUser();
                if (userDetails && userDetails.isOwner) {
                    setIsOwner(true);
                    try {
                        const rest = await restaurantApi.getMyRestaurant();
                        console.log('[NavBar] getMyRestaurant returned:', rest);
                        if (rest && rest.id) {
                            setRestaurantId(rest.id);
                        }
                    } catch (e) {
                        console.log("[NavBar] Owner doesn't have a restaurant yet:", e.message);
                    }
                } else {
                    setIsOwner(false);
                    setRestaurantId(null);
                }
            } catch (err) {
                console.error("Failed to fetch user details", err);
            }
        };

        checkOwnerStatus();
    }, [location.pathname]); // re-run on every route change

    const handleOwnerDashboard = () => {
        if (isOwner && restaurantId) {
            navigate(`/manager/${restaurantId}`);
        } else {
            alert('You are not a manager access denied');
        }
    };

    const handleOwnerView = async () => {
        const user = await auth.getUser();
        console.log("User object from auth:", user);
        if (user && user.isOwner === true) {
            navigate(`/owner`);
        } else {
            alert('You are not an owner access denied');
        }
    };

    const handleProfileView = async () => {
        navigate(`/profile`);
    };

    return (
        <nav className="navbar">
            {/* Brand name on the left */}
            <div className="navbar-brand" onClick={() => navigate('/')}>
                Wolt
            </div>

            <div className="navbar-search">
                <SearchBar onSearch={(query) => {
                    if (query.trim()) {
                        navigate(`/restaurant?search=${encodeURIComponent(query)}`);
                    } else {
                        navigate(`/restaurant`);
                    }
                }} />
            </div>

            <ul className="navbar-links">
                {/* --- Buttons everyone sees --- */}
                <li>
                    <button onClick={() => navigate('/')}>Home</button>
                </li>
                <li>
                    <button onClick={() => navigate('/restaurant')}>Restaurants</button>
                </li>
                <li>
                    <button onClick={toggleTheme}>
                        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                </li>

                {/* What logged in see */}
                {isLoggedIn ? (
                    <>
                        {/*What owners see*/}
                        {isOwner && (
                            <li>
                                <button onClick={handleOwnerView} className="owner-dashboard-btn">
                                    Owner Dashboard
                                </button>
                            </li>
                        )}

                        <li>
                            <button onClick={() => navigate('/order')}>My Cart</button>
                        </li>
                         <li>
                                <button onClick={handleProfileView} className="">
                                    Profile
                                </button>
                            </li>
                        <li>
                            <SignoutButton />
                        </li>
                    </>
                ) : (
                    <>
                        {/* What guests see */}
                        <li>
                            <RegisterButton />
                        </li>
                        <li>
                            <LoginButton />
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;