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
  FaRoute,
  FaWarehouse,
  FaClipboardList
} from 'react-icons/fa';
import './Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedTerminal, setSelectedTerminal] = useState('all');
  const [loading, setLoading] = useState(false);

  const reportCategories = [
    {
      id: 'vehicles',
      title: 'Vehicle Reports',
      icon: FaCar,
      description: 'Vehicle utilization, maintenance, and performance reports',
      color: '#3B82F6',
      reports: [
        { id: 'vehicle-utilization', name: 'Vehicle Utilization Report', description: 'Track vehicle usage and efficiency' },
        { id: 'maintenance-summary', name: 'Maintenance Summary', description: 'Vehicle maintenance history and costs' },
        { id: 'fuel-consumption', name: 'Fuel Consumption Report', description: 'Fuel usage and efficiency analysis' },
        { id: 'vehicle-performance', name: 'Vehicle Performance', description: 'Performance metrics and reliability' }
      ]
    },
    {
      id: 'personnel',
      title: 'Personnel Reports',
      icon: FaUsers,
      description: 'Staff performance, attendance, and training reports',
      color: '#10B981',
      reports: [
        { id: 'personnel-performance', name: 'Performance Report', description: 'Staff performance and evaluation metrics' },
        { id: 'attendance-summary', name: 'Attendance Summary', description: 'Staff attendance and leave tracking' },
        { id: 'training-compliance', name: 'Training Compliance', description: 'Training completion and certification status' },
        { id: 'driver-efficiency', name: 'Driver Efficiency', description: 'Driver performance and safety metrics' }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Reports',
      icon: FaDollarSign,
      description: 'Revenue, expenses, and profitability analysis',
      color: '#F59E0B',
      reports: [
        { id: 'revenue-analysis', name: 'Revenue Analysis', description: 'Income tracking and revenue trends' },
        { id: 'expense-breakdown', name: 'Expense Breakdown', description: 'Detailed expense categorization' },
        { id: 'profit-loss', name: 'Profit & Loss Statement', description: 'Comprehensive P&L analysis' },
        { id: 'cost-per-mile', name: 'Cost Per Mile', description: 'Operational cost efficiency metrics' }
      ]
    },
    {
      id: 'maintenance',
      title: 'Maintenance Reports',
      icon: FaWrench,
      description: 'Work orders, schedules, and maintenance costs',
      color: '#EF4444',
      reports: [
        { id: 'work-order-summary', name: 'Work Order Summary', description: 'Maintenance work order tracking' },
        { id: 'preventive-maintenance', name: 'Preventive Maintenance', description: 'Scheduled maintenance compliance' },
        { id: 'parts-usage', name: 'Parts Usage Report', description: 'Inventory usage and costs' },
        { id: 'maintenance-costs', name: 'Maintenance Costs', description: 'Detailed maintenance cost analysis' }
      ]
    },
    {
      id: 'operations',
      title: 'Operations Reports',
      icon: FaRoute,
      description: 'Route performance, trips, and operational metrics',
      color: '#8B5CF6',
      reports: [
        { id: 'route-performance', name: 'Route Performance', description: 'Route efficiency and profitability' },
        { id: 'trip-summary', name: 'Trip Summary', description: 'Trip completion and timing analysis' },
        { id: 'customer-satisfaction', name: 'Customer Satisfaction', description: 'Service quality and feedback metrics' },
        { id: 'operational-efficiency', name: 'Operational Efficiency', description: 'Overall operational performance' }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Reports',
      icon: FaWarehouse,
      description: 'Stock levels, usage, and procurement reports',
      color: '#06B6D4',
      reports: [
        { id: 'stock-levels', name: 'Stock Levels', description: 'Current inventory levels and status' },
        { id: 'usage-analysis', name: 'Usage Analysis', description: 'Parts and supplies usage patterns' },
        { id: 'reorder-alerts', name: 'Reorder Alerts', description: 'Items requiring restocking' },
        { id: 'procurement-summary', name: 'Procurement Summary', description: 'Purchase orders and supplier analysis' }
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
    setLoading(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would call your API to generate the actual report
      console.log('Generating report:', reportId, 'for category:', categoryId);
      console.log('Date range:', dateRange);
      console.log('Terminal:', selectedTerminal);
      
      // For now, just show success message
      alert('Report generated successfully! (This is a demo)');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setLoading(false);
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
            <span className="stat-number">24</span>
            <span className="stat-label">Available Reports</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <span className="stat-number">7</span>
            <span className="stat-label">Days Range</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="stat-icon">
            <FaDownload />
          </div>
          <div className="stat-content">
            <span className="stat-number">3</span>
            <span className="stat-label">Export Formats</span>
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
                        disabled={loading}
                      >
                        {loading ? 'Generating...' : 'Generate'}
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
          <div className="recent-report-item">
            <div className="report-icon">
              <FaCar />
            </div>
            <div className="report-details">
              <h4>Vehicle Utilization Report</h4>
              <p>Generated 2 hours ago</p>
            </div>
            <div className="report-status success">Completed</div>
          </div>
          <div className="recent-report-item">
            <div className="report-icon">
              <FaUsers />
            </div>
            <div className="report-details">
              <h4>Personnel Performance Report</h4>
              <p>Generated 1 day ago</p>
            </div>
            <div className="report-status success">Completed</div>
          </div>
          <div className="recent-report-item">
            <div className="report-icon">
              <FaDollarSign />
            </div>
            <div className="report-details">
              <h4>Financial Summary Report</h4>
              <p>Generated 3 days ago</p>
            </div>
            <div className="report-status success">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
