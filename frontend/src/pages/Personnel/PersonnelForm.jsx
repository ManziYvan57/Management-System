import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser } from 'react-icons/fa';

const PersonnelForm = ({ isOpen, onClose, onSubmit, mode, personnel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    employeeId: '',
    role: 'driver',
    department: 'operations',
    terminal: 'Kigali',
    hireDate: new Date().toISOString().split('T')[0],
    employmentStatus: 'active',
    salary: 0,
    licenseNumber: '',
    licenseType: '',
    licenseExpiryDate: '',
    drivingPoints: 100,
    assignedVehicle: '',
    assignedRoute: '',
    performanceRating: 3,
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && personnel) {
      setFormData({
        firstName: personnel.firstName || '',
        lastName: personnel.lastName || '',
        email: personnel.email || '',
        phoneNumber: personnel.phoneNumber || '',
        dateOfBirth: personnel.dateOfBirth ? new Date(personnel.dateOfBirth).toISOString().split('T')[0] : '',
        gender: personnel.gender || '',
        employeeId: personnel.employeeId || '',
        role: personnel.role || 'driver',
        department: personnel.department || 'operations',
        terminal: personnel.terminal || 'Kigali',
        hireDate: personnel.hireDate ? new Date(personnel.hireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        employmentStatus: personnel.employmentStatus || 'active',
        salary: personnel.salary || 0,
        licenseNumber: personnel.licenseNumber || '',
        licenseType: personnel.licenseType || '',
        licenseExpiryDate: personnel.licenseExpiryDate ? new Date(personnel.licenseExpiryDate).toISOString().split('T')[0] : '',
        drivingPoints: personnel.drivingPoints || 100,
        assignedVehicle: personnel.assignedVehicle?._id || personnel.assignedVehicle || '',
        assignedRoute: personnel.assignedRoute || '',
        performanceRating: personnel.performanceRating || 3,
        notes: personnel.notes || ''
      });
    }
  }, [mode, personnel]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.terminal) newErrors.terminal = 'Terminal is required';
    if (!formData.hireDate) newErrors.hireDate = 'Hire date is required';

    // Driver-specific validation
    if (formData.role === 'driver') {
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required for drivers';
      if (!formData.licenseType) newErrors.licenseType = 'License type is required for drivers';
      if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = 'License expiry date is required for drivers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
        drivingPoints: parseInt(formData.drivingPoints) || 100,
        performanceRating: parseFloat(formData.performanceRating) || 3,
        assignedVehicle: formData.assignedVehicle || null
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="personnel-form-modal">
        <div className="modal-header">
          <h3>
            <FaUser />
            {mode === 'edit' ? 'Edit Personnel' : 'Add New Personnel'}
          </h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="personnel-form">
          {/* Basic Information */}
          <div className="form-section">
            <h4>Basic Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={errors.phoneNumber ? 'error' : ''}
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={errors.dateOfBirth ? 'error' : ''}
                />
                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={errors.gender ? 'error' : ''}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender}</span>}
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="form-section">
            <h4>Employment Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employeeId">Employee ID *</label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className={errors.employeeId ? 'error' : ''}
                />
                {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={errors.role ? 'error' : ''}
                >
                  <option value="driver">Driver</option>
                  <option value="team_leader">Team Leader</option>
                  <option value="customer_care">Customer Care</option>
                  <option value="mechanic">Mechanic</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="other">Other</option>
                </select>
                {errors.role && <span className="error-message">{errors.role}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={errors.department ? 'error' : ''}
                >
                  <option value="operations">Operations</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="customer_service">Customer Service</option>
                  <option value="administration">Administration</option>
                  <option value="finance">Finance</option>
                  <option value="other">Other</option>
                </select>
                {errors.department && <span className="error-message">{errors.department}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="terminal">Terminal *</label>
                <select
                  id="terminal"
                  name="terminal"
                  value={formData.terminal}
                  onChange={handleInputChange}
                  className={errors.terminal ? 'error' : ''}
                >
                  <option value="Kigali">Kigali</option>
                  <option value="Kampala">Kampala</option>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Juba">Juba</option>
                </select>
                {errors.terminal && <span className="error-message">{errors.terminal}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hireDate">Hire Date *</label>
                <input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  className={errors.hireDate ? 'error' : ''}
                />
                {errors.hireDate && <span className="error-message">{errors.hireDate}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="employmentStatus">Employment Status</label>
                <select
                  id="employmentStatus"
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="terminated">Terminated</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salary">Salary</label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label htmlFor="performanceRating">Performance Rating</label>
                <select
                  id="performanceRating"
                  name="performanceRating"
                  value={formData.performanceRating}
                  onChange={handleInputChange}
                >
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Below Average</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Above Average</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Driver-specific Information */}
          {formData.role === 'driver' && (
            <div className="form-section">
              <h4>Driver Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="licenseNumber">License Number *</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className={errors.licenseNumber ? 'error' : ''}
                  />
                  {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="licenseType">License Type *</label>
                  <select
                    id="licenseType"
                    name="licenseType"
                    value={formData.licenseType}
                    onChange={handleInputChange}
                    className={errors.licenseType ? 'error' : ''}
                  >
                    <option value="">Select License Type</option>
                    <option value="A">A - Motorcycle</option>
                    <option value="B">B - Light Vehicle</option>
                    <option value="C">C - Medium Vehicle</option>
                    <option value="D">D - Heavy Vehicle</option>
                    <option value="E">E - Trailer</option>
                    <option value="F">F - Special Purpose</option>
                  </select>
                  {errors.licenseType && <span className="error-message">{errors.licenseType}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="licenseExpiryDate">License Expiry Date *</label>
                  <input
                    type="date"
                    id="licenseExpiryDate"
                    name="licenseExpiryDate"
                    value={formData.licenseExpiryDate}
                    onChange={handleInputChange}
                    className={errors.licenseExpiryDate ? 'error' : ''}
                  />
                  {errors.licenseExpiryDate && <span className="error-message">{errors.licenseExpiryDate}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="drivingPoints">Driving Points</label>
                  <input
                    type="number"
                    id="drivingPoints"
                    name="drivingPoints"
                    value={formData.drivingPoints}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="assignedVehicle">Assigned Vehicle</label>
                  <input
                    type="text"
                    id="assignedVehicle"
                    name="assignedVehicle"
                    value={formData.assignedVehicle}
                    onChange={handleInputChange}
                    placeholder="Vehicle ID"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="assignedRoute">Assigned Route</label>
                  <input
                    type="text"
                    id="assignedRoute"
                    name="assignedRoute"
                    value={formData.assignedRoute}
                    onChange={handleInputChange}
                    placeholder="e.g., Kigali-Kampala"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="form-section">
            <h4>Additional Information</h4>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Additional notes about this personnel..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  {mode === 'edit' ? 'Update Personnel' : 'Add Personnel'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonnelForm;
