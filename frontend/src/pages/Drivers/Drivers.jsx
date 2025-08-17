import React, { useState, useEffect } from 'react';
import './Drivers.css';

const Drivers = () => {
  // Predefined infraction rules (customize these!)
  const infractionRules = [
    { type: "Speeding", points: 5 },
    { type: "Late Departure", points: 3 },
    { type: "Reckless Driving", points: 10 },
    { type: "Unauthorized Stop", points: 2 },
  ];

  // Generate unique IDs
  const generateId = () => Date.now().toString();

  // Main drivers state
  const [drivers, setDrivers] = useState([]);
  
  // Driver form state
  const [formData, setFormData] = useState({
    id: '',
    driverName: '',
    assignedBus: '',
    role: 'Driver',
    points: 100,
    contactNumber: '',
    licenseNumber: '',
    notes: '',
    infractions: []
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showInfractionForm, setShowInfractionForm] = useState(false);
  const [newInfraction, setNewInfraction] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    notes: '',
    points: 0
  });

  // Load drivers from localStorage
  useEffect(() => {
    const storedDrivers = JSON.parse(localStorage.getItem('drivers')) || [];
    setDrivers(storedDrivers);
  }, []);

  // Save drivers to localStorage
  useEffect(() => {
    localStorage.setItem('drivers', JSON.stringify(drivers));
  }, [drivers]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle infraction input changes
  const handleInfractionChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      const selectedRule = infractionRules.find(rule => rule.type === value);
      setNewInfraction(prev => ({
        ...prev,
        type: value,
        points: selectedRule ? selectedRule.points : 0,
      }));
    } else {
      setNewInfraction(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit driver form
  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedDrivers;

    if (isEditing) {
      updatedDrivers = drivers.map(driver => 
        driver.id === formData.id ? formData : driver
      );
    } else {
      updatedDrivers = [...drivers, { 
        ...formData, 
        id: generateId(),
        infractions: []
      }];
    }

    setDrivers(updatedDrivers);
    resetForm();
  };

  // Add new infraction
  const handleAddInfraction = (e) => {
    e.preventDefault();
    if (!selectedDriver || !newInfraction.type || newInfraction.points <= 0) return;

    const updatedDrivers = drivers.map(driver => {
      if (driver.id === selectedDriver.id) {
        const updatedPoints = Math.max(0, driver.points - newInfraction.points);
        const infraction = {
          id: generateId(),
          date: newInfraction.date,
          type: newInfraction.type,
          notes: newInfraction.notes,
          points: newInfraction.points
        };

        return {
          ...driver,
          points: updatedPoints,
          infractions: [...driver.infractions, infraction]
        };
      }
      return driver;
    });

    setDrivers(updatedDrivers);
    setSelectedDriver(updatedDrivers.find(d => d.id === selectedDriver.id));
    resetInfractionForm();
    setShowInfractionForm(false);
  };

  // Reset infraction form
  const resetInfractionForm = () => {
    setNewInfraction({
      date: new Date().toISOString().split('T')[0],
      type: '',
      notes: '',
      points: 0
    });
  };

  // Edit driver
  const handleEditDriver = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setFormData(driver);
      setIsEditing(true);
      setShowForm(true);
    }
  };

  // Delete driver
  const handleDeleteDriver = (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      setDrivers(drivers.filter(d => d.id !== driverId));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: '',
      driverName: '',
      assignedBus: '',
      role: 'Driver',
      points: 100,
      contactNumber: '',
      licenseNumber: '',
      notes: '',
      infractions: []
    });
    setIsEditing(false);
    setShowForm(false);
  };

  // Get points badge color
  const getPointsColor = (points) => {
    if (points >= 80) return 'green';
    if (points >= 50) return 'orange';
    return 'red';
  };

  return (
    <div className="drivers-container">
      <h2>Driver Management</h2>
      
      <div className="action-buttons">
        <button onClick={() => setShowForm(true)} className="action-btn">
          Add Driver
        </button>
      </div>

      {/* Driver Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Driver' : 'Add New Driver'}</h3>
              <button onClick={resetForm} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Driver Name:</label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Assigned Bus:</label>
                <input
                  type="text"
                  name="assignedBus"
                  value={formData.assignedBus}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Contact Number:</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>License Number:</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <button type="submit" className="submit-btn">
                {isEditing ? 'Update Driver' : 'Add Driver'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {selectedDriver && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedDriver.driverName} - Details</h3>
              <button onClick={() => setSelectedDriver(null)} className="close-btn">
                &times;
              </button>
            </div>
            
            <div className="modal-content">
              <div className="driver-info">
                <p><strong>Assigned Bus:</strong> {selectedDriver.assignedBus || 'None'}</p>
                <p><strong>Contact:</strong> {selectedDriver.contactNumber || 'N/A'}</p>
                <p><strong>License:</strong> {selectedDriver.licenseNumber || 'N/A'}</p>
                <p><strong>Points:</strong> 
                  <span className={`points-badge ${getPointsColor(selectedDriver.points)}`}>
                    {selectedDriver.points}/100
                  </span>
                </p>
                <p><strong>Notes:</strong> {selectedDriver.notes || 'None'}</p>
              </div>

              <div className="infractions-section">
                <h4>Infractions History</h4>
                {selectedDriver.infractions.length > 0 ? (
                  <div className="table-container">
                    <table className="infractions-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Infraction</th>
                          <th>Points Deducted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDriver.infractions.map(infraction => (
                          <tr key={infraction.id}>
                            <td>{infraction.date}</td>
                            <td>
                              <strong>{infraction.type}</strong>
                              {infraction.notes && <div className="notes">{infraction.notes}</div>}
                            </td>
                            <td>{infraction.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No infractions recorded</p>
                )}

                {!showInfractionForm ? (
                  <button 
                    onClick={() => setShowInfractionForm(true)}
                    className="action-btn"
                  >
                    Add Infraction
                  </button>
                ) : (
                  <div className="add-infraction-form">
                    <h5>Add New Infraction</h5>
                    <form onSubmit={handleAddInfraction}>
                      <div className="form-group">
                        <label>Date:</label>
                        <input
                          type="date"
                          name="date"
                          value={newInfraction.date}
                          onChange={handleInfractionChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Infraction Type:</label>
                        <select
                          name="type"
                          value={newInfraction.type}
                          onChange={handleInfractionChange}
                          required
                        >
                          <option value="">Select Infraction</option>
                          {infractionRules.map((rule, index) => (
                            <option key={index} value={rule.type}>
                              {rule.type} (-{rule.points} points)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Notes (Optional):</label>
                        <input
                          type="text"
                          name="notes"
                          placeholder="Additional details..."
                          value={newInfraction.notes}
                          onChange={handleInfractionChange}
                        />
                      </div>
                      <div className="form-buttons">
                        <button 
                          type="submit" 
                          className="submit-btn"
                          disabled={!newInfraction.type || newInfraction.points <= 0}
                        >
                          Add Infraction
                        </button>
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => {
                            resetInfractionForm();
                            setShowInfractionForm(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drivers List Table */}
      <div className="driver-list">
        <h3>Registered Drivers</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>Assigned Bus</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(driver => (
                <tr key={driver.id}>
                  <td>{driver.driverName}</td>
                  <td>{driver.assignedBus || 'None'}</td>
                  <td>
                    <span className={`points-badge ${getPointsColor(driver.points)}`}>
                      {driver.points}/100
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => setSelectedDriver(driver)}
                      className="view-btn"
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => handleEditDriver(driver.id)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteDriver(driver.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Drivers;