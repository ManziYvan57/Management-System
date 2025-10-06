import React, { useState } from 'react';
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
import './ReportsByTerminal.css';

const ReportsByTerminal = ({ terminal }) => {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState({});
  const [previewReport, setPreviewReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const handleGenerateReport = async (reportId, categoryId) => {
    const loadingKey = `${categoryId}-${reportId}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      let data = null;
      const params = {
        terminal: terminal.value,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      };

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
            data = await dashboardAPI.getFinancials({ terminal: terminal.value });
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

      const reportInfo = {
        data,
        generatedAt: new Date().toISOString(),
        reportId,
        categoryId,
        params
      };

      setReportData(prev => ({
        ...prev,
        [loadingKey]: reportInfo
      }));

      setPreviewReport(reportInfo);
      setShowPreview(true);

    } catch (error) {
      console.error('Error generating report:', error);
      alert(`Error generating report: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const renderReportSummary = (reportInfo) => {
    const { data, reportId, categoryId } = reportInfo;
    const reportData = data?.data;

    if (!reportData) {
      return <div className="no-data"><p>No data available</p></div>;
    }

    switch (categoryId) {
      case 'vehicles':
        return renderVehicleSummary(reportData, reportId);
      case 'personnel':
        return renderPersonnelSummary(reportData, reportId);
      case 'financial':
        return renderFinancialSummary(reportData, reportId);
      case 'maintenance':
        return renderMaintenanceSummary(reportData, reportId);
      case 'inventory':
        return renderInventorySummary(reportData, reportId);
      case 'equipment':
        return renderEquipmentSummary(reportData, reportId);
      default:
        return renderGenericSummary(reportData);
    }
  };

  const renderVehicleSummary = (data, reportId) => {
    if (reportId === 'vehicle-overview') {
      return (
        <div className="summary-cards">
          <div className="summary-card">
            <h5>Total Vehicles</h5>
            <span className="summary-number">{data.totalVehicles || 0}</span>
          </div>
          <div className="summary-card">
            <h5>Active Vehicles</h5>
            <span className="summary-number success">{data.activeVehicles || 0}</span>
          </div>
          <div className="summary-card">
            <h5>In Maintenance</h5>
            <span className="summary-number warning">{data.maintenanceVehicles || 0}</span>
          </div>
          <div className="summary-card">
            <h5>Out of Service</h5>
            <span className="summary-number danger">{data.outOfServiceVehicles || 0}</span>
          </div>
          <div className="summary-card">
            <h5>Total Value</h5>
            <span className="summary-number">${(data.totalValue || 0).toLocaleString()}</span>
          </div>
          <div className="summary-card">
            <h5>Total Mileage</h5>
            <span className="summary-number">{(data.totalMileage || 0).toLocaleString()} km</span>
          </div>
        </div>
      );
    } else if (reportId === 'vehicle-performance') {
      const vehicles = Array.isArray(data) ? data : data.data || [];
      return (
        <div>
          <p><strong>Total Vehicles:</strong> {vehicles.length}</p>
          {vehicles.length > 0 && (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Plate Number</th>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Status</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.slice(0, 10).map((vehicle, index) => (
                    <tr key={index}>
                      <td>{vehicle.plateNumber || 'N/A'}</td>
                      <td>{vehicle.make || 'N/A'}</td>
                      <td>{vehicle.model || 'N/A'}</td>
                      <td><span className={`status-badge ${vehicle.status}`}>{vehicle.status || 'N/A'}</span></td>
                      <td>${(vehicle.currentValue || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vehicles.length > 10 && (
                <p className="data-note">... and {vehicles.length - 10} more vehicles</p>
              )}
            </div>
          )}
        </div>
      );
    }
    return renderGenericSummary(data);
  };

  const renderPersonnelSummary = (data, reportId) => {
    if (reportId === 'personnel-overview') {
      const personnel = Array.isArray(data) ? data : data.data || [];
      return (
        <div>
          <p><strong>Total Personnel:</strong> {personnel.length}</p>
          {personnel.length > 0 && (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Terminal</th>
                  </tr>
                </thead>
                <tbody>
                  {personnel.slice(0, 10).map((person, index) => (
                    <tr key={index}>
                      <td>{person.firstName} {person.lastName}</td>
                      <td>{person.role || 'N/A'}</td>
                      <td>{person.department || 'N/A'}</td>
                      <td><span className={`status-badge ${person.employmentStatus}`}>{person.employmentStatus || 'N/A'}</span></td>
                      <td>{person.terminal || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {personnel.length > 10 && (
                <p className="data-note">... and {personnel.length - 10} more personnel</p>
              )}
            </div>
          )}
        </div>
      );
    } else if (reportId === 'driver-performance') {
      const drivers = Array.isArray(data) ? data : data.data || [];
      return (
        <div>
          <p><strong>Total Drivers:</strong> {drivers.length}</p>
          {drivers.length > 0 && (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>License Number</th>
                    <th>Points</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.slice(0, 10).map((driver, index) => (
                    <tr key={index}>
                      <td>{driver.firstName} {driver.lastName}</td>
                      <td>{driver.licenseNumber || 'N/A'}</td>
                      <td>{driver.drivingPoints || 0}</td>
                      <td>{driver.assignedVehicle?.plateNumber || 'Unassigned'}</td>
                      <td><span className={`status-badge ${driver.employmentStatus}`}>{driver.employmentStatus || 'N/A'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {drivers.length > 10 && (
                <p className="data-note">... and {drivers.length - 10} more drivers</p>
              )}
            </div>
          )}
        </div>
      );
    }
    return renderGenericSummary(data);
  };

  const renderFinancialSummary = (data, reportId) => {
    if (reportId === 'financial-overview') {
      return (
        <div className="summary-cards">
          <div className="summary-card">
            <h5>Total Asset Value</h5>
            <span className="summary-number">${(data.totalAssetValue || 0).toLocaleString()}</span>
          </div>
          <div className="summary-card">
            <h5>Monthly Maintenance</h5>
            <span className="summary-number">${(data.monthlyMaintenanceCosts || 0).toLocaleString()}</span>
          </div>
          <div className="summary-card">
            <h5>Inventory Value</h5>
            <span className="summary-number">${(data.totalInventoryValue || 0).toLocaleString()}</span>
          </div>
          <div className="summary-card">
            <h5>Avg Item Cost</h5>
            <span className="summary-number">${(data.avgItemCost || 0).toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return renderGenericSummary(data);
  };

  const renderMaintenanceSummary = (data, reportId) => {
    if (reportId === 'work-orders') {
      const workOrders = Array.isArray(data) ? data : data.data || [];
      return (
        <div>
          <p><strong>Total Work Orders:</strong> {workOrders.length}</p>
          {workOrders.length > 0 && (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Work Order #</th>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.slice(0, 10).map((order, index) => (
                    <tr key={index}>
                      <td>{order.workOrderNumber || 'N/A'}</td>
                      <td>{order.vehicle?.plateNumber || 'N/A'}</td>
                      <td>{order.workType || 'N/A'}</td>
                      <td><span className={`priority-badge ${order.priority}`}>{order.priority || 'N/A'}</span></td>
                      <td><span className={`status-badge ${order.status}`}>{order.status || 'N/A'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {workOrders.length > 10 && (
                <p className="data-note">... and {workOrders.length - 10} more work orders</p>
              )}
            </div>
          )}
        </div>
      );
    }
    return renderGenericSummary(data);
  };

  const renderInventorySummary = (data, reportId) => {
    if (reportId === 'inventory-overview') {
      const inventory = Array.isArray(data) ? data : data.data || [];
      return (
        <div>
          <p><strong>Total Items:</strong> {inventory.length}</p>
          {inventory.length > 0 && (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td>{item.name || 'N/A'}</td>
                      <td>{item.category || 'N/A'}</td>
                      <td>{item.quantity || 0}</td>
                      <td>${(item.unitCost || 0).toFixed(2)}</td>
                      <td>${((item.quantity || 0) * (item.unitCost || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {inventory.length > 10 && (
                <p className="data-note">... and {inventory.length - 10} more items</p>
              )}
            </div>
          )}
        </div>
      );
    }
    return renderGenericSummary(data);
  };

  const renderEquipmentSummary = (data, reportId) => {
    if (reportId === 'equipment-overview') {
      const equipment = Array.isArray(data) ? data : data.data || [];
      return (
        <div>
          <p><strong>Total Equipment:</strong> {equipment.length}</p>
          {equipment.length > 0 && (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Value</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td>{item.name || 'N/A'}</td>
                      <td>{item.category || 'N/A'}</td>
                      <td><span className={`status-badge ${item.status}`}>{item.status || 'N/A'}</span></td>
                      <td>${(item.currentValue || 0).toLocaleString()}</td>
                      <td>{item.location || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {equipment.length > 10 && (
                <p className="data-note">... and {equipment.length - 10} more equipment</p>
              )}
            </div>
          )}
        </div>
      );
    }
    return renderGenericSummary(data);
  };

  const renderGenericSummary = (data) => {
    if (Array.isArray(data)) {
      return (
        <div>
          <p><strong>Total Records:</strong> {data.length}</p>
          {data.length > 0 && (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    {Object.keys(data[0]).slice(0, 5).map(key => (
                      <th key={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>
                    ))}
                    {Object.keys(data[0]).length > 5 && <th>...</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      {Object.keys(item).slice(0, 5).map(key => (
                        <td key={key}>{String(item[key] || '').substring(0, 50)}</td>
                      ))}
                      {Object.keys(item).length > 5 && <td>...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 10 && (
                <p className="data-note">... and {data.length - 10} more records</p>
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="data-object">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
    }
  };

  return (
    <div className="terminal-report-section">
      <h2>{terminal.label}</h2>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showPreview && previewReport && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content report-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FaFileAlt />
                Report Preview
              </h2>
              <button className="close-button" onClick={() => setShowPreview(false)}>
                ×
              </button>
            </div>
            
            <div className="report-preview-content">
              <div className="report-preview-info">
                <h3>
                  {reportCategories
                    .find(cat => cat.id === previewReport.categoryId)
                    ?.reports.find(rep => rep.id === previewReport.reportId)?.name || 'Unknown Report'}
                </h3>
                <p>Generated: {new Date(previewReport.generatedAt).toLocaleString()}</p>
                <p>Terminal: {previewReport.params.terminal || 'All Terminals'}</p>
                <p>Date Range: {previewReport.params.startDate} to {previewReport.params.endDate}</p>
              </div>

              <div className="report-preview-data">
                {previewReport.data && previewReport.data.data ? (
                  <div className="data-preview">
                    <h4>Report Summary:</h4>
                    {renderReportSummary(previewReport)}
                  </div>
                ) : (
                  <div className="no-data">
                    <p>No data available in this report.</p>
                  </div>
                )}
              </div>

              <div className="report-preview-actions">
                <button 
                  className="export-btn"
                  onClick={() => {
                    const reportName = reportCategories
                      .find(cat => cat.id === previewReport.categoryId)
                      ?.reports.find(rep => rep.id === previewReport.reportId)?.name || 'Unknown Report';
                    handleExportReport('pdf', previewReport.reportId, previewReport.categoryId);
                  }}
                >
                  <FaDownload /> Export PDF
                </button>
                <button 
                  className="export-btn"
                  onClick={() => {
                    handleExportReport('csv', previewReport.reportId, previewReport.categoryId);
                  }}
                >
                  <FaDownload /> Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsByTerminal;