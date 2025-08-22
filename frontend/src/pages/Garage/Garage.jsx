import React, { useState, useEffect } from 'react';
import { garageAPI } from '../../services/api';
import './Garage.css';

const Garage = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    workOrders: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    maintenance: { total: 0, overdue: 0 },
    vehicles: { inMaintenance: 0 }
  });

  // Form states
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  // Loading states
  const [isSubmittingWorkOrder, setIsSubmittingWorkOrder] = useState(false);
  const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false);

  // Form data
  const [newWorkOrder, setNewWorkOrder] = useState({
    vehicle: '',
    workType: 'repair',
    priority: 'medium',
    title: '',
    description: '',
    assignedMechanic: '',
    scheduledDate: '',
    terminal: ''
  });

  const [newMaintenance, setNewMaintenance] = useState({
    vehicle: '',
    maintenanceType: 'general_inspection',
    title: '',
    frequency: 'monthly',
    interval: 1,
    nextDue: '',
    priority: 'medium',
    terminal: ''
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [
          workOrdersResponse,
          maintenanceResponse,
          vehiclesResponse,
          mechanicsResponse,
          statsResponse
        ] = await Promise.all([
          garageAPI.getWorkOrders(),
          garageAPI.getMaintenanceSchedules(),
          garageAPI.getVehicles(),
          garageAPI.getMechanics(),
          garageAPI.getStats()
        ]);
        
        setWorkOrders(workOrdersResponse.data || []);
        setMaintenanceSchedules(maintenanceResponse.data || []);
        setVehicles(vehiclesResponse.data || []);
        setMechanics(mechanicsResponse.data || []);
        setStats(statsResponse.data || {});
      } catch (err) {
        console.error('Error fetching garage data:', err);
        setError(err.message || 'Failed to fetch garage data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh data after adding/editing
  const refreshData = async () => {
    try {
      const [workOrdersResponse, maintenanceResponse, statsResponse] = await Promise.all([
        garageAPI.getWorkOrders(),
        garageAPI.getMaintenanceSchedules(),
        garageAPI.getStats()
      ]);
      
      setWorkOrders(workOrdersResponse.data || []);
      setMaintenanceSchedules(maintenanceResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (err) {
      console.error('Error refreshing garage data:', err);
    }
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    switch(formType) {
      case 'workOrder':
        setNewWorkOrder({ ...newWorkOrder, [name]: value });
        break;
      case 'maintenance':
        setNewMaintenance({ ...newMaintenance, [name]: value });
        break;
      default:
        break;
    }
  };

  const handleSubmitWorkOrder = async (e) => {
    e.preventDefault();
    setIsSubmittingWorkOrder(true);
    
    try {
      const workOrderData = {
        ...newWorkOrder,
        scheduledDate: newWorkOrder.scheduledDate || new Date().toISOString().split('T')[0]
      };
      
      await garageAPI.createWorkOrder(workOrderData);
      
      // Refresh the data
      await refreshData();
      
      // Reset form
      setNewWorkOrder({
        vehicle: '',
        workType: 'repair',
        priority: 'medium',
        title: '',
        description: '',
        assignedMechanic: '',
        scheduledDate: '',
        terminal: ''
      });
      
      setShowWorkOrderForm(false);
    } catch (err) {
      console.error('Error creating work order:', err);
      alert(err.message || 'Failed to create work order');
    } finally {
      setIsSubmittingWorkOrder(false);
    }
  };

  const handleSubmitMaintenance = async (e) => {
    e.preventDefault();
    setIsSubmittingMaintenance(true);
    
    try {
      const maintenanceData = {
        ...newMaintenance,
        interval: parseInt(newMaintenance.interval) || 1
      };
      
      await garageAPI.createMaintenanceSchedule(maintenanceData);
      
      // Refresh the data
      await refreshData();
      
      // Reset form
      setNewMaintenance({
        vehicle: '',
        maintenanceType: 'general_inspection',
        title: '',
        frequency: 'monthly',
        interval: 1,
        nextDue: '',
        priority: 'medium',
        terminal: ''
      });
      
      setShowMaintenanceForm(false);
    } catch (err) {
      console.error('Error creating maintenance schedule:', err);
      alert(err.message || 'Failed to create maintenance schedule');
    } finally {
      setIsSubmittingMaintenance(false);
    }
  };

  const getWorkOrderStatus = (workOrder) => {
    if (workOrder.status === 'completed') return 'completed';
    if (workOrder.status === 'in_progress') return 'in-progress';
    if (workOrder.status === 'pending') return 'pending';
    if (workOrder.status === 'cancelled') return 'cancelled';
    return 'on-hold';
  };

  const getMaintenanceStatus = (maintenance) => {
    if (maintenance.status === 'completed') return 'completed';
    if (maintenance.status === 'overdue') return 'overdue';
    if (maintenance.status === 'in_progress') return 'in-progress';
    if (maintenance.status === 'scheduled') return 'scheduled';
    return 'cancelled';
  };

  const getMaintenanceTypeLabel = (type) => {
    const labels = {
      'oil_change': 'Oil Change',
      'tire_rotation': 'Tire Rotation',
      'brake_service': 'Brake Service',
      'engine_tune_up': 'Engine Tune Up',
      'transmission_service': 'Transmission Service',
      'air_filter': 'Air Filter',
      'fuel_filter': 'Fuel Filter',
      'spark_plugs': 'Spark Plugs',
      'battery_check': 'Battery Check',
      'coolant_check': 'Coolant Check',
      'general_inspection': 'General Inspection',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const getWorkTypeLabel = (type) => {
    const labels = {
      'repair': 'Repair',
      'maintenance': 'Maintenance',
      'inspection': 'Inspection',
      'emergency': 'Emergency',
      'preventive': 'Preventive',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'critical': 'Critical'
    };
    return labels[priority] || priority;
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'semi_annually': 'Semi-Annually',
      'annually': 'Annually',
      'mileage_based': 'Mileage Based',
      'custom': 'Custom'
    };
    return labels[frequency] || frequency;
  };

  const overdueMaintenance = maintenanceSchedules.filter(m => m.isOverdue);
  const dueSoonMaintenance = maintenanceSchedules.filter(m => m.isDueSoon);
  const pendingWorkOrders = workOrders.filter(w => w.status === 'pending');

  return (
    <div className="garage-container">
      <h2>Garage Management</h2>
      
      {/* Mini Dashboard */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{stats.workOrders?.total || 0}</h3>
          <p>Total Work Orders</p>
        </div>
        <div className="stat-card">
          <h3>{stats.workOrders?.pending || 0}</h3>
          <p>Pending Orders</p>
        </div>
        <div className="stat-card">
          <h3>{stats.maintenance?.overdue || 0}</h3>
          <p>Overdue Maintenance</p>
        </div>
        <div className="stat-card">
          <h3>{stats.vehicles?.inMaintenance || 0}</h3>
          <p>Vehicles in Maintenance</p>
        </div>
      </div>

      {/* Alerts */}
      {overdueMaintenance.length > 0 && (
        <div className="alert warning">
          <strong>Maintenance Alerts:</strong> {overdueMaintenance.length} maintenance(s) overdue
        </div>
      )}

      {dueSoonMaintenance.length > 0 && (
        <div className="alert info">
          <strong>Maintenance Reminder:</strong> {dueSoonMaintenance.length} maintenance(s) due within 7 days
        </div>
      )}

      {pendingWorkOrders.length > 0 && (
        <div className="alert warning">
          <strong>Work Orders:</strong> {pendingWorkOrders.length} pending work order(s) awaiting assignment
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => setShowWorkOrderForm(true)} className="action-btn">
          Create Work Order
        </button>
        <button onClick={() => setShowMaintenanceForm(true)} className="action-btn">
          Schedule Maintenance
        </button>
      </div>

      {/* Work Orders Section */}
      <div className="work-order-list">
        <h3>Work Orders</h3>
        <div className="table-container">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading work orders...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={refreshData} className="retry-btn">Retry</button>
            </div>
          )}
          
          {!loading && !error && (
            <table>
              <thead>
                <tr>
                  <th>Work Order #</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((workOrder) => (
                  <tr key={workOrder._id} className={`status-${getWorkOrderStatus(workOrder)}`}>
                    <td>{workOrder.workOrderNumber}</td>
                    <td>{workOrder.vehicle?.plateNumber || 'N/A'}</td>
                    <td>{getWorkTypeLabel(workOrder.workType)}</td>
                    <td>{workOrder.title}</td>
                    <td>
                      <span className={`priority ${workOrder.priority}`}>
                        {getPriorityLabel(workOrder.priority)}
                      </span>
                    </td>
                    <td>{workOrder.assignedMechanic ? `${workOrder.assignedMechanic.firstName} ${workOrder.assignedMechanic.lastName}` : 'Unassigned'}</td>
                    <td>{new Date(workOrder.scheduledDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${getWorkOrderStatus(workOrder)}`}>
                        {workOrder.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && !error && workOrders.length === 0 && (
            <div className="no-results">
              <p>No work orders found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Schedules Section */}
      <div className="maintenance-schedule-list">
        <h3>Maintenance Schedules</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Title</th>
                <th>Frequency</th>
                <th>Next Due</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceSchedules.map((maintenance) => (
                <tr key={maintenance._id} className={`status-${getMaintenanceStatus(maintenance)}`}>
                  <td>{maintenance.vehicle?.plateNumber || 'N/A'}</td>
                  <td>{getMaintenanceTypeLabel(maintenance.maintenanceType)}</td>
                  <td>{maintenance.title}</td>
                  <td>{getFrequencyLabel(maintenance.frequency)}</td>
                  <td>{new Date(maintenance.nextDue).toLocaleDateString()}</td>
                  <td>
                    <span className={`priority ${maintenance.priority}`}>
                      {getPriorityLabel(maintenance.priority)}
                    </span>
                  </td>
                  <td>{maintenance.assignedMechanic ? `${maintenance.assignedMechanic.firstName} ${maintenance.assignedMechanic.lastName}` : 'Unassigned'}</td>
                  <td>
                    <span className={`status ${getMaintenanceStatus(maintenance)}`}>
                      {maintenance.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {maintenanceSchedules.length === 0 && (
            <div className="no-results">
              <p>No maintenance schedules found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Work Order Form Modal */}
      {showWorkOrderForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Work Order</h3>
              <button onClick={() => setShowWorkOrderForm(false)} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitWorkOrder} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vehicle">Vehicle *</label>
                  <select
                    id="vehicle"
                    name="vehicle"
                    value={newWorkOrder.vehicle}
                    onChange={(e) => handleInputChange(e, 'workOrder')}
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.plateNumber} - {vehicle.busType} ({vehicle.manufacturer} {vehicle.model})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="workType">Work Type *</label>
                  <select
                    id="workType"
                    name="workType"
                    value={newWorkOrder.workType}
                    onChange={(e) => handleInputChange(e, 'workOrder')}
                    required
                  >
                    <option value="repair">Repair</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inspection">Inspection</option>
                    <option value="emergency">Emergency</option>
                    <option value="preventive">Preventive</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newWorkOrder.title}
                    onChange={(e) => handleInputChange(e, 'workOrder')}
                    required
                    placeholder="Brief description of the work"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    name="priority"
                    value={newWorkOrder.priority}
                    onChange={(e) => handleInputChange(e, 'workOrder')}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={newWorkOrder.description}
                  onChange={(e) => handleInputChange(e, 'workOrder')}
                  required
                  placeholder="Detailed description of the work to be performed"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="assignedMechanic">Assigned Mechanic *</label>
                  <select
                    id="assignedMechanic"
                    name="assignedMechanic"
                    value={newWorkOrder.assignedMechanic}
                    onChange={(e) => handleInputChange(e, 'workOrder')}
                    required
                  >
                    <option value="">Select Mechanic</option>
                    {mechanics.map(mechanic => (
                      <option key={mechanic._id} value={mechanic._id}>
                        {mechanic.firstName} {mechanic.lastName} ({mechanic.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="scheduledDate">Scheduled Date *</label>
                  <input
                    type="date"
                    id="scheduledDate"
                    name="scheduledDate"
                    value={newWorkOrder.scheduledDate}
                    onChange={(e) => handleInputChange(e, 'workOrder')}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="terminal">Terminal *</label>
                <input
                  type="text"
                  id="terminal"
                  name="terminal"
                  value={newWorkOrder.terminal}
                  onChange={(e) => handleInputChange(e, 'workOrder')}
                  required
                  placeholder="e.g., Kampala Terminal"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowWorkOrderForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmittingWorkOrder}>
                  {isSubmittingWorkOrder ? 'Creating...' : 'Create Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Schedule Form Modal */}
      {showMaintenanceForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Schedule Maintenance</h3>
              <button onClick={() => setShowMaintenanceForm(false)} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitMaintenance} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maintenanceVehicle">Vehicle *</label>
                  <select
                    id="maintenanceVehicle"
                    name="vehicle"
                    value={newMaintenance.vehicle}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.plateNumber} - {vehicle.busType} ({vehicle.manufacturer} {vehicle.model})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="maintenanceType">Maintenance Type *</label>
                  <select
                    id="maintenanceType"
                    name="maintenanceType"
                    value={newMaintenance.maintenanceType}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                  >
                    <option value="general_inspection">General Inspection</option>
                    <option value="oil_change">Oil Change</option>
                    <option value="tire_rotation">Tire Rotation</option>
                    <option value="brake_service">Brake Service</option>
                    <option value="engine_tune_up">Engine Tune Up</option>
                    <option value="transmission_service">Transmission Service</option>
                    <option value="air_filter">Air Filter</option>
                    <option value="fuel_filter">Fuel Filter</option>
                    <option value="spark_plugs">Spark Plugs</option>
                    <option value="battery_check">Battery Check</option>
                    <option value="coolant_check">Coolant Check</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maintenanceTitle">Title *</label>
                  <input
                    type="text"
                    id="maintenanceTitle"
                    name="title"
                    value={newMaintenance.title}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                    placeholder="Maintenance title"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    name="priority"
                    value={newMaintenance.priority}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="frequency">Frequency *</label>
                  <select
                    id="frequency"
                    name="frequency"
                    value={newMaintenance.frequency}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi_annually">Semi-Annually</option>
                    <option value="annually">Annually</option>
                    <option value="mileage_based">Mileage Based</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="interval">Interval *</label>
                  <input
                    type="number"
                    id="interval"
                    name="interval"
                    value={newMaintenance.interval}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                    min="1"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nextDue">Next Due Date *</label>
                  <input
                    type="date"
                    id="nextDue"
                    name="nextDue"
                    value={newMaintenance.nextDue}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="maintenanceTerminal">Terminal *</label>
                  <input
                    type="text"
                    id="maintenanceTerminal"
                    name="terminal"
                    value={newMaintenance.terminal}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                    placeholder="e.g., Kampala Terminal"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowMaintenanceForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmittingMaintenance}>
                  {isSubmittingMaintenance ? 'Creating...' : 'Schedule Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Garage; 