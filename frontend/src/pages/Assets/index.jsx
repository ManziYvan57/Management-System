import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FaCar, FaTools, FaFileAlt } from 'react-icons/fa';
import VehiclesTab from './VehiclesTab';
import EquipmentTab from './EquipmentTab';
import VehicleDocumentsTab from './VehicleDocumentsTab';
import './Assets.css';

const Assets = () => {
  const [activeTab, setActiveTab] = useState('vehicles');

  const tabs = [
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: <FaCar />,
      component: <VehiclesTab />
    },
    {
      id: 'equipment',
      label: 'Equipment',
      icon: <FaTools />,
      component: <EquipmentTab />
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FaFileAlt />,
      component: <VehicleDocumentsTab />
    }
  ];

  return (
    <div className="assets-container">
        <div className="assets-header">
          <p>Manage your fleet vehicles and equipment inventory</p>
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