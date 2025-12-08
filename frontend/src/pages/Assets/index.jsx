import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FaCar, FaFileAlt, FaWarehouse, FaBuilding } from 'react-icons/fa';
import VehiclesTab from './VehiclesTab';
import VehicleDocumentsTab from './VehicleDocumentsTab';
import './Assets.css';

const Assets = () => {
  // Get user information from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userTerminal = user.terminal || 'Kigali';
  const userRole = user.role || 'user';
  
  // Terminal tabs state
  const [activeTerminal, setActiveTerminal] = useState('Kigali');
  // const [availableTerminals, setAvailableTerminals] = useState(['Kigali', 'Kampala', 'Nairobi', 'Juba', 'Goma', 'Bor']);
  const [availableTerminals, setAvailableTerminals] = useState(['Kigali']);
  
  const [activeTab, setActiveTab] = useState('vehicles');

  const tabs = [
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: <FaCar />,
      component: <VehiclesTab activeTerminal={activeTerminal} />
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FaFileAlt />,
      component: <VehicleDocumentsTab activeTerminal={activeTerminal} />
    }
  ];

  // Handle terminal tab change
  const handleTerminalChange = (terminal) => {
    setActiveTerminal(terminal);
  };

  // Get terminals available to user based on role
  const getUserTerminals = () => {
    // For now, show all terminals to admin users (including 'admin' role)
    if (userRole === 'super_admin' || userRole === 'admin' || userRole === 'Admin') {
      return availableTerminals;
    }
    return [userTerminal]; // Regular users only see their terminal
  };

  return (
      <div className="assets-container">
        <div className="assets-header">
          <h2>Assets Management</h2>
          <div className="terminal-info">
             <FaBuilding className="terminal-icon" />
             <span>Location: <strong>{activeTerminal}</strong></span>
           </div>
        </div>

        {/* Terminal Tabs */}
        <div className="terminal-tabs">
          {getUserTerminals().map((terminal) => (
            <button
              key={terminal}
              className={`terminal-tab ${activeTerminal === terminal ? 'active' : ''}`}
              onClick={() => handleTerminalChange(terminal)}
            >
              <FaWarehouse className="tab-icon" />
               {terminal}
              </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="tabs-container">
          <div className="tabs-header">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {tabs.find(tab => tab.id === activeTab)?.component}
          </div>
        </div>
      </div>
  );
};

export default Assets;