import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaBus } from 'react-icons/fa';
import { vehiclesAPI } from '../../services/api';
import VehicleForm from './VehicleForm';
import Pagination from '../../components/Pagination';
import './Assets.css';
import './VehiclesTab.css';

const VehiclesTab = ({ activeTerminal }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'user';
  
  const hasPermission = (module, action) => {
    if (userRole === 'super_admin') return true;
    if (user.permissions && user.permissions[module]) {
      return user.permissions[module][action] || false;
    }
    return false;
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [itemsPerPage] = useState(5);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        fuelType: fuelTypeFilter,
        company: activeTerminal
      };
      const response = await vehiclesAPI.getAll(params);
      setVehicles(response.data || []);
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

  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchVehicles();
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, fuelTypeFilter, activeTerminal]);

  useEffect(() => {
    fetchVehicles();
  }, [currentPage]);

  const handleAddVehicle = async (vehicleData) => {
    try {
      await vehiclesAPI.create(vehicleData);
      setShowAddForm(false);
      const newTotalPages = Math.ceil((totalVehicles + 1) / itemsPerPage);
      if (currentPage === newTotalPages) {
        fetchVehicles();
      } else {
        setCurrentPage(newTotalPages);
      }
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
        if (vehicles.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchVehicles();
        }
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        alert('Failed to delete vehicle');
      }
    }
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
      case 'parked': return 'status-parked';
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

  if (loading) return <div className="loading-state"><div className="loading-spinner"></div><p>Loading vehicles...</p></div>;
  if (error) return <div className="error-state"><p>Error: {error}</p><button onClick={fetchVehicles}>Retry</button></div>;

  return (
    <div className="vehicles-tab">
      <div className="tab-header">
        <div className="header-left">
          <h2>Vehicle Fleet</h2>
          <span className="vehicle-count">{totalVehicles} vehicles</span>
        </div>
        <div className="header-right">
          {hasPermission('assets', 'create') && (
            <button className="add-button" onClick={() => setShowAddForm(true)}><FaPlus /> Add Vehicle</button>
          )}
        </div>
      </div>

      <div className="search-filter-container">
        <form onSubmit={(e) => { e.preventDefault(); fetchVehicles(); }} className="search-form">
          <div className="search-input-group">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search by plate number, make, model..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </form>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_service">Out of Service</option>
              <option value="parked">Parked</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Fuel Type:</label>
            <select value={fuelTypeFilter} onChange={(e) => setFuelTypeFilter(e.target.value)}>
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

      <div className="table-container">
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <FaBus className="empty-icon" />
            <h3>No vehicles found</h3>
            <p>Add your first vehicle to get started</p>
          </div>
        ) : (
          <>
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Plate Number</th>
                  <th>Make & Model</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Fuel Type</th>
                  <th>Seating</th>
                  <th>Terminal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id}>
                    <td><div className="plate-number"><FaBus /><span>{vehicle.plateNumber}</span></div></td>
                    <td><div className="vehicle-info"><strong>{vehicle.make}</strong><span>{vehicle.model}</span></div></td>
                    <td>{vehicle.year}</td>
                    <td><span className={`status-badge ${getStatusBadgeClass(vehicle.status)}`}>{vehicle.status.replace('_', ' ')}</span></td>
                    <td><span className={`fuel-badge ${getFuelTypeBadgeClass(vehicle.fuelType)}`}>{vehicle.fuelType}</span></td>
                    <td>{vehicle.seatingCapacity} seats</td>
                    <td>
                      <div className="terminals-container">
                        {vehicle.terminals?.map((terminal, index) => (
                          <span key={index} className="terminal-badge">{terminal}</span>
                        )) || <span className="terminal-badge">N/A</span>}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view-btn" title="View Details" onClick={() => { setEditingVehicle(vehicle); setShowViewForm(true); }}><FaEye /></button>
                        {hasPermission('assets', 'edit') && <button className="action-btn edit-btn" title="Edit Vehicle" onClick={() => { setEditingVehicle(vehicle); setShowEditForm(true); }}><FaEdit /></button>}
                        {hasPermission('assets', 'delete') && <button className="action-btn delete-btn" title="Delete Vehicle" onClick={() => handleDeleteVehicle(vehicle._id)}><FaTrash /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={totalVehicles} itemsPerPage={itemsPerPage} />
          </>
        )}
      </div>

      {showAddForm && <VehicleForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} onSubmit={handleAddVehicle} mode="add" activeTerminal={activeTerminal} />}
      {showEditForm && <VehicleForm isOpen={showEditForm} onClose={() => { setShowEditForm(false); setEditingVehicle(null); }} onSubmit={(data) => handleEditVehicle(editingVehicle._id, data)} mode="edit" vehicle={editingVehicle} activeTerminal={activeTerminal} />}
      {showViewForm && <VehicleForm 
        isOpen={showViewForm} 
        onClose={() => { setShowViewForm(false); setEditingVehicle(null); }} 
        onSubmit={() => { setShowViewForm(false); setEditingVehicle(null); }}
        mode="view" 
        vehicle={editingVehicle} 
        activeTerminal={activeTerminal} />}
    </div>
  );
};

export default VehiclesTab;