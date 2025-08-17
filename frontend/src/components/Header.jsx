import React from 'react';
import './Header.css';

const Header = ({ user, onLogout }) => {
  return (
    <header className="system-header">
      <div className="header-left">
        {/* System Logo */}
        <div className="logo-container">
          <img 
            src="/images/company-logo.jpeg" 
            alt="Company Logo" 
            className="logo-img"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>

        {/* System Name */}
        <h1 className="system-title">Trinity Management System</h1>
      </div>

      <div className="header-right">
        {/* Welcome Message */}
        <span className="welcome-message">
          Welcome, {user?.firstName || user?.username || 'User'}
        </span>

        {/* Logout Button */}
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;