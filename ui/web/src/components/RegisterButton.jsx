import React from 'react';
import { useNavigate } from 'react-router-dom';
import jwtHelper from '../../../shared/services/JwtHelper';

const RegisterButton = () => {
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (await jwtHelper.isLoggedIn()) {
            alert('You are already logged in');
        } else {
            navigate('/register');
        }
    };

    return (
        <button 
            onClick={handleRegister}
            style={{ 
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            Register
        </button>
    );
};

export default RegisterButton;
