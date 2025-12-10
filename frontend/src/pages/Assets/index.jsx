import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FaCar, FaFileAlt, FaWarehouse, FaBuilding } from 'react-icons/fa';
import VehiclesTab from './VehiclesTab';
import VehicleDocumentsTab from './VehicleDocumentsTab';
import './Assets.css';

const Assets = () => {
  // Get user information from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userCompany = user.company || 'Kigali';
  const userRole = user.role || 'user';
  
  // Company tabs state
  const [activeCompany, setActiveCompany] = useState('Kigali');
  const [availableCompanies, setAvailableCompanies] = useState(['Kigali', 'Musanze', 'Nyabugogo', 'Muhanga', 'Rusizi', 'Rubavu', 'Huye']);
  
  const [activeTab, setActiveTab] = useState('vehicles');

  const tabs = [
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: <FaCar />,
      component: <VehiclesTab activeTerminal={activeCompany} />
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FaFileAlt />,
      component: <VehicleDocumentsTab activeTerminal={activeCompany} />
    }
  ];

  // Handle company tab change
  const handleCompanyChange = (company) => {
    setActiveCompany(company);
  };

  // Get companies available to user based on role
  const getUserCompanies = () => {
    // For now, show all companies to admin users (including 'admin' role)
    if (userRole === 'super_admin' || userRole === 'admin' || userRole === 'Admin') {
      return availableCompanies;
    }
    return [userCompany]; // Regular users only see their company
  };

  return (
      <div className="assets-container">
        <div className="assets-header">
          <h2>Assets Management</h2>
          <div className="terminal-info">
             <FaBuilding className="terminal-icon" />
             <span>Location: <strong>{activeCompany}</strong></span>
           </div>
        </div>

        {/* Company Tabs */}
        <div className="terminal-tabs">
          {getUserCompanies().map((company) => (
            <button
              key={company}
              className={`terminal-tab ${activeCompany === company ? 'active' : ''}`}
              onClick={() => handleCompanyChange(company)}
            >
              <FaWarehouse className="tab-icon" />
               {company}
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