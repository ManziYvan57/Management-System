import React, { useState } from 'react';
import './Garage.css';

const Garage = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
  const [nextWorkOrderId, setNextWorkOrderId] = useState(1);
  const [nextMaintenanceId, setNextMaintenanceId] = useState(1);
  // Parts will now come from main Inventory system
  const [parts, setParts] = useState([
    { id: 1, name: 'Engine Oil 5W-30', quantity: 50, minQuantity: 10 },
    { id: 2, name: 'Brake Pads Front', quantity: 25, minQuantity: 5 },
    { id: 3, name: 'Air Filter', quantity: 8, minQuantity: 15 },
  ]);
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState(null);
  const [newWorkOrder, setNewWorkOrder] = useState({
    plateNumber: '',
    date: '',
    description: '',
    selectedParts: [],
    endDate: '',
    priority: 'medium',
    workType: 'repair' // repair, maintenance, inspection, other
  });
  const [newMaintenance, setNewMaintenance] = useState({
    plateNumber: '',
    maintenanceType: '',
    scheduledDate: '',
    description: '',
    frequency: 'monthly',
    lastPerformed: '',
    nextDue: ''
  });
  // Removed Add Part functionality - parts now managed in Inventory

  // Dashboard Statistics
  const activeWorkOrders = workOrders.filter(order => !order.endDate).length;
  const completedToday = workOrders.filter(order => 
    order.endDate === new Date().toLocaleDateString()
  ).length;
  const highPriorityPending = workOrders.filter(order => 
    !order.endDate && order.priority === 'high'
  ).length;
  const lowStockParts = parts.filter(part => part.quantity <= part.minQuantity && part.quantity > 0).length;
  const noStockParts = parts.filter(part => part.quantity === 0).length;
  const upcomingMaintenance = maintenanceSchedule.filter(maintenance => {
    const dueDate = new Date(maintenance.nextDue);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

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

  const handlePartSelect = (partId, isAdding) => {
    const selectedParts = [...newWorkOrder.selectedParts];
    if (isAdding) {
      if (!selectedParts.find(p => p.partId === partId)) {
        selectedParts.push({ partId, quantity: 1 });
      }
    } else {
      const index = selectedParts.findIndex(p => p.partId === partId);
      if (index > -1) {
        selectedParts.splice(index, 1);
      }
    }
    setNewWorkOrder({ ...newWorkOrder, selectedParts });
  };

  const handlePartQuantityChange = (partId, quantity) => {
    const selectedParts = [...newWorkOrder.selectedParts];
    const partIndex = selectedParts.findIndex(p => p.partId === partId);
    if (partIndex > -1) {
      selectedParts[partIndex] = { ...selectedParts[partIndex], quantity: parseInt(quantity) || 1 };
    }
    setNewWorkOrder({ ...newWorkOrder, selectedParts });
  };

  const handleNewPartInputChange = (e) => {
    const { name, value } = e.target;
    setNewPart({ ...newPart, [name]: value.replace(/^0+/, '') });
  };

  const handleSubmitWorkOrder = (e) => {
    e.preventDefault();
    
    if (editingWorkOrder) {
      // Update existing work order
      const updatedWorkOrder = {
        ...editingWorkOrder,
        ...newWorkOrder,
        partsUsed: newWorkOrder.selectedParts.map(selectedPart => {
          const part = parts.find(p => p.id === selectedPart.partId);
          return { 
            id: part.id, 
            name: part.name, 
            quantity: selectedPart.quantity 
          };
        })
      };
      
      setWorkOrders(workOrders.map(order => 
        order.id === editingWorkOrder.id ? updatedWorkOrder : order
      ));
      setEditingWorkOrder(null);
    } else {
      // Create new work order
      const newOrder = {
        id: nextWorkOrderId,
        ...newWorkOrder,
        date: newWorkOrder.date || new Date().toISOString().split('T')[0],
        partsUsed: newWorkOrder.selectedParts.map(selectedPart => {
          const part = parts.find(p => p.id === selectedPart.partId);
          return { 
            id: part.id, 
            name: part.name, 
            quantity: selectedPart.quantity 
          };
        })
      };
      
      setWorkOrders([...workOrders, newOrder]);
      setNextWorkOrderId(nextWorkOrderId + 1);
    }
    
    // Update parts inventory
    const updatedParts = parts.map(part => {
      const selectedPart = newWorkOrder.selectedParts.find(sp => sp.partId === part.id);
      if (selectedPart) {
        return { ...part, quantity: Math.max(0, part.quantity - selectedPart.quantity) };
      }
      return part;
    });
    setParts(updatedParts);
    
    setNewWorkOrder({ 
      plateNumber: '', 
      date: '', 
      description: '', 
      selectedParts: [], 
      endDate: '',
      priority: 'medium',
      actualCost: '',
      workType: 'repair'
    });
    setShowWorkOrderForm(false);
  };

  const handleEditWorkOrder = (workOrder) => {
    setEditingWorkOrder(workOrder);
    setNewWorkOrder({
      plateNumber: workOrder.plateNumber,
      date: workOrder.date,
      description: workOrder.description,
      selectedParts: workOrder.partsUsed.map(part => ({
        partId: part.id,
        quantity: part.quantity
      })),
      endDate: workOrder.endDate,
      priority: workOrder.priority,
      workType: workOrder.workType
    });
    setShowWorkOrderForm(true);
  };

  const handleCancelEdit = () => {
    setEditingWorkOrder(null);
    setNewWorkOrder({ 
      plateNumber: '', 
      date: '', 
      description: '', 
      selectedParts: [], 
      endDate: '',
      priority: 'medium',
      workType: 'repair'
    });
    setShowWorkOrderForm(false);
  };

  const handleSubmitMaintenance = (e) => {
    e.preventDefault();
    
    // Calculate next due date based on frequency
    const scheduledDate = new Date(newMaintenance.scheduledDate);
    let nextDueDate = new Date(scheduledDate);
    
    switch(newMaintenance.frequency) {
      case 'weekly':
        nextDueDate.setDate(scheduledDate.getDate() + 7);
        break;
      case 'monthly':
        nextDueDate.setMonth(scheduledDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDueDate.setMonth(scheduledDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDueDate.setFullYear(scheduledDate.getFullYear() + 1);
        break;
      default:
        nextDueDate.setMonth(scheduledDate.getMonth() + 1);
    }

    const newMaintenanceItem = {
      id: nextMaintenanceId,
      ...newMaintenance,
      scheduledDate: newMaintenance.scheduledDate || new Date().toISOString().split('T')[0],
      nextDue: nextDueDate.toISOString().split('T')[0],
      status: 'scheduled',
      lastPerformed: newMaintenance.lastPerformed || ''
    };

    setMaintenanceSchedule([...maintenanceSchedule, newMaintenanceItem]);
    setNewMaintenance({
      plateNumber: '',
      maintenanceType: '',
      scheduledDate: '',
      description: '',
      frequency: 'monthly',
      lastPerformed: '',
      nextDue: ''
    });
    setShowMaintenanceForm(false);
    setNextMaintenanceId(nextMaintenanceId + 1);
  };

  const handleMarkMaintenanceComplete = (maintenanceId) => {
    const today = new Date().toISOString().split('T')[0];
    setMaintenanceSchedule(
      maintenanceSchedule.map(maintenance =>
        maintenance.id === maintenanceId 
          ? { 
              ...maintenance, 
              lastPerformed: today,
              status: 'completed',
              nextDue: calculateNextDueDate(maintenance.scheduledDate, maintenance.frequency)
            }
          : maintenance
      )
    );
  };

  const calculateNextDueDate = (lastDate, frequency) => {
    const date = new Date(lastDate);
    let nextDue = new Date(date);
    
    switch(frequency) {
      case 'weekly':
        nextDue.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        nextDue.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        nextDue.setFullYear(date.getFullYear() + 1);
        break;
      default:
        nextDue.setMonth(date.getMonth() + 1);
    }
    
    return nextDue.toISOString().split('T')[0];
  };

  const handleSubmitNewPart = (e) => {
    e.preventDefault();
    const newPartWithId = { 
      ...newPart, 
      id: Date.now(), 
      quantity: parseInt(newPart.quantity) || 0,
      minQuantity: parseInt(newPart.minQuantity) || 0
    };
    setParts([...parts, newPartWithId]);
    setNewPart({ name: '', quantity: '', minQuantity: '' });
    setShowAddPartForm(false);
  };

  // Parts management functions removed - now handled in main Inventory system

  const handleMarkAsComplete = (orderId) => {
    const completionDate = new Date().toLocaleDateString();
    setWorkOrders(
      workOrders.map(order =>
        order.id === orderId ? { ...order, endDate: completionDate } : order
      )
    );
  };

  const lowStockPartsList = parts.filter(part => part.quantity <= part.minQuantity && part.quantity > 0);
  const noStockPartsList = parts.filter(part => part.quantity === 0);

  const getMaintenanceStatus = (maintenance) => {
    const dueDate = new Date(maintenance.nextDue);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (maintenance.status === 'completed') return 'completed';
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 7) return 'due-soon';
    return 'scheduled';
  };

  return (
    <div className="garage-container">
      <h2>Garage Management</h2>
      
      {/* Mini Dashboard */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{activeWorkOrders}</h3>
          <p>Active Work Orders</p>
        </div>
        <div className="stat-card">
          <h3>{completedToday}</h3>
          <p>Completed Today</p>
        </div>
        <div className="stat-card">
          <h3>{highPriorityPending}</h3>
          <p>High Priority Pending</p>
        </div>
        <div className="stat-card">
          <h3>{upcomingMaintenance}</h3>
          <p>Due This Week</p>
        </div>
      </div>

      {(lowStockPartsList.length > 0 || noStockPartsList.length > 0) && (
        <div className="alert warning">
          <strong>Stock Alerts:</strong> 
          {lowStockPartsList.length > 0 && ` ${lowStockPartsList.length} low stock items`}
          {noStockPartsList.length > 0 && ` ${noStockPartsList.length} out of stock items`}
        </div>
      )}

      {maintenanceSchedule.filter(m => getMaintenanceStatus(m) === 'due-soon').length > 0 && (
        <div className="alert maintenance">
          <strong>Maintenance Reminder:</strong> 
          {maintenanceSchedule.filter(m => getMaintenanceStatus(m) === 'due-soon').length} maintenance(s) due within 7 days
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
          <table>
            <thead>
                              <tr>
                  <th>ID</th>
                  <th>Plate</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Parts</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
            </thead>
            <tbody>
              {workOrders.map((order) => (
                <tr key={order.id} className={`priority-${order.priority}`}>
                  <td>{order.id}</td>
                  <td>{order.plateNumber}</td>
                  <td>{order.date}</td>
                  <td>
                    <span className={`work-type-badge ${order.workType}`}>
                      {order.workType}
                    </span>
                  </td>
                  <td>{order.description}</td>
                                     <td>
                     <span className={`priority-badge ${order.priority}`}>
                       {order.priority}
                     </span>
                   </td>
                   <td>
                     {order.partsUsed.map(part => `${part.name} (${part.quantity})`).join(', ') || 'None'}
                   </td>
                  <td>
                    {order.endDate ? (
                      <span className="status completed">Completed on {order.endDate}</span>
                    ) : (
                      <span className="status in-progress">In Progress</span>
                    )}
                  </td>
                  <td>
                    {!order.endDate ? (
                      <div className="action-buttons-cell">
                        <button 
                          onClick={() => handleEditWorkOrder(order)} 
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleMarkAsComplete(order.id)} 
                          className="status-btn"
                        >
                          Complete
                        </button>
                      </div>
                    ) : (
                      <span className="status completed">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Schedule Section */}
      <div className="maintenance-schedule-list">
        <h3>Maintenance Schedule</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Plate</th>
                <th>Type</th>
                <th>Frequency</th>
                <th>Last Performed</th>
                <th>Next Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceSchedule.map((maintenance) => {
                const status = getMaintenanceStatus(maintenance);
                return (
                  <tr key={maintenance.id} className={`maintenance-${status}`}>
                    <td>{maintenance.id}</td>
                    <td>{maintenance.plateNumber}</td>
                    <td>{maintenance.maintenanceType}</td>
                    <td>{maintenance.frequency}</td>
                    <td>{maintenance.lastPerformed || 'Never'}</td>
                    <td>{maintenance.nextDue}</td>
                    <td>
                      <span className={`status ${status}`}>
                        {status === 'completed' && 'Completed'}
                        {status === 'overdue' && 'Overdue'}
                        {status === 'due-soon' && 'Due Soon'}
                        {status === 'scheduled' && 'Scheduled'}
                      </span>
                    </td>
                    <td>
                      {status !== 'completed' && (
                        <button 
                          onClick={() => handleMarkMaintenanceComplete(maintenance.id)} 
                          className="status-btn"
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parts are now managed in the main Inventory system */}

      {/* Work Order Form Modal */}
      {(showWorkOrderForm || editingWorkOrder) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingWorkOrder ? 'Edit Work Order' : 'Create Work Order'}</h3>
              <button onClick={handleCancelEdit} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitWorkOrder} className="modal-form">
              <div className="form-group">
                <label htmlFor="plateNumber">Plate Number:</label>
                <input
                  type="text"
                  id="plateNumber"
                  name="plateNumber"
                  value={newWorkOrder.plateNumber}
                  onChange={(e) => handleInputChange(e, 'workOrder')}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date:</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newWorkOrder.date}
                    onChange={(e) => handleInputChange(e, 'workOrder')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="workType">Work Type:</label>
                  <select
                    id="workType"
                    name="workType"
                    value={newWorkOrder.workType}
                    onChange={(e) => handleInputChange(e, 'workOrder')}
                  >
                    <option value="repair">Repair</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inspection">Inspection</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority:</label>
                  <select
                    id="priority"
                    name="priority"
                    value={newWorkOrder.priority}
                    onChange={(e) => handleInputChange(e, 'workOrder')}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                

              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={newWorkOrder.description}
                  onChange={(e) => handleInputChange(e, 'workOrder')}
                  required
                />
              </div>
              
              <div className="parts-selection">
                <h4>Select Parts (from main Inventory):</h4>
                <ul>
                  {parts.map((part) => {
                    const isSelected = newWorkOrder.selectedParts.find(sp => sp.partId === part.id);
                    const selectedPart = isSelected ? isSelected : null;
                    return (
                      <li key={part.id} className={part.quantity === 0 ? 'no-stock' : part.quantity <= part.minQuantity ? 'low-stock' : ''}>
                        <div className="part-selection-row">
                          <label>
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={(e) => handlePartSelect(part.id, e.target.checked)}
                              disabled={part.quantity === 0}
                            />
                            {part.name} - {part.quantity} available
                            {part.quantity === 0 && ' (No Stock)'}
                            {part.quantity <= part.minQuantity && part.quantity > 0 && ' (Low Stock)'}
                          </label>
                          {isSelected && (
                            <input
                              type="number"
                              min="1"
                              max={part.quantity}
                              value={selectedPart.quantity}
                              onChange={(e) => handlePartQuantityChange(part.id, e.target.value)}
                              className="quantity-input"
                              placeholder="Qty"
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingWorkOrder ? 'Update Work Order' : 'Create Work Order'}
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
              <div className="form-group">
                <label htmlFor="maintenancePlateNumber">Plate Number:</label>
                <input
                  type="text"
                  id="maintenancePlateNumber"
                  name="plateNumber"
                  value={newMaintenance.plateNumber}
                  onChange={(e) => handleInputChange(e, 'maintenance')}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maintenanceType">Maintenance Type:</label>
                  <select
                    id="maintenanceType"
                    name="maintenanceType"
                    value={newMaintenance.maintenanceType}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Oil Change">Oil Change</option>
                    <option value="Brake Service">Brake Service</option>
                    <option value="Tire Rotation">Tire Rotation</option>
                    <option value="Engine Tune-up">Engine Tune-up</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="frequency">Frequency:</label>
                  <select
                    id="frequency"
                    name="frequency"
                    value={newMaintenance.frequency}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="scheduledDate">Scheduled Date:</label>
                  <input
                    type="date"
                    id="scheduledDate"
                    name="scheduledDate"
                    value={newMaintenance.scheduledDate}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastPerformed">Last Performed (Optional):</label>
                  <input
                    type="date"
                    id="lastPerformed"
                    name="lastPerformed"
                    value={newMaintenance.lastPerformed}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="maintenanceDescription">Description:</label>
                <textarea
                  id="maintenanceDescription"
                  name="description"
                  value={newMaintenance.description}
                  onChange={(e) => handleInputChange(e, 'maintenance')}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowMaintenanceForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Schedule Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parts are now managed in the main Inventory system */}
    </div>
  );
};

export default Garage;