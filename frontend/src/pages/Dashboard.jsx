import React, { useState } from 'react';
import { RoleBasedAccess } from '../components/RoleBasedAccess';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const tabs = [
    { id: 'overview', label: 'Overview', module: 'reports', action: 'view' },
    { id: 'financials', label: 'Financials', module: 'reports', action: 'view' },
    { id: 'operations', label: 'Operations', module: 'reports', action: 'view' },
    { id: 'maintenance', label: 'Maintenance', module: 'reports', action: 'view' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderOverviewTab = () => (
    <div className="dashboard-section">
      <div className="stats-grid">
        <div className="stat-card overview-card">
          <h3>Total Assets</h3>
          <p className="stat-number">24</p>
          <p className="stat-label">Vehicles & Equipment</p>
        </div>
        <div className="stat-card overview-card">
          <h3>Active Drivers</h3>
          <p className="stat-number">8</p>
          <p className="stat-label">Currently on duty</p>
        </div>
        <div className="stat-card overview-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">{formatCurrency(25000000)}</p>
          <p className="stat-label">This month</p>
        </div>
        <div className="stat-card overview-card">
          <h3>Active Routes</h3>
          <p className="stat-number">12</p>
          <p className="stat-label">Currently operating</p>
        </div>
      </div>
    </div>
  );

  const renderFinancialsTab = () => (
    <div className="dashboard-section">
      <div className="stats-grid">
        <div className="stat-card financial-card">
          <h3>Monthly Revenue</h3>
          <p className="stat-number">{formatCurrency(25000000)}</p>
          <p className="stat-label">+15% from last month</p>
        </div>
        <div className="stat-card financial-card">
          <h3>Operating Costs</h3>
          <p className="stat-number">{formatCurrency(18000000)}</p>
          <p className="stat-label">-8% from last month</p>
        </div>
        <div className="stat-card financial-card">
          <h3>Net Profit</h3>
          <p className="stat-number">{formatCurrency(7000000)}</p>
          <p className="stat-label">+25% from last month</p>
        </div>
        <div className="stat-card financial-card">
          <h3>Fuel Expenses</h3>
          <p className="stat-number">{formatCurrency(8500000)}</p>
          <p className="stat-label">34% of total costs</p>
        </div>
      </div>
    </div>
  );

  const renderOperationsTab = () => (
    <div className="dashboard-section">
      <div className="stats-grid">
        <div className="stat-card operation-card">
          <h3>Active Trips</h3>
          <p className="stat-number">18</p>
          <p className="stat-label">Currently in progress</p>
        </div>
        <div className="stat-card operation-card">
          <h3>Completed Trips</h3>
          <p className="stat-number">156</p>
          <p className="stat-label">This month</p>
        </div>
        <div className="stat-card operation-card">
          <h3>On-Time Performance</h3>
          <p className="stat-number">94%</p>
          <p className="stat-label">Average this month</p>
        </div>
        <div className="stat-card operation-card">
          <h3>Passenger Count</h3>
          <p className="stat-number">2,847</p>
          <p className="stat-label">This month</p>
        </div>
      </div>
    </div>
  );

  const renderMaintenanceTab = () => (
    <div className="dashboard-section">
      <div className="stats-grid">
        <div className="stat-card maintenance-card">
          <h3>Scheduled Maintenance</h3>
          <p className="stat-number">5</p>
          <p className="stat-label">Due this week</p>
        </div>
        <div className="stat-card maintenance-card">
          <h3>Completed Repairs</h3>
          <p className="stat-number">23</p>
          <p className="stat-label">This month</p>
        </div>
        <div className="stat-card maintenance-card">
          <h3>Vehicle Availability</h3>
          <p className="stat-number">92%</p>
          <p className="stat-label">Fleet readiness</p>
        </div>
        <div className="stat-card maintenance-card">
          <h3>Maintenance Costs</h3>
          <p className="stat-number">{formatCurrency(3200000)}</p>
          <p className="stat-label">This month</p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'financials':
        return renderFinancialsTab();
      case 'operations':
        return renderOperationsTab();
      case 'maintenance':
        return renderMaintenanceTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        {user.terminal && (
          <div className="terminal-info">
            <span className="terminal-badge">{user.terminal.toUpperCase()} Terminal</span>
          </div>
        )}
      </div>

      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <RoleBasedAccess key={tab.id} user={user} module={tab.module} action={tab.action}>
            <button
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          </RoleBasedAccess>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
};

export default Dashboard;