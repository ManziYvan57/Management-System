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

  useEffect(() => {
    fetchVehicles();
  }, [activeTerminal, currentPage]);

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
        terminal: activeTerminal
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

  const handleSearchAndFilter = () => {
    setCurrentPage(1);
    fetchVehicles();
  };

  useEffect(() => {
    const handler = setTimeout(() => {
        handleSearchAndFilter();
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, fuelTypeFilter, activeTerminal]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Other helper functions (getStatusBadgeClass, etc.) would be here

  if (loading) return <div className="loading-state"><div className="loading-spinner"></div><p>Loading vehicles...</p></div>;
  if (error) return <div className="error-state"><p>Error: {error}</p><button onClick={fetchVehicles}>Retry</button></div>;

  return (
    <div className="vehicles-tab">
      <div className="tab-header">
        <h2>Vehicle Fleet ({totalVehicles})</h2>
        {hasPermission('assets', 'create') && (
            <button className="add-button" onClick={() => setShowAddForm(true)}><FaPlus /> Add Vehicle</button>
        )}
      </div>

      <div className="search-filter-container">
        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        {/* Filter dropdowns would go here */}
      </div>

      <div className="table-container">
        {vehicles.length === 0 ? (
            <div className="empty-state">
                <FaBus className="empty-icon" />
                <h3>No vehicles found</h3>
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
                  <th>Terminals</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id}>
                    <td>{vehicle.plateNumber}</td>
                    <td>{vehicle.make} {vehicle.model}</td>
                    <td>{vehicle.year}</td>
                    <td>{vehicle.status}</td>
                    <td>{vehicle.terminals.join(', ')}</td>
                    <td>
                      <button onClick={() => { setEditingVehicle(vehicle); setShowViewForm(true); }}><FaEye /></button>
                      {hasPermission('assets', 'edit') && <button onClick={() => { setEditingVehicle(vehicle); setShowEditForm(true); }}><FaEdit /></button>}
                      {hasPermission('assets', 'delete') && <button onClick={() => handleDeleteVehicle(vehicle._id)}><FaTrash /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalVehicles}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </div>

      {showAddForm && <VehicleForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} onSubmit={handleAddVehicle} mode="add" activeTerminal={activeTerminal} />}
      {showEditForm && <VehicleForm isOpen={showEditForm} onClose={() => setEditingVehicle(null)} onSubmit={(data) => handleEditVehicle(editingVehicle._id, data)} mode="edit" vehicle={editingVehicle} activeTerminal={activeTerminal} />}
      {showViewForm && <VehicleForm isOpen={showViewForm} onClose={() => setEditingVehicle(null)} mode="view" vehicle={editingVehicle} activeTerminal={activeTerminal} />}
    </div>
  );
};

export default VehiclesTab;