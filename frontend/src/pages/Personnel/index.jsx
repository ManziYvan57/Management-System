import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaUser, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaMapMarkerAlt, FaCar, FaRoute, FaExclamationTriangle, FaCheckCircle, FaClock, FaStar } from 'react-icons/fa';
import { personnelAPI } from '../../services/api';
import PersonnelForm from './PersonnelForm';
import InfractionForm from './InfractionForm';
import './Personnel.css';

const Personnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewForm, setShowViewForm] = useState(false);
  const [showInfractionForm, setShowInfractionForm] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState(null);
  const [viewingPersonnel, setViewingPersonnel] = useState(null);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [terminalFilter, setTerminalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch personnel on component mount
  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (departmentFilter) params.department = departmentFilter;
      if (terminalFilter) params.terminal = terminalFilter;
      if (statusFilter) params.employmentStatus = statusFilter;
      
      const response = await personnelAPI.getAll(params);
      setPersonnel(response.data || []);
    } catch (err) {
      console.error('Error fetching personnel:', err);
      setError(err.message || 'Failed to fetch personnel');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPersonnel = async (personnelData) => {
    try {
      await personnelAPI.create(personnelData);
      setShowAddForm(false);
      fetchPersonnel();
    } catch (err) {
      console.error('Error adding personnel:', err);
      throw err;
    }
  };

  const handleEditPersonnel = async (id, personnelData) => {
    try {
      await personnelAPI.update(id, personnelData);
      setShowEditForm(false);
      setEditingPersonnel(null);
      fetchPersonnel();
    } catch (err) {
      console.error('Error updating personnel:', err);
      throw err;
    }
  };

  const handleDeletePersonnel = async (id) => {
    if (window.confirm('Are you sure you want to delete this personnel?')) {
      try {
        await personnelAPI.delete(id);
        fetchPersonnel();
      } catch (err) {
        console.error('Error deleting personnel:', err);
        alert('Failed to delete personnel');
      }
    }
  };

  const handleAddInfraction = async (personnelId, infractionData) => {
    try {
      await personnelAPI.addInfraction(personnelId, infractionData);
      setShowInfractionForm(false);
      setSelectedPersonnel(null);
      fetchPersonnel();
    } catch (err) {
      console.error('Error adding infraction:', err);
      throw err;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPersonnel();
  };

  const handleFilterChange = () => {
    fetchPersonnel();
  };

  const handleTabChange = (tab) => {
    // This function is no longer needed since we removed tabs
    // Keeping it for backward compatibility but it's not used
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'suspended': return 'status-suspended';
      case 'terminated': return 'status-terminated';
      case 'on_leave': return 'status-on-leave';
      default: return 'status-default';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'driver': return 'role-driver';
      case 'team_leader': return 'role-team-leader';
      case 'customer_care': return 'role-customer-care';
      case 'mechanic': return 'role-mechanic';
      case 'supervisor': return 'role-supervisor';
      case 'manager': return 'role-manager';
      case 'admin': return 'role-admin';
      default: return 'role-other';
    }
  };

  const getDepartmentBadgeClass = (department) => {
    switch (department) {
      case 'operations': return 'dept-operations';
      case 'maintenance': return 'dept-maintenance';
      case 'customer_service': return 'dept-customer-service';
      case 'administration': return 'dept-administration';
      case 'finance': return 'dept-finance';
      default: return 'dept-other';
    }
  };

  const getPointsColor = (points) => {
    if (points >= 80) return 'points-good';
    if (points >= 50) return 'points-warning';
    return 'points-danger';
  };

  const getLicenseStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'license-valid';
      case 'expiring_soon': return 'license-warning';
      case 'expired': return 'license-expired';
      default: return 'license-unknown';
    }
  };

  const filteredPersonnel = personnel; // All filtering is now handled by the API with query parameters

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading personnel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
        <button onClick={fetchPersonnel} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="personnel-container">
      {/* Header */}
      <div className="personnel-header">
        <div className="header-left">
          <h2>Personnel Management</h2>
          <span className="personnel-count">{personnel.length} personnel</span>
        </div>
        
        <div className="header-right">
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            <FaPlus />
            Add Personnel
          </button>
        </div>
      </div>

      {/* Personnel Overview */}
      <div className="personnel-overview">
        <h3>All Personnel</h3>
        <p>Manage and view all personnel across different roles and departments</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="search-filter-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <FaSearch className="search-icon" />
            <input
              type="text"
                             placeholder="Search by name, email, phone..."
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
            <label>Role:</label>
            <select 
              value={roleFilter} 
              onChange={(e) => {
                setRoleFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Roles</option>
              <option value="driver">Driver</option>
              <option value="team_leader">Team Leader</option>
              <option value="customer_care">Customer Care</option>
              <option value="mechanic">Mechanic</option>
              <option value="supervisor">Supervisor</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="garage_staff">Garage Staff</option>
              <option value="transport_staff">Transport Staff</option>
              <option value="inventory_staff">Inventory Staff</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Department:</label>
            <select 
              value={departmentFilter} 
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Departments</option>
              <option value="operations">Operations</option>
              <option value="maintenance">Maintenance</option>
              <option value="customer_service">Customer Service</option>
              <option value="administration">Administration</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Terminal:</label>
            <select 
              value={terminalFilter} 
              onChange={(e) => {
                setTerminalFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Terminals</option>
              <option value="Kigali">Kigali</option>
              <option value="Kampala">Kampala</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Juba">Juba</option>
            </select>
          </div>

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
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Personnel Table */}
      <div className="table-container">
        {filteredPersonnel.length === 0 ? (
          <div className="empty-state">
            <FaUser className="empty-icon" />
            <h3>No personnel found</h3>
            <p>Add your first personnel member to get started</p>
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus />
              Add Personnel
            </button>
          </div>
        ) : (
          <table className="personnel-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Department</th>
                <th>Terminal</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Driver Info</th>
                <th>Performance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersonnel.map((person) => (
                <tr key={person._id}>
                  <td>
                    <div className="employee-info">
                      <div className="employee-avatar">
                        <FaUser />
                      </div>
                                             <div className="employee-details">
                         <strong>{person.firstName} {person.lastName}</strong>
                       </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeClass(person.role)}`}>
                      {person.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`department-badge ${getDepartmentBadgeClass(person.department)}`}>
                      {person.department.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className="terminal-badge">
                      {person.terminal}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(person.employmentStatus)}`}>
                      {person.employmentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="contact-info">
                      {person.email && (
                        <div className="contact-item">
                          <FaEnvelope />
                          <span>{person.email}</span>
                        </div>
                      )}
                      {person.phoneNumber && (
                        <div className="contact-item">
                          <FaPhone />
                          <span>{person.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {person.role === 'driver' ? (
                      <div className="driver-info">
                        {person.licenseNumber && (
                          <div className="driver-info-item">
                            <FaIdCard />
                            <span>{person.licenseNumber}</span>
                            {person.licenseExpiryDate && (
                              <span className={`license-status ${getLicenseStatusColor(person.licenseStatus)}`}>
                                {person.licenseStatus}
                              </span>
                            )}
                          </div>
                        )}
                        {person.drivingPoints !== null && person.drivingPoints !== undefined && person.drivingPoints > 0 && (
                          <div className="driver-info-item">
                            <span className={`points-info ${getPointsColor(person.drivingPoints)}`}>
                              {person.drivingPoints}
                            </span>
                          </div>
                        )}
                        {person.assignedVehicle && (
                          <div className="driver-info-item">
                            <FaCar />
                            <span>{person.assignedVehicle.plateNumber || person.assignedVehicle}</span>
                          </div>
                        )}
                        {person.assignedRoute && (
                          <div className="driver-info-item">
                            <FaRoute />
                            <span>{person.assignedRoute}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="not-driver">N/A</span>
                    )}
                  </td>
                  <td>
                                         <div className="performance-info">
                       {person.performanceRating ? (
                         <div className="rating">
                           <FaStar />
                           <span>{person.performanceRating}/5</span>
                         </div>
                       ) : (
                         <span className="not-rated">Not Rated</span>
                       )}
                       {person.lastEvaluationDate && (
                         <div className="evaluation-date">
                           <FaCalendar />
                           <span>{new Date(person.lastEvaluationDate).toLocaleDateString()}</span>
                         </div>
                       )}
                     </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        title="View Details"
                        onClick={() => {
                          setViewingPersonnel(person);
                          setShowViewForm(true);
                        }}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit Personnel"
                        onClick={() => {
                          setEditingPersonnel(person);
                          setShowEditForm(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                      {person.role === 'driver' && (
                        <button
                          className="action-btn infraction-btn"
                          title="Add Infraction"
                          onClick={() => {
                            setSelectedPersonnel(person);
                            setShowInfractionForm(true);
                          }}
                        >
                          <FaExclamationTriangle />
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        title="Delete Personnel"
                        onClick={() => handleDeletePersonnel(person._id)}
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

      {/* Infractions Table */}
      {filteredPersonnel.some(person => person.role === 'driver' && person.infractions && person.infractions.length > 0) && (
        <div className="infractions-section">
          <h3>Driver Infractions</h3>
          <div className="table-container">
            <table className="infractions-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Points</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel
                  .filter(person => person.role === 'driver' && person.infractions && person.infractions.length > 0)
                  .flatMap(person => 
                    person.infractions.map((infraction, index) => (
                      <tr key={`${person._id}-${index}`}>
                        <td>
                          <div className="driver-name">
                            <FaUser />
                            <span>{person.firstName} {person.lastName}</span>
                          </div>
                        </td>
                        <td>{new Date(infraction.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`infraction-type ${infraction.severity}`}>
                            {infraction.type}
                          </span>
                        </td>
                        <td>{infraction.description}</td>
                        <td>
                          <span className={`points-badge ${getPointsColor(infraction.points)}`}>
                            {infraction.points}
                          </span>
                        </td>
                        <td>
                          <span className={`severity-badge ${infraction.severity}`}>
                            {infraction.severity}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${infraction.status}`}>
                            {infraction.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Personnel Modal */}
      {showAddForm && (
        <PersonnelForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddPersonnel}
          mode="add"
        />
      )}

      {/* Edit Personnel Modal */}
      {showEditForm && editingPersonnel && (
        <PersonnelForm
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setEditingPersonnel(null);
          }}
          onSubmit={(data) => handleEditPersonnel(editingPersonnel._id, data)}
          mode="edit"
          personnel={editingPersonnel}
        />
      )}

      {/* View Personnel Modal */}
      {showViewForm && viewingPersonnel && (
        <PersonnelForm
          isOpen={showViewForm}
          onClose={() => {
            setShowViewForm(false);
            setViewingPersonnel(null);
          }}
          onSubmit={() => {}}
          mode="view"
          personnel={viewingPersonnel}
        />
      )}

      {/* Add Infraction Modal */}
      {showInfractionForm && selectedPersonnel && (
        <InfractionForm
          isOpen={showInfractionForm}
          onClose={() => {
            setShowInfractionForm(false);
            setSelectedPersonnel(null);
          }}
          onSubmit={(data) => handleAddInfraction(selectedPersonnel._id, data)}
          personnel={selectedPersonnel}
        />
      )}
    </div>
  );
};

export default Personnel;
