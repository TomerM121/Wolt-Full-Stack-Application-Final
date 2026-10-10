import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignoutButton from '../components/SignoutButton';
import jwtHelper from '../../../shared/services/JwtHelper';

const HomeView = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
          const checkAuthStatus = async () => {
              const status = await jwtHelper.isLoggedIn();
              setIsLoggedIn(status);
          };
          
          checkAuthStatus();
      }, [[location.pathname]]);

  const actionButtonStyle = {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const secondaryButtonStyle = {
    ...actionButtonStyle,
    backgroundColor: '#f3f4f6',
    color: '#333',
    border: '1px solid #ccc'
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '80px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>Welcome to Wolt!</h1>
      
      {isLoggedIn ? (
        // Logged in mode
        <div style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>
            Great to see you again! Ready to grab a bite?
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button 
              onClick={() => navigate('/restaurant')}
              style={actionButtonStyle}
            >
              Browse Restaurants
            </button>
            <SignoutButton />
          </div>
        </div>
      ) : (
        // Guest mode
        <div style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>
            Hungry? Log in or register to start ordering from your favorite spots.
          </p>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              onClick={() => navigate('/login')}
              style={actionButtonStyle}
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')}
              style={actionButtonStyle}
            >
              Register
            </button>
          </div>
            
          <div style={{ marginTop: '40px' }}>
            <p style={{ fontSize: '1rem', color: '#777', marginBottom: '15px' }}>
              Just looking around?
            </p>
            <button 
              onClick={() => navigate('/restaurant')}
              style={secondaryButtonStyle}
            >
              Browse Restaurants
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;