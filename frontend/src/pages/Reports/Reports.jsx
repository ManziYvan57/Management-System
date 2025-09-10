import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaFileAlt, 
  FaDownload, 
  FaCalendarAlt, 
  FaFilter,
  FaCar,
  FaUsers,
  FaDollarSign,
  FaWrench,
  FaBoxes,
  FaClipboardList
} from 'react-icons/fa';
import { 
  vehiclesAPI, 
  personnelAPI, 
  dashboardAPI, 
  garageAPI, 
  inventoryAPI,
  equipmentAPI
} from '../../services/api';
import './Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedTerminal, setSelectedTerminal] = useState('all');
  const [loading, setLoading] = useState({});
  const [reportData, setReportData] = useState({});
  const [recentReports, setRecentReports] = useState([]);

  const reportCategories = [
    {
      id: 'vehicles',
      title: 'Vehicle Reports',
      icon: FaCar,
      description: 'Vehicle utilization, maintenance, and performance reports',
      color: '#3B82F6',
      reports: [
        { id: 'vehicle-overview', name: 'Vehicle Overview', description: 'Vehicle status, counts, and basic metrics' },
        { id: 'vehicle-performance', name: 'Vehicle Performance', description: 'Vehicle utilization and efficiency metrics' },
        { id: 'vehicle-maintenance', name: 'Vehicle Maintenance', description: 'Maintenance history and costs by vehicle' }
      ]
    },
    {
      id: 'personnel',
      title: 'Personnel Reports',
      icon: FaUsers,
      description: 'Staff performance and driver metrics',
      color: '#10B981',
      reports: [
        { id: 'personnel-overview', name: 'Personnel Overview', description: 'Staff counts, roles, and status breakdown' },
        { id: 'driver-performance', name: 'Driver Performance', description: 'Driver efficiency and safety metrics' },
        { id: 'personnel-stats', name: 'Personnel Statistics', description: 'Detailed personnel analytics and trends' }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Reports',
      icon: FaDollarSign,
      description: 'Financial overview and cost analysis',
      color: '#F59E0B',
      reports: [
        { id: 'financial-overview', name: 'Financial Overview', description: 'Asset values, costs, and financial metrics' },
        { id: 'maintenance-costs', name: 'Maintenance Costs', description: 'Maintenance spending and cost analysis' },
        { id: 'inventory-costs', name: 'Inventory Costs', description: 'Inventory value and spending analysis' }
      ]
    },
    {
      id: 'maintenance',
      title: 'Maintenance Reports',
      icon: FaWrench,
      description: 'Work orders and maintenance tracking',
      color: '#EF4444',
      reports: [
        { id: 'work-orders', name: 'Work Orders', description: 'Work order status and completion tracking' },
        { id: 'maintenance-stats', name: 'Maintenance Statistics', description: 'Maintenance performance and efficiency' },
        { id: 'garage-overview', name: 'Garage Overview', description: 'Garage operations and work order summary' }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Reports',
      icon: FaBoxes,
      description: 'Stock levels and inventory management',
      color: '#06B6D4',
      reports: [
        { id: 'inventory-overview', name: 'Inventory Overview', description: 'Stock levels and inventory status' },
        { id: 'inventory-stats', name: 'Inventory Statistics', description: 'Inventory analytics and trends' },
        { id: 'low-stock', name: 'Low Stock Alert', description: 'Items requiring restocking' }
      ]
    },
    {
      id: 'equipment',
      title: 'Equipment Reports',
      icon: FaClipboardList,
      description: 'Equipment status and utilization',
      color: '#8B5CF6',
      reports: [
        { id: 'equipment-overview', name: 'Equipment Overview', description: 'Equipment status and basic metrics' },
        { id: 'equipment-stats', name: 'Equipment Statistics', description: 'Equipment utilization and performance' }
      ]
    }
  ];

  const terminals = [
    { value: 'all', label: 'All Terminals' },
    { value: 'Kigali', label: 'Kigali' },
    { value: 'Kampala', label: 'Kampala' },
    { value: 'Nairobi', label: 'Nairobi' },
    { value: 'Juba', label: 'Juba' }
  ];

  const handleGenerateReport = async (reportId, categoryId) => {
    const loadingKey = `${categoryId}-${reportId}`;
    
    // Set loading state for this specific report
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      let data = null;
      const params = {
        terminal: selectedTerminal !== 'all' ? selectedTerminal : undefined,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      // Generate report based on category and report ID
      switch (categoryId) {
        case 'vehicles':
          if (reportId === 'vehicle-overview') {
            data = await vehiclesAPI.getStats(params);
          } else if (reportId === 'vehicle-performance') {
            data = await vehiclesAPI.getAll(params);
          } else if (reportId === 'vehicle-maintenance') {
            data = await garageAPI.getWorkOrders(params);
          }
          break;
          
        case 'personnel':
          if (reportId === 'personnel-overview') {
            data = await personnelAPI.getAll(params);
          } else if (reportId === 'driver-performance') {
            data = await personnelAPI.getDrivers(params);
          } else if (reportId === 'personnel-stats') {
            data = await personnelAPI.getStats(params);
          }
          break;
          
        case 'financial':
          if (reportId === 'financial-overview') {
            data = await dashboardAPI.getFinancials();
          } else if (reportId === 'maintenance-costs') {
            data = await garageAPI.getStats(params);
          } else if (reportId === 'inventory-costs') {
            data = await inventoryAPI.getStats(params);
          }
          break;
          
        case 'maintenance':
          if (reportId === 'work-orders') {
            data = await garageAPI.getWorkOrders(params);
          } else if (reportId === 'maintenance-stats') {
            data = await garageAPI.getStats(params);
          } else if (reportId === 'garage-overview') {
            data = await garageAPI.getStats(params);
          }
          break;
          
        case 'inventory':
          if (reportId === 'inventory-overview') {
            data = await inventoryAPI.getAll(params);
          } else if (reportId === 'inventory-stats') {
            data = await inventoryAPI.getStats(params);
          } else if (reportId === 'low-stock') {
            data = await inventoryAPI.getAll({ ...params, lowStock: true });
          }
          break;
          
        case 'equipment':
          if (reportId === 'equipment-overview') {
            data = await equipmentAPI.getAll(params);
          } else if (reportId === 'equipment-stats') {
            data = await equipmentAPI.getStats(params);
          }
          break;
          
        default:
          throw new Error('Unknown report category');
      }

      // Store the report data
      setReportData(prev => ({
        ...prev,
        [loadingKey]: {
          data,
          generatedAt: new Date().toISOString(),
          reportId,
          categoryId,
          params
        }
      }));

      // Add to recent reports
      const reportName = reportCategories
        .find(cat => cat.id === categoryId)
        ?.reports.find(rep => rep.id === reportId)?.name || 'Unknown Report';
      
      setRecentReports(prev => [
        {
          id: loadingKey,
          name: reportName,
          category: categoryId,
          generatedAt: new Date().toISOString(),
          data
        },
        ...prev.slice(0, 4) // Keep only last 5 reports
      ]);

      alert(`Report "${reportName}" generated successfully!`);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`Error generating report: ${error.message}`);
    } finally {
      // Clear loading state for this specific report
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleExportReport = (format) => {
    // Simulate export functionality
    console.log(`Exporting report as ${format}`);
    alert(`Report exported as ${format.toUpperCase()} successfully! (This is a demo)`);
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="reports-title">
          <FaChartBar className="reports-icon" />
          <h1>Reports & Analytics</h1>
        </div>
        <p className="reports-subtitle">
          Generate comprehensive reports and analytics for your transport operations
        </p>
      </div>

      {/* Filters Section */}
      <div className="reports-filters">
        <div className="filter-group">
          <label htmlFor="dateRange">Date Range</label>
          <div className="date-range-inputs">
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="date-input"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="date-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="terminal">Terminal</label>
          <select
            id="terminal"
            value={selectedTerminal}
            onChange={(e) => setSelectedTerminal(e.target.value)}
            className="terminal-select"
          >
            {terminals.map(terminal => (
              <option key={terminal.value} value={terminal.value}>
                {terminal.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button className="filter-btn">
            <FaFilter />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="reports-quick-stats">
        <div className="quick-stat">
          <div className="stat-icon">
            <FaFileAlt />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {reportCategories.reduce((total, category) => total + category.reports.length, 0)}
            </span>
            <span className="stat-label">Available Reports</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24))}
            </span>
            <span className="stat-label">Days Range</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="stat-icon">
            <FaDownload />
          </div>
          <div className="stat-content">
            <span className="stat-number">{recentReports.length}</span>
            <span className="stat-label">Generated Reports</span>
          </div>
        </div>
      </div>

      {/* Report Categories */}
      <div className="reports-categories">
        {reportCategories.map(category => {
          const IconComponent = category.icon;
          return (
            <div key={category.id} className="report-category">
              <div className="category-header">
                <div className="category-icon" style={{ backgroundColor: category.color }}>
                  <IconComponent />
                </div>
                <div className="category-info">
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                </div>
              </div>

              <div className="category-reports">
                {category.reports.map(report => (
                  <div key={report.id} className="report-item">
                    <div className="report-info">
                      <h4>{report.name}</h4>
                      <p>{report.description}</p>
                    </div>
                    <div className="report-actions">
                      <button
                        className="generate-btn"
                        onClick={() => handleGenerateReport(report.id, category.id)}
                        disabled={loading[`${category.id}-${report.id}`]}
                      >
                        {loading[`${category.id}-${report.id}`] ? 'Generating...' : 'Generate'}
                      </button>
                      <div className="export-dropdown">
                        <button className="export-btn">
                          <FaDownload />
                        </button>
                        <div className="export-menu">
                          <button onClick={() => handleExportReport('pdf')}>PDF</button>
                          <button onClick={() => handleExportReport('excel')}>Excel</button>
                          <button onClick={() => handleExportReport('csv')}>CSV</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div className="recent-reports">
        <h3>Recent Reports</h3>
        <div className="recent-reports-list">
          {recentReports.length > 0 ? (
            recentReports.map((report, index) => {
              const category = reportCategories.find(cat => cat.id === report.category);
              const IconComponent = category?.icon || FaFileAlt;
              const timeAgo = new Date(report.generatedAt).toLocaleString();
              
              return (
                <div key={report.id} className="recent-report-item">
                  <div className="report-icon">
                    <IconComponent />
                  </div>
                  <div className="report-details">
                    <h4>{report.name}</h4>
                    <p>Generated {timeAgo}</p>
                  </div>
                  <div className="report-status success">Completed</div>
                </div>
              );
            })
          ) : (
            <div className="no-reports">
              <p>No reports generated yet. Generate your first report above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
