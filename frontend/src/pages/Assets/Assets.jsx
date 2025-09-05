import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { FaBus, FaTools, FaCogs, FaPlus, FaSearch, FaFilter, FaSync } from 'react-icons/fa';
import { vehiclesAPI, equipmentAPI } from '../../services/api';
import VehiclesTab from './VehiclesTab';
import EquipmentTab from './EquipmentTab';
import './Assets.css';

const Assets = () => {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    vehicles: {
      totalVehicles: 0,
      activeVehicles: 0,
      maintenanceVehicles: 0,
      totalValue: 0,
      totalMileage: 0
    },
    equipment: {
      totalEquipment: 0,
      availableEquipment: 0,
      inUseEquipment: 0,
      totalValue: 0,
      totalMaintenanceCost: 0
    }
  });

  // Fetch statistics function
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [vehiclesStats, equipmentStats] = await Promise.all([
        vehiclesAPI.getStats(),
        equipmentAPI.getStats()
      ]);
      
      setStats({
        vehicles: vehiclesStats.data || {},
        equipment: equipmentStats.data || {}
      });
    } catch (err) {
      console.error('Error fetching assets stats:', err);
      setError(err.message || 'Failed to fetch assets statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics on component mount and when tab changes
  useEffect(() => {
    fetchStats();
  }, [activeTab]);

  // Refresh stats when component becomes visible (user navigates back to this page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <Layout>
        <div className="assets-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading assets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="assets-container">
          <div className="error-message">
            <h3>Error Loading Assets</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="assets-container">
        {/* Header */}
        <div className="assets-header">
          <div className="assets-title">
            <h1>Asset Management</h1>
            <p>Manage vehicles and equipment across all terminals</p>
          </div>
          <div className="assets-actions">
            <button 
              className="refresh-button"
              onClick={fetchStats}
              disabled={loading}
              title="Refresh data"
            >
              <FaSync className={loading ? 'spinning' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="assets-stats">
          <div className="stats-card vehicles-stats">
            <div className="stats-icon">
              <FaBus />
            </div>
            <div className="stats-content">
              <h3>Vehicles</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{stats.vehicles.totalVehicles || 0}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.vehicles.activeVehicles || 0}</span>
                  <span className="stat-label">Active</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.vehicles.maintenanceVehicles || 0}</span>
                  <span className="stat-label">Maintenance</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">${(stats.vehicles.totalValue || 0).toLocaleString()}</span>
                  <span className="stat-label">Total Value</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-card equipment-stats">
            <div className="stats-icon">
              <FaTools />
            </div>
            <div className="stats-content">
              <h3>Equipment</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{stats.equipment.totalEquipment || 0}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.equipment.availableEquipment || 0}</span>
                  <span className="stat-label">Available</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.equipment.inUseEquipment || 0}</span>
                  <span className="stat-label">In Use</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">${(stats.equipment.totalValue || 0).toLocaleString()}</span>
                  <span className="stat-label">Total Value</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="assets-tabs">
          <button
            className={`tab-button ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => handleTabChange('vehicles')}
          >
            <FaBus />
            <span>Vehicles</span>
            <span className="tab-count">{stats.vehicles.totalVehicles || 0}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => handleTabChange('equipment')}
          >
            <FaTools />
            <span>Equipment</span>
            <span className="tab-count">{stats.equipment.totalEquipment || 0}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'vehicles' && <VehiclesTab />}
          {activeTab === 'equipment' && <EquipmentTab />}
        </div>
      </div>
    </Layout>
  );
};

export default Assets;
