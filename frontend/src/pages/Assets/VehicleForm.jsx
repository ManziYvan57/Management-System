import React, { useState, useEffect } from 'react';
import { FaTimes, FaBus, FaSave } from 'react-icons/fa';
import './Assets.css';

const VehicleForm = ({ isOpen, onClose, onSubmit, mode = 'add', vehicle = null, activeTerminal = 'Kigali' }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'active',
    company: ['Kigali'],
    seatingCapacity: 0,
    fuelType: 'Diesel',
    mileage: 0,
    fuelConsumption: 0,
    purchaseCost: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    currentValue: 0
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && vehicle) {
      const vehicleData = {
        plateNumber: vehicle.plateNumber || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        status: vehicle.status || 'active',
        company: vehicle.company || ['Kigali'],
        seatingCapacity: vehicle.seatingCapacity || 0,
        fuelType: vehicle.fuelType || 'Diesel',
        mileage: vehicle.mileage || 0,
        fuelConsumption: vehicle.fuelConsumption || 0,
        purchaseCost: vehicle.purchaseCost || 0,
        purchaseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        currentValue: vehicle.currentValue || 0
      };
      
      setFormData(vehicleData);
    }
  }, [mode, vehicle]);

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
    if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.company || formData.company.length === 0) newErrors.company = 'At least one company is required';
    if (formData.seatingCapacity <= 0) newErrors.seatingCapacity = 'Seating capacity must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'view') return;
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Clean up the data before submitting
      const allowedCompanies = ['Kigali', 'Musanze', 'Nyabugogo', 'Muhanga', 'Rusizi', 'Rubavu', 'Huye'];
      const cleanedCompanies = (formData.company || [])
        .map(c => (c || '').trim())
        .filter(Boolean)
        .map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())
        .filter((c, idx, arr) => allowedCompanies.includes(c) && arr.indexOf(c) === idx);
      const submitData = {
        ...formData,
        company: cleanedCompanies,
        purchaseCost: parseFloat(formData.purchaseCost) || 0,
        currentValue: parseFloat(formData.currentValue) || 0,
        seatingCapacity: parseInt(formData.seatingCapacity) || 0,
        year: parseInt(formData.year) || new Date().getFullYear(),
        mileage: parseFloat(formData.mileage) || 0,
        fuelConsumption: parseFloat(formData.fuelConsumption) || 0
      };
      
      console.log('Submitting vehicle payload:', submitData);
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting vehicle:', error);
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
             <FaBus />
             {mode === 'view' ? 'View Vehicle' : 
              mode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'}
           </h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plateNumber">Plate Number *</label>
              <input
                type="text"
                id="plateNumber"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleInputChange}
                className={errors.plateNumber ? 'error' : ''}
                placeholder="e.g., RAA 123A"
                disabled={mode === 'view'}
              />
              {errors.plateNumber && <span className="error-message">{errors.plateNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="make">Make *</label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                className={errors.make ? 'error' : ''}
                placeholder="e.g., Toyota"
                disabled={mode === 'view'}
              />
              {errors.make && <span className="error-message">{errors.make}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="model">Model *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className={errors.model ? 'error' : ''}
                placeholder="e.g., Coaster"
                disabled={mode === 'view'}
              />
              {errors.model && <span className="error-message">{errors.model}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear() + 1}
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
              <label htmlFor="company">Company *</label>
              <select
                id="company"
                name="company"
                value={formData.company[0] || 'Kigali'}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    company: [e.target.value]
                  }));
                }}
                disabled={mode === 'view'}
                className={errors.company ? 'error' : ''}
              >
                <option value="">Select a company</option>
                <option value="Kigali">Kigali</option>
                <option value="Musanze">Musanze</option>
                <option value="Nyabugogo">Nyabugogo</option>
                <option value="Muhanga">Muhanga</option>
                <option value="Rusizi">Rusizi</option>
                <option value="Rubavu">Rubavu</option>
                <option value="Huye">Huye</option>
              </select>
              {errors.company && <span className="error-message">{errors.company}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seatingCapacity">Seating Capacity *</label>
              <input
                type="number"
                id="seatingCapacity"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleInputChange}
                className={errors.seatingCapacity ? 'error' : ''}
                min="1"
                max="100"
                disabled={mode === 'view'}
              />
              {errors.seatingCapacity && <span className="error-message">{errors.seatingCapacity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fuelType">Fuel Type</label>
              <select
                id="fuelType"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                disabled={mode === 'view'}
              >
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mileage">Current Mileage (km)</label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                min="0"
                disabled={mode === 'view'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fuelConsumption">Fuel Consumption (L/100km)</label>
              <input
                type="number"
                id="fuelConsumption"
                name="fuelConsumption"
                value={formData.fuelConsumption}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                disabled={mode === 'view'}
              />
            </div>
          </div>

                     <div className="form-row">
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
           </div>

           <div className="form-row">
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
                    {mode === 'add' ? 'Add Vehicle' : 'Update Vehicle'}
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

export default VehicleForm;