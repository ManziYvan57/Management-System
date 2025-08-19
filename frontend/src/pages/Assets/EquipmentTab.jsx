import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaTools } from 'react-icons/fa';
import { equipmentAPI } from '../../services/api';
import './Assets.css';

const EquipmentTab = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
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

  const handleFilterChange = () => {
    fetchEquipment();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available': return 'status-active';
      case 'in_use': return 'status-maintenance';
      case 'maintenance': return 'status-maintenance';
      case 'retired': return 'status-retired';
      default: return 'status-default';
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading equipment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>Error Loading Equipment</h3>
        <p>{error}</p>
        <button onClick={fetchEquipment}>Retry</button>
      </div>
    );
  }

  return (
    <div className="vehicles-tab">
      {/* Header */}
      <div className="tab-header">
        <div className="header-left">
          <h2>Equipment Inventory</h2>
          <span className="vehicle-count">{equipment.length} items</span>
        </div>
        
        <div className="header-right">
          <button className="add-button">
            <FaPlus />
            Add Equipment
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
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
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
            <button className="add-button">
              <FaPlus />
              Add Equipment
            </button>
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
                      <span>{item.type}</span>
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
                      >
                        <FaEye />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit Equipment"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete Equipment"
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
    </div>
  );
};

export default EquipmentTab;
