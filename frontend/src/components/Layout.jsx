import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, title }) => {
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="app-container">
      <Header
        user={user}
        onLogout={handleLogout}
      />
      <Sidebar user={user} />
      <main className="main-content">
        <div className="page-container">
          <h1 className="page-title">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;