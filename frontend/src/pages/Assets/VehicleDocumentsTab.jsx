import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaFileAlt, FaCalendar } from 'react-icons/fa';
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
  const [itemsPerPage] = useState(5); // Lower limit for documents as they are grouped

  useEffect(() => {
    fetchDocuments();
    fetchVehicles();
  }, [activeTerminal, currentPage]);

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

  const handleAddDocument = async (documentData) => {
    try {
      await vehicleDocumentsAPI.create(documentData);
      setShowAddForm(false);
      // Go to the last page to see the new document
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
      fetchDocuments(); // Refetch current page
    } catch (err) {
      console.error('Error updating document:', err);
      throw err;
    }
  };

  const handleDeleteDocument = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await vehicleDocumentsAPI.delete(id);
        // If the last item on a page is deleted, go to the previous page
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
  
  const handleSearchAndFilter = () => {
    setCurrentPage(1);
    fetchDocuments();
  };

  useEffect(() => {
    const handler = setTimeout(() => {
        handleSearchAndFilter();
    }, 500); // Debounce search/filter input
    return () => clearTimeout(handler);
  }, [searchTerm, documentTypeFilter, statusFilter, complianceFilter, expiryStatusFilter, activeTerminal]);


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'expired': return 'status-expired';
      case 'pending_renewal': return 'status-pending';
      default: return 'status-default';
    }
  };

  const getComplianceBadgeClass = (status) => {
    switch (status) {
      case 'compliant': return 'compliance-compliant';
      case 'non_compliant': return 'compliance-non-compliant';
      default: return 'compliance-default';
    }
  };

  const getExpiryStatusClass = (daysUntilExpiry) => {
    if (daysUntilExpiry < 0) return 'expiry-expired';
    if (daysUntilExpiry <= 30) return 'expiry-warning';
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

  if (error) return <div className="error-state">Error: {error} <button onClick={fetchDocuments}>Retry</button></div>;

  return (
    <div className="vehicle-documents-container">
      <div className="vehicle-documents-header">
        <h2>Vehicle Document Management</h2>
        <button className="add-button" onClick={() => setShowAddForm(true)}><FaPlus /> Add Document</button>
      </div>

      <div className="search-filter-container">
        {/* Search and filter inputs here, simplified for brevity */}
        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div><p>Loading documents...</p></div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
            <FaFileAlt className="empty-icon" />
            <h3>No documents found</h3>
            <p>Add your first vehicle document to get started</p>
        </div>
      ) : (
        <>
          <div className="documents-list-container">
            {Object.values(groupedDocuments).map(({ vehicle, documents: docs }) => (
              <div key={vehicle?._id || 'unassigned'} className="vehicle-document-group">
                <div className="vehicle-header">
                  <FaFileAlt className="vehicle-icon" />
                  <strong className="vehicle-plate">{getVehicleDisplay(vehicle)}</strong>
                  <span className="document-count">{docs.length} document(s)</span>
                </div>
                <div className="documents-list">
                  {docs.map(doc => (
                    <div key={doc._id} className="document-item">
                      <div className="document-main-info">
                        <strong>{doc.title}</strong>
                        <span className="document-number">#{doc.documentNumber}</span>
                      </div>
                      <div className="document-details">
                        <span className={`status-badge ${getStatusBadgeClass(doc.status)}`}>{doc.status}</span>
                        <span className={`compliance-badge ${getComplianceBadgeClass(doc.complianceStatus)}`}>{doc.complianceStatus}</span>
                        <div className={`expiry-info ${getExpiryStatusClass(doc.daysUntilExpiry)}`}>
                          <FaCalendar /> {formatDate(doc.expiryDate)}
                        </div>
                      </div>
                      <div className="document-actions">
                        <button onClick={() => { setEditingDocument(doc); setShowViewForm(true); }}><FaEye /></button>
                        <button onClick={() => { setEditingDocument(doc); setShowEditForm(true); }}><FaEdit /></button>
                        <button onClick={() => handleDeleteDocument(doc._id)}><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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

      {showAddForm && <VehicleDocumentForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} onSubmit={handleAddDocument} mode="add" vehicles={vehicles} />}
      {showEditForm && <VehicleDocumentForm isOpen={showEditForm} onClose={() => setEditingDocument(null)} onSubmit={(data) => handleEditDocument(editingDocument._id, data)} mode="edit" document={editingDocument} vehicles={vehicles} />}
      {showViewForm && <VehicleDocumentForm isOpen={showViewForm} onClose={() => setEditingDocument(null)} mode="view" document={editingDocument} vehicles={vehicles} />}
    </div>
  );
};

export default VehicleDocumentsTab;