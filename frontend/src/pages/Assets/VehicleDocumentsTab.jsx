import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaFileAlt, FaCalendar, FaExclamationTriangle, FaCheckCircle, FaClock, FaDownload, FaUpload } from 'react-icons/fa';
import { vehicleDocumentsAPI, vehiclesAPI } from '../../services/api';
import VehicleDocumentForm from './VehicleDocumentForm';
import './VehicleDocumentsTab.css';

const VehicleDocumentsTab = () => {
  const [documents, setDocuments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('');
  const [expiryStatusFilter, setExpiryStatusFilter] = useState('');

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
    fetchVehicles();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (documentTypeFilter) params.documentType = documentTypeFilter;
      if (statusFilter) params.status = statusFilter;
      if (complianceFilter) params.complianceStatus = complianceFilter;
      if (expiryStatusFilter) params.expiryStatus = expiryStatusFilter;
      
      const response = await vehicleDocumentsAPI.getAll(params);
      setDocuments(response.data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      if (err.message.includes('500')) {
        setError('Vehicle Documents service is currently unavailable. Please try again later or contact support.');
      } else {
        setError(err.message || 'Failed to fetch documents');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesAPI.getAll();
      setVehicles(response.data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      // Don't set error state for vehicles as it's not critical for the main functionality
    }
  };

  const handleAddDocument = async (documentData) => {
    try {
      await vehicleDocumentsAPI.create(documentData);
      setShowAddForm(false);
      fetchDocuments();
    } catch (err) {
      console.error('Error adding document:', err);
      throw err;
    }
  };

  const handleEditDocument = async (id, documentData) => {
    try {
      await vehicleDocumentsAPI.update(id, documentData);
      setShowEditForm(false);
      setEditingDocument(null);
      fetchDocuments();
    } catch (err) {
      console.error('Error updating document:', err);
      throw err;
    }
  };

  const handleDeleteDocument = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await vehicleDocumentsAPI.delete(id);
        fetchDocuments();
      } catch (err) {
        console.error('Error deleting document:', err);
        alert('Failed to delete document');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleFilterChange = () => {
    fetchDocuments();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'expired': return 'status-expired';
      case 'pending_renewal': return 'status-pending';
      case 'suspended': return 'status-suspended';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const getDocumentTypeBadgeClass = (type) => {
    switch (type) {
      case 'insurance': return 'type-insurance';
      case 'technical_control': return 'type-technical';
      case 'registration': return 'type-registration';
      case 'inspection_certificate': return 'type-inspection';
      case 'emission_test': return 'type-emission';
      case 'safety_certificate': return 'type-safety';
      case 'compliance_certificate': return 'type-compliance';
      default: return 'type-other';
    }
  };

  const getComplianceBadgeClass = (status) => {
    switch (status) {
      case 'compliant': return 'compliance-compliant';
      case 'non_compliant': return 'compliance-non-compliant';
      case 'pending_review': return 'compliance-pending';
      case 'under_review': return 'compliance-under-review';
      default: return 'compliance-default';
    }
  };

  const getExpiryStatusClass = (daysUntilExpiry) => {
    if (daysUntilExpiry < 0) return 'expiry-expired';
    if (daysUntilExpiry <= 7) return 'expiry-critical';
    if (daysUntilExpiry <= 30) return 'expiry-warning';
    if (daysUntilExpiry <= 90) return 'expiry-notice';
    return 'expiry-valid';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getVehicleDisplay = (vehicle) => {
    if (!vehicle) return 'N/A';
    return `${vehicle.plateNumber} - ${vehicle.make} ${vehicle.model} (${vehicle.year})`;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading vehicle documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>Error Loading Documents</h3>
        <p>{error}</p>
        <button onClick={fetchDocuments}>Retry</button>
      </div>
    );
  }

  return (
    <div className="vehicle-documents-container">
      {/* Header */}
      <div className="vehicle-documents-header">
        <div className="header-left">
          <h2>Vehicle Document Management</h2>
          <span className="documents-count">{documents.length} documents</span>
        </div>
        
        <div className="header-right">
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            <FaPlus />
            Add Document
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
              placeholder="Search by document number, title, authority..."
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
            <label>Document Type:</label>
            <select 
              value={documentTypeFilter} 
              onChange={(e) => {
                setDocumentTypeFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Types</option>
              <option value="insurance">Insurance</option>
              <option value="technical_control">Technical Control</option>
              <option value="registration">Registration</option>
              <option value="inspection_certificate">Inspection Certificate</option>
              <option value="emission_test">Emission Test</option>
              <option value="safety_certificate">Safety Certificate</option>
              <option value="compliance_certificate">Compliance Certificate</option>
              <option value="other">Other</option>
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
              <option value="expired">Expired</option>
              <option value="pending_renewal">Pending Renewal</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Compliance:</label>
            <select 
              value={complianceFilter} 
              onChange={(e) => {
                setComplianceFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Compliance</option>
              <option value="compliant">Compliant</option>
              <option value="non_compliant">Non-Compliant</option>
              <option value="pending_review">Pending Review</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Expiry Status:</label>
            <select 
              value={expiryStatusFilter} 
              onChange={(e) => {
                setExpiryStatusFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Expiry</option>
              <option value="expired">Expired</option>
              <option value="expiring_soon">Expiring Soon (≤30 days)</option>
              <option value="expiring_later">Expiring Later (31-90 days)</option>
              <option value="valid">Valid (&gt;90 days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="table-container">
        {documents.length === 0 ? (
          <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <h3>No documents found</h3>
            <p>Add your first vehicle document to get started</p>
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus />
              Add Document
            </button>
          </div>
        ) : (
          <table className="documents-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Document</th>
                <th>Type</th>
                <th>Status</th>
                <th>Compliance</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id}>
                  <td>
                    <div className="vehicle-info">
                      <FaFileAlt className="vehicle-icon" />
                      <div className="vehicle-details">
                        <strong>{getVehicleDisplay(doc.vehicle)}</strong>
                        <span className="document-number">{doc.documentNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="document-info">
                      <div className="document-title">
                        <strong>{doc.title}</strong>
                      </div>
                      <div className="document-authority">
                        <span className="issuing-authority">{doc.issuingAuthority}</span>
                      </div>
                      {doc.description && (
                        <div className="document-description">
                          <span className="description">{doc.description}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`document-type-badge ${getDocumentTypeBadgeClass(doc.documentType)}`}>
                      {doc.documentType.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(doc.status)}`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`compliance-badge ${getComplianceBadgeClass(doc.complianceStatus)}`}>
                      {doc.complianceStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className={`expiry-info ${getExpiryStatusClass(doc.daysUntilExpiry)}`}>
                      <div className="expiry-date">
                        <FaCalendar />
                        <span>{formatDate(doc.expiryDate)}</span>
                      </div>
                      {doc.daysUntilExpiry !== null && (
                        <div className="days-remaining">
                          {doc.daysUntilExpiry < 0 ? (
                            <span className="expired">Expired {Math.abs(doc.daysUntilExpiry)} days ago</span>
                          ) : (
                            <span>{doc.daysUntilExpiry} days remaining</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        onClick={() => {
                          setEditingDocument(doc);
                          setShowEditForm(true);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => {
                          setEditingDocument(doc);
                          setShowEditForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteDocument(doc._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Document Modal */}
      {showAddForm && (
        <VehicleDocumentForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddDocument}
          mode="add"
          vehicles={vehicles}
        />
      )}

      {/* Edit Document Modal */}
      {showEditForm && editingDocument && (
        <VehicleDocumentForm
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setEditingDocument(null);
          }}
          onSubmit={(data) => handleEditDocument(editingDocument._id, data)}
          mode="edit"
          document={editingDocument}
          vehicles={vehicles}
        />
      )}
    </div>
  );
};

export default VehicleDocumentsTab;
