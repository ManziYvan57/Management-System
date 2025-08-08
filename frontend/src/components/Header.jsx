import React from 'react';
import './Header.css';

const Header = ({ user, onToggleSidebar, onLogout }) => {
  return (
    <header className="system-header">
      <div className="header-left">
        <button onClick={onToggleSidebar} className="sidebar-toggle-btn" aria-label="Toggle sidebar">
          &#9776;
        </button>
        <img src="/images/company-logo.jpeg" alt="Trinity Logo" className="header-logo" />
        <h1>Trinity Management System</h1>
      </div>
      <div className="header-right">
        <span className="welcome-text">Welcome, {user?.firstName || 'User'}</span>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
    </header>
  );
};

export default Header;