import React, { useState, useEffect } from 'react';
import './UserInfoBar.css';

const UserInfoBar = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        setUserInfo({
          ip: data.ip,
          city: data.city,
          country: data.country_name,
          countryCode: data.country_code
        });
        
      } catch (err) {
        console.error('Error fetching user info:', err);
        // Fallback to basic IP detection
        try {
          const fallbackResponse = await fetch('https://api.ipify.org?format=json');
          const fallbackData = await fallbackResponse.json();
          setUserInfo({
            ip: fallbackData.ip,
            city: 'Unknown',
            country: 'Unknown',
            countryCode: 'XX'
          });
        } catch (fallbackErr) {
          setUserInfo({
            ip: 'Not available',
            city: 'Unknown',
            country: 'Unknown',
            countryCode: 'XX'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const getFlagEmoji = (countryCode) => {
    if (!countryCode || countryCode === 'XX') return '🏴';
    return countryCode
      .toUpperCase()
      .split('')
      .map(char => String.fromCodePoint(127397 + char.charCodeAt()))
      .join('');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="user-info-bar">
      <div className="user-info-content">
        <span className="info-icon">🌐</span>
        
        {loading ? (
          <div className="loading-info">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Detecting your location...</span>
          </div>
        ) : userInfo ? (
          <div className="user-details">
            <span className="ip-address">
              <strong>IP:</strong> {userInfo.ip}
            </span>
            <span className="location">
              <strong>Location:</strong> {getFlagEmoji(userInfo.countryCode)} 
              {userInfo.city && userInfo.city !== 'Unknown' ? ` ${userInfo.city}, ` : ' '}
              {userInfo.country}
            </span>
          </div>
        ) : (
          <span className="error-message">Location unavailable</span>
        )}
      </div>
      
      <button className="close-btn" onClick={handleClose} title="Close">
        ×
      </button>
    </div>
  );
};

export default UserInfoBar;