import React, { useState, useEffect, useCallback, useRef } from 'react';
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

    // Refs for debouncing
    const searchTimeoutRef = useRef(null);
    const filterTimeoutRef = useRef(null);
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');

    // Fetch documents function
    const fetchDocuments = useCallback(async (search = appliedSearchTerm, docType = documentTypeFilter, status = statusFilter, compliance = complianceFilter, expiry = expiryStatusFilter) => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: search,
                documentType: docType,
                status: status,
                complianceStatus: compliance,
                expiryStatus: expiry,
                terminal: activeTerminal
            };

            // Clean up undefined/null parameters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] == null) {
                    delete params[key];
                }
            });

            console.log('Fetching documents with params:', params);
            console.log('Search term:', search, 'Applied search:', appliedSearchTerm);
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
    }, [currentPage, itemsPerPage, activeTerminal, appliedSearchTerm, documentTypeFilter, statusFilter, complianceFilter, expiryStatusFilter]);

    const fetchVehicles = useCallback(async () => {
        try {
            const response = await vehiclesAPI.getAll({
                limit: 1000,
                terminal: activeTerminal // Filter vehicles by active terminal
            });
            console.log('Fetched vehicles for terminal', activeTerminal, ':', response.data?.length || 0, 'vehicles');
            setVehicles(response.data || []);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setError('Failed to fetch vehicles');
        }
    }, [activeTerminal]);

    // Initial fetch
    useEffect(() => {
        fetchDocuments();
        fetchVehicles();
    }, [activeTerminal]); // Fetch when terminal changes

    // Handle page changes
    useEffect(() => {
        fetchDocuments();
    }, [currentPage]); // Only fetch when page changes

    // Handle search input (without immediate API call)
    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    // Handle search button click
    const handleSearchSubmit = () => {
        const trimmedSearchTerm = searchTerm.trim();
        setAppliedSearchTerm(trimmedSearchTerm);
        setCurrentPage(1); // Reset to first page
        fetchDocuments(trimmedSearchTerm, documentTypeFilter, statusFilter, complianceFilter, expiryStatusFilter);
    };

    // Handle filter changes with proper debouncing
    const handleFilterChange = (filterType, value) => {
        // Update the filter state immediately
        switch (filterType) {
            case 'documentType':
                setDocumentTypeFilter(value);
                break;
            case 'status':
                setStatusFilter(value);
                break;
            case 'compliance':
                setComplianceFilter(value);
                break;
            case 'expiryStatus':
                setExpiryStatusFilter(value);
                break;
            default:
                break;
        }

        // Clear existing timeout
        if (filterTimeoutRef.current) {
            clearTimeout(filterTimeoutRef.current);
        }

        // Set new timeout for filter
        filterTimeoutRef.current = setTimeout(() => {
            setCurrentPage(1); // Reset to first page
            fetchDocuments(appliedSearchTerm,
                filterType === 'documentType' ? value : documentTypeFilter,
                filterType === 'status' ? value : statusFilter,
                filterType === 'compliance' ? value : complianceFilter,
                filterType === 'expiryStatus' ? value : expiryStatusFilter
            );
        }, 500); // 500ms delay
    };

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (filterTimeoutRef.current) {
                clearTimeout(filterTimeoutRef.current);
            }
        };
    }, []);

    const refreshDocuments = useCallback(async () => {
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: appliedSearchTerm,
                documentType: documentTypeFilter,
                status: statusFilter,
                complianceStatus: complianceFilter,
                expiryStatus: expiryStatusFilter,
                terminal: activeTerminal
            };

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
            }
        } catch (err) {
            console.error('Error refreshing documents:', err);
        }
    }, [currentPage, itemsPerPage, activeTerminal, appliedSearchTerm, documentTypeFilter, statusFilter, complianceFilter, expiryStatusFilter]);

    const handleAddDocument = async (documentData, files = []) => {
        try {
            // Validate that the selected vehicle exists in our vehicles list
            const vehicleId = documentData.vehicle;
            const vehicleExists = vehicles.some(v => v._id === vehicleId);

            if (!vehicleExists) {
                console.error('Selected vehicle not found in vehicles list. Vehicle ID:', vehicleId);
                console.error('Available vehicles:', vehicles.map(v => ({ id: v._id, plate: v.plateNumber })));
                toast.error('Selected vehicle not found. Please refresh and try again.');
                // Refresh vehicles and try again
                await fetchVehicles();
                return;
            }

            const created = await vehicleDocumentsAPI.create(documentData);
            const createdDoc = created?.data || created;
            const docId = createdDoc?._id || createdDoc?.id;

            if (docId && files && files.length > 0) {
                for (const file of files) {
                    await vehicleDocumentsAPI.uploadAttachment(docId, file);
                }
            }

            setShowAddForm(false);
            // Refresh only the table instead of the whole page
            await refreshDocuments();
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
            // Refresh only the table instead of the whole page
            await refreshDocuments();
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
                    // Refresh only the table instead of the whole page
                    await refreshDocuments();
                }
            } catch (err) {
                console.error('Error deleting document:', err);
                toast.error(err.response?.data?.message || 'Failed to delete document');
            }
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (window.confirm('Are you sure you want to delete this attachment?')) {
            try {
                if (editingDocument && editingDocument._id) {
                    await vehicleDocumentsAPI.deleteAttachment(editingDocument._id, attachmentId);
                    
                    // Refresh the editing document to show updated attachments
                    const docResponse = await vehicleDocumentsAPI.getById(editingDocument._id);
                    setEditingDocument(docResponse.data || docResponse);
                    // Refresh only the table instead of the whole page
                    await refreshDocuments();
                }
            } catch (err) {
                console.error('Error deleting attachment:', err);
                toast.error('Failed to delete attachment');
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

    // Get documents with upcoming expirations
    const getExpiringDocuments = () => {
        return documents.filter(doc => {
            const daysUntil = doc.daysUntilExpiry;
            // Show critical (≤7 days), warning (≤30 days), and notice (≤90 days)
            return daysUntil !== null && daysUntil !== undefined && daysUntil <= 90 && daysUntil >= 0;
        }).sort((a, b) => (a.daysUntilExpiry || 0) - (b.daysUntilExpiry || 0));
    };

    // Get expired documents
    const getExpiredDocuments = () => {
        return documents.filter(doc => {
            const daysUntil = doc.daysUntilExpiry;
            return daysUntil !== null && daysUntil !== undefined && daysUntil < 0;
        });
    };

    const expiringDocs = getExpiringDocuments();
    const expiredDocs = getExpiredDocuments();
    const hasExpiryAlerts = expiredDocs.length > 0 || expiringDocs.length > 0;

    const getAlertSeverity = (daysUntil) => {
        if (daysUntil < 0) return 'critical';
        if (daysUntil <= 7) return 'critical';
        if (daysUntil <= 30) return 'warning';
        return 'notice';
    };

    const closeViewForm = () => {
        setShowViewForm(false);
        setEditingDocument(null);
    };

    if (error) return <div className="error-state"><p>Error: {error}</p><button onClick={() => fetchDocuments()}>Retry</button></div>;

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
                <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }} className="search-form">
                    <div className="search-input-group">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by document number, title, authority..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                        />
                        <button type="submit" className="search-button">
                            <FaSearch /> Search
                        </button>
                    </div>
                </form>
                <div className="filter-controls">
                    <div className="filter-group">
                        <label>Document Type:</label>
                        <select
                            value={documentTypeFilter}
                            onChange={(e) => handleFilterChange('documentType', e.target.value)}
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
                            onChange={(e) => handleFilterChange('status', e.target.value)}
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
                            onChange={(e) => handleFilterChange('compliance', e.target.value)}
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
                            onChange={(e) => handleFilterChange('expiryStatus', e.target.value)}
                        >
                            <option value="">All Expiry Status</option>
                            <option value="expired">Expired</option>
                            <option value="critical">Critical (≤ 7 days)</option>
                            <option value="warning">Warning (≤ 30 days)</option>
                            <option value="notice">Notice (≤ 90 days)</option>
                            <option value="valid">Valid</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Expiry Alerts Section */}
            {hasExpiryAlerts && (
                <div className="expiry-alerts-section">
                    <h3>
                        <FaExclamationTriangle style={{ color: '#dc2626' }} />
                        Document Expiry Alerts
                    </h3>
                    <ul className="alerts-list">
                        {expiredDocs.map(doc => (
                            <li key={doc._id} className="alert-item critical">
                                <div className="alert-icon">
                                    <FaExclamationTriangle />
                                </div>
                                <div className="alert-content">
                                    <div className="alert-title">{doc.title || 'Untitled'} - EXPIRED</div>
                                    <div className="alert-description">
                                        {doc.vehicle?.plateNumber || 'N/A'} • Expired {Math.abs(doc.daysUntilExpiry || 0)} days ago
                                    </div>
                                </div>
                            </li>
                        ))}
                        {expiringDocs.map(doc => {
                            const severity = getAlertSeverity(doc.daysUntilExpiry);
                            const icon = severity === 'critical' ? <FaExclamationTriangle /> : <FaClock />;
                            return (
                                <li key={doc._id} className={`alert-item ${severity}`}>
                                    <div className="alert-icon">
                                        {icon}
                                    </div>
                                    <div className="alert-content">
                                        <div className="alert-title">{doc.title || 'Untitled'}</div>
                                        <div className="alert-description">
                                            {doc.vehicle?.plateNumber || 'N/A'} • Expires in {doc.daysUntilExpiry} days
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            <div className="table-container">
                {loading ? (
                    <div className="table-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading documents...</p>
                    </div>
                ) : documents.length === 0 ? (
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
                                                                                    toast.error('Failed to download file');
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
                    onDeleteAttachment={handleDeleteAttachment}
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