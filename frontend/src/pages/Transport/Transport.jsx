import React, { useState, useEffect } from 'react';
import './Transport.css';

const Transport = () => {
  const [buses, setBuses] = useState([]);
  const [formData, setFormData] = useState({
    plateNumber: '',
    route: '',
    busType: '',
    model: '',
    capacity: '',
    status: 'Active',
    insuranceExpiryDate: '',
    inspectionDate: '',
    chasisNumber: '',
    acquisitionDate: '',
    manufacturerDate: '',
    odometerReading: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editBusId, setEditBusId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data for dropdowns
  const busTypes = ['Bus', 'City Bus', 'Mini Van', 'Mini Bus', 'Ritco', 'Coastal'];
  const statusOptions = ['Active', 'Inactive', 'Parked', 'Maintenance'];
  const routes = ['Sonatube', 'Kibagabaga', 'Kalbeza', 'Kimironko', 'Kicukiro', 'Kigali'];

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedBuses = JSON.parse(localStorage.getItem('buses')) || [];
    setBuses(storedBuses);
  }, []);

  // Save data to localStorage whenever buses change
  useEffect(() => {
    localStorage.setItem('buses', JSON.stringify(buses));
  }, [buses]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      plateNumber: '',
      route: '',
      busType: '',
      model: '',
      capacity: '',
      status: 'Active',
      insuranceExpiryDate: '',
      inspectionDate: '',
      chasisNumber: '',
      acquisitionDate: '',
      manufacturerDate: '',
      odometerReading: 0
    });
    setIsEditing(false);
    setEditBusId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      const updatedBuses = buses.map(bus => 
        bus.plateNumber === editBusId ? formData : bus
      );
      setBuses(updatedBuses);
    } else {
      if (buses.some(bus => bus.plateNumber === formData.plateNumber)) {
        alert('Bus with this plate number already exists!');
        return;
      }
      setBuses([...buses, formData]);
    }
    resetForm();
    setShowForm(false);
  };

  const handleEditBus = (plateNumber) => {
    const busToEdit = buses.find(bus => bus.plateNumber === plateNumber);
    if (busToEdit) {
      setFormData(busToEdit);
      setIsEditing(true);
      setEditBusId(plateNumber);
      setShowForm(true);
    }
  };

  const handleDeleteBus = (plateNumber) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      const updatedBuses = buses.filter(bus => bus.plateNumber !== plateNumber);
      setBuses(updatedBuses);
    }
  };

  // Fixed notification functions
  const getMaintenanceAlerts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const warningDate = new Date(today);
    warningDate.setDate(today.getDate() + 7);
    
    return buses.filter(bus => {
      if (!bus.inspectionDate) return false;
      
      const inspectionDate = new Date(bus.inspectionDate);
      inspectionDate.setHours(0, 0, 0, 0);
      
      return inspectionDate >= today && inspectionDate <= warningDate;
    });
  };

  const getInsuranceAlerts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const warningDate = new Date(today);
    warningDate.setDate(today.getDate() + 7);
    
    return buses.filter(bus => {
      if (!bus.insuranceExpiryDate) return false;
      
      const expiryDate = new Date(bus.insuranceExpiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      
      return expiryDate >= today && expiryDate <= warningDate;
    });
  };

  // Format date for display
  const formatAlertDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter and pagination logic
  const filteredBuses = buses.filter(bus => {
    const searchLower = searchTerm.toLowerCase();
    return (
      bus.plateNumber.toLowerCase().includes(searchLower) ||
      bus.route.toLowerCase().includes(searchLower) ||
      bus.busType.toLowerCase().includes(searchLower) ||
      bus.model.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredBuses.length / entriesPerPage);
  const paginatedBuses = filteredBuses.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Get alerts
  const maintenanceAlerts = getMaintenanceAlerts();
  const insuranceAlerts = getInsuranceAlerts();

  return (
    <div className="transport-container">
      {/* Header Card */}
      <div className="transport-card header-card">
        <div className="card-header">
          <h2>Bus Data Registration</h2>
          <button onClick={() => setShowForm(true)} className="add-btn">
            + Add New Bus
          </button>
        </div>
      </div>

      {/* Alerts Card */}
      {(maintenanceAlerts.length > 0 || insuranceAlerts.length > 0) && (
        <div className="transport-card alerts-card">
          <div className="card-body">
            {maintenanceAlerts.length > 0 && (
              <div className="alert maintenance-alert">
                <div className="alert-header">
                  <span className="alert-icon">🔧</span>
                  <strong>Upcoming Maintenance (Next 7 Days)</strong>
                </div>
                <ul>
                  {maintenanceAlerts.map(bus => (
                    <li key={bus.plateNumber}>
                      <strong>{bus.plateNumber}</strong> - Due on {formatAlertDate(bus.inspectionDate)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {insuranceAlerts.length > 0 && (
              <div className="alert insurance-alert">
                <div className="alert-header">
                  <span className="alert-icon">📄</span>
                  <strong>Insurance Expiring (Next 7 Days)</strong>
                </div>
                <ul>
                  {insuranceAlerts.map(bus => (
                    <li key={bus.plateNumber}>
                      <strong>{bus.plateNumber}</strong> - Expires on {formatAlertDate(bus.insuranceExpiryDate)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bus List Card */}
      <div className="transport-card list-card">
        <div className="card-body">
          <div className="list-controls">
            <div className="entries-control">
              <span>Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[10, 25, 50, 100].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span>entries</span>
            </div>
            <div className="search-control">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="bus-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Plate Number</th>
                  <th>Route</th>
                  <th>Bus Type</th>
                  <th>Chasis Number</th>
                  <th>Model</th>
                  <th>Acquisition Date</th>
                  <th>Manufacturer Date</th>
                  <th>Capacity</th>
                  <th>Odometer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBuses.map((bus, index) => (
                  <tr key={bus.plateNumber}>
                    <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td>{bus.plateNumber}</td>
                    <td>{bus.route}</td>
                    <td>{bus.busType}</td>
                    <td>{bus.chasisNumber || '-'}</td>
                    <td>{bus.model}</td>
                    <td>{bus.acquisitionDate ? formatAlertDate(bus.acquisitionDate) : '-'}</td>
                    <td>{bus.manufacturerDate ? formatAlertDate(bus.manufacturerDate) : '-'}</td>
                    <td>{bus.capacity}</td>
                    <td>{bus.odometerReading.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${bus.status.toLowerCase()}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => handleEditBus(bus.plateNumber)} 
                        className="action-btn edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBus(bus.plateNumber)} 
                        className="action-btn delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div className="entries-info">
              Showing {filteredBuses.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * entriesPerPage, filteredBuses.length)} of {filteredBuses.length} entries
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Bus' : 'Add New Bus'}</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="bus-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="plateNumber">Plate Number *</label>
                  <input
                    type="text"
                    id="plateNumber"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleInputChange}
                    required
                    disabled={isEditing}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="route">Route *</label>
                  <select
                    id="route"
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Route</option>
                    {routes.map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="busType">Bus Type *</label>
                  <select
                    id="busType"
                    name="busType"
                    value={formData.busType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Type</option>
                    {busTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="model">Model *</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="chasisNumber">Chasis Number</label>
                  <input
                    type="text"
                    id="chasisNumber"
                    name="chasisNumber"
                    value={formData.chasisNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="capacity">Capacity *</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="acquisitionDate">Acquisition Date</label>
                  <input
                    type="date"
                    id="acquisitionDate"
                    name="acquisitionDate"
                    value={formData.acquisitionDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="manufacturerDate">Manufacturer Date</label>
                  <input
                    type="date"
                    id="manufacturerDate"
                    name="manufacturerDate"
                    value={formData.manufacturerDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="odometerReading">Odometer Reading</label>
                  <input
                    type="number"
                    id="odometerReading"
                    name="odometerReading"
                    value={formData.odometerReading}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="insuranceExpiryDate">Insurance Expiry Date</label>
                  <input
                    type="date"
                    id="insuranceExpiryDate"
                    name="insuranceExpiryDate"
                    value={formData.insuranceExpiryDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inspectionDate">Inspection Date</label>
                  <input
                    type="date"
                    id="inspectionDate"
                    name="inspectionDate"
                    value={formData.inspectionDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {isEditing ? 'Update Bus' : 'Add Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transport;