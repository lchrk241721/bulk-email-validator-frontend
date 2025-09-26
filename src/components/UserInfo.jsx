import React, { useState, useEffect } from 'react';
import './UserInfo.css';

const UserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        
        // Method 1: Using ipapi.co (free tier available)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.reason || 'Failed to fetch location data');
        }

        setUserInfo({
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_name,
          countryCode: data.country_code,
          timezone: data.timezone,
          isp: data.org
        });
        
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError('Unable to fetch location information');
        
        // Fallback: Try another service
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
          setError('Location services unavailable');
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

  if (loading) {
    return (
      <div className="user-info-container">
        <div className="user-info-loading">
          <div className="loading-spinner"></div>
          <span>Detecting your location...</span>
        </div>
      </div>
    );
  }

  if (error && !userInfo) {
    return (
      <div className="user-info-container">
        <div className="user-info-error">
          <span>🌐 Location detection unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="user-info-container">
      <div className="user-info-card">
        <div className="user-info-header">
          <span className="user-info-icon">🌐</span>
          <h4>Your Connection Info</h4>
        </div>
        
        <div className="user-info-details">
          <div className="info-item">
            <span className="info-label">IP Address:</span>
            <span className="info-value">{userInfo.ip}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Location:</span>
            <span className="info-value">
              {getFlagEmoji(userInfo.countryCode)} 
              {userInfo.city && userInfo.city !== 'Unknown' ? `${userInfo.city}, ` : ''}
              {userInfo.country}
            </span>
          </div>
          
          {userInfo.region && userInfo.region !== userInfo.city && (
            <div className="info-item">
              <span className="info-label">Region:</span>
              <span className="info-value">{userInfo.region}</span>
            </div>
          )}
          
          {userInfo.timezone && (
            <div className="info-item">
              <span className="info-label">Timezone:</span>
              <span className="info-value">{userInfo.timezone}</span>
            </div>
          )}
          
          {userInfo.isp && (
            <div className="info-item">
              <span className="info-label">ISP:</span>
              <span className="info-value">{userInfo.isp}</span>
            </div>
          )}
        </div>
        
        <div className="user-info-footer">
          <small>We don't store this information</small>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;