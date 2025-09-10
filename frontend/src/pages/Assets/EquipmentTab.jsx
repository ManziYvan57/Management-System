import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaTools } from 'react-icons/fa';
import { equipmentAPI } from '../../services/api';
import EquipmentForm from './EquipmentForm';
import Pagination from '../../components/Pagination';
import './Assets.css';
import './EquipmentTab.css';

const EquipmentTab = ({ activeTerminal }) => {
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

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewForm, setShowViewForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEquipment, setTotalEquipment] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchEquipment();
  }, [activeTerminal]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (activeTerminal) params.terminal = activeTerminal;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      
      const response = await equipmentAPI.getAll(params);
      setEquipment(response.data || []);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError(err.message || 'Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEquipment();
  };

  const handleAddEquipment = async (equipmentData) => {
    try {
      await equipmentAPI.create(equipmentData);
      setShowAddForm(false);
      fetchEquipment();
    } catch (err) {
      console.error('Error adding equipment:', err);
      throw err;
    }
  };

  const handleEditEquipment = async (id, equipmentData) => {
    try {
      await equipmentAPI.update(id, equipmentData);
      setShowEditForm(false);
      setEditingEquipment(null);
      fetchEquipment();
    } catch (err) {
      console.error('Error updating equipment:', err);
      throw err;
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await equipmentAPI.delete(id);
        fetchEquipment();
      } catch (err) {
        console.error('Error deleting equipment:', err);
        alert('Failed to delete equipment');
      }
    }
  };

  const handleFilterChange = () => {
    fetchEquipment();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'maintenance': return 'status-maintenance';
      case 'out_of_service': return 'status-retired';
      default: return 'status-default';
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading equipment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
        <button onClick={fetchEquipment} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="vehicles-tab equipment-tab">
      {/* Header */}
      <div className="tab-header">
        <div className="header-left">
          <h2>Equipment Inventory</h2>
          <span className="vehicle-count">{equipment.length} items</span>
        </div>
        
        <div className="header-right">
          {hasPermission('assets', 'create') && (
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus />
              Add Equipment
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
              placeholder="Search by name, serial number..."
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
            <label>Category:</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Categories</option>
              <option value="tools">Tools</option>
              <option value="electronics">Electronics</option>
              <option value="safety">Safety Equipment</option>
              <option value="office">Office Equipment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="table-container">
        {equipment.length === 0 ? (
          <div className="empty-state">
            <FaTools className="empty-icon" />
            <h3>No equipment found</h3>
            <p>Add your first equipment item to get started</p>
            {hasPermission('assets', 'create') && (
              <button 
                className="add-button"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus />
                Add Equipment
              </button>
            )}
          </div>
        ) : (
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Serial Number</th>
                <th>Status</th>
                <th>Location</th>
                <th>Terminal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="vehicle-info">
                      <strong>{item.name}</strong>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.serialNumber}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{item.location}</td>
                  <td>
                    <span className="terminal-badge">
                      {item.terminal}
                    </span>
                  </td>
                  <td>
                                         <div className="action-buttons">
                                               <button
                          className="action-btn view-btn"
                          title="View Details"
                          onClick={() => {
                            setEditingEquipment(item);
                            setShowViewForm(true);
                          }}
                        >
                          <FaEye />
                        </button>
                        {hasPermission('assets', 'edit') && (
                          <button
                            className="action-btn edit-btn"
                            title="Edit Equipment"
                            onClick={() => {
                              setEditingEquipment(item);
                              setShowEditForm(true);
                            }}
                          >
                            <FaEdit />
                          </button>
                        )}
                        {hasPermission('assets', 'delete') && (
                          <button
                            className="action-btn delete-btn"
                            title="Delete Equipment"
                            onClick={() => handleDeleteEquipment(item._id)}
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
      </div>

      {/* Add Equipment Modal */}
      {showAddForm && (
        <EquipmentForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddEquipment}
          mode="add"
        />
      )}

      {/* Edit Equipment Modal */}
      {showEditForm && editingEquipment && (
        <EquipmentForm
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setEditingEquipment(null);
          }}
          onSubmit={(data) => handleEditEquipment(editingEquipment._id, data)}
          mode="edit"
          equipment={editingEquipment}
        />
      )}

      {/* View Equipment Modal */}
      {showViewForm && editingEquipment && (
        <EquipmentForm
          isOpen={showViewForm}
          onClose={() => {
            setShowViewForm(false);
            setEditingEquipment(null);
          }}
          onSubmit={() => {}}
          mode="view"
          equipment={editingEquipment}
        />
      )}
    </div>
  );
};

export default EquipmentTab;
