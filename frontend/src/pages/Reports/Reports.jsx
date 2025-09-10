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

      console.log(`🔄 Generating ${categoryId} report: ${reportId}`);
      console.log('📊 API Parameters:', params);

      // Generate report based on category and report ID
      switch (categoryId) {
        case 'vehicles':
          if (reportId === 'vehicle-overview') {
            console.log('🚗 Calling vehiclesAPI.getStats...');
            data = await vehiclesAPI.getStats(params);
          } else if (reportId === 'vehicle-performance') {
            console.log('🚗 Calling vehiclesAPI.getAll...');
            data = await vehiclesAPI.getAll(params);
          } else if (reportId === 'vehicle-maintenance') {
            console.log('🔧 Calling garageAPI.getWorkOrders...');
            data = await garageAPI.getWorkOrders(params);
          }
          break;
          
        case 'personnel':
          if (reportId === 'personnel-overview') {
            console.log('👥 Calling personnelAPI.getAll...');
            data = await personnelAPI.getAll(params);
          } else if (reportId === 'driver-performance') {
            console.log('👥 Calling personnelAPI.getDrivers...');
            data = await personnelAPI.getDrivers(params);
          } else if (reportId === 'personnel-stats') {
            console.log('👥 Calling personnelAPI.getStats...');
            data = await personnelAPI.getStats(params);
          }
          break;
          
        case 'financial':
          if (reportId === 'financial-overview') {
            console.log('💰 Calling dashboardAPI.getFinancials...');
            data = await dashboardAPI.getFinancials();
          } else if (reportId === 'maintenance-costs') {
            console.log('💰 Calling garageAPI.getStats...');
            data = await garageAPI.getStats(params);
          } else if (reportId === 'inventory-costs') {
            console.log('💰 Calling inventoryAPI.getStats...');
            data = await inventoryAPI.getStats(params);
          }
          break;
          
        case 'maintenance':
          if (reportId === 'work-orders') {
            console.log('🔧 Calling garageAPI.getWorkOrders...');
            data = await garageAPI.getWorkOrders(params);
          } else if (reportId === 'maintenance-stats') {
            console.log('🔧 Calling garageAPI.getStats...');
            data = await garageAPI.getStats(params);
          } else if (reportId === 'garage-overview') {
            console.log('🔧 Calling garageAPI.getStats...');
            data = await garageAPI.getStats(params);
          }
          break;
          
        case 'inventory':
          if (reportId === 'inventory-overview') {
            console.log('📦 Calling inventoryAPI.getAll...');
            data = await inventoryAPI.getAll(params);
          } else if (reportId === 'inventory-stats') {
            console.log('📦 Calling inventoryAPI.getStats...');
            data = await inventoryAPI.getStats(params);
          } else if (reportId === 'low-stock') {
            console.log('📦 Calling inventoryAPI.getAll with lowStock filter...');
            data = await inventoryAPI.getAll({ ...params, lowStock: true });
          }
          break;
          
        case 'equipment':
          if (reportId === 'equipment-overview') {
            console.log('⚙️ Calling equipmentAPI.getAll...');
            data = await equipmentAPI.getAll(params);
          } else if (reportId === 'equipment-stats') {
            console.log('⚙️ Calling equipmentAPI.getStats...');
            data = await equipmentAPI.getStats(params);
          }
          break;
          
        default:
          throw new Error('Unknown report category');
      }

      console.log('✅ API Response received:', data);

      // Store the report data
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

      // Add to recent reports
      const reportName = reportCategories
        .find(cat => cat.id === categoryId)
        ?.reports.find(rep => rep.id === reportId)?.name || 'Unknown Report';
      
      const recentReport = {
        id: loadingKey,
        name: reportName,
        category: categoryId,
        generatedAt: new Date().toISOString(),
        data
      };

      setRecentReports(prev => [
        recentReport,
        ...prev.slice(0, 4) // Keep only last 5 reports
      ]);

      // Show preview
      setPreviewReport(reportInfo);
      setShowPreview(true);
      
    } catch (error) {
      console.error('❌ Error generating report:', error);
      alert(`Error generating report: ${error.message}`);
    } finally {
      // Clear loading state for this specific report
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleExportReport = (format, reportId, categoryId) => {
    const loadingKey = `${categoryId}-${reportId}`;
    const reportInfo = reportData[loadingKey];
    
    if (!reportInfo) {
      alert('No report data available to export. Please generate the report first.');
      return;
    }

    try {
      const reportName = reportCategories
        .find(cat => cat.id === categoryId)
        ?.reports.find(rep => rep.id === reportId)?.name || 'Unknown Report';
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}`;

      if (format === 'csv') {
        exportToCSV(reportInfo.data, filename);
      } else if (format === 'json') {
        exportToJSON(reportInfo.data, filename);
      } else if (format === 'pdf') {
        exportToPDF(reportInfo.data, reportName, filename);
      }

      alert(`Report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Error exporting report: ${error.message}`);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || !data.data) {
      throw new Error('No data available for export');
    }

    const items = Array.isArray(data.data) ? data.data : [data.data];
    if (items.length === 0) {
      throw new Error('No data items to export');
    }

    const headers = Object.keys(items[0]);
    const csvContent = [
      headers.join(','),
      ...items.map(item => headers.map(header => `"${item[header] || ''}"`).join(','))
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  };

  const exportToJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  };

  const exportToPDF = (data, reportName, filename) => {
    // Simple PDF generation using browser's print functionality
    const printWindow = window.open('', '_blank');
    const content = generatePDFContent(data, reportName);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const generatePDFContent = (data, reportName) => {
    if (!data || !data.data) return '<p>No data available</p>';

    const items = Array.isArray(data.data) ? data.data : [data.data];
    if (items.length === 0) return '<p>No data items available</p>';

    const headers = Object.keys(items[0]);
    
    return `
      <h1>${reportName}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${items.map(item => 
            `<tr>${headers.map(header => `<td>${item[header] || ''}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
    `;
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderReportSummary = (reportInfo) => {
    const { data, reportId, categoryId } = reportInfo;
    const reportData = data?.data;

    if (!reportData) {
      return <div className="no-data"><p>No data available</p></div>;
    }

    // Handle different report types
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
                          <button onClick={() => handleExportReport('pdf', report.id, category.id)}>PDF</button>
                          <button onClick={() => handleExportReport('json', report.id, category.id)}>JSON</button>
                          <button onClick={() => handleExportReport('csv', report.id, category.id)}>CSV</button>
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

      {/* Report Preview Modal */}
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
                <button 
                  className="export-btn"
                  onClick={() => {
                    handleExportReport('json', previewReport.reportId, previewReport.categoryId);
                  }}
                >
                  <FaDownload /> Export JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
