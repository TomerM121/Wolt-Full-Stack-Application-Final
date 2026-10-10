import React from 'react';
import { useNavigate } from 'react-router-dom';
import jwtHelper from '../../../shared/services/JwtHelper';

const LoginButton = () => {
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (await jwtHelper.isLoggedIn()) {
            alert('You are already logged in');
        } else {
            navigate('/login');
        }
    };

    return (
        <button 
            onClick={handleLogin}
            style={{ 
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            Log in
        </button>
    );
};

export default LoginButton;
