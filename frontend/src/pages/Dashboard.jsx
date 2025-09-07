import React, { useState, useEffect } from 'react';
import { 
  FaTools, FaBoxes, FaBus, FaUsers, 
  FaExclamationTriangle, FaCheckCircle, FaClock,
  FaChartLine, FaChartBar, FaChartPie, FaCalendarAlt,
  FaDollarSign, FaWrench, FaUserTie, FaUserCog,
  FaFileAlt, FaClipboardList, FaTachometerAlt, FaShieldAlt,
  FaCog, FaWarehouse, FaUserShield, FaTimesCircle
} from 'react-icons/fa';
import { assetsAPI, vehiclesAPI, equipmentAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [dashboardData, setDashboardData] = useState({
    garage: {},
    inventory: {},
    assets: {},
    personnel: {},
    users: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Dashboard: Token exists:', !!token);
        console.log('Dashboard: User:', user);
        
        // Fetch data from individual APIs instead of dashboard API
        console.log('Fetching assets data from individual APIs...');
        const [assetsRes, vehiclesRes, equipmentRes] = await Promise.all([
          assetsAPI.getStats(),
          vehiclesAPI.getStats(),
          equipmentAPI.getStats()
        ]);
        console.log('Assets response:', assetsRes);
        console.log('Vehicles response:', vehiclesRes);
        console.log('Equipment response:', equipmentRes);
        
        // Combine data from individual APIs using standardized field names
        const combinedData = {
          // Vehicle data (now using standardized field names)
          totalVehicles: vehiclesRes.data?.totalVehicles || 0,
          activeVehicles: vehiclesRes.data?.activeVehicles || 0,
          vehiclesInMaintenance: vehiclesRes.data?.maintenanceVehicles || 0,
          outOfServiceVehicles: vehiclesRes.data?.outOfServiceVehicles || 0,
          
          // Equipment data (now using standardized field names)
          totalEquipment: equipmentRes.data?.totalEquipment || 0,
          operationalEquipment: equipmentRes.data?.activeEquipment || 0,
          underRepairEquipment: equipmentRes.data?.maintenanceEquipment || 0,
          retiredEquipment: equipmentRes.data?.outOfServiceEquipment || 0,
          
          // Asset data
          totalAssetValue: (vehiclesRes.data?.totalValue || 0) + (equipmentRes.data?.totalValue || 0),
          
          // Keep other data from assets API
          ...assetsRes.data
        };
        
        setDashboardData({
          overview: combinedData,
          financial: {},
          operations: {},
          maintenance: {},
          garage: {},
          inventory: {},
          assets: combinedData,
          personnel: {},
          users: {}
        });
        
        console.log('Dashboard data set:', {
          combinedData,
          assets: combinedData
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          response: err.response?.data
        });
        // Set empty data on error
        setDashboardData({
          overview: {},
          financial: {},
          operations: {},
          maintenance: {},
          garage: {},
          inventory: {},
          assets: {},
          personnel: {},
          users: {}
        });
        setError(`Failed to load data - ${err.message || 'API connection failed'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Calculate cross-module insights with safe property access
  const insights = {
    // Financial Overview
    totalMonthlySpending: ((dashboardData.garage?.monthlySpending || 0) + (dashboardData.financial?.monthlySpending || 0)),
    totalAssetValue: dashboardData.assets?.totalAssetValue || 0,
    netAssetValue: (dashboardData.assets?.totalAssetValue || 0) - (dashboardData.assets?.depreciation || 0),
    
    // Operational Efficiency
    maintenanceEfficiency: (dashboardData.garage?.totalWorkOrders || 0) > 0 ? 
      Math.round(((dashboardData.garage?.completedWorkOrders || 0) / (dashboardData.garage?.totalWorkOrders || 1)) * 100) : 0,
    personnelUtilization: (dashboardData.personnel?.totalPersonnel || 0) > 0 ? 
      Math.round(((dashboardData.personnel?.activePersonnel || 0) / (dashboardData.personnel?.totalPersonnel || 1)) * 100) : 0,
    
    // Critical Alerts
    criticalAlerts: [
      ...((dashboardData.garage?.criticalAlerts || 0) > 0 ? [`${dashboardData.garage?.criticalAlerts || 0} vehicles need immediate attention`] : []),
      ...((dashboardData.inventory?.outOfStockItems || 0) > 0 ? [`${dashboardData.inventory?.outOfStockItems || 0} items out of stock`] : []),
      ...((dashboardData.inventory?.lowStockItems || 0) > 5 ? [`${dashboardData.inventory?.lowStockItems || 0} items running low`] : []),
      ...((dashboardData.garage?.overdueSchedules || 0) > 0 ? [`${dashboardData.garage?.overdueSchedules || 0} maintenance schedules overdue`] : [])
    ]
  };

  // Format currency in RWF
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show warning if there's an error but still render dashboard
  const showErrorWarning = error && (
    <div className="error-warning">
      <FaExclamationTriangle className="warning-icon" />
      <span>{error}</span>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Trinity Management Dashboard</h1>
          <p>Comprehensive overview of all operations</p>
        </div>
        <div className="header-right">
          <div className="real-time-clock">
            <FaClock className="clock-icon" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          <div className="date-display">
            <FaCalendarAlt className="date-icon" />
            <span>{currentTime.toLocaleDateString()}</span>
        </div>
        </div>
      </div>

      {/* Error Warning */}
      {showErrorWarning}

      {/* Critical Alerts */}
      {insights.criticalAlerts.length > 0 && (
        <div className="critical-alerts">
          <div className="alert-header">
            <FaExclamationTriangle className="alert-icon" />
            <h3>Critical Alerts</h3>
          </div>
          <div className="alert-list">
            {insights.criticalAlerts.map((alert, index) => (
              <div key={index} className="alert-item">
                <FaExclamationTriangle className="alert-item-icon" />
                <span>{alert}</span>
              </div>
            ))}
    </div>
        </div>
      )}

      {/* Navigation Tabs - Simplified for Development */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine className="tab-icon" />
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          <FaBus className="tab-icon" />
          Assets
        </button>
        {/* Temporarily commented out for development
        <button 
          className={`tab-btn ${activeTab === 'personnel' ? 'active' : ''}`}
          onClick={() => setActiveTab('personnel')}
        >
          <FaUsers className="tab-icon" />
          Personnel
        </button>
        <button 
          className={`tab-btn ${activeTab === 'garage' ? 'active' : ''}`}
          onClick={() => setActiveTab('garage')}
        >
          <FaWrench className="tab-icon" />
          Garage
        </button>
        <button 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <FaBoxes className="tab-icon" />
          Inventory
        </button>
        */}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* Key Metrics */}
          <div className="key-metrics">
            <div className="metric-card primary">
              <div className="metric-icon">
                <FaBus />
              </div>
              <div className="metric-content">
                <h3>{dashboardData.assets?.totalVehicles || 0}</h3>
                <p>Total Vehicles</p>
                <span className="metric-subtitle">{dashboardData.assets?.activeVehicles || 0} active</span>
              </div>
            </div>

            <div className="metric-card success">
              <div className="metric-icon">
                <FaUsers />
              </div>
              <div className="metric-content">
                <h3>{dashboardData.personnel?.totalPersonnel || 0}</h3>
                <p>Total Personnel</p>
                <span className="metric-subtitle">{dashboardData.personnel?.activePersonnel || 0} active</span>
              </div>
            </div>

            <div className="metric-card warning">
              <div className="metric-icon">
                <FaBoxes />
              </div>
              <div className="metric-content">
                <h3>{dashboardData.inventory?.totalInventory || 0}</h3>
                <p>Inventory Items</p>
                <span className="metric-subtitle">{dashboardData.inventory?.lowStockItems || 0} low stock</span>
              </div>
            </div>

            <div className="metric-card info">
              <div className="metric-icon">
                <FaDollarSign />
              </div>
              <div className="metric-content">
                <h3>{formatCurrency(insights.totalAssetValue || 0)}</h3>
                <p>Total Asset Value</p>
                <span className="metric-subtitle">{formatCurrency(insights.netAssetValue || 0)} net value</span>
              </div>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="efficiency-metrics">
            <h3>Operational Efficiency</h3>
            <div className="efficiency-grid">
              <div className="efficiency-card">
                <div className="efficiency-header">
                  <FaWrench className="efficiency-icon" />
                  <span>Maintenance Efficiency</span>
                </div>
                <div className="efficiency-value">{insights.maintenanceEfficiency || 0}%</div>
                <div className="efficiency-bar">
                  <div 
                    className="efficiency-fill" 
                    style={{ width: `${insights.maintenanceEfficiency || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="efficiency-card">
                <div className="efficiency-header">
                  <FaUserTie className="efficiency-icon" />
                  <span>Personnel Utilization</span>
                </div>
                <div className="efficiency-value">{insights.personnelUtilization || 0}%</div>
                <div className="efficiency-bar">
                  <div 
                    className="efficiency-fill" 
                    style={{ width: `${insights.personnelUtilization || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="efficiency-card">
                <div className="efficiency-header">
                  <FaBoxes className="efficiency-icon" />
                  <span>Inventory Efficiency</span>
                </div>
                <div className="efficiency-value">{Math.round(((dashboardData.inventory.inStockItems || 0) / (dashboardData.inventory.totalInventory || 1)) * 100)}%</div>
                <div className="efficiency-bar">
                  <div 
                    className="efficiency-fill" 
                    style={{ width: `${Math.round(((dashboardData.inventory.inStockItems || 0) / (dashboardData.inventory.totalInventory || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stats-row">
              <div className="stat-item">
                <FaTools className="stat-icon" />
                <div className="stat-info">
                  <h4>{dashboardData.garage.totalWorkOrders || 0}</h4>
                  <p>Work Orders</p>
                </div>
              </div>

              <div className="stat-item">
                <FaBoxes className="stat-icon" />
                <div className="stat-info">
                  <h4>{dashboardData.inventory.totalInventory || 0}</h4>
                  <p>Inventory Items</p>
                </div>
              </div>

              <div className="stat-item">
                <FaBus className="stat-icon" />
                <div className="stat-info">
                  <h4>{dashboardData.assets.totalVehicles || 0}</h4>
                  <p>Total Vehicles</p>
                </div>
              </div>

              <div className="stat-item">
                <FaUsers className="stat-icon" />
                <div className="stat-info">
                  <h4>{dashboardData.personnel.totalDrivers || 0}</h4>
                  <p>Total Drivers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assets Management Tab */}
      {activeTab === 'assets' && (
        <div className="tab-content">
          <div className="assets-overview">
            <div className="assets-header">
              <h3>Assets Management</h3>
            </div>

            {/* Key Metrics Row */}
            <div className="assets-grid">
              <div className="asset-card">
                <h4>Vehicle Fleet</h4>
                <div className="asset-stats">
                  <div className="asset-stat">
                    <span>Total Vehicles</span>
                    <strong>{dashboardData.assets.totalVehicles || 0}</strong>
                  </div>
                  <div className="asset-stat">
                    <span>Active</span>
                    <strong className="success">{dashboardData.assets.activeVehicles || 0}</strong>
                  </div>
                  <div className="asset-stat">
                    <span>In Maintenance</span>
                    <strong className="warning">{dashboardData.assets.vehiclesInMaintenance || 0}</strong>
                  </div>
                  <div className="asset-stat">
                    <span>Out of Service</span>
                    <strong className="danger">{dashboardData.assets.outOfServiceVehicles || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="asset-card">
                <h4>Equipment</h4>
                <div className="asset-stats">
                  <div className="asset-stat">
                    <span>Total Equipment</span>
                    <strong>{dashboardData.assets.totalEquipment || 0}</strong>
                  </div>
                  <div className="asset-stat">
                    <span>Operational</span>
                    <strong className="success">{dashboardData.assets.operationalEquipment || 0}</strong>
                  </div>
                  <div className="asset-stat">
                    <span>Under Repair</span>
                    <strong className="warning">{dashboardData.assets.underRepairEquipment || 0}</strong>
                  </div>
                  <div className="asset-stat">
                    <span>Out of Service</span>
                    <strong className="info">{dashboardData.assets.retiredEquipment || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="asset-card">
                <h4>Financial Overview</h4>
                <div className="asset-stats">
                  <div className="asset-stat">
                    <span>Total Asset Value</span>
                    <strong>{formatCurrency(dashboardData.assets.totalAssetValue || 0)}</strong>
                  </div>
                  <div className="asset-stat">
                    <span>Depreciation</span>
                    <strong className="warning">{formatCurrency(dashboardData.assets.depreciation || 0)}</strong>
                  </div>
                  <div className="asset-stat">
                    <span>Net Value</span>
                    <strong className="success">{formatCurrency(insights.netAssetValue || 0)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Health & Performance */}
            <div className="assets-details">
              <div className="asset-health">
                <h4>Asset Health Status</h4>
                <div className="health-grid">
                  <div className="health-item">
                    <div className="health-icon success">
                      <FaCheckCircle />
                    </div>
                    <div className="health-info">
                      <span className="health-label">Fully Operational</span>
                      <span className="health-count">{((dashboardData.assets.activeVehicles || 0) + (dashboardData.assets.operationalEquipment || 0))}</span>
                    </div>
                  </div>
                  <div className="health-item">
                    <div className="health-icon warning">
                      <FaExclamationTriangle />
                    </div>
                    <div className="health-info">
                      <span className="health-label">Needs Attention</span>
                      <span className="health-count">{((dashboardData.assets.vehiclesInMaintenance || 0) + (dashboardData.assets.underRepairEquipment || 0))}</span>
                    </div>
                  </div>
                  <div className="health-item">
                    <div className="health-icon danger">
                      <FaTimesCircle />
                    </div>
                    <div className="health-info">
                      <span className="health-label">Out of Service</span>
                      <span className="health-count">{((dashboardData.assets.outOfServiceVehicles || 0) + (dashboardData.assets.retiredEquipment || 0))}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="asset-performance">
                <h4>Performance Metrics</h4>
                <div className="performance-grid">
                  <div className="performance-item">
                    <span className="performance-label">Asset Utilization</span>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill" 
                        style={{ width: `${Math.min(100, ((dashboardData.assets.activeVehicles || 0) + (dashboardData.assets.operationalEquipment || 0)) / Math.max(1, (dashboardData.assets.totalVehicles || 0) + (dashboardData.assets.totalEquipment || 0)) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="performance-value">
                      {Math.round(((dashboardData.assets.activeVehicles || 0) + (dashboardData.assets.operationalEquipment || 0)) / Math.max(1, (dashboardData.assets.totalVehicles || 0) + (dashboardData.assets.totalEquipment || 0)) * 100)}%
                    </span>
                  </div>
                  <div className="performance-item">
                    <span className="performance-label">Maintenance Efficiency</span>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill" 
                        style={{ width: `${Math.min(100, ((dashboardData.assets.vehiclesInMaintenance || 0) + (dashboardData.assets.underRepairEquipment || 0)) / Math.max(1, (dashboardData.assets.totalVehicles || 0) + (dashboardData.assets.totalEquipment || 0)) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="performance-value">
                      {Math.round(((dashboardData.assets.vehiclesInMaintenance || 0) + (dashboardData.assets.underRepairEquipment || 0)) / Math.max(1, (dashboardData.assets.totalVehicles || 0) + (dashboardData.assets.totalEquipment || 0)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Personnel Management Tab */}
      {activeTab === 'personnel' && (
        <div className="tab-content">
          <div className="personnel-overview">
            <div className="personnel-header">
              <h3>Personnel Management</h3>
            </div>

            {/* Key Metrics Row */}
            <div className="personnel-grid">
              <div className="personnel-card">
                <h4>Staff Overview</h4>
                <div className="personnel-stats">
                  <div className="personnel-stat">
                    <span>Total Personnel</span>
                    <strong>{dashboardData.personnel?.totalPersonnel || 0}</strong>
                  </div>
                  <div className="personnel-stat">
                    <span>Active Staff</span>
                    <strong className="success">{dashboardData.personnel?.activePersonnel || 0}</strong>
                  </div>
                  <div className="personnel-stat">
                    <span>Drivers</span>
                    <strong className="info">{dashboardData.personnel?.drivers || 0}</strong>
                  </div>
                  <div className="personnel-stat">
                    <span>Administrative</span>
                    <strong className="warning">{dashboardData.personnel?.administrative || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="personnel-card">
                <h4>Driver Management</h4>
                <div className="personnel-stats">
                  <div className="personnel-stat">
                    <span>Active Drivers</span>
                    <strong className="success">{dashboardData.personnel?.activeDrivers || 0}</strong>
                  </div>
                  <div className="personnel-stat">
                    <span>Drivers with Infractions</span>
                    <strong className="warning">{dashboardData.personnel?.driversWithInfractions || 0}</strong>
                  </div>
                  <div className="personnel-stat">
                    <span>Average Points</span>
                    <strong className="info">{dashboardData.personnel?.averagePoints || 0}</strong>
                  </div>
                  <div className="personnel-stat">
                    <span>Critical Drivers</span>
                    <strong className="danger">{dashboardData.personnel?.criticalDrivers || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="personnel-card">
                <h4>Performance Metrics</h4>
                <div className="personnel-stats">
                  <div className="personnel-stat">
                    <span>Personnel Utilization</span>
                    <strong className="success">{insights.personnelUtilization || 0}%</strong>
                  </div>
                  <div className="personnel-stat">
                    <span>Driver Efficiency</span>
                    <strong className="info">{dashboardData.personnel?.driverEfficiency || 0}%</strong>
                  </div>
                  <div className="personnel-stat">
                    <span>Training Completion</span>
                    <strong className="warning">{dashboardData.personnel?.trainingCompletion || 0}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Personnel Health & Performance */}
            <div className="personnel-details">
              <div className="personnel-health">
                <h4>Personnel Health Status</h4>
                <div className="health-grid">
                  <div className="health-item">
                    <div className="health-icon success">
                      <FaCheckCircle />
                    </div>
                    <div className="health-info">
                      <span className="health-label">Fully Active</span>
                      <span className="health-count">{dashboardData.personnel?.activePersonnel || 0}</span>
                    </div>
                  </div>
                  <div className="health-item">
                    <div className="health-icon warning">
                      <FaExclamationTriangle />
                    </div>
                    <div className="health-info">
                      <span className="health-label">Needs Attention</span>
                      <span className="health-count">{dashboardData.personnel?.driversWithInfractions || 0}</span>
                    </div>
                  </div>
                  <div className="health-item">
                    <div className="health-icon danger">
                      <FaTimesCircle />
                    </div>
                    <div className="health-info">
                      <span className="health-label">Critical Status</span>
                      <span className="health-count">{dashboardData.personnel?.criticalDrivers || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="personnel-performance">
                <h4>Performance Metrics</h4>
                <div className="performance-grid">
                  <div className="performance-item">
                    <span className="performance-label">Personnel Utilization</span>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill" 
                        style={{ width: `${Math.min(100, insights.personnelUtilization || 0)}%` }}
                      ></div>
                    </div>
                    <span className="performance-value">
                      {insights.personnelUtilization || 0}%
                    </span>
                  </div>
                  <div className="performance-item">
                    <span className="performance-label">Driver Efficiency</span>
                    <div className="performance-bar">
                      <div 
                        className="performance-fill" 
                        style={{ width: `${Math.min(100, dashboardData.personnel?.driverEfficiency || 0)}%` }}
                      ></div>
                    </div>
                    <span className="performance-value">
                      {dashboardData.personnel?.driverEfficiency || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="role-distribution">
              <h4>Role Distribution</h4>
              <div className="role-grid">
                <div className="role-item">
                  <div className="role-icon drivers">
                    <FaBus />
                  </div>
                  <div className="role-info">
                    <span className="role-label">Drivers</span>
                    <span className="role-count">{dashboardData.personnel?.drivers || 0}</span>
                    <span className="role-percentage">
                      {Math.round(((dashboardData.personnel?.drivers || 0) / Math.max(1, dashboardData.personnel?.totalPersonnel || 1)) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="role-item">
                  <div className="role-icon admin">
                    <FaUserTie />
                  </div>
                  <div className="role-info">
                    <span className="role-label">Administrative</span>
                    <span className="role-count">{dashboardData.personnel?.administrative || 0}</span>
                    <span className="role-percentage">
                      {Math.round(((dashboardData.personnel?.administrative || 0) / Math.max(1, dashboardData.personnel?.totalPersonnel || 1)) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="role-item">
                  <div className="role-icon maintenance">
                    <FaWrench />
                  </div>
                  <div className="role-info">
                    <span className="role-label">Maintenance</span>
                    <span className="role-count">{dashboardData.personnel?.maintenance || 0}</span>
                    <span className="role-percentage">
                      {Math.round(((dashboardData.personnel?.maintenance || 0) / Math.max(1, dashboardData.personnel?.totalPersonnel || 1)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Garage Management Tab - Temporarily disabled for development */}
      {false && activeTab === 'garage' && (
        <div className="tab-content">
          <div className="garage-overview">
            <h3>Garage Management</h3>
            <div className="garage-grid">
              <div className="garage-card">
                <h4>Work Orders</h4>
                <div className="garage-stats">
                  <div className="garage-stat">
                    <span>Total Work Orders</span>
                    <strong>{dashboardData.garage.totalWorkOrders || 0}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>Pending</span>
                    <strong className="warning">{dashboardData.garage.pendingWorkOrders || 0}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>In Progress</span>
                    <strong className="info">{dashboardData.garage.inProgressWorkOrders || 0}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>Completed</span>
                    <strong className="success">{dashboardData.garage.completedWorkOrders || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="garage-card">
                <h4>Maintenance Schedules</h4>
                <div className="garage-stats">
                  <div className="garage-stat">
                    <span>Total Schedules</span>
                    <strong>{dashboardData.garage.totalSchedules || 0}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>Due This Week</span>
                    <strong className="warning">{dashboardData.garage.dueThisWeek || 0}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>Overdue</span>
                    <strong className="danger">{dashboardData.garage.overdueSchedules || 0}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>Completed</span>
                    <strong className="success">{dashboardData.garage.completedSchedules || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="garage-card">
                <h4>Vehicle Status</h4>
                <div className="garage-stats">
                  <div className="garage-stat">
                    <span>In Maintenance</span>
                    <strong className="warning">{dashboardData.garage.vehiclesInMaintenance || 0}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>Critical Alerts</span>
                    <strong className="danger">{dashboardData.garage.criticalAlerts || 0}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>Available</span>
                    <strong className="success">{dashboardData.garage.availableVehicles || 0}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>Out of Service</span>
                    <strong className="danger">{dashboardData.garage.outOfService || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="garage-card">
                <h4>Cost Analysis</h4>
                <div className="garage-stats">
                  <div className="garage-stat">
                    <span>Monthly Spending</span>
                    <strong>{formatCurrency(dashboardData.garage.monthlySpending || 0)}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>Average Cost per Order</span>
                    <strong>{formatCurrency(dashboardData.garage.avgCostPerOrder || 0)}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>Parts Cost</span>
                    <strong>{formatCurrency(dashboardData.garage.partsCost || 0)}</strong>
                  </div>
                  <div className="garage-stat">
                    <span>Labor Cost</span>
                    <strong>{formatCurrency(dashboardData.garage.laborCost || 0)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Management Tab - Temporarily disabled for development */}
      {false && activeTab === 'inventory' && (
        <div className="tab-content">
          <div className="inventory-overview">
            <h3>Inventory Management</h3>
            <div className="inventory-grid">
              <div className="inventory-card">
                <h4>Stock Overview</h4>
                <div className="inventory-stats">
                  <div className="inventory-stat">
                    <span>Total Items</span>
                    <strong>{dashboardData.inventory.totalInventory || 0}</strong>
                  </div>
                  <div className="inventory-stat">
                    <span>In Stock</span>
                    <strong className="success">{dashboardData.inventory.inStockItems || 0}</strong>
                  </div>
                  <div className="inventory-stat">
                    <span>Low Stock</span>
                    <strong className="warning">{dashboardData.inventory.lowStockItems || 0}</strong>
        </div>
                  <div className="inventory-stat">
                    <span>Out of Stock</span>
                    <strong className="danger">{dashboardData.inventory.outOfStockItems || 0}</strong>
        </div>
      </div>
    </div>

              <div className="inventory-card">
                <h4>Financial Overview</h4>
                <div className="inventory-stats">
                  <div className="inventory-stat">
                    <span>Total Value</span>
                    <strong>{formatCurrency(dashboardData.inventory.inventoryValue || 0)}</strong>
        </div>
                  <div className="inventory-stat">
                    <span>Monthly Spending</span>
                    <strong>{formatCurrency(dashboardData.financial.monthlySpending || 0)}</strong>
        </div>
                  <div className="inventory-stat">
                    <span>Average Item Cost</span>
                    <strong>{formatCurrency(dashboardData.financial.avgItemCost || 0)}</strong>
        </div>
                  <div className="inventory-stat">
                    <span>Reorder Value</span>
                    <strong className="warning">{formatCurrency(dashboardData.financial.reorderValue || 0)}</strong>
        </div>
      </div>
    </div>

              <div className="inventory-card">
                <h4>Purchase Orders</h4>
                <div className="inventory-stats">
                  <div className="inventory-stat">
                    <span>Total Orders</span>
                    <strong>{dashboardData.inventory.totalPurchaseOrders || 0}</strong>
                  </div>
                  <div className="inventory-stat">
                    <span>Pending</span>
                    <strong className="warning">{dashboardData.inventory.pendingOrders || 0}</strong>
                  </div>
                  <div className="inventory-stat">
                    <span>Completed</span>
                    <strong className="success">{dashboardData.inventory.completedOrders || 0}</strong>
                  </div>
                  <div className="inventory-stat">
                    <span>This Month</span>
                    <strong>{dashboardData.inventory.ordersThisMonth || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="inventory-card">
                <h4>Supplier Management</h4>
                <div className="inventory-stats">
                  <div className="inventory-stat">
                    <span>Total Suppliers</span>
                    <strong>{dashboardData.inventory.totalSuppliers || 0}</strong>
                  </div>
                  <div className="inventory-stat">
                    <span>Active Suppliers</span>
                    <strong className="success">{dashboardData.inventory.activeSuppliers || 0}</strong>
                  </div>
                  <div className="inventory-stat">
                    <span>Top Supplier</span>
                    <strong>{dashboardData.inventory.topSupplier || 'N/A'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

      {/* User Management Tab - Temporarily disabled for development */}
      {false && activeTab === 'users' && (
        <div className="tab-content">
          <div className="users-overview">
            <h3>User Management</h3>
            <div className="users-grid">
              <div className="users-card">
                <h4>User Overview</h4>
                <div className="users-stats">
                  <div className="users-stat">
                    <span>Total Users</span>
                    <strong>{dashboardData.users.totalUsers || 0}</strong>
                  </div>
                  <div className="users-stat">
                    <span>Active Users</span>
                    <strong className="success">{dashboardData.users.activeUsers || 0}</strong>
                  </div>
                  <div className="users-stat">
                    <span>Inactive Users</span>
                    <strong className="warning">{dashboardData.users.inactiveUsers || 0}</strong>
                  </div>
                </div>
      </div>

              <div className="users-card">
                <h4>Role Distribution</h4>
                <div className="users-stats">
                  <div className="users-stat">
                    <span>Super Admins</span>
                    <strong>{dashboardData.users.superAdmins || 0}</strong>
                  </div>
                  <div className="users-stat">
                    <span>Terminal Managers</span>
                    <strong>{dashboardData.users.terminalManagers || 0}</strong>
                  </div>
                  <div className="users-stat">
                    <span>Route Managers</span>
                    <strong>{dashboardData.users.routeManagers || 0}</strong>
                  </div>
                  <div className="users-stat">
                    <span>Fleet Managers</span>
                    <strong>{dashboardData.users.fleetManagers || 0}</strong>
                  </div>
                </div>
      </div>

              <div className="users-card">
                <h4>Terminal Distribution</h4>
                <div className="users-stats">
                  <div className="users-stat">
                    <span>Kigali Terminal</span>
                    <strong>{dashboardData.users.kigaliUsers || 0}</strong>
                  </div>
                  <div className="users-stat">
                    <span>Kampala Terminal</span>
                    <strong>{dashboardData.users.kampalaUsers || 0}</strong>
                  </div>
                  <div className="users-stat">
                    <span>Nairobi Terminal</span>
                    <strong>{dashboardData.users.nairobiUsers || 0}</strong>
                  </div>
                  <div className="users-stat">
                    <span>Juba Terminal</span>
                    <strong>{dashboardData.users.jubaUsers || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;