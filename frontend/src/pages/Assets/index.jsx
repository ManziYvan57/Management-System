import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { FaBus, FaTools, FaCogs } from 'react-icons/fa';
import './Assets.css';

const Assets = () => {
  const [assets, setAssets] = useState([
    {
      id: 1,
      name: 'Bus #001',
      category: 'Bus',
      type: 'Passenger Bus',
      model: 'Toyota Coaster',
      year: 2020,
      registrationNumber: 'RAB 123A',
      purchaseCost: 45000000,
      purchaseDate: '2020-03-15',
      currentValue: 36000000,
      maintenanceCost: 1250000,
      status: 'active',
      location: 'Main Garage',
      insuranceExpiry: '2024-12-31',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      assignedTo: 'John Driver',
      notes: 'Primary route bus'
    },
    {
      id: 2,
      name: 'Diagnostic Scanner',
      category: 'Equipment',
      type: 'Diagnostic Tool',
      model: 'OBD-II Scanner Pro',
      year: 2022,
      registrationNumber: '',
      purchaseCost: 250000,
      purchaseDate: '2022-06-20',
      currentValue: 200000,
      maintenanceCost: 45000,
      status: 'active',
      location: 'Garage Workshop',
      insuranceExpiry: '',
      lastMaintenance: '2024-02-15',
      nextMaintenance: '2024-05-15',
      assignedTo: 'Mechanic Team',
      notes: 'Used for engine diagnostics'
    },
    {
      id: 3,
      name: 'Bus #002',
      category: 'Bus',
      type: 'Passenger Bus',
      model: 'Isuzu NPR',
      year: 2019,
      registrationNumber: 'RAB 456B',
      purchaseCost: 52000000,
      purchaseDate: '2019-08-10',
      currentValue: 39000000,
      maintenanceCost: 850000,
      status: 'maintenance',
      location: 'Main Garage',
      insuranceExpiry: '2024-11-30',
      lastMaintenance: '2024-01-25',
      nextMaintenance: '2024-04-25',
      assignedTo: 'Sarah Driver',
      notes: 'Currently under repair'
    }
  ]);

  const [maintenanceHistory, setMaintenanceHistory] = useState([
    {
      id: 1,
      assetId: 1,
      assetName: 'Bus #001',
      type: 'Preventive',
      description: 'Oil change and filter replacement',
      cost: 45000,
      date: '2024-01-10',
      technician: 'Mike Mechanic',
      nextDue: '2024-04-10'
    },
    {
      id: 2,
      assetId: 3,
      assetName: 'Bus #002',
      type: 'Corrective',
      description: 'Brake system repair',
      cost: 125000,
      date: '2024-01-25',
      technician: 'Mike Mechanic',
      nextDue: '2024-04-25'
    }
  ]);

  const [showAddAssetForm, setShowAddAssetForm] = useState(false);
  const [showEditAssetForm, setShowEditAssetForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  // Calculate maintenance cost from work orders (will be connected to Garage module)
  const calculateMaintenanceCost = (assetId) => {
    // This will be replaced with actual work order data from Garage module
    // For now, using sample data to demonstrate the concept
    const workOrderCosts = {
      1: 1250000, // Bus #001: Oil change + brake repair + tire replacement
      2: 45000,   // Diagnostic Scanner: Calibration + software update
      3: 850000   // Bus #002: Engine repair + transmission work
    };
    return workOrderCosts[assetId] || 0;
  };

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newAsset, setNewAsset] = useState({
    name: '',
    category: '',
    type: '',
    model: '',
    year: '',
    registrationNumber: '',
    purchaseCost: '',
    purchaseDate: '',
    location: '',
    insuranceExpiry: '',
    assignedTo: '',
    notes: ''
  });

  const [newMaintenance, setNewMaintenance] = useState({
    assetId: '',
    type: '',
    description: '',
    cost: '',
    date: '',
    technician: ''
  });

  // Dashboard Statistics
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalPurchaseCost = assets.reduce((sum, asset) => sum + asset.purchaseCost, 0);
  const totalMaintenanceCost = assets.reduce((sum, asset) => sum + (asset.maintenanceCost || 0), 0);
  const depreciation = totalPurchaseCost - totalValue;
  const activeAssets = assets.filter(asset => asset.status === 'active').length;
  const maintenanceAssets = assets.filter(asset => asset.status === 'maintenance').length;
  const outOfServiceAssets = assets.filter(asset => asset.status === 'out-of-service').length;

  // Category breakdown
  const busAssets = assets.filter(asset => asset.category === 'Bus');
  const equipmentAssets = assets.filter(asset => asset.category === 'Equipment');
  const toolAssets = assets.filter(asset => asset.category === 'Tool');

  // Expiring insurance
  const expiringInsurance = assets.filter(asset => {
    if (!asset.insuranceExpiry) return false;
    const expiryDate = new Date(asset.insuranceExpiry);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  });

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    switch(formType) {
      case 'asset':
        setNewAsset({ ...newAsset, [name]: value });
        break;
      case 'maintenance':
        setNewMaintenance({ ...newMaintenance, [name]: value });
        break;
      default:
        break;
    }
  };

  const handleSubmitAsset = (e) => {
    e.preventDefault();
    const newAssetItem = {
      id: Date.now(),
      ...newAsset,
      year: parseInt(newAsset.year) || 0,
      purchaseCost: parseFloat(newAsset.purchaseCost) || 0,
      currentValue: parseFloat(newAsset.purchaseCost) || 0, // Initially same as purchase cost
      status: 'active',
      lastMaintenance: '',
      nextMaintenance: ''
    };
    setAssets([...assets, newAssetItem]);
    setNewAsset({
      name: '',
      category: '',
      type: '',
      model: '',
      year: '',
      registrationNumber: '',
      purchaseCost: '',
      purchaseDate: '',
      location: '',
      insuranceExpiry: '',
      assignedTo: '',
      notes: ''
    });
    setShowAddAssetForm(false);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setNewAsset({
      name: asset.name,
      category: asset.category,
      type: asset.type,
      model: asset.model,
      year: asset.year.toString(),
      registrationNumber: asset.registrationNumber,
      purchaseCost: asset.purchaseCost.toString(),
      purchaseDate: asset.purchaseDate,
      location: asset.location,
      insuranceExpiry: asset.insuranceExpiry,
      assignedTo: asset.assignedTo,
      notes: asset.notes
    });
    setShowEditAssetForm(true);
  };

  const handleUpdateAsset = (e) => {
    e.preventDefault();
    const updatedAsset = {
      ...editingAsset,
      ...newAsset,
      year: parseInt(newAsset.year) || 0,
      purchaseCost: parseFloat(newAsset.purchaseCost) || 0
    };
    setAssets(assets.map(asset => 
      asset.id === editingAsset.id ? updatedAsset : asset
    ));
    setNewAsset({
      name: '',
      category: '',
      type: '',
      model: '',
      year: '',
      registrationNumber: '',
      purchaseCost: '',
      purchaseDate: '',
      location: '',
      insuranceExpiry: '',
      assignedTo: '',
      notes: ''
    });
    setEditingAsset(null);
    setShowEditAssetForm(false);
  };

  const handleSubmitMaintenance = (e) => {
    e.preventDefault();
    const selectedAsset = assets.find(asset => asset.id === parseInt(newMaintenance.assetId));
    const newMaintenanceRecord = {
      id: Date.now(),
      ...newMaintenance,
      assetId: parseInt(newMaintenance.assetId),
      assetName: selectedAsset?.name || '',
      cost: parseFloat(newMaintenance.cost) || 0,
      date: newMaintenance.date,
      nextDue: new Date(new Date(newMaintenance.date).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from maintenance date
    };

    // Update asset maintenance dates
    setAssets(assets.map(asset => 
      asset.id === parseInt(newMaintenance.assetId) 
        ? { 
            ...asset, 
            lastMaintenance: newMaintenance.date,
            nextMaintenance: newMaintenanceRecord.nextDue,
            status: 'active' // Set back to active after maintenance
          }
        : asset
    ));

    setMaintenanceHistory([...maintenanceHistory, newMaintenanceRecord]);
    setNewMaintenance({
      assetId: '',
      type: '',
      description: '',
      cost: '',
      date: '',
      technician: ''
    });
    setShowMaintenanceForm(false);
  };

  const handleStatusChange = (assetId, newStatus) => {
    setAssets(assets.map(asset =>
      asset.id === assetId ? { ...asset, status: newStatus } : asset
    ));
  };

  const handleValueUpdate = (assetId, newValue) => {
    setAssets(assets.map(asset =>
      asset.id === assetId ? { ...asset, currentValue: parseFloat(newValue) || 0 } : asset
    ));
  };

  // Filtered assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchTerm === '' || 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'out-of-service': return 'danger';
      default: return 'secondary';
    }
  };

  const getAssetAge = (year) => {
    const currentYear = new Date().getFullYear();
    return currentYear - year;
  };

  return (
    <div className="assets-container">
      <h2>Asset Management</h2>
      
      {/* Mini Dashboard */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{totalAssets}</h3>
          <p>Total Assets</p>
        </div>
        <div className="stat-card">
          <h3>RWF {totalValue.toLocaleString()}</h3>
          <p>Current Value</p>
        </div>
        <div className="stat-card">
          <h3>RWF {totalMaintenanceCost.toLocaleString()}</h3>
          <p>Total Maintenance Cost</p>
        </div>
        <div className="stat-card">
          <h3>{activeAssets}</h3>
          <p>Active Assets</p>
        </div>
      </div>

      {/* Asset Categories */}
      <div className="category-stats">
        <div className="category-card">
          <div className="category-icon">
            <FaBus />
          </div>
          <h4>Buses</h4>
          <div className="category-value">{busAssets.length}</div>
          <div className="category-amount">RWF {busAssets.reduce((sum, asset) => sum + asset.currentValue, 0).toLocaleString()}</div>
        </div>
        <div className="category-card">
          <div className="category-icon">
            <FaCogs />
          </div>
          <h4>Equipment</h4>
          <div className="category-value">{equipmentAssets.length}</div>
          <div className="category-amount">RWF {equipmentAssets.reduce((sum, asset) => sum + asset.currentValue, 0).toLocaleString()}</div>
        </div>
        <div className="category-card">
          <div className="category-icon">
            <FaTools />
          </div>
          <h4>Tools</h4>
          <div className="category-value">{toolAssets.length}</div>
          <div className="category-amount">RWF {toolAssets.reduce((sum, asset) => sum + asset.currentValue, 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Alerts */}
      {expiringInsurance.length > 0 && (
        <div className="alert warning">
          <strong>Insurance Alerts:</strong> {expiringInsurance.length} asset(s) have insurance expiring within 30 days
        </div>
      )}

      {maintenanceAssets.length > 0 && (
        <div className="alert info">
          <strong>Maintenance Status:</strong> {maintenanceAssets} asset(s) currently under maintenance
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => setShowAddAssetForm(true)} className="action-btn">
          Add Asset
        </button>
        <button onClick={() => setShowMaintenanceForm(true)} className="action-btn">
          Record Maintenance
        </button>
      </div>

      {/* Assets List */}
      <div className="assets-list">
        <div className="section-header">
          <h3>Asset Register</h3>
          
          {/* Search and Filter Controls */}
          <div className="search-filter-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                <option value="Bus">Buses</option>
                <option value="Equipment">Equipment</option>
                <option value="Tool">Tools</option>
              </select>
              
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="out-of-service">Out of Service</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Model/Type</th>
                <th>Registration</th>
                <th>Age</th>
                <th>Purchase Cost</th>
                <th>Current Value</th>
                <th>Maintenance Cost</th>
                <th>Status</th>
                <th>Location</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className={`asset-${asset.status}`}>
                  <td>
                    <div className="asset-name">
                      <strong>{asset.name}</strong>
                      {asset.notes && <div className="asset-notes">{asset.notes}</div>}
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge ${asset.category.toLowerCase()}`}>
                      {asset.category}
                    </span>
                  </td>
                  <td>{asset.model || asset.type}</td>
                  <td>{asset.registrationNumber || '-'}</td>
                  <td>{getAssetAge(asset.year)} years</td>
                  <td>RWF {asset.purchaseCost.toLocaleString()}</td>
                  <td>
                    <div className="value-controls">
                      <input
                        type="number"
                        value={asset.currentValue}
                        onChange={(e) => handleValueUpdate(asset.id, e.target.value)}
                        className="value-input"
                        min="0"
                      />
                    </div>
                  </td>
                  <td>
                    <span className="maintenance-cost">
                      RWF {(asset.maintenanceCost || 0).toLocaleString()}
                    </span>
                    <small className="cost-note">(Auto-calculated from work orders)</small>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(asset.status)}`}>
                      {asset.status === 'active' && 'Active'}
                      {asset.status === 'maintenance' && 'Maintenance'}
                      {asset.status === 'out-of-service' && 'Out of Service'}
                    </span>
                  </td>
                  <td>{asset.location}</td>
                  <td>{asset.assignedTo || '-'}</td>
                  <td>
                    <div className="action-controls">
                      <button 
                        onClick={() => handleEditAsset(asset)}
                        className="edit-btn"
                        title="Edit Asset"
                      >
                        Edit
                      </button>
                      <select
                        value={asset.status}
                        onChange={(e) => handleStatusChange(asset.id, e.target.value)}
                        className="status-change-select"
                        title="Change Status"
                      >
                        <option value="active">Set Active</option>
                        <option value="maintenance">Set Maintenance</option>
                        <option value="out-of-service">Set Out of Service</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAssets.length === 0 && (
            <div className="no-results">
              <p>No assets found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>



      {/* Add Asset Form Modal */}
      {showAddAssetForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Asset</h3>
              <button onClick={() => setShowAddAssetForm(false)} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitAsset} className="modal-form">
              {/* Basic Information - Always Visible */}
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="assetName">Asset Name:</label>
                    <input
                      type="text"
                      id="assetName"
                      name="name"
                      value={newAsset.name}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <select
                      id="category"
                      name="category"
                      value={newAsset.category}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Bus">Bus</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Tool">Tool</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">Type:</label>
                    <input
                      type="text"
                      id="type"
                      name="type"
                      value={newAsset.type}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      placeholder={newAsset.category === 'Bus' ? 'e.g., Passenger Bus, Cargo Bus' : 
                                  newAsset.category === 'Equipment' ? 'e.g., Diagnostic Tool, Compressor' :
                                  'e.g., Wrench Set, Screwdriver'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="model">Model:</label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={newAsset.model}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      placeholder={newAsset.category === 'Bus' ? 'e.g., Toyota Coaster, Isuzu NPR' : 
                                  newAsset.category === 'Equipment' ? 'e.g., OBD-II Scanner Pro, Air Compressor' :
                                  'e.g., Stanley, Craftsman'}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle-Specific Fields - Only for Buses */}
              {newAsset.category === 'Bus' && (
                <div className="form-section">
                  <h4>Vehicle Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="year">Manufacturing Year:</label>
                      <input
                        type="number"
                        id="year"
                        name="year"
                        value={newAsset.year}
                        onChange={(e) => handleInputChange(e, 'asset')}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="registrationNumber">Registration Number:</label>
                      <input
                        type="text"
                        id="registrationNumber"
                        name="registrationNumber"
                        value={newAsset.registrationNumber}
                        onChange={(e) => handleInputChange(e, 'asset')}
                        placeholder="e.g., RAB 123A"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="insuranceExpiry">Insurance Expiry Date:</label>
                    <input
                      type="date"
                      id="insuranceExpiry"
                      name="insuranceExpiry"
                      value={newAsset.insuranceExpiry}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Equipment/Tool Specific Fields */}
              {(newAsset.category === 'Equipment' || newAsset.category === 'Tool') && (
                <div className="form-section">
                  <h4>{newAsset.category} Details</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="year">Purchase Year:</label>
                      <input
                        type="number"
                        id="year"
                        name="year"
                        value={newAsset.year}
                        onChange={(e) => handleInputChange(e, 'asset')}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="assignedTo">Assigned To:</label>
                      <input
                        type="text"
                        id="assignedTo"
                        name="assignedTo"
                        value={newAsset.assignedTo}
                        onChange={(e) => handleInputChange(e, 'asset')}
                        placeholder={newAsset.category === 'Equipment' ? 'e.g., Mechanic Team, Workshop' : 'e.g., John Mechanic, Tool Box'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Information - Always Visible */}
              <div className="form-section">
                <h4>Financial Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="purchaseCost">Purchase Cost (RWF):</label>
                    <input
                      type="number"
                      id="purchaseCost"
                      name="purchaseCost"
                      value={newAsset.purchaseCost}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="purchaseDate">Purchase Date:</label>
                    <input
                      type="date"
                      id="purchaseDate"
                      name="purchaseDate"
                      value={newAsset.purchaseDate}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location Information - Always Visible */}
              <div className="form-section">
                <h4>Location Information</h4>
                <div className="form-group">
                  <label htmlFor="location">Location:</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newAsset.location}
                    onChange={(e) => handleInputChange(e, 'asset')}
                    placeholder={newAsset.category === 'Bus' ? 'e.g., Main Garage, Parking Lot' : 
                                newAsset.category === 'Equipment' ? 'e.g., Workshop, Diagnostic Bay' :
                                'e.g., Tool Cabinet, Workshop'}
                    required
                  />
                </div>
              </div>

              {/* Additional Information - Always Visible */}
              <div className="form-section">
                <h4>Additional Information</h4>
                <div className="form-group">
                  <label htmlFor="notes">Notes:</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={newAsset.notes}
                    onChange={(e) => handleInputChange(e, 'asset')}
                    placeholder="Additional information about the asset"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddAssetForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Asset Form Modal */}
      {showEditAssetForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Asset</h3>
              <button onClick={() => setShowEditAssetForm(false)} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateAsset} className="modal-form">
              {/* Basic Information - Always Visible */}
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editAssetName">Asset Name:</label>
                    <input
                      type="text"
                      id="editAssetName"
                      name="name"
                      value={newAsset.name}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editCategory">Category:</label>
                    <select
                      id="editCategory"
                      name="category"
                      value={newAsset.category}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Bus">Bus</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Tool">Tool</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editType">Type:</label>
                    <input
                      type="text"
                      id="editType"
                      name="type"
                      value={newAsset.type}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      placeholder={newAsset.category === 'Bus' ? 'e.g., Passenger Bus, Cargo Bus' : 
                                  newAsset.category === 'Equipment' ? 'e.g., Diagnostic Tool, Compressor' :
                                  'e.g., Wrench Set, Screwdriver'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editModel">Model:</label>
                    <input
                      type="text"
                      id="editModel"
                      name="model"
                      value={newAsset.model}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      placeholder={newAsset.category === 'Bus' ? 'e.g., Toyota Coaster, Isuzu NPR' : 
                                  newAsset.category === 'Equipment' ? 'e.g., OBD-II Scanner Pro, Air Compressor' :
                                  'e.g., Stanley, Craftsman'}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle-Specific Fields - Only for Buses */}
              {newAsset.category === 'Bus' && (
                <div className="form-section">
                  <h4>Vehicle Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="editYear">Manufacturing Year:</label>
                      <input
                        type="number"
                        id="editYear"
                        name="year"
                        value={newAsset.year}
                        onChange={(e) => handleInputChange(e, 'asset')}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="editRegistrationNumber">Registration Number:</label>
                      <input
                        type="text"
                        id="editRegistrationNumber"
                        name="registrationNumber"
                        value={newAsset.registrationNumber}
                        onChange={(e) => handleInputChange(e, 'asset')}
                        placeholder="e.g., RAB 123A"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="editInsuranceExpiry">Insurance Expiry Date:</label>
                    <input
                      type="date"
                      id="editInsuranceExpiry"
                      name="insuranceExpiry"
                      value={newAsset.insuranceExpiry}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Equipment/Tool Specific Fields */}
              {(newAsset.category === 'Equipment' || newAsset.category === 'Tool') && (
                <div className="form-section">
                  <h4>{newAsset.category} Details</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="editYear">Purchase Year:</label>
                      <input
                        type="number"
                        id="editYear"
                        name="year"
                        value={newAsset.year}
                        onChange={(e) => handleInputChange(e, 'asset')}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="editAssignedTo">Assigned To:</label>
                      <input
                        type="text"
                        id="editAssignedTo"
                        name="assignedTo"
                        value={newAsset.assignedTo}
                        onChange={(e) => handleInputChange(e, 'asset')}
                        placeholder={newAsset.category === 'Equipment' ? 'e.g., Mechanic Team, Workshop' : 'e.g., John Mechanic, Tool Box'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Information - Always Visible */}
              <div className="form-section">
                <h4>Financial Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editPurchaseCost">Purchase Cost (RWF):</label>
                    <input
                      type="number"
                      id="editPurchaseCost"
                      name="purchaseCost"
                      value={newAsset.purchaseCost}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editPurchaseDate">Purchase Date:</label>
                    <input
                      type="date"
                      id="editPurchaseDate"
                      name="purchaseDate"
                      value={newAsset.purchaseDate}
                      onChange={(e) => handleInputChange(e, 'asset')}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location Information - Always Visible */}
              <div className="form-section">
                <h4>Location Information</h4>
                <div className="form-group">
                  <label htmlFor="editLocation">Location:</label>
                  <input
                    type="text"
                    id="editLocation"
                    name="location"
                    value={newAsset.location}
                    onChange={(e) => handleInputChange(e, 'asset')}
                    placeholder={newAsset.category === 'Bus' ? 'e.g., Main Garage, Parking Lot' : 
                                newAsset.category === 'Equipment' ? 'e.g., Workshop, Diagnostic Bay' :
                                'e.g., Tool Cabinet, Workshop'}
                    required
                  />
                </div>
              </div>

              {/* Additional Information - Always Visible */}
              <div className="form-section">
                <h4>Additional Information</h4>
                <div className="form-group">
                  <label htmlFor="editNotes">Notes:</label>
                  <textarea
                    id="editNotes"
                    name="notes"
                    value={newAsset.notes}
                    onChange={(e) => handleInputChange(e, 'asset')}
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowEditAssetForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Form Modal */}
      {showMaintenanceForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Record Maintenance</h3>
              <button onClick={() => setShowMaintenanceForm(false)} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitMaintenance} className="modal-form">
              <div className="form-group">
                <label htmlFor="maintenanceAsset">Asset:</label>
                <select
                  id="maintenanceAsset"
                  name="assetId"
                  value={newMaintenance.assetId}
                  onChange={(e) => handleInputChange(e, 'maintenance')}
                  required
                >
                  <option value="">Select Asset</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} - {asset.model || asset.type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maintenanceType">Maintenance Type:</label>
                  <select
                    id="maintenanceType"
                    name="type"
                    value={newMaintenance.type}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Preventive">Preventive</option>
                    <option value="Corrective">Corrective</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="maintenanceDate">Date:</label>
                  <input
                    type="date"
                    id="maintenanceDate"
                    name="date"
                    value={newMaintenance.date}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maintenanceCost">Cost (RWF):</label>
                  <input
                    type="number"
                    id="maintenanceCost"
                    name="cost"
                    value={newMaintenance.cost}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="maintenanceTechnician">Technician:</label>
                  <input
                    type="text"
                    id="maintenanceTechnician"
                    name="technician"
                    value={newMaintenance.technician}
                    onChange={(e) => handleInputChange(e, 'maintenance')}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="maintenanceDescription">Description:</label>
                <textarea
                  id="maintenanceDescription"
                  name="description"
                  value={newMaintenance.description}
                  onChange={(e) => handleInputChange(e, 'maintenance')}
                  placeholder="Describe the maintenance work performed"
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowMaintenanceForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Record Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;