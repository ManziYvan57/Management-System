import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaBus, FaUser, FaRoute, FaCalendar, FaDollarSign } from 'react-icons/fa';
import { vehiclesAPI } from '../../services/api';
import VehicleForm from './VehicleForm';
import './Assets.css';
import './VehiclesTab.css';

const VehiclesTab = ({ activeTerminal }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewForm, setShowViewForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('');

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (fuelTypeFilter) params.fuelType = fuelTypeFilter;
      
      const response = await vehiclesAPI.getAll(params);
      setVehicles(response.data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (vehicleData) => {
    try {
      await vehiclesAPI.create(vehicleData);
      setShowAddForm(false);
      fetchVehicles();
    } catch (err) {
      console.error('Error adding vehicle:', err);
      throw err;
    }
  };

  const handleEditVehicle = async (id, vehicleData) => {
    try {
      await vehiclesAPI.update(id, vehicleData);
      setShowEditForm(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (err) {
      console.error('Error updating vehicle:', err);
      throw err;
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehiclesAPI.delete(id);
        fetchVehicles();
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        alert('Failed to delete vehicle');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleFilterChange = () => {
    fetchVehicles();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'maintenance': return 'status-maintenance';
      case 'out_of_service': return 'status-out-of-service';
      default: return 'status-default';
    }
  };

  const getFuelTypeBadgeClass = (fuelType) => {
    switch (fuelType) {
      case 'Diesel': return 'fuel-diesel';
      case 'Petrol': return 'fuel-petrol';
      case 'Electric': return 'fuel-electric';
      case 'Hybrid': return 'fuel-hybrid';
      default: return 'fuel-other';
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
        <button onClick={fetchVehicles} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="vehicles-tab">
      {/* Header with Search and Filters */}
      <div className="tab-header">
        <div className="header-left">
          <h2>Vehicle Fleet</h2>
          <span className="vehicle-count">{vehicles.length} vehicles</span>
        </div>
        
        <div className="header-right">
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            <FaPlus />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="search-filter-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by plate number, make, model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_service">Out of Service</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Fuel Type:</label>
            <select 
              value={fuelTypeFilter} 
              onChange={(e) => {
                setFuelTypeFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Fuel Types</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="table-container">
        {vehicles.length === 0 ? (
                             <div className="empty-state">
                     <FaBus className="empty-icon" />
                     <h3>No vehicles found</h3>
            <p>Add your first vehicle to get started</p>
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus />
              Add Vehicle
            </button>
          </div>
        ) : (
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Make & Model</th>
                <th>Year</th>
                <th>Status</th>
                <th>Fuel Type</th>
                <th>Seating</th>
                <th>Assigned Driver</th>
                <th>Route</th>
                <th>Terminal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                                             <td>
                             <div className="plate-number">
                               <FaBus />
                               <span>{vehicle.plateNumber}</span>
                             </div>
                           </td>
                  <td>
                    <div className="vehicle-info">
                      <strong>{vehicle.make}</strong>
                      <span>{vehicle.model}</span>
                    </div>
                  </td>
                  <td>{vehicle.year}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(vehicle.status)}`}>
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`fuel-badge ${getFuelTypeBadgeClass(vehicle.fuelType)}`}>
                      {vehicle.fuelType}
                    </span>
                  </td>
                  <td>{vehicle.seatingCapacity} seats</td>
                  <td>
                    {vehicle.assignedDriver ? (
                      <div className="assigned-driver">
                        <FaUser />
                        <span>{vehicle.assignedDriver.firstName} {vehicle.assignedDriver.lastName}</span>
                      </div>
                    ) : (
                      <span className="unassigned">Unassigned</span>
                    )}
                  </td>
                  <td>
                    {vehicle.assignedRoute ? (
                      <div className="assigned-route">
                        <FaRoute />
                        <span>{vehicle.assignedRoute}</span>
                      </div>
                    ) : (
                      <span className="no-route">No route</span>
                    )}
                  </td>
                  <td>
                    <span className="terminal-badge">
                      {vehicle.terminal}
                    </span>
                  </td>
                  <td>
                                         <div className="action-buttons">
                       <button
                         className="action-btn view-btn"
                         title="View Details"
                         onClick={() => {
                           setEditingVehicle(vehicle);
                           setShowViewForm(true);
                         }}
                       >
                         <FaEye />
                       </button>
                       <button
                         className="action-btn edit-btn"
                         title="Edit Vehicle"
                         onClick={() => {
                           setEditingVehicle(vehicle);
                           setShowEditForm(true);
                         }}
                       >
                         <FaEdit />
                       </button>
                       <button
                         className="action-btn delete-btn"
                         title="Delete Vehicle"
                         onClick={() => handleDeleteVehicle(vehicle._id)}
                       >
                         <FaTrash />
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddForm && (
        <VehicleForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddVehicle}
          mode="add"
        />
      )}

      {/* Edit Vehicle Modal */}
      {showEditForm && editingVehicle && (
        <VehicleForm
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setEditingVehicle(null);
          }}
          onSubmit={(data) => handleEditVehicle(editingVehicle._id, data)}
          mode="edit"
          vehicle={editingVehicle}
        />
      )}

      {/* View Vehicle Modal */}
      {showViewForm && editingVehicle && (
        <VehicleForm
          isOpen={showViewForm}
          onClose={() => {
            setShowViewForm(false);
            setEditingVehicle(null);
          }}
          onSubmit={() => {}}
          mode="view"
          vehicle={editingVehicle}
        />
      )}
    </div>
  );
};

export default VehiclesTab;
