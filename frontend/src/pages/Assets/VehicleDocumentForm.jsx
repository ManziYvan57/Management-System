import React, { useState, useEffect } from 'react';
import './VehicleDocumentForm.css';

const VehicleDocumentForm = ({ document, onSubmit, onClose, isOpen, mode = 'add', vehicles = [] }) => {
  const [formData, setFormData] = useState({
    vehicle: '',
    documentType: '',
    documentNumber: '',
    title: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    status: 'active',
    complianceStatus: 'compliant',
    notes: ''
  });


  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const documentTypeOptions = [
    { value: 'insurance', label: 'Insurance Certificate' },
    { value: 'registration', label: 'Vehicle Registration' },
    { value: 'technical_control', label: 'Technical Control Certificate' },
    { value: 'inspection', label: 'Safety Inspection' },
    { value: 'permit', label: 'Operating Permit' },
    { value: 'other', label: 'Other Document' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'pending_renewal', label: 'Pending Renewal' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const complianceStatusOptions = [
    { value: 'compliant', label: 'Compliant' },
    { value: 'non_compliant', label: 'Non-Compliant' },
    { value: 'pending_review', label: 'Pending Review' }
  ];

  useEffect(() => {
    if (isOpen) {
      if (document) {
        setFormData({
          ...document,
          issueDate: document.issueDate ? new Date(document.issueDate).toISOString().split('T')[0] : '',
          expiryDate: document.expiryDate ? new Date(document.expiryDate).toISOString().split('T')[0] : ''
        });
      } else {
        setFormData({
          vehicle: '',
          documentType: '',
          documentNumber: '',
          title: '',
          issuingAuthority: '',
          issueDate: '',
          expiryDate: '',
          status: 'active',
          complianceStatus: 'compliant',
          notes: ''
        });
      }
    }
  }, [document, isOpen]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicle) newErrors.vehicle = 'Vehicle is required';
    if (!formData.documentType) newErrors.documentType = 'Document type is required';
    if (!formData.documentNumber) newErrors.documentNumber = 'Document number is required';
    if (!formData.title) newErrors.title = 'Document title is required';
    if (!formData.issuingAuthority) newErrors.issuingAuthority = 'Issuing authority is required';
    if (!formData.issueDate) newErrors.issueDate = 'Issue date is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vehicle-document-form-overlay">
      <div className="vehicle-document-form-modal">
        <div className="vehicle-document-form-header">
          <h2>{mode === 'edit' ? 'Edit Vehicle Document' : 'Add Vehicle Document'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-document-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicle">Vehicle *</label>
              <select
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                className={errors.vehicle ? 'error' : ''}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
              {errors.vehicle && <span className="error-message">{errors.vehicle}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="documentType">Document Type *</label>
              <select
                id="documentType"
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                className={errors.documentType ? 'error' : ''}
              >
                <option value="">Select Document Type</option>
                {documentTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.documentType && <span className="error-message">{errors.documentType}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Document Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="Enter document title"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="issuingAuthority">Issuing Authority *</label>
              <input
                type="text"
                id="issuingAuthority"
                name="issuingAuthority"
                value={formData.issuingAuthority}
                onChange={handleInputChange}
                className={errors.issuingAuthority ? 'error' : ''}
                placeholder="Enter issuing authority"
              />
              {errors.issuingAuthority && <span className="error-message">{errors.issuingAuthority}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="documentNumber">Document Number *</label>
              <input
                type="text"
                id="documentNumber"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleInputChange}
                className={errors.documentNumber ? 'error' : ''}
                placeholder="Enter document number"
              />
              {errors.documentNumber && <span className="error-message">{errors.documentNumber}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="issueDate">Issue Date *</label>
              <input
                type="date"
                id="issueDate"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                className={errors.issueDate ? 'error' : ''}
              />
              {errors.issueDate && <span className="error-message">{errors.issueDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date *</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className={errors.expiryDate ? 'error' : ''}
              />
              {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="complianceStatus">Compliance Status</label>
              <select
                id="complianceStatus"
                name="complianceStatus"
                value={formData.complianceStatus}
                onChange={handleInputChange}
              >
                {complianceStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Enter additional notes"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (mode === 'edit' ? 'Update Document' : 'Add Document')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleDocumentForm;
