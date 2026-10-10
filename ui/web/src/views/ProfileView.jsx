import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '../../../shared/api/auth.js';
import jwtHelper from '../../../shared/services/JwtHelper';
import './ProfileView.css';
import {CONFIG} from '../../../shared/config';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // If not logged in redirect
  const navigate = useNavigate();

  useEffect(() => {
    const initProfile = async () => {
      const isLoggedIn = await jwtHelper.isLoggedIn(); 
      
      if (!isLoggedIn) {
          navigate('/'); 
          return; 
      }

      try {
        setIsLoading(true);
        const userData = await auth.getUser();

        if (!userData) {
          throw new Error('Could not retrieve user data');
        }

        setUser(userData);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initProfile();
  }, [navigate]);

  if (isLoading) {
    return <div className="profile-container" style={{ textAlign: 'center' }}>Loading profile...</div>;
  }

    if (error || !user) {
        return null; 
    }

  if (isLoading) {
    return <div className="profile-container" style={{ textAlign: 'center' }}>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      
      <div className="profile-header">
        {user.logo ? (
          <img 
            src={`${CONFIG.BACKEND_URL}${user.logo}`} 
            alt={user.name} 
            className="profile-avatar" 
          />
        ) : (
          <div className="avatar-placeholder">
            <span className="avatar-initial">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
        )}
        <h1 className="profile-name">{user.name}</h1>
        <p className="profile-handle">@{user.username}</p>
      </div>

      <div className="profile-card">
        <h2 className="card-title">ACCOUNT DETAILS</h2>
        
        <ul className="details-list">
          
          <li className="detail-row">
            <span className="detail-label">Name</span>
            <span className="detail-value">{user.name}</span>
          </li>

          <li className="detail-row">
            <span className="detail-label">Username</span>
            <span className="detail-value">{user.username}</span>
          </li>

          <li className="detail-row">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{user.phone || 'N/A'}</span>
          </li>

          <li className="detail-row">
            <span className="detail-label">Location</span>
            <span className="detail-value">
              {user.location 
                ? (user.location.latitude 
                    ? `${user.location.latitude}, ${user.location.longitude}` 
                    : user.location)
                : 'N/A'}
            </span>
          </li>

          <li className="detail-row">
            <span className="detail-label">Role</span>
            <span className="detail-value role-text">
              {user.isOwner ? 'Restaurant Owner' : 'Customer'}
            </span>
          </li>

        </ul>
      </div>
      
    </div>
  );
}