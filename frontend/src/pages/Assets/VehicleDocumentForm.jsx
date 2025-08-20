import React, { useState, useEffect } from 'react';
import { FaTimes, FaFileAlt, FaSave } from 'react-icons/fa';
import './Assets.css';

const VehicleDocumentForm = ({ isOpen, onClose, onSubmit, mode = 'add', document = null, vehicles = [] }) => {
  const [formData, setFormData] = useState({
    vehicle: '',
    documentType: '',
    documentNumber: '',
    title: '',
    description: '',
    issuingAuthority: '',
    provider: '',
    issueDate: '',
    expiryDate: '',
    status: 'active',
    complianceStatus: 'pending_review',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && document) {
      setFormData({
        vehicle: document.vehicle?._id || document.vehicle || '',
        documentType: document.documentType || '',
        documentNumber: document.documentNumber || '',
        title: document.title || '',
        description: document.description || '',
        issuingAuthority: document.issuingAuthority || '',
        provider: document.provider || '',
        issueDate: document.issueDate ? new Date(document.issueDate).toISOString().split('T')[0] : '',
        expiryDate: document.expiryDate ? new Date(document.expiryDate).toISOString().split('T')[0] : '',
        status: document.status || 'active',
        complianceStatus: document.complianceStatus || 'pending_review',
        notes: document.notes || ''
      });
    }
  }, [mode, document]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicle) newErrors.vehicle = 'Vehicle is required';
    if (!formData.documentType) newErrors.documentType = 'Document type is required';
    if (!formData.documentNumber.trim()) newErrors.documentNumber = 'Document number is required';
    if (!formData.title.trim()) newErrors.title = 'Document title is required';
    if (!formData.issuingAuthority.trim()) newErrors.issuingAuthority = 'Issuing authority is required';
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
      onClose();
    } catch (error) {
      console.error('Error submitting document:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="document-form-modal">
        <div className="modal-header">
          <h3>
            <FaFileAlt />
            {mode === 'add' ? 'Add New Document' : 'Edit Document'}
          </h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="document-form">
          <div className="form-section">
            <h4>Document Information</h4>
            
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
                  <option value="">Select Vehicle...</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
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
                  <option value="">Select Type...</option>
                  <option value="insurance">Insurance</option>
                  <option value="technical_control">Technical Control</option>
                  <option value="registration">Registration</option>
                  <option value="inspection_certificate">Inspection Certificate</option>
                  <option value="emission_test">Emission Test</option>
                  <option value="safety_certificate">Safety Certificate</option>
                  <option value="compliance_certificate">Compliance Certificate</option>
                  <option value="other">Other</option>
                </select>
                {errors.documentType && <span className="error-message">{errors.documentType}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="documentNumber">Document Number *</label>
                <input
                  type="text"
                  id="documentNumber"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  className={errors.documentNumber ? 'error' : ''}
                />
                {errors.documentNumber && <span className="error-message">{errors.documentNumber}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="title">Document Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={errors.title ? 'error' : ''}
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
                />
                {errors.issuingAuthority && <span className="error-message">{errors.issuingAuthority}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="provider">Provider</label>
                <input
                  type="text"
                  id="provider"
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                />
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

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  {mode === 'add' ? 'Adding...' : 'Updating...'}
                </>
              ) : (
                <>
                  <FaSave />
                  {mode === 'add' ? 'Add Document' : 'Update Document'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleDocumentForm;
