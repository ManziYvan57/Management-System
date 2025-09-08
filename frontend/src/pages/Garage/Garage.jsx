import React, { useState, useEffect } from 'react';
import { garageAPI, vehiclesAPI, inventoryAPI, stockMovementsAPI } from '../../services/api';
import './Garage.css';

const Garage = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalWorkOrders: 0,
    pendingWorkOrders: 0,
    inProgressWorkOrders: 0,
    completedWorkOrders: 0,
    totalMaintenanceSchedules: 0,
    overdueMaintenance: 0,
    upcomingMaintenance: 0,
    vehiclesInGarage: 0,
    availableMechanics: 0,
    criticalAlerts: 0,
    monthlySpending: 0,
    averageRepairTime: 0
  });

  // Form states
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showEditWorkOrder, setShowEditWorkOrder] = useState(false);
  const [showEditMaintenance, setShowEditMaintenance] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState(null);
  const [editingMaintenance, setEditingMaintenance] = useState(null);

  // Loading states
  const [isSubmittingWorkOrder, setIsSubmittingWorkOrder] = useState(false);
  const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false);
  const [isUpdatingWorkOrder, setIsUpdatingWorkOrder] = useState(false);
  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);

  // Form data
  const [newWorkOrder, setNewWorkOrder] = useState({
    vehicle: '',
    workType: 'repair',
    priority: 'medium',
    title: '',
    description: '',
    scheduledDate: '',
    terminal: '',
    partsUsed: []
  });

  const [newMaintenance, setNewMaintenance] = useState({
    vehicle: '',
    maintenanceType: 'general_inspection',
    title: '',
    frequency: 'monthly',
    interval: 1,
    nextDue: '',
    priority: 'medium',
    terminal: '',
    requiredParts: []
  });

  // Parts selection state
  const [selectedParts, setSelectedParts] = useState([]);
  const [newPart, setNewPart] = useState({
    inventoryItem: '',
    quantity: 1,
    unitCost: 0
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
          inventoryResponse,
          statsResponse
        ] = await Promise.all([
          garageAPI.getWorkOrders(),
          garageAPI.getMaintenanceSchedules(),
          vehiclesAPI.getAll(),
          inventoryAPI.getAll(),
          garageAPI.getStats()
        ]);
        
        console.log('Vehicles Response:', vehiclesResponse);
        console.log('Vehicles Data:', vehiclesResponse.data);
        
        setWorkOrders(workOrdersResponse.data || []);
        setMaintenanceSchedules(maintenanceResponse.data || []);
        setVehicles(vehiclesResponse.data || []);
        setInventoryItems(inventoryResponse.data || []);
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

  // Parts management functions
  const handleAddPart = () => {
    if (newPart.inventoryItem && newPart.quantity > 0) {
      const selectedItem = inventoryItems.find(item => item._id === newPart.inventoryItem);
      if (selectedItem) {
        const partData = {
          ...newPart,
          itemName: selectedItem.name,
          unitCost: selectedItem.unitCost || 0,
          totalCost: (selectedItem.unitCost || 0) * newPart.quantity
        };
        
        setSelectedParts([...selectedParts, partData]);
        setNewPart({
          inventoryItem: '',
          quantity: 1,
          unitCost: 0
        });
      }
    }
  };

  const handleRemovePart = (index) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== index));
  };

  const handlePartChange = (e) => {
    const { name, value } = e.target;
    setNewPart({ ...newPart, [name]: value });
    
    // Auto-calculate unit cost when item is selected
    if (name === 'inventoryItem' && value) {
      const selectedItem = inventoryItems.find(item => item._id === value);
      if (selectedItem) {
        setNewPart(prev => ({
          ...prev,
          unitCost: selectedItem.unitCost || 0
        }));
      }
    }
  };

  // Create stock movement for parts used
  const createStockMovement = async (partsUsed, workOrderId, workOrderNumber) => {
    try {
      for (const part of partsUsed) {
        const stockMovementData = {
          inventoryItem: part.inventoryItem,
          movementType: 'out',
          quantity: parseInt(part.quantity),
          reason: 'maintenance',
          reference: `Work Order: ${workOrderNumber}`,
          notes: `Used in work order: ${workOrderNumber}`
        };
        
        console.log('Creating stock movement:', stockMovementData);
        await stockMovementsAPI.create(stockMovementData);
      }
    } catch (err) {
      console.error('Error creating stock movement:', err);
      // Don't throw error to prevent work order creation from failing
    }
  };

  const handleSubmitWorkOrder = async (e) => {
    e.preventDefault();
    setIsSubmittingWorkOrder(true);
    
    try {
             const workOrderData = {
         ...newWorkOrder,
         scheduledDate: newWorkOrder.scheduledDate || new Date().toISOString().split('T')[0],
         partsUsed: selectedParts.map(part => ({
           inventoryItem: part.inventoryItem,
           itemName: part.itemName,
           quantity: parseInt(part.quantity),
           unitCost: parseFloat(part.unitCost),
           totalCost: parseFloat(part.totalCost)
         }))
       };
      
      const response = await garageAPI.createWorkOrder(workOrderData);
      
             // Create stock movements for parts used
       if (selectedParts.length > 0) {
         await createStockMovement(selectedParts, response.data._id, response.data.workOrderNumber);
       }
      
      // Refresh the data
      await refreshData();
      
      // Reset form
      setNewWorkOrder({
        vehicle: '',
        workType: 'repair',
        priority: 'medium',
        title: '',
        description: '',
        scheduledDate: '',
        partsUsed: []
      });
      setSelectedParts([]);
      
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
        interval: parseInt(newMaintenance.interval) || 1,
        requiredParts: selectedParts.map(part => ({
          inventoryItem: part.inventoryItem,
          itemName: part.itemName,
          quantity: parseInt(part.quantity),
          estimatedCost: parseFloat(part.totalCost)
        }))
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
        terminal: '',
        requiredParts: []
      });
      setSelectedParts([]);
      
      setShowMaintenanceForm(false);
    } catch (err) {
      console.error('Error creating maintenance schedule:', err);
      alert(err.message || 'Failed to create maintenance schedule');
    } finally {
      setIsSubmittingMaintenance(false);
    }
  };

  // Edit functions
  const handleEditWorkOrder = (workOrder) => {
    setEditingWorkOrder(workOrder);
    setShowEditWorkOrder(true);
  };

  const handleEditMaintenance = (maintenance) => {
    setEditingMaintenance(maintenance);
    setShowEditMaintenance(true);
  };

  const handleUpdateWorkOrderStatus = async (workOrderId, newStatus) => {
    setIsUpdatingWorkOrder(true);
    try {
      await garageAPI.updateWorkOrder(workOrderId, { status: newStatus });
      await refreshData();
      setShowEditWorkOrder(false);
      setEditingWorkOrder(null);
    } catch (err) {
      console.error('Error updating work order:', err);
      alert(err.message || 'Failed to update work order');
    } finally {
      setIsUpdatingWorkOrder(false);
    }
  };

  const handleUpdateMaintenanceStatus = async (maintenanceId, newStatus) => {
    setIsUpdatingMaintenance(true);
    try {
      await garageAPI.updateMaintenanceSchedule(maintenanceId, { status: newStatus });
      await refreshData();
      setShowEditMaintenance(false);
      setEditingMaintenance(null);
    } catch (err) {
      console.error('Error updating maintenance schedule:', err);
      alert(err.message || 'Failed to update maintenance schedule');
    } finally {
      setIsUpdatingMaintenance(false);
    }
  };

  // Quick action functions
  const handleSetWorkOrderComplete = async (workOrderId) => {
    setIsUpdatingWorkOrder(true);
    try {
      await garageAPI.updateWorkOrder(workOrderId, { status: 'completed' });
      await refreshData();
    } catch (err) {
      console.error('Error completing work order:', err);
      alert(err.message || 'Failed to complete work order');
    } finally {
      setIsUpdatingWorkOrder(false);
    }
  };

  const handleSetMaintenanceComplete = async (maintenanceId) => {
    setIsUpdatingMaintenance(true);
    try {
      await garageAPI.updateMaintenanceSchedule(maintenanceId, { status: 'completed' });
      await refreshData();
    } catch (err) {
      console.error('Error completing maintenance:', err);
      alert(err.message || 'Failed to complete maintenance');
    } finally {
      setIsUpdatingMaintenance(false);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilDueClass = (days) => {
    if (days < 0) return 'overdue';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'normal';
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading work orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="garage-container">
      {/* Header */}
      <div className="garage-header">
        <h2>Garage Management</h2>
        <p>Manage work orders, maintenance schedules, and track vehicle repairs</p>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <h3>{stats.totalWorkOrders || 0}</h3>
          <p>Total Work Orders</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pendingWorkOrders || 0}</h3>
          <p>Pending Work Orders</p>
        </div>
        <div className="stat-card">
          <h3>{stats.inProgressWorkOrders || 0}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-card">
          <h3>{stats.completedWorkOrders || 0}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{stats.overdueMaintenance || 0}</h3>
          <p>Overdue Maintenance</p>
        </div>
        <div className="stat-card">
          <h3>{stats.vehiclesInGarage || 0}</h3>
          <p>Vehicles in Garage</p>
        </div>
        <div className="stat-card">
          <h3>{stats.criticalAlerts || 0}</h3>
          <p>Critical Alerts</p>
        </div>
        <div className="stat-card">
          <h3>{stats.availableMechanics || 0}</h3>
          <p>Available Mechanics</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="btn-primary"
          onClick={() => setShowWorkOrderForm(true)}
        >
          Create Work Order
        </button>
        <button 
          className="btn-secondary"
          onClick={() => setShowMaintenanceForm(true)}
        >
          Schedule Maintenance
        </button>
      </div>

      {/* Work Orders Section */}
      <div className="section">
        <h3>Work Orders</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Work Order #</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Scheduled Date</th>
                <th>Terminal</th>
                <th>Parts Used</th>
                <th>Actions</th>
               </tr>
             </thead>
             <tbody>
               {workOrders.map((workOrder) => (
                 <tr key={workOrder._id}>
                   <td>{workOrder.workOrderNumber}</td>
                   <td>
                     {workOrder.vehicle ? 
                       workOrder.vehicle.plateNumber : 
                       'N/A'
                     }
                   </td>
                   <td>{getWorkTypeLabel(workOrder.workType)}</td>
                   <td>{workOrder.title}</td>
                   <td>
                     <span className={`priority ${workOrder.priority}`}>
                       {getPriorityLabel(workOrder.priority)}
                     </span>
                   </td>
                   <td>
                     <span className={`status ${getWorkOrderStatus(workOrder)}`}>
                       {workOrder.status.replace('_', ' ')}
                     </span>
                   </td>
                   <td>{formatDate(workOrder.scheduledDate)}</td>
                   <td>
                     <span className="terminal-badge">
                       {workOrder.terminal || 'N/A'}
                     </span>
                   </td>
                   <td>
                     {workOrder.partsUsed && workOrder.partsUsed.length > 0 ? (
                       <ul className="parts-list">
                         {workOrder.partsUsed.map((part, index) => (
                           <li key={index}>
                             {part.itemName || 'Unknown'} - Qty: {part.quantity}
                           </li>
                         ))}
                       </ul>
                     ) : (
                       'No parts used'
                     )}
                   </td>
                   <td>
                     <div className="action-controls">
                       {workOrder.status !== 'completed' && (
                         <>
                           <button 
                             onClick={() => handleSetWorkOrderComplete(workOrder._id)}
                             className="status-btn"
                             title="Mark as Complete"
                             disabled={isUpdatingWorkOrder}
                           >
                             {isUpdatingWorkOrder ? 'Updating...' : 'Set Complete'}
                           </button>
                           <button 
                             onClick={() => handleEditWorkOrder(workOrder)}
                             className="btn-edit"
                             title="Edit Status"
                             disabled={isUpdatingWorkOrder}
                           >
                             Edit
                           </button>
                         </>
                       )}
                     </div>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
          
          {workOrders.length === 0 && (
            <div className="no-results">
              <p>No work orders found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Schedules Section */}
      <div className="section">
        <h3>Maintenance Schedules</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Title</th>
                <th>Frequency</th>
                <th>Next Due</th>
                <th>Days Until Due</th>
                <th>Status</th>
                <th>Terminal</th>
                <th>Required Parts</th>
                <th>Actions</th>
               </tr>
             </thead>
             <tbody>
               {maintenanceSchedules.map((maintenance) => {
                 const daysUntilDue = calculateDaysUntilDue(maintenance.nextDue);
                 return (
                   <tr key={maintenance._id}>
                     <td>
                       {maintenance.vehicle ? 
                         maintenance.vehicle.plateNumber : 
                         'N/A'
                       }
                     </td>
                     <td>{getMaintenanceTypeLabel(maintenance.maintenanceType)}</td>
                     <td>{maintenance.title}</td>
                     <td>{maintenance.frequency.replace('_', ' ')}</td>
                     <td>{formatDate(maintenance.nextDue)}</td>
                     <td>
                       {maintenance.status === 'completed' ? (
                         <span className="completed-status">Completed</span>
                       ) : (
                         <span className={`days-until-due ${getDaysUntilDueClass(daysUntilDue)}`}>
                           {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days`}
                         </span>
                       )}
                     </td>
                     <td>
                       <span className={`status ${getMaintenanceStatus(maintenance)}`}>
                         {maintenance.status.replace('_', ' ')}
                       </span>
                     </td>
                     <td>
                       <span className="terminal-badge">
                         {maintenance.terminal || 'N/A'}
                       </span>
                     </td>
                     <td>
                       {maintenance.requiredParts && maintenance.requiredParts.length > 0 ? (
                         <ul className="parts-list">
                           {maintenance.requiredParts.map((part, index) => (
                             <li key={index}>
                               {part.itemName || 'Unknown'} - Qty: {part.quantity}
                             </li>
                           ))}
                         </ul>
                       ) : (
                         'No parts required'
                       )}
                     </td>
                     <td>
                       <div className="action-controls">
                         {maintenance.status !== 'completed' && (
                           <>
                             <button 
                               onClick={() => handleSetMaintenanceComplete(maintenance._id)}
                               className="status-btn"
                               title="Mark as Complete"
                               disabled={isUpdatingMaintenance}
                             >
                               {isUpdatingMaintenance ? 'Updating...' : 'Set Complete'}
                             </button>
                             <button 
                               onClick={() => handleEditMaintenance(maintenance)}
                               className="btn-edit"
                               title="Edit Status"
                               disabled={isUpdatingMaintenance}
                             >
                               Edit
                             </button>
                           </>
                         )}
                       </div>
                     </td>
                   </tr>
                 );
               })}
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
                    <option value="">Select Vehicle ({vehicles.length} available)</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.plateNumber}
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
                <div className="form-group">
                  <label htmlFor="terminal">Terminal *</label>
                  <select
                    id="terminal"
                    name="terminal"
                    value={newWorkOrder.terminal}
                    onChange={(e) => handleInputChange(e, 'workOrder')}
                    required
                  >
                    <option value="">Select Terminal</option>
                    <option value="Kigali">Kigali</option>
                    <option value="Kampala">Kampala</option>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Juba">Juba</option>
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
                  rows="3"
                  placeholder="Detailed description of the work to be performed"
                />
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

              {/* Parts Selection */}
              <div className="form-group">
                <label>Parts Used</label>
                <div className="parts-selection">
                  <div className="parts-input-row">
                    <select
                      name="inventoryItem"
                      value={newPart.inventoryItem}
                      onChange={handlePartChange}
                    >
                      <option value="">Select Part</option>
                      {inventoryItems.map(item => (
                        <option key={item._id} value={item._id}>
                          {item.name} - Stock: {item.quantity}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      name="quantity"
                      value={newPart.quantity}
                      onChange={handlePartChange}
                      min="1"
                      placeholder="Qty"
                    />
                    <button type="button" onClick={handleAddPart} className="btn-add-part">
                      Add Part
                    </button>
                  </div>
                  
                  {selectedParts.length > 0 && (
                    <div className="selected-parts">
                      <h4>Selected Parts:</h4>
                      <ul>
                        {selectedParts.map((part, index) => (
                          <li key={index}>
                            {part.itemName} - Qty: {part.quantity} - Cost: ${part.totalCost}
                            <button 
                              type="button" 
                              onClick={() => handleRemovePart(index)}
                              className="btn-remove-part"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowWorkOrderForm(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmittingWorkOrder}>
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
                    <option value="">Select Vehicle ({vehicles.length} available)</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.plateNumber}
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
                <div className="form-group">
                  <label htmlFor="maintenanceTerminal">Terminal *</label>
                  <select
                    id="maintenanceTerminal"
                    name="terminal"
                    value={newMaintenance.terminal}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                  >
                    <option value="">Select Terminal</option>
                    <option value="Kigali">Kigali</option>
                    <option value="Kampala">Kampala</option>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Juba">Juba</option>
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

              {/* Parts Selection for Maintenance */}
              <div className="form-group">
                <label>Required Parts</label>
                <div className="parts-selection">
                  <div className="parts-input-row">
                    <select
                      name="inventoryItem"
                      value={newPart.inventoryItem}
                      onChange={handlePartChange}
                    >
                      <option value="">Select Part</option>
                      {inventoryItems.map(item => (
                        <option key={item._id} value={item._id}>
                          {item.name} - Stock: {item.quantity}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      name="quantity"
                      value={newPart.quantity}
                      onChange={handlePartChange}
                      min="1"
                      placeholder="Qty"
                    />
                    <button type="button" onClick={handleAddPart} className="btn-add-part">
                      Add Part
                    </button>
                  </div>
                  
                  {selectedParts.length > 0 && (
                    <div className="selected-parts">
                      <h4>Required Parts:</h4>
                      <ul>
                        {selectedParts.map((part, index) => (
                          <li key={index}>
                            {part.itemName} - Qty: {part.quantity} - Cost: ${part.totalCost}
                            <button 
                              type="button" 
                              onClick={() => handleRemovePart(index)}
                              className="btn-remove-part"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowMaintenanceForm(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmittingMaintenance}>
                  {isSubmittingMaintenance ? 'Creating...' : 'Schedule Maintenance'}
                </button>
              </div>
            </form>
          </div>
                 </div>
       )}

       {/* Edit Work Order Modal */}
       {showEditWorkOrder && editingWorkOrder && (
         <div className="modal-overlay">
           <div className="modal">
             <div className="modal-header">
               <h3>Update Work Order Status</h3>
               <button onClick={() => setShowEditWorkOrder(false)} className="close-btn">
                 &times;
               </button>
             </div>
             <div className="modal-content">
               <div className="form-group">
                 <label>Work Order: {editingWorkOrder.workOrderNumber}</label>
                 <p><strong>Vehicle:</strong> {editingWorkOrder.vehicle ? `${editingWorkOrder.vehicle.plateNumber} - ${editingWorkOrder.vehicle.make} ${editingWorkOrder.vehicle.model}` : 'N/A'}</p>
                 <p><strong>Title:</strong> {editingWorkOrder.title}</p>
                 <p><strong>Current Status:</strong> {editingWorkOrder.status.replace('_', ' ')}</p>
               </div>
               
               <div className="form-group">
                 <label htmlFor="newStatus">New Status</label>
                 <select
                   id="newStatus"
                   onChange={(e) => {
                     const newStatus = e.target.value;
                     if (newStatus) {
                       handleUpdateWorkOrderStatus(editingWorkOrder._id, newStatus);
                     }
                   }}
                   defaultValue=""
                 >
                   <option value="">Select new status</option>
                   <option value="pending">Pending</option>
                   <option value="in_progress">In Progress</option>
                   <option value="completed">Completed</option>
                   <option value="cancelled">Cancelled</option>
                   <option value="on_hold">On Hold</option>
                 </select>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Edit Maintenance Schedule Modal */}
       {showEditMaintenance && editingMaintenance && (
         <div className="modal-overlay">
           <div className="modal">
             <div className="modal-header">
               <h3>Update Maintenance Status</h3>
               <button onClick={() => setShowEditMaintenance(false)} className="close-btn">
                 &times;
               </button>
             </div>
             <div className="modal-content">
               <div className="form-group">
                 <label>Maintenance: {editingMaintenance.title}</label>
                 <p><strong>Vehicle:</strong> {editingMaintenance.vehicle ? `${editingMaintenance.vehicle.plateNumber} - ${editingMaintenance.vehicle.make} ${editingMaintenance.vehicle.model}` : 'N/A'}</p>
                 <p><strong>Type:</strong> {getMaintenanceTypeLabel(editingMaintenance.maintenanceType)}</p>
                 <p><strong>Current Status:</strong> {editingMaintenance.status.replace('_', ' ')}</p>
               </div>
               
               <div className="form-group">
                 <label htmlFor="newMaintenanceStatus">New Status</label>
                 <select
                   id="newMaintenanceStatus"
                   onChange={(e) => {
                     const newStatus = e.target.value;
                     if (newStatus) {
                       handleUpdateMaintenanceStatus(editingMaintenance._id, newStatus);
                     }
                   }}
                   defaultValue=""
                 >
                   <option value="">Select new status</option>
                   <option value="scheduled">Scheduled</option>
                   <option value="in_progress">In Progress</option>
                   <option value="completed">Completed</option>
                   <option value="cancelled">Cancelled</option>
                   <option value="overdue">Overdue</option>
                 </select>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default Garage; 