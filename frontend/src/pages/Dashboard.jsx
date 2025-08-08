import React, { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, you would clear auth tokens, redirect to login, etc.
    console.log("User logged out");
    alert("Logout button clicked!");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Header 
        user={{ firstName: 'Serge' }} 
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
      />
      <div className="dashboard-body">
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <nav>
            {/* Sidebar navigation links go here */}
            <a href="#">Dashboard</a>
            <a href="#">Users</a>
            <a href="#">Settings</a>
          </nav>
        </aside>
        <main className={`dashboard-content ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
          <h2>System Overview</h2>
          {/* Dashboard content goes here */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;