import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaExclamationTriangle } from 'react-icons/fa';

const InfractionForm = ({ isOpen, onClose, onSubmit, personnel, editingInfraction }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    description: '',
    points: 0,
    severity: 'minor',
    status: 'active',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    // Reset loading state when form opens
    setLoading(false);
    
    if (editingInfraction) {
      setFormData({
        date: editingInfraction.date ? new Date(editingInfraction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        type: editingInfraction.type || '',
        description: editingInfraction.description || '',
        points: editingInfraction.points || 0,
        severity: editingInfraction.severity || 'minor',
        status: editingInfraction.status || 'active',
        notes: editingInfraction.notes || ''
      });
    } else {
      // Reset form for new infraction
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: '',
        description: '',
        points: 0,
        severity: 'minor',
        status: 'active',
        notes: ''
      });
    }
  }, [editingInfraction]);

  // Predefined infraction types with point values
  const infractionTypes = [
    { type: 'Speeding', points: 5, severity: 'major' },
    { type: 'Late Departure', points: 3, severity: 'minor' },
    { type: 'Reckless Driving', points: 10, severity: 'critical' },
    { type: 'Unauthorized Stop', points: 2, severity: 'minor' },
    { type: 'Traffic Violation', points: 4, severity: 'major' },
    { type: 'Vehicle Damage', points: 8, severity: 'major' },
    { type: 'Customer Complaint', points: 3, severity: 'minor' },
    { type: 'Route Deviation', points: 6, severity: 'major' },
    { type: 'Documentation Error', points: 1, severity: 'minor' },
    { type: 'Other', points: 0, severity: 'minor' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      const selectedInfraction = infractionTypes.find(inf => inf.type === value);
      setFormData(prev => ({
        ...prev,
        type: value,
        points: selectedInfraction ? selectedInfraction.points : 0,
        severity: selectedInfraction ? selectedInfraction.severity : 'minor'
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.type) newErrors.type = 'Infraction type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.points < 0) newErrors.points = 'Points cannot be negative';
    if (!formData.severity) newErrors.severity = 'Severity is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('Starting infraction submission, loading:', loading);
    setLoading(true);
    console.log('Loading set to true');
    
    try {
      let submitData;
      
      if (editingInfraction) {
        // For editing, only send status and notes (what the backend expects)
        submitData = {
          status: formData.status,
          notes: formData.notes || ''
        };
      } else {
        // For creating, send all the data
        submitData = {
          ...formData,
          points: parseInt(formData.points) || 0
        };
      }

      console.log('Submitting infraction data:', submitData);
      await onSubmit(submitData);
      console.log('Infraction submitted successfully');
      // Don't close here - let parent component handle closing after successful API call
    } catch (error) {
      console.error('Error submitting infraction:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  console.log('InfractionForm render - loading:', loading, 'editingInfraction:', editingInfraction);

  return (
    <div className="modal-overlay">
      <div className="infraction-form-modal">
        <div className="modal-header">
          <h3>
            <FaExclamationTriangle />
            {editingInfraction ? 'Edit Infraction' : 'Add Infraction'} - {personnel?.firstName} {personnel?.lastName}
          </h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="infraction-form">
          <div className="form-section">
            <h4>Infraction Details</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={errors.date ? 'error' : ''}
                />
                {errors.date && <span className="error-message">{errors.date}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="type">Infraction Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={errors.type ? 'error' : ''}
                >
                  <option value="">Select Infraction Type</option>
                  {infractionTypes.map(infraction => (
                    <option key={infraction.type} value={infraction.type}>
                      {infraction.type} ({infraction.points} points)
                    </option>
                  ))}
                </select>
                {errors.type && <span className="error-message">{errors.type}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="severity">Severity *</label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className={errors.severity ? 'error' : ''}
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                </select>
                {errors.severity && <span className="error-message">{errors.severity}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="points">Points *</label>
                <input
                  type="number"
                  id="points"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  className={errors.points ? 'error' : ''}
                />
                {errors.points && <span className="error-message">{errors.points}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe the infraction in detail..."
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                placeholder="Any additional notes or context..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="appealed">Appealed</option>
              </select>
            </div>
          </div>

          {/* Driver Information Display */}
          <div className="form-section">
            <h4>Driver Information</h4>
            <div className="driver-info-display">
              <div className="info-item">
                <strong>Name:</strong> {personnel?.firstName} {personnel?.lastName}
              </div>
              <div className="info-item">
                <strong>Employee ID:</strong> {personnel?.employeeId}
              </div>
              <div className="info-item">
                <strong>Current Points:</strong> {personnel?.drivingPoints || 100}
              </div>
              <div className="info-item">
                <strong>Points After Infraction:</strong> {Math.max(0, (personnel?.drivingPoints || 100) - formData.points)}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-button"
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <span>Loading...</span>
              ) : (
                <span>
                  <FaSave /> {editingInfraction ? 'Update Infraction' : 'Add Infraction'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InfractionForm;
