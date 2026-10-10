import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './RegisterView.css';
import auth from '../../../shared/api/auth.js';
import jwtHelper from '../../../shared/services/JwtHelper';

const RegisterView = () => {
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

  // Manage the state for all the requested text fields
  const [formData, setFormData] = useState({
    uname: '',
    name: '',
    phone: '',
    latitude: '',
    longitude: '',
    password: '',
    confirmPassword: '',
    isOwner: false
  });
  
  // Manage state specifically for the uploaded image file
  const [logoFile, setLogoFile] = useState(null);
  
  // Manage state for displaying errors and loading
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle changes for all text input fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all text fields are filled
    if (
      !formData.uname || 
      !formData.name || 
      !formData.phone || 
      !formData.latitude || 
      !formData.longitude || 
      !formData.password || 
      !formData.confirmPassword
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate that a logo image was selected
    if (!logoFile) {
      setError('Please upload a profile photo.');
      return;
    }

    // Validate that the passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Clear errors and lock the button while the request is in flight
    setError('');
    setIsSubmitting(true);

    try {
      // Call the register method from our auth class 
      const data = await auth.register(
        formData.uname, 
        formData.name, 
        formData.phone,
        formData.latitude,
        formData.longitude,
        formData.password,
        logoFile,
        formData.isOwner
      );

      console.log('Register successful:', data);
      
      const loginData = await auth.login(formData.uname, formData.password);
      // Save the token and userId from the login response
      await jwtHelper.saveSession(loginData.token, loginData.userId);

      // redirect to home page
      navigate('/restaurant');
    } catch (err) {
      console.error('Register error:', err);

      // Map common backend error strings to friendly, specific messages
      const msg = err.message || '';
      if (msg.includes('Username already exists') || msg.includes('already registered')) {
        setError('That username is already taken. Please choose another.');
      } else if (msg.includes('required') || msg.includes('missing')) {
        setError('Please fill in all required fields and upload a photo.');
      } else if (msg.includes('connect') || msg.includes('Network')) {
        setError('Could not reach the server. Please check your connection and try again.');
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      
      {/* Display error message if it exists */}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="register-form">
        
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
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group location-group">
          <label htmlFor="latitude">Latitude (Y):</label>
          <input
            type="number"
            step="any"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="e.g. 31.9639"
          />
        </div>

        <div className="form-group location-group">
          <label htmlFor="longitude">Longitude (X):</label>
          <input
            type="number"
            step="any"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="e.g. 34.8015"
          />
        </div>

          <div className="form-group">
          <label htmlFor="phone">Phone:</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="logo">User Logo:</label>
          <input
            type="file"
            id="logo"
            name="logo"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="form-group checkbox-group">
        <label>
          <input 
            type="checkbox" 
            name="isOwner" 
            checked={formData.isOwner} 
            onChange={handleChange} 
          />
          I am a restaurant owner
        </label>
      </div>

        <button type="submit" className="register-button" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>

                <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <p>Already have an account?</p>
          <button 
            type="button" 
            className="login-link-button" 
            onClick={handleLoginRedirect}
            style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Login here
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterView;