import React, { useState, useEffect } from 'react';
import { 
  FaTools, FaBoxes, FaBus, FaUsers, FaRoute, 
  FaExclamationTriangle, FaCheckCircle, FaClock,
  FaChartLine, FaChartBar, FaChartPie, FaCalendarAlt,
  FaDollarSign, FaWrench, FaTruck, FaUserTie
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data - In real implementation, this would come from API calls
  const [dashboardData, setDashboardData] = useState({
    // Garage Data
    garage: {
      totalWorkOrders: 24,
      pendingWorkOrders: 8,
      completedWorkOrders: 16,
      vehiclesInMaintenance: 5,
      criticalAlerts: 2,
      monthlySpending: 2500000, // RWF
      topIssues: ['Engine Problems', 'Brake System', 'Electrical Issues']
    },
    
    // Inventory Data
    inventory: {
      totalItems: 156,
      lowStockItems: 12,
      outOfStockItems: 3,
      totalValue: 45000000, // RWF
      monthlySpending: 8500000, // RWF
      topCategories: ['Engine Parts', 'Brake System', 'Electrical']
    },
    
    // Assets Data
    assets: {
      totalAssets: 89,
      activeAssets: 76,
      underMaintenance: 8,
      retiredAssets: 5,
      totalValue: 125000000, // RWF
      depreciation: 15000000, // RWF
      categories: {
        vehicles: 45,
        equipment: 28,
        tools: 16
      }
    },
    
    // Personnel Data
    personnel: {
      totalPersonnel: 67,
      drivers: 45,
      customerCare: 12,
      mechanics: 8,
      management: 2,
      activePersonnel: 65,
      onLeave: 2,
      performanceScore: 92
    },
    
    // Transport Data
    transport: {
      totalRoutes: 6,
      activeRoutes: 6,
      totalVehicles: 34,
      todayTrips: 28,
      inTransit: 12,
      completedToday: 16,
      onTimePercentage: 94,
      totalPersonnel: 67
    }
  });

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Calculate cross-module insights
  const insights = {
    // Financial Overview
    totalMonthlySpending: dashboardData.garage.monthlySpending + dashboardData.inventory.monthlySpending,
    totalAssetValue: dashboardData.assets.totalValue,
    netAssetValue: dashboardData.assets.totalValue - dashboardData.assets.depreciation,
    
    // Operational Efficiency
    vehicleUtilization: Math.round((dashboardData.transport.todayTrips / dashboardData.transport.totalVehicles) * 100),
    maintenanceEfficiency: Math.round((dashboardData.garage.completedWorkOrders / dashboardData.garage.totalWorkOrders) * 100),
    personnelUtilization: Math.round((dashboardData.personnel.activePersonnel / dashboardData.personnel.totalPersonnel) * 100),
    
    // Critical Alerts
    criticalAlerts: [
      ...(dashboardData.garage.criticalAlerts > 0 ? [`${dashboardData.garage.criticalAlerts} vehicles need immediate attention`] : []),
      ...(dashboardData.inventory.outOfStockItems > 0 ? [`${dashboardData.inventory.outOfStockItems} items out of stock`] : []),
      ...(dashboardData.inventory.lowStockItems > 5 ? [`${dashboardData.inventory.lowStockItems} items running low`] : [])
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

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine className="tab-icon" />
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          <FaDollarSign className="tab-icon" />
          Financial
        </button>
        <button 
          className={`tab-btn ${activeTab === 'operations' ? 'active' : ''}`}
          onClick={() => setActiveTab('operations')}
        >
          <FaTruck className="tab-icon" />
          Operations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          <FaWrench className="tab-icon" />
          Maintenance
        </button>
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
                <h3>{dashboardData.transport.totalVehicles}</h3>
                <p>Total Vehicles</p>
                <span className="metric-subtitle">{dashboardData.transport.inTransit} in transit</span>
              </div>
            </div>

            <div className="metric-card success">
              <div className="metric-icon">
                <FaRoute />
              </div>
              <div className="metric-content">
                <h3>{dashboardData.transport.todayTrips}</h3>
                <p>Today's Trips</p>
                <span className="metric-subtitle">{dashboardData.transport.onTimePercentage}% on time</span>
              </div>
            </div>

            <div className="metric-card warning">
              <div className="metric-icon">
                <FaUsers />
              </div>
              <div className="metric-content">
                <h3>{dashboardData.personnel.totalPersonnel}</h3>
                <p>Total Personnel</p>
                <span className="metric-subtitle">{dashboardData.personnel.performanceScore}% performance</span>
              </div>
            </div>

            <div className="metric-card info">
              <div className="metric-icon">
                <FaDollarSign />
              </div>
              <div className="metric-content">
                <h3>{formatCurrency(insights.totalAssetValue)}</h3>
                <p>Total Asset Value</p>
                <span className="metric-subtitle">{formatCurrency(insights.netAssetValue)} net value</span>
              </div>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="efficiency-metrics">
            <h3>Operational Efficiency</h3>
            <div className="efficiency-grid">
              <div className="efficiency-card">
                <div className="efficiency-header">
                  <FaTruck className="efficiency-icon" />
                  <span>Vehicle Utilization</span>
                </div>
                <div className="efficiency-value">{insights.vehicleUtilization}%</div>
                <div className="efficiency-bar">
                  <div 
                    className="efficiency-fill" 
                    style={{ width: `${insights.vehicleUtilization}%` }}
                  ></div>
                </div>
              </div>

              <div className="efficiency-card">
                <div className="efficiency-header">
                  <FaWrench className="efficiency-icon" />
                  <span>Maintenance Efficiency</span>
                </div>
                <div className="efficiency-value">{insights.maintenanceEfficiency}%</div>
                <div className="efficiency-bar">
                  <div 
                    className="efficiency-fill" 
                    style={{ width: `${insights.maintenanceEfficiency}%` }}
                  ></div>
                </div>
              </div>

              <div className="efficiency-card">
                <div className="efficiency-header">
                  <FaUserTie className="efficiency-icon" />
                  <span>Personnel Utilization</span>
                </div>
                <div className="efficiency-value">{insights.personnelUtilization}%</div>
                <div className="efficiency-bar">
                  <div 
                    className="efficiency-fill" 
                    style={{ width: `${insights.personnelUtilization}%` }}
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
                  <h4>{dashboardData.garage.totalWorkOrders}</h4>
                  <p>Work Orders</p>
                </div>
              </div>

              <div className="stat-item">
                <FaBoxes className="stat-icon" />
                <div className="stat-info">
                  <h4>{dashboardData.inventory.totalItems}</h4>
                  <p>Inventory Items</p>
                </div>
              </div>

              <div className="stat-item">
                <FaBus className="stat-icon" />
                <div className="stat-info">
                  <h4>{dashboardData.assets.totalAssets}</h4>
                  <p>Total Assets</p>
                </div>
              </div>

              <div className="stat-item">
                <FaRoute className="stat-icon" />
                <div className="stat-info">
                  <h4>{dashboardData.transport.totalRoutes}</h4>
                  <p>Active Routes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div className="tab-content">
          <div className="financial-overview">
            <h3>Financial Overview</h3>
            <div className="financial-grid">
              <div className="financial-card">
                <h4>Total Asset Value</h4>
                <div className="financial-amount">{formatCurrency(dashboardData.assets.totalValue)}</div>
                <p>All company assets</p>
              </div>

              <div className="financial-card">
                <h4>Net Asset Value</h4>
                <div className="financial-amount">{formatCurrency(insights.netAssetValue)}</div>
                <p>After depreciation</p>
              </div>

              <div className="financial-card">
                <h4>Monthly Spending</h4>
                <div className="financial-amount">{formatCurrency(insights.totalMonthlySpending)}</div>
                <p>Garage + Inventory</p>
              </div>

              <div className="financial-card">
                <h4>Inventory Value</h4>
                <div className="financial-amount">{formatCurrency(dashboardData.inventory.totalValue)}</div>
                <p>Current stock value</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operations Tab */}
      {activeTab === 'operations' && (
        <div className="tab-content">
          <div className="operations-overview">
            <h3>Transport Operations</h3>
            <div className="operations-grid">
              <div className="operation-card">
                <h4>Today's Performance</h4>
                <div className="operation-stats">
                  <div className="operation-stat">
                    <span>Trips Completed</span>
                    <strong>{dashboardData.transport.completedToday}</strong>
                  </div>
                  <div className="operation-stat">
                    <span>In Transit</span>
                    <strong>{dashboardData.transport.inTransit}</strong>
                  </div>
                  <div className="operation-stat">
                    <span>On Time Rate</span>
                    <strong>{dashboardData.transport.onTimePercentage}%</strong>
                  </div>
                </div>
              </div>

              <div className="operation-card">
                <h4>Personnel Status</h4>
                <div className="operation-stats">
                  <div className="operation-stat">
                    <span>Active Personnel</span>
                    <strong>{dashboardData.personnel.activePersonnel}</strong>
                  </div>
                  <div className="operation-stat">
                    <span>On Leave</span>
                    <strong>{dashboardData.personnel.onLeave}</strong>
                  </div>
                  <div className="operation-stat">
                    <span>Performance Score</span>
                    <strong>{dashboardData.personnel.performanceScore}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="tab-content">
          <div className="maintenance-overview">
            <h3>Maintenance Status</h3>
            <div className="maintenance-grid">
              <div className="maintenance-card">
                <h4>Work Orders</h4>
                <div className="maintenance-stats">
                  <div className="maintenance-stat">
                    <span>Total</span>
                    <strong>{dashboardData.garage.totalWorkOrders}</strong>
                  </div>
                  <div className="maintenance-stat">
                    <span>Pending</span>
                    <strong className="warning">{dashboardData.garage.pendingWorkOrders}</strong>
                  </div>
                  <div className="maintenance-stat">
                    <span>Completed</span>
                    <strong className="success">{dashboardData.garage.completedWorkOrders}</strong>
                  </div>
                </div>
              </div>

              <div className="maintenance-card">
                <h4>Vehicle Status</h4>
                <div className="maintenance-stats">
                  <div className="maintenance-stat">
                    <span>In Maintenance</span>
                    <strong className="warning">{dashboardData.garage.vehiclesInMaintenance}</strong>
                  </div>
                  <div className="maintenance-stat">
                    <span>Critical Alerts</span>
                    <strong className="danger">{dashboardData.garage.criticalAlerts}</strong>
                  </div>
                  <div className="maintenance-stat">
                    <span>Available</span>
                    <strong className="success">{dashboardData.transport.totalVehicles - dashboardData.garage.vehiclesInMaintenance}</strong>
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
