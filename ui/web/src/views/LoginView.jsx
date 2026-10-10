import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import './LoginView.css';
import { useNavigate } from 'react-router-dom';
import auth from '../../../shared/api/auth.js';
import jwtHelper from '../../../shared/services/JwtHelper';

const LoginView = () => {
  // If already logged in redirect
  const navigate = useNavigate();

        useEffect(() => {
            const checkLoginAndRedirect = async () => {
                const isLoggedIn = await jwtHelper.isLoggedIn(); 
                
                if (isLoggedIn) {
                    navigate('/restaurant');
                }
            };
    
            checkLoginAndRedirect();
        }, [navigate]);
  
  // Setup Variables
  const [formData, setFormData] = useState({
    uname: '', 
    password: ''
  });
  
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.uname || !formData.password) {
      setError('Please fill all the fields');
      return;
    }

    setError('');

    try {
      const data = await auth.login(formData.uname, formData.password);
      await jwtHelper.saveSession(data.token, data.userId);
      navigate('/restaurant');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Could not connect to the server.');
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="uname">User name:</label>
          <input
            type="text"
            id="uname"
            name="uname"
            value={formData.uname}
            onChange={handleChange}
            placeholder="Enter user name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
        </div>

        <button type="submit" className="login-button">
            Login
        </button>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <p>Don't have an account?</p>
          <button 
            type="button" 
            className="register-link-button" 
            onClick={handleRegisterRedirect}
            style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Register here
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginView;