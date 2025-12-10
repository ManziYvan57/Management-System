import React, { useState, useEffect } from 'react';
import { 
  FaBus,
  FaClock,
  FaCalendarAlt,
  FaWarehouse, FaBuilding
} from 'react-icons/fa';
import { vehiclesAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userCompany = user.company || 'Kigali';
  const userRole = user.role || 'user';

  // Initialize with user's company, allow admins to switch
  const [activeTerminal, setActiveTerminal] = useState(userCompany);
  const [availableTerminals, setAvailableTerminals] = useState(
    userRole === 'super_admin' || userRole === 'admin' 
      ? ['Kigali', 'Musanze', 'Nyabugogo', 'Muhanga', 'Rusizi', 'Rubavu', 'Huye']
      : [userCompany]
  );

  const [dashboardData, setDashboardData] = useState({
    totalVehicles: 0,
    activeVehicles: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle terminal tab change
  const handleTerminalChange = (terminal) => {
    setActiveTerminal(terminal);
  };

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const vehiclesRes = await vehiclesAPI.getStats({ terminal: activeTerminal });
        
        setDashboardData({
          totalVehicles: vehiclesRes.data?.totalVehicles || 0,
          activeVehicles: vehiclesRes.data?.activeVehicles || 0
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setDashboardData({
          totalVehicles: 0,
          activeVehicles: 0
        });
        setError(`Failed to load data - ${err.message || 'API connection failed'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeTerminal]);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Jali Transport Dashboard</h1>
           <div className="terminal-info">
             <FaBuilding className="terminal-icon" />
             <span>Location: <strong>{activeTerminal}</strong></span>
           </div>
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

      {/* Terminal Tabs */}
      <div className="terminal-tabs">
        {availableTerminals.map((terminal) => (
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

      {/* Key Metrics - Total Vehicles Only */}
      <div className="key-metrics">
        <div className="metric-card primary">
          <div className="metric-icon">
            <FaBus />
          </div>
          <div className="metric-content">
            <h3>{dashboardData.totalVehicles || 0}</h3>
            <p>Total Vehicles</p>
            <span className="metric-subtitle">{dashboardData.activeVehicles || 0} active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
