import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaSave } from 'react-icons/fa';
import './Personnel.css';

const PersonnelForm = ({ isOpen, onClose, onSubmit, mode = 'add', personnel = null }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    },

    // Employment Information
    role: '',
    department: '',
    terminal: '',
    employmentStatus: '',
    supervisor: '',

    // Driver-specific fields (only shown for drivers)
    licenseNumber: '',
    licenseType: '',
    licenseExpiryDate: '',
    drivingPoints: '',
    assignedVehicle: '',
    assignedRoute: '',

    // Performance and Training
    performanceRating: '',
    lastEvaluationDate: '',
    trainingCompleted: [],
    certifications: [],

    // Work Schedule
    workSchedule: {
      shift: 'morning',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: '08:00',
      endTime: '17:00'
    },

    // Additional Information
    notes: '',
    skills: [],
    languages: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Role options based on your requirements
  const roleOptions = [
    { value: '', label: 'Select Role...' },
    { value: 'driver', label: 'Driver' },
    { value: 'team_leader', label: 'Team Leader' },
    { value: 'customer_care', label: 'Customer Care' },
    { value: 'mechanic', label: 'Mechanic' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
    { value: 'garage_staff', label: 'Garage Staff' },
    { value: 'transport_staff', label: 'Transport Staff' },
    { value: 'inventory_staff', label: 'Inventory Staff' }
  ];

  // Department options
  const departmentOptions = [
    { value: '', label: 'Select Department...' },
    { value: 'operations', label: 'Operations' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'administration', label: 'Administration' },
    { value: 'finance', label: 'Finance' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'other', label: 'Other' }
  ];

  // License types
  const licenseTypes = [
    { value: '', label: 'Select License Type...' },
    { value: 'A', label: 'A - Motorcycle' },
    { value: 'B', label: 'B - Light Vehicle' },
    { value: 'C', label: 'C - Heavy Vehicle' },
    { value: 'D', label: 'D - Passenger Vehicle' },
    { value: 'E', label: 'E - Trailer' },
    { value: 'F', label: 'F - Special Vehicle' }
  ];

  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && personnel) {
      setFormData({
        firstName: personnel.firstName || '',
        lastName: personnel.lastName || '',
        email: personnel.email || '',
        phoneNumber: personnel.phoneNumber || '',
        dateOfBirth: personnel.dateOfBirth ? new Date(personnel.dateOfBirth).toISOString().split('T')[0] : '',
        gender: personnel.gender || '',
        address: {
          street: personnel.address?.street || '',
          city: personnel.address?.city || '',
          state: personnel.address?.state || '',
          country: personnel.address?.country || '',
          postalCode: personnel.address?.postalCode || ''
        },
        emergencyContact: {
          name: personnel.emergencyContact?.name || '',
          relationship: personnel.emergencyContact?.relationship || '',
          phoneNumber: personnel.emergencyContact?.phoneNumber || ''
        },
        employeeId: personnel.employeeId || '',
        role: personnel.role || '',
        department: personnel.department || '',
        terminal: personnel.terminal || '',
        hireDate: personnel.hireDate ? new Date(personnel.hireDate).toISOString().split('T')[0] : '',
        employmentStatus: personnel.employmentStatus || '',
        salary: personnel.salary || '',
        supervisor: personnel.supervisor || '',
        licenseNumber: personnel.licenseNumber || '',
        licenseType: personnel.licenseType || '',
        licenseExpiryDate: personnel.licenseExpiryDate ? new Date(personnel.licenseExpiryDate).toISOString().split('T')[0] : '',
        drivingPoints: personnel.drivingPoints || '',
        assignedVehicle: personnel.assignedVehicle || '',
        assignedRoute: personnel.assignedRoute || '',
        performanceRating: personnel.performanceRating || '',
        lastEvaluationDate: personnel.lastEvaluationDate ? new Date(personnel.lastEvaluationDate).toISOString().split('T')[0] : '',
        trainingCompleted: personnel.trainingCompleted || [],
        certifications: personnel.certifications || [],
        workSchedule: {
          shift: personnel.workSchedule?.shift || '',
          workingDays: personnel.workSchedule?.workingDays || [],
          startTime: personnel.workSchedule?.startTime || '',
          endTime: personnel.workSchedule?.endTime || ''
        },
        notes: personnel.notes || '',
        skills: personnel.skills || [],
        languages: personnel.languages || []
      });
    }
  }, [mode, personnel]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested object updates
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    console.log('Validating form with data:', formData);

    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.terminal) newErrors.terminal = 'Terminal is required';

    // Driver-specific validation (optional fields)
    if (formData.role === 'driver') {
      // Only validate if license fields are provided (they are optional now)
      if (formData.licenseNumber.trim() && !formData.licenseType) {
        newErrors.licenseType = 'License type is required when license number is provided';
      }
      if (formData.licenseNumber.trim() && !formData.licenseExpiryDate) {
        newErrors.licenseExpiryDate = 'License expiry date is required when license number is provided';
      }
      if (formData.licenseType && !formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required when license type is provided';
      }
      if (formData.licenseExpiryDate && !formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required when license expiry date is provided';
      }
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form is valid:', isValid);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, submitting...');
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        drivingPoints: formData.drivingPoints ? parseInt(formData.drivingPoints) : null,
        performanceRating: formData.performanceRating ? parseInt(formData.performanceRating) : null
      };

      console.log('Submitting data:', submitData);
      await onSubmit(submitData);
      console.log('Submit successful!');
      onClose();
    } catch (error) {
      console.error('Error submitting personnel:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current role is driver
  const isDriver = formData.role === 'driver';

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="personnel-form-modal">
        <div className="modal-header">
          <h3>
            <FaUser />
            {mode === 'view' ? 'View Personnel' : 
             mode === 'add' ? 'Add New Personnel' : 'Edit Personnel'}
          </h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="personnel-form">
          {/* Basic Information Section */}
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
                  disabled={mode === 'view'}
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
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Optional"
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

          {/* Employment Information Section */}
          <div className="form-section">
            <h4>Employment Information</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={errors.role ? 'error' : ''}
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
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
                  <option value="">Select Department</option>
                  {departmentOptions.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
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
                  <option value="">Select Terminal</option>
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
          </div>

          {/* Driver-specific fields - only shown for drivers */}
          {isDriver && (
            <div className="form-section">
              <h4>Driver Information</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="licenseNumber">License Number</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className={errors.licenseNumber ? 'error' : ''}
                    placeholder="Optional"
                  />
                  {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="licenseType">License Type</label>
                  <select
                    id="licenseType"
                    name="licenseType"
                    value={formData.licenseType}
                    onChange={handleInputChange}
                    className={errors.licenseType ? 'error' : ''}
                  >
                    <option value="">Select License Type (Optional)</option>
                    {licenseTypes.map(license => (
                      <option key={license.value} value={license.value}>
                        {license.label}
                      </option>
                    ))}
                  </select>
                  {errors.licenseType && <span className="error-message">{errors.licenseType}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="licenseExpiryDate">License Expiry Date</label>
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
                    placeholder="Vehicle ID or plate number"
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
                    placeholder="Route name or ID"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Performance Information */}
          <div className="form-section">
            <h4>Performance & Work Schedule</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="performanceRating">Performance Rating</label>
                <select
                  id="performanceRating"
                  name="performanceRating"
                  value={formData.performanceRating}
                  onChange={handleInputChange}
                >
                  <option value="">Select Performance Rating...</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Below Average</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Above Average</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="lastEvaluationDate">Last Evaluation Date</label>
                <input
                  type="date"
                  id="lastEvaluationDate"
                  name="lastEvaluationDate"
                  value={formData.lastEvaluationDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="workSchedule.shift">Work Shift</label>
                <select
                  id="workSchedule.shift"
                  name="workSchedule.shift"
                  value={formData.workSchedule.shift}
                  onChange={handleInputChange}
                >
                  <option value="">Select Work Shift...</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="night">Night</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="workSchedule.startTime">Start Time</label>
                <input
                  type="time"
                  id="workSchedule.startTime"
                  name="workSchedule.startTime"
                  value={formData.workSchedule.startTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="workSchedule.endTime">End Time</label>
                <input
                  type="time"
                  id="workSchedule.endTime"
                  name="workSchedule.endTime"
                  value={formData.workSchedule.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <h4>Address Information</h4>
            
            <div className="form-group">
              <label htmlFor="address.street">Street Address</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.city">City</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address.state">State/Province</label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.country">Country</label>
                <input
                  type="text"
                  id="address.country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address.postalCode">Postal Code</label>
                <input
                  type="text"
                  id="address.postalCode"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="form-section">
            <h4>Emergency Contact</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContact.name">Contact Name</label>
                <input
                  type="text"
                  id="emergencyContact.name"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyContact.relationship">Relationship</label>
                <input
                  type="text"
                  id="emergencyContact.relationship"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact.phoneNumber">Contact Phone</label>
              <input
                type="tel"
                id="emergencyContact.phoneNumber"
                name="emergencyContact.phoneNumber"
                value={formData.emergencyContact.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Additional Information */}
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
                placeholder="Any additional notes or comments..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
              onClick={() => console.log('Submit button clicked!')}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  {mode === 'add' ? 'Adding...' : 'Updating...'}
                </>
              ) : (
                <>
                  <FaSave />
                  {mode === 'add' ? 'Add Personnel' : 'Update Personnel'}
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
