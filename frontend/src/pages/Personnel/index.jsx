import React, { useState, useEffect } from 'react';
import { FaUserTie, FaUsers, FaUserCheck, FaUserClock, FaRoute, FaBus } from 'react-icons/fa';
import { personnelAPI } from '../../services/api';
import './Personnel.css';

const Personnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddPersonnelForm, setShowAddPersonnelForm] = useState(false);
  const [showEditPersonnelForm, setShowEditPersonnelForm] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newPersonnel, setNewPersonnel] = useState({
    name: '',
    type: 'driver',
    role: 'driver',
    route: '',
    status: 'active',
    phone: '',
    license: '',
    experience: ''
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await personnelAPI.getAll();
        setPersonnel(response.data || []);
      } catch (err) {
        console.error('Error fetching personnel data:', err);
        setError(err.message || 'Failed to fetch personnel data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh data after adding/editing
  const refreshData = async () => {
    try {
      const response = await personnelAPI.getAll();
      setPersonnel(response.data || []);
    } catch (err) {
      console.error('Error refreshing personnel data:', err);
    }
  };

  // Dashboard Statistics
  const totalPersonnel = personnel.length;
  const activeDrivers = personnel.filter(p => p.type === 'driver' && p.status === 'active').length;
  const activeCustomerCare = personnel.filter(p => p.type === 'customer-care' && p.status === 'active').length;
  const reservePersonnel = personnel.filter(p => p.role === 'reserve').length;
  const teamLeaders = personnel.filter(p => p.role === 'team-leader').length;

  // Filter personnel based on search and filters
  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.phone.includes(searchTerm) ||
                         (person.license && person.license.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || person.type === typeFilter;
    const matchesRole = routeFilter === 'all' || person.role === routeFilter;
    const matchesStatus = statusFilter === 'all' || person.status === statusFilter;
    
    return matchesSearch && matchesType && matchesRole && matchesStatus;
  });

  // Form handling functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPersonnel({ ...newPersonnel, [name]: value });
  };

  const handleSubmitPersonnel = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPersonnel) {
        // Update existing personnel
        // TODO: Add update API call when backend supports it
        console.log('Update personnel:', newPersonnel);
      } else {
        // Add new personnel
        await personnelAPI.create(newPersonnel);
      }
      
      // Refresh the data
      await refreshData();
      
      setNewPersonnel({
        name: '',
        type: 'driver',
        role: 'driver',
        route: '',
        status: 'active',
        phone: '',
        license: '',
        experience: ''
      });
      setEditingPersonnel(null);
      setShowAddPersonnelForm(false);
      setShowEditPersonnelForm(false);
    } catch (err) {
      console.error('Error saving personnel:', err);
      alert(err.message || 'Failed to save personnel');
    }
  };

  const handleEditPersonnel = (person) => {
    setEditingPersonnel(person);
    setNewPersonnel({
      name: person.name,
      type: person.type,
      role: person.role,
      route: person.route,
      status: person.status,
      phone: person.phone,
      license: person.license || '',
      experience: person.experience
    });
    setShowEditPersonnelForm(true);
  };

  const handleCancelEdit = () => {
    setEditingPersonnel(null);
    setNewPersonnel({
      name: '',
      type: 'driver',
      role: 'driver',
      route: '',
      status: 'active',
      phone: '',
      license: '',
      experience: ''
    });
    setShowAddPersonnelForm(false);
    setShowEditPersonnelForm(false);
  };

  return (
    <div className="personnel-container">
      <h2>Personnel Management</h2>
      
      {/* Mini Dashboard */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{totalPersonnel}</h3>
          <p>Total Personnel</p>
        </div>
        <div className="stat-card">
          <h3>{activeDrivers}</h3>
          <p>Active Drivers</p>
        </div>
        <div className="stat-card">
          <h3>{activeCustomerCare}</h3>
          <p>Customer Care Staff</p>
        </div>
        <div className="stat-card">
          <h3>{reservePersonnel}</h3>
          <p>Reserve Personnel</p>
        </div>
      </div>

             {/* Quick Actions */}
       <div className="quick-actions">
         <button onClick={() => setShowAddPersonnelForm(true)} className="action-btn">
           Add Personnel
         </button>
       </div>

               {/* Personnel List */}
       <div className="personnel-list">
         <div className="list-header">
           <h3>Personnel Directory</h3>
           <div className="header-controls">
             <div className="search-box">
               <input
                 type="text"
                 placeholder="Search personnel..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="search-input"
               />
             </div>
             
             <div className="filter-group">
               <select
                 value={typeFilter}
                 onChange={(e) => setTypeFilter(e.target.value)}
                 className="filter-select"
               >
                 <option value="all">All Types</option>
                 <option value="driver">Drivers</option>
                 <option value="customer-care">Customer Care</option>
               </select>
               
               <select
                 value={routeFilter}
                 onChange={(e) => setRouteFilter(e.target.value)}
                 className="filter-select"
               >
                 <option value="all">All Roles</option>
                 <option value="driver">Driver</option>
                 <option value="team-leader">Team Leader</option>
                 <option value="staff">Staff</option>
                 <option value="reserve">Reserve</option>
               </select>
               
               <select
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="filter-select"
               >
                 <option value="all">All Status</option>
                 <option value="active">Active</option>
                 <option value="reserve">Reserve</option>
                 <option value="sick">Sick</option>
               </select>
             </div>
           </div>
         </div>
        <div className="table-container">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading personnel...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={refreshData} className="retry-btn">Retry</button>
            </div>
          )}
          
          {!loading && !error && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Role</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Phone</th>
                    <th>License/Experience</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonnel.map((person) => (
                <tr key={person.id}>
                  <td>{person.name}</td>
                  <td>{person.type === 'driver' ? 'Driver' : 'Customer Care'}</td>
                  <td>{person.role === 'team-leader' ? 'Team Leader' : person.role}</td>
                  <td>{person.route}</td>
                  <td>{person.status}</td>
                  <td>{person.phone}</td>
                  <td>{person.type === 'driver' ? person.license : person.experience}</td>
                                     <td>
                     <button 
                       className="edit-btn" 
                       onClick={() => handleEditPersonnel(person)}
                     >
                       Edit
                     </button>
                   </td>
                </tr>
              ))}
                            </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Add Personnel Form Modal */}
      {showAddPersonnelForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Personnel</h3>
              <button onClick={handleCancelEdit} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitPersonnel} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Full Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newPersonnel.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Type:</label>
                  <select
                    id="type"
                    name="type"
                    value={newPersonnel.type}
                    onChange={handleInputChange}
                  >
                    <option value="driver">Driver</option>
                    <option value="customer-care">Customer Care</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="role">Role:</label>
                  <select
                    id="role"
                    name="role"
                    value={newPersonnel.role}
                    onChange={handleInputChange}
                  >
                    <option value="driver">Driver</option>
                    <option value="team-leader">Team Leader</option>
                    <option value="staff">Staff</option>
                    <option value="reserve">Reserve</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="route">Route:</label>
                  <select
                    id="route"
                    name="route"
                    value={newPersonnel.route}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Route</option>
                    <option value="Kampala-Nairobi">Kampala-Nairobi</option>
                    <option value="Goma-Cyanika-Kampala">Goma-Cyanika-Kampala</option>
                    <option value="Nairobi-Kigali">Nairobi-Kigali</option>
                    <option value="Kampala-Kigali">Kampala-Kigali</option>
                    <option value="Kampala-Juba">Kampala-Juba</option>
                    <option value="Juba-Bor">Juba-Bor</option>
                    <option value="Standby">Standby</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Status:</label>
                  <select
                    id="status"
                    name="status"
                    value={newPersonnel.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="reserve">Reserve</option>
                    <option value="sick">Sick</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number:</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newPersonnel.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {newPersonnel.type === 'driver' ? (
                  <div className="form-group">
                    <label htmlFor="license">License Number:</label>
                    <input
                      type="text"
                      id="license"
                      name="license"
                      value={newPersonnel.license}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="experience">Experience:</label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      value={newPersonnel.experience}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 years"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Personnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Personnel Form Modal */}
      {showEditPersonnelForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Personnel</h3>
              <button onClick={handleCancelEdit} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitPersonnel} className="modal-form">
              <div className="form-group">
                <label htmlFor="editName">Full Name:</label>
                <input
                  type="text"
                  id="editName"
                  name="name"
                  value={newPersonnel.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="editType">Type:</label>
                  <select
                    id="editType"
                    name="type"
                    value={newPersonnel.type}
                    onChange={handleInputChange}
                  >
                    <option value="driver">Driver</option>
                    <option value="customer-care">Customer Care</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="editRole">Role:</label>
                  <select
                    id="editRole"
                    name="role"
                    value={newPersonnel.role}
                    onChange={handleInputChange}
                  >
                    <option value="driver">Driver</option>
                    <option value="team-leader">Team Leader</option>
                    <option value="staff">Staff</option>
                    <option value="reserve">Reserve</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="editRoute">Route:</label>
                  <select
                    id="editRoute"
                    name="route"
                    value={newPersonnel.route}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Route</option>
                    <option value="Kampala-Nairobi">Kampala-Nairobi</option>
                    <option value="Goma-Cyanika-Kampala">Goma-Cyanika-Kampala</option>
                    <option value="Nairobi-Kigali">Nairobi-Kigali</option>
                    <option value="Kampala-Kigali">Kampala-Kigali</option>
                    <option value="Kampala-Juba">Kampala-Juba</option>
                    <option value="Juba-Bor">Juba-Bor</option>
                    <option value="Standby">Standby</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="editStatus">Status:</label>
                  <select
                    id="editStatus"
                    name="status"
                    value={newPersonnel.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="reserve">Reserve</option>
                    <option value="sick">Sick</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="editPhone">Phone Number:</label>
                  <input
                    type="tel"
                    id="editPhone"
                    name="phone"
                    value={newPersonnel.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {newPersonnel.type === 'driver' ? (
                  <div className="form-group">
                    <label htmlFor="editLicense">License Number:</label>
                    <input
                      type="text"
                      id="editLicense"
                      name="license"
                      value={newPersonnel.license}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="editExperience">Experience:</label>
                    <input
                      type="text"
                      id="editExperience"
                      name="experience"
                      value={newPersonnel.experience}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 years"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Personnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personnel;
