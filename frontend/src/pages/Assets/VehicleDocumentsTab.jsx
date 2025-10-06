import React, { useState, useEffect } from 'react';
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

  const fetchDocuments = async () => {
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
      const response = await vehicleDocumentsAPI.getAll(params);
      setDocuments(response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
        setTotalDocuments(response.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesAPI.getAll({ select: 'true', terminal: activeTerminal });
      setVehicles(response.data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [activeTerminal]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchDocuments();
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, documentTypeFilter, statusFilter, complianceFilter, expiryStatusFilter, activeTerminal]);

  useEffect(() => {
    fetchDocuments();
  }, [currentPage]);

  const handleAddDocument = async (documentData) => {
    try {
      await vehicleDocumentsAPI.create(documentData);
      setShowAddForm(false);
      const newTotalPages = Math.ceil((totalDocuments + 1) / itemsPerPage);
      if (currentPage === newTotalPages) {
        fetchDocuments();
      } else {
        setCurrentPage(newTotalPages);
      }
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
        if (documents.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchDocuments();
        }
      } catch (err) {
        console.error('Error deleting document:', err);
        alert('Failed to delete document');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const getVehicleDisplay = (vehicle) => vehicle ? vehicle.plateNumber : 'N/A';

  const groupDocumentsByVehicle = (docs) => {
    return docs.reduce((acc, doc) => {
      const vehicleId = doc.vehicle?._id || 'unassigned';
      if (!acc[vehicleId]) {
        acc[vehicleId] = { vehicle: doc.vehicle, documents: [] };
      }
      acc[vehicleId].documents.push(doc);
      return acc;
    }, {});
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
          <button className="add-button" onClick={() => setShowAddForm(true)}><FaPlus /> Add Document</button>
        </div>
      </div>

      <div className="search-filter-container">
        <form onSubmit={(e) => e.preventDefault()} className="search-form">
          <div className="search-input-group">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search by document number, title, authority..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
              {Object.values(groupedDocuments).map(({ vehicle, documents: docs }) => (
                <div key={vehicle?._id || 'unassigned'} className="vehicle-document-group">
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
                        <div className="document-content-wrapper"> {/* This wrapper is the fix */}
                          <div className="document-main-info">
                            <div className="document-title"><strong>{doc.title}</strong><span className="document-number">#{doc.documentNumber}</span></div>
                            <div className="document-authority"><span className="issuing-authority">{doc.issuingAuthority}</span></div>
                            {doc.description && <div className="document-description"><span>{doc.description}</span></div>}
                          </div>
                          <div className="document-details">
                            <div className="document-type"><span className={`document-type-badge ${getDocumentTypeBadgeClass(doc.documentType)}`}>{doc.documentType.replace('_', ' ')}</span></div>
                            <div className="document-status"><span className={`status-badge ${getStatusBadgeClass(doc.status)}`}>{doc.status.replace('_', ' ')}</span></div>
                            <div className="document-compliance"><span className={`compliance-badge ${getComplianceBadgeClass(doc.complianceStatus)}`}>{doc.complianceStatus.replace('_', ' ')}</span></div>
                            <div className="document-expiry">
                              <div className={`expiry-info ${getExpiryStatusClass(doc.daysUntilExpiry)}`}>
                                <div className="expiry-date"><FaCalendar /><span>{formatDate(doc.expiryDate)}</span></div>
                                {doc.daysUntilExpiry !== null && <div className="days-remaining">{doc.daysUntilExpiry < 0 ? <span className="expired">Expired {Math.abs(doc.daysUntilExpiry)} days ago</span> : <span>{doc.daysUntilExpiry} days remaining</span>}</div>}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="document-actions">
                          <button className="action-btn view-btn" onClick={() => { setEditingDocument(doc); setShowViewForm(true); }} title="View Document"><FaEye /></button>
                          <button className="action-btn edit-btn" onClick={() => { setEditingDocument(doc); setShowEditForm(true); }} title="Edit Document"><FaEdit /></button>
                          <button className="action-btn delete-btn" onClick={() => handleDeleteDocument(doc._id)} title="Delete Document"><FaTrash /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={totalDocuments} itemsPerPage={itemsPerPage} />
          </>
        )}
      </div>

      {showAddForm && <VehicleDocumentForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} onSubmit={handleAddDocument} mode="add" vehicles={vehicles} />}
      {showEditForm && <VehicleDocumentForm isOpen={showEditForm} onClose={() => setEditingDocument(null)} onSubmit={(data) => handleEditDocument(editingDocument._id, data)} mode="edit" document={editingDocument} vehicles={vehicles} />}
      {showViewForm && <VehicleDocumentForm 
        isOpen={showViewForm} 
        onClose={closeViewForm} 
        onSubmit={closeViewForm} 
        mode="view" 
        document={editingDocument} 
        vehicles={vehicles} />}
    </div>
  );
};

export default VehicleDocumentsTab;