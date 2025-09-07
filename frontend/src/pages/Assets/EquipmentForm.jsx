import React, { useState, useEffect } from 'react';
import { FaTimes, FaTools, FaSave } from 'react-icons/fa';
import './Assets.css';

const EquipmentForm = ({ isOpen, onClose, onSubmit, mode = 'add', equipment = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: '',
    serialNumber: '',
    status: 'active',
    location: '',
    terminal: '',
    description: '',
    purchaseCost: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    currentValue: 0
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && equipment) {
      setFormData({
        name: equipment.name || '',
        category: equipment.category || '',
        type: equipment.type || '',
        serialNumber: equipment.serialNumber || '',
        status: equipment.status || 'active',
        location: equipment.location || '',
        terminal: equipment.terminal || '',
        description: equipment.description || '',
        purchaseCost: equipment.purchaseCost || 0,
        purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        currentValue: equipment.currentValue || 0
      });
    }
  }, [mode, equipment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.terminal.trim()) newErrors.terminal = 'Terminal is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Clean up the data before submitting
      const submitData = {
        ...formData,
        purchaseCost: parseFloat(formData.purchaseCost) || 0,
        currentValue: parseFloat(formData.currentValue) || 0
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content vehicle-form-modal">
        <div className="modal-header">
          <h2>
            <FaTools />
            {mode === 'view' ? 'View Equipment' : 
             mode === 'add' ? 'Add New Equipment' : 'Edit Equipment'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Equipment Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="e.g., Diagnostic Scanner"
                disabled={mode === 'view'}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={errors.category ? 'error' : ''}
                disabled={mode === 'view'}
              >
                <option value="">Select Category</option>
                <option value="tools">Tools</option>
                <option value="electronics">Electronics</option>
                <option value="safety">Safety Equipment</option>
                <option value="office">Office Equipment</option>
                <option value="maintenance">Maintenance Equipment</option>
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="e.g., OBD Scanner"
                disabled={mode === 'view'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="serialNumber">Serial Number</label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="e.g., SN123456789"
                disabled={mode === 'view'}
              />
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
                disabled={mode === 'view'}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_service">Out of Service</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="terminal">Terminal *</label>
              <select
                id="terminal"
                name="terminal"
                value={formData.terminal}
                onChange={handleInputChange}
                className={errors.terminal ? 'error' : ''}
                disabled={mode === 'view'}
              >
                <option value="">Select Terminal</option>
                <option value="Kigali">Kigali</option>
                <option value="Kampala">Kampala</option>
                <option value="Juba">Juba</option>
                <option value="Nairobi">Nairobi</option>
              </select>
              {errors.terminal && <span className="error-message">{errors.terminal}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Garage A, Shelf 3"
                disabled={mode === 'view'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="purchaseCost">Purchase Cost (RWF)</label>
              <input
                type="number"
                id="purchaseCost"
                name="purchaseCost"
                value={formData.purchaseCost}
                onChange={handleInputChange}
                min="0"
                step="1000"
                disabled={mode === 'view'}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentValue">Current Value (RWF)</label>
              <input
                type="number"
                id="currentValue"
                name="currentValue"
                value={formData.currentValue}
                onChange={handleInputChange}
                min="0"
                step="1000"
                disabled={mode === 'view'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                disabled={mode === 'view'}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Equipment description and specifications..."
                rows="3"
                disabled={mode === 'view'}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </button>
            {mode !== 'view' && (
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    {mode === 'add' ? 'Adding...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <FaSave />
                    {mode === 'add' ? 'Add Equipment' : 'Update Equipment'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentForm;
