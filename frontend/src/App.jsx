import React, { useState, useEffect } from 'react';
import { authAPI } from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await authAPI.login(loginForm);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading Trinity Management System...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="login-card">
            <h1>Trinity Management System</h1>
            <p>Integrated Transport, Garage, Stock, Asset, and Driver Performance Management</p>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  required
                />
              </div>
              
              {error && <div className="error">{error}</div>}
              
              <button type="submit" className="login-btn">
                Login
              </button>
            </form>
            
            <div className="login-info">
              <p><strong>Test Credentials:</strong></p>
              <p>Username: admin</p>
              <p>Password: admin123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Trinity Management System</h1>
        <div className="user-info">
          <span>Welcome, {user?.username} ({user?.role})</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <main className="main-content">
        <div className="dashboard">
          <h2>Dashboard</h2>
          <p>Welcome to the Trinity Integrated Management System!</p>
          
          <div className="modules-grid">
            <div className="module-card">
              <h3>Asset Register</h3>
              <p>Manage buses, tools, and equipment</p>
              <span className="status">Coming Soon</span>
            </div>
            
            <div className="module-card">
              <h3>Inventory Management</h3>
              <p>Track spare parts and consumables</p>
              <span className="status">Coming Soon</span>
            </div>
            
            <div className="module-card">
              <h3>Garage Operations</h3>
              <p>Job cards, work orders, and maintenance</p>
              <span className="status">Coming Soon</span>
            </div>
            
            <div className="module-card">
              <h3>Driver Performance</h3>
              <p>Monitor driver behavior and safety</p>
              <span className="status">Coming Soon</span>
            </div>
            
            <div className="module-card">
              <h3>Transport Operations</h3>
              <p>Route planning and trip management</p>
              <span className="status">Coming Soon</span>
            </div>
            
            <div className="module-card">
              <h3>Package Management</h3>
              <p>Track packages and deliveries</p>
              <span className="status">Coming Soon</span>
            </div>
          </div>
          
          <div className="user-permissions">
            <h3>Your Permissions</h3>
            <div className="permissions-list">
              {user?.permissions && Object.keys(user.permissions).map(permission => (
                <span key={permission} className="permission-tag">
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 