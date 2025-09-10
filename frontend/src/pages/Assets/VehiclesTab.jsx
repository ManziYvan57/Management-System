import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaBus, FaUser, FaRoute, FaCalendar, FaDollarSign } from 'react-icons/fa';
import { vehiclesAPI } from '../../services/api';
import VehicleForm from './VehicleForm';
import Pagination from '../../components/Pagination';
import './Assets.css';
import './VehiclesTab.css';

const VehiclesTab = ({ activeTerminal }) => {
  // Get user information from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'user';
  
  // Helper function to check if user has permission for an action
  const hasPermission = (module, action) => {
    if (userRole === 'super_admin') {
      return true; // Only super admin has all permissions
    }
    
    if (user.permissions && user.permissions[module]) {
      return user.permissions[module][action] || false;
    }
    
    return false; // Default to no permission
  };

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [itemsPerPage] = useState(10);

  // Fetch vehicles on component mount and when dependencies change
  useEffect(() => {
    fetchVehicles();
  }, [activeTerminal, currentPage, searchTerm, statusFilter, fuelTypeFilter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (fuelTypeFilter) params.fuelType = fuelTypeFilter;
      if (activeTerminal) params.terminal = activeTerminal;
      
      const response = await vehiclesAPI.getAll(params);
      setVehicles(response.data || []);
      
      // Update pagination info
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setTotalVehicles(response.total || 0);
      }
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
    setCurrentPage(1); // Reset to first page when searching
    fetchVehicles();
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filtering
    fetchVehicles();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
          <span className="vehicle-count">{totalVehicles} vehicles</span>
        </div>
        
        <div className="header-right">
          {hasPermission('assets', 'create') && (
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus />
              Add Vehicle
            </button>
          )}
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
            {hasPermission('assets', 'create') && (
              <button 
                className="add-button"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus />
                Add Vehicle
              </button>
            )}
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
                    <div className="terminals-container">
                      {vehicle.terminals && vehicle.terminals.length > 0 ? (
                        vehicle.terminals.map((terminal, index) => (
                          <span key={index} className="terminal-badge">
                            {terminal}
                          </span>
                        ))
                      ) : (
                        <span className="terminal-badge">N/A</span>
                      )}
                    </div>
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
                       {hasPermission('assets', 'edit') && (
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
                       )}
                       {hasPermission('assets', 'delete') && (
                         <button
                           className="action-btn delete-btn"
                           title="Delete Vehicle"
                           onClick={() => handleDeleteVehicle(vehicle._id)}
                         >
                           <FaTrash />
                         </button>
                       )}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalVehicles}
          itemsPerPage={itemsPerPage}
        />
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
