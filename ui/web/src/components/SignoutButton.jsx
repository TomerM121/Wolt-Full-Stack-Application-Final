import React from 'react';
import { useNavigate } from 'react-router-dom';
import jwtHelper from '../../../shared/services/JwtHelper';

const SignoutButton = () => {
    const navigate = useNavigate();

    const handleSignout = async () => {
        if (await jwtHelper.isLoggedIn()) {
            await jwtHelper.logout(); 
            navigate('/');
        } else {
            alert('Can not sign out becasue you are not logged in');
        }
    };

    return (
        <button 
            onClick={handleSignout}
            style={{ 
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            Sign Out
        </button>
    );
};

export default SignoutButton;
