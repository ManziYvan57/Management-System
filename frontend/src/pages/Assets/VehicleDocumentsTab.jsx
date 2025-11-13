import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaFileAlt, FaCalendar, FaExclamationTriangle, FaCheckCircle, FaClock, FaDownload, FaUpload } from 'react-icons/fa';
import { vehicleDocumentsAPI, vehiclesAPI } from '../../services/api';
import VehicleDocumentForm from './VehicleDocumentForm';
import Pagination from '../../components/Pagination';
import './VehicleDocumentsTab.css';

const VehicleDocumentsTab = ({ activeTerminal }) => {
  const [documents, setDocuments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewForm, setShowViewForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('');
  const [expiryStatusFilter, setExpiryStatusFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [itemsPerPage] = useState(5);

  // Memoized fetchDocuments to prevent unnecessary re-renders
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        documentType: documentTypeFilter,
        status: statusFilter,
        complianceStatus: complianceFilter,
        expiryStatus: expiryStatusFilter,
        terminal: activeTerminal
      };
      
      // Clean up undefined/null parameters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] == null) {
          delete params[key];
        }
      });

      const response = await vehicleDocumentsAPI.getAll(params);
      setDocuments(response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.pages || 1);
        setTotalDocuments(response.pagination.total || 0);
      } else {
        // Fallback if pagination object doesn't exist
        setTotalPages(1);
        setTotalDocuments(response.data?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, documentTypeFilter, statusFilter, complianceFilter, expiryStatusFilter, activeTerminal]);

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await vehiclesAPI.getAll({ 
        select: 'true', 
        terminal: activeTerminal 
      });
      setVehicles(response.data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to fetch vehicles');
    }
  }, [activeTerminal]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Use useEffect for search/filter changes with proper dependencies
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1); // Always reset to first page when filters change
    }, 500);
    
    return () => clearTimeout(handler);
  }, [searchTerm, documentTypeFilter, statusFilter, complianceFilter, expiryStatusFilter, activeTerminal]);

  // Fetch documents when currentPage changes or after filter changes
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleAddDocument = async (documentData, files = []) => {
    try {
      const created = await vehicleDocumentsAPI.create(documentData);
      const createdDoc = created?.data || created;
      const docId = createdDoc?._id || createdDoc?.id;
      
      if (docId && files && files.length > 0) {
        for (const file of files) {
          await vehicleDocumentsAPI.uploadAttachment(docId, file);
        }
      }
      
      setShowAddForm(false);
      await fetchDocuments(); // Always refresh to get the latest state
    } catch (err) {
      console.error('Error adding document:', err);
      throw err;
    }
  };

  const handleEditDocument = async (id, documentData, files = []) => {
    try {
      await vehicleDocumentsAPI.update(id, documentData);
      
      if (files && files.length > 0) {
        for (const file of files) {
          await vehicleDocumentsAPI.uploadAttachment(id, file);
        }
      }
      
      setShowEditForm(false);
      setEditingDocument(null);
      await fetchDocuments();
    } catch (err) {
      console.error('Error updating document:', err);
      throw err;
    }
  };

  const handleDeleteDocument = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await vehicleDocumentsAPI.delete(id);
        
        // Check if we need to go to previous page
        if (documents.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          await fetchDocuments();
        }
      } catch (err) {
        console.error('Error deleting document:', err);
        alert(err.response?.data?.message || 'Failed to delete document');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-default';
    
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
    if (!type) return 'type-other';
    
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
    if (!status) return 'compliance-default';
    
    switch (status) {
      case 'compliant': return 'compliance-compliant';
      case 'non_compliant': return 'compliance-non-compliant';
      case 'pending_review': return 'compliance-pending';
      case 'under_review': return 'compliance-under-review';
      default: return 'compliance-default';
    }
  };

  const getExpiryStatusClass = (daysUntilExpiry) => {
    if (daysUntilExpiry === null || daysUntilExpiry === undefined) return 'expiry-valid';
    
    if (daysUntilExpiry < 0) return 'expiry-expired';
    if (daysUntilExpiry <= 7) return 'expiry-critical';
    if (daysUntilExpiry <= 30) return 'expiry-warning';
    if (daysUntilExpiry <= 90) return 'expiry-notice';
    return 'expiry-valid';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getVehicleDisplay = (vehicle) => {
    if (!vehicle) return 'Unassigned';
    return vehicle.plateNumber || vehicle.licensePlate || 'N/A';
  };

  const normalizePlate = (plate) => (plate || '').toString().replace(/\s+/g, '').toUpperCase();

  const groupDocumentsByVehicle = (docs) => {
    const groups = {};
    
    for (const doc of docs) {
      const v = doc.vehicle && typeof doc.vehicle === 'object' ? doc.vehicle : null;
      const vId = typeof doc.vehicle === 'string' ? doc.vehicle : (v?._id || null);
      const plate = v?.plateNumber || v?.licensePlate || null;
      const plateKey = plate ? normalizePlate(plate) : null;
      const key = plateKey || (vId || 'unassigned');

      if (!groups[key]) {
        groups[key] = {
          key,
          vehicleId: vId,
          plateKey,
          vehicle: v || null,
          documents: []
        };
      } else {
        if (!groups[key].vehicle && v) groups[key].vehicle = v;
        if (!groups[key].vehicleId && vId) groups[key].vehicleId = vId;
      }
      groups[key].documents.push(doc);
    }
    return groups;
  };

  const groupedDocuments = groupDocumentsByVehicle(documents);

  const closeViewForm = () => {
    setShowViewForm(false);
    setEditingDocument(null);
  };

  if (loading) return <div className="loading-state"><div className="loading-spinner"></div><p>Loading vehicle documents...</p></div>;
  if (error) return <div className="error-state"><p>Error: {error}</p><button onClick={fetchDocuments}>Retry</button></div>;

  return (
    <div className="vehicle-documents-container">
      <div className="vehicle-documents-header">
        <div className="header-left">
          <h2>Vehicle Document Management</h2>
          <span className="documents-count">{totalDocuments} documents</span>
        </div>
        <div className="header-right">
          <button className="add-button" onClick={() => setShowAddForm(true)}>
            <FaPlus /> Add Document
          </button>
        </div>
      </div>

      <div className="search-filter-container">
        <form onSubmit={(e) => e.preventDefault()} className="search-form">
          <div className="search-input-group">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by document number, title, authority..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </form>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Document Type:</label>
            <select value={documentTypeFilter} onChange={(e) => setDocumentTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="insurance">Insurance</option>
              <option value="technical_control">Technical Control</option>
              <option value="registration">Registration</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        {documents.length === 0 ? (
          <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <h3>No documents found</h3>
            <p>Add your first vehicle document to get started</p>
          </div>
        ) : (
          <>
            <div className="documents-container">
              {Object.values(groupedDocuments).map((group) => {
                const vehicle = group.vehicle || vehicles.find(v => v._id === group.vehicleId) || null;
                const docs = group.documents;
                
                return (
                  <div key={group.key} className="vehicle-document-group">
                    <div className="vehicle-header">
                      <div className="vehicle-info">
                        <FaFileAlt className="vehicle-icon" />
                        <div className="vehicle-details">
                          <strong className="vehicle-plate">{getVehicleDisplay(vehicle)}</strong>
                          <span className="document-count">{docs.length} document(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className="documents-list">
                      {docs.map((doc) => (
                        <div key={doc._id} className="document-item">
                          <div className="document-content-wrapper">
                            <div className="document-main-info">
                              <div className="document-title">
                                <strong>{doc.title || 'Untitled Document'}</strong>
                                <span className="document-number">#{doc.documentNumber || 'N/A'}</span>
                              </div>
                              <div className="document-authority">
                                <span className="issuing-authority">{doc.issuingAuthority || 'N/A'}</span>
                              </div>
                              {doc.description && (
                                <div className="document-description">
                                  <span>{doc.description}</span>
                                </div>
                              )}
                            </div>
                            <div className="document-details">
                              <div className="document-type">
                                <span className={`document-type-badge ${getDocumentTypeBadgeClass(doc.documentType)}`}>
                                  {(doc.documentType || 'unknown').replace(/_/g, ' ')}
                                </span>
                              </div>
                              <div className="document-status">
                                <span className={`status-badge ${getStatusBadgeClass(doc.status)}`}>
                                  {(doc.status || 'unknown').replace(/_/g, ' ')}
                                </span>
                              </div>
                              <div className="document-compliance">
                                <span className={`compliance-badge ${getComplianceBadgeClass(doc.complianceStatus)}`}>
                                  {(doc.complianceStatus || 'unknown').replace(/_/g, ' ')}
                                </span>
                              </div>
                              <div className="document-expiry">
                                <div className={`expiry-info ${getExpiryStatusClass(doc.daysUntilExpiry)}`}>
                                  <div className="expiry-date">
                                    <FaCalendar />
                                    <span>{formatDate(doc.expiryDate)}</span>
                                  </div>
                                  {doc.daysUntilExpiry !== null && doc.daysUntilExpiry !== undefined && (
                                    <div className="days-remaining">
                                      {doc.daysUntilExpiry < 0 ? (
                                        <span className="expired">
                                          Expired {Math.abs(doc.daysUntilExpiry)} days ago
                                        </span>
                                      ) : (
                                        <span>{doc.daysUntilExpiry} days remaining</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="document-attachments">
                            <div className="attachments-header">
                              <strong>Attachments</strong>
                            </div>
                            {(!doc.attachments || doc.attachments.length === 0) ? (
                              <div className="no-attachments">No files uploaded</div>
                            ) : (
                              <ul className="attachments-list">
                                {doc.attachments.map((att) => (
                                  <li key={att._id} className="attachment-item">
                                    <span className="attachment-name">
                                      {att.fileName?.split('-').slice(1).join('-') || att.fileName || 'Unknown file'}
                                    </span>
                                    <span className="attachment-meta">
                                      {Math.round((att.fileSize || 0) / 1024)} KB
                                    </span>
                                    <button
                                      className="attachment-download"
                                      onClick={async () => {
                                        try {
                                          const url = vehicleDocumentsAPI.getAttachmentDownloadUrl(doc._id, att._id);
                                          const token = localStorage.getItem('token');
                                          const res = await fetch(url, { 
                                            headers: token ? { Authorization: `Bearer ${token}` } : {} 
                                          });
                                          if (!res.ok) {
                                            throw new Error(`Download failed (${res.status})`);
                                          }
                                          const blob = await res.blob();
                                          const link = document.createElement('a');
                                          link.href = URL.createObjectURL(blob);
                                          link.download = att.fileName?.split('-').slice(1).join('-') || att.fileName || 'document';
                                          document.body.appendChild(link);
                                          link.click();
                                          URL.revokeObjectURL(link.href);
                                          link.remove();
                                        } catch (err) {
                                          console.error('Download failed', err);
                                          alert('Failed to download file');
                                        }
                                      }}
                                      title="Download"
                                    >
                                      <FaDownload /> Download
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="document-actions">
                            <button 
                              className="action-btn view-btn" 
                              onClick={() => { setEditingDocument(doc); setShowViewForm(true); }} 
                              title="View Document"
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="action-btn edit-btn" 
                              onClick={() => { setEditingDocument(doc); setShowEditForm(true); }} 
                              title="Edit Document"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="action-btn delete-btn" 
                              onClick={() => handleDeleteDocument(doc._id)} 
                              title="Delete Document"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
              totalItems={totalDocuments} 
              itemsPerPage={itemsPerPage} 
            />
          </>
        )}
      </div>

      {showAddForm && (
        <VehicleDocumentForm 
          isOpen={showAddForm} 
          onClose={() => setShowAddForm(false)} 
          onSubmit={handleAddDocument} 
          mode="add" 
          vehicles={vehicles} 
        />
      )}
      
      {showEditForm && (
        <VehicleDocumentForm 
          isOpen={showEditForm}
          onClose={() => { setShowEditForm(false); setEditingDocument(null); }}
          onSubmit={(data, files) => handleEditDocument(editingDocument._id, data, files)}
          mode="edit"
          document={editingDocument}
          vehicles={vehicles}
        />
      )}
      
      {showViewForm && (
        <VehicleDocumentForm 
          isOpen={showViewForm} 
          onClose={closeViewForm} 
          onSubmit={closeViewForm} 
          mode="view" 
          document={editingDocument} 
          vehicles={vehicles} 
        />
      )}
    </div>
  );
};

export default VehicleDocumentsTab;