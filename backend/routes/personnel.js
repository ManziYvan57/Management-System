const express = require('express');
const router = express.Router();
const Personnel = require('../models/Personnel');
const Vehicle = require('../models/Vehicle');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validatePersonnel = [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('phoneNumber').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  body('dateOfBirth').isISO8601().withMessage('Please enter a valid date of birth'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Please select a valid gender'),

  body('role').isIn(['driver', 'team_leader', 'customer_care', 'mechanic', 'supervisor', 'manager', 'admin', 'garage_staff', 'transport_staff', 'inventory_staff']).withMessage('Please select a valid role'),
  body('department').isIn(['operations', 'maintenance', 'customer_service', 'administration', 'finance', 'other']).withMessage('Please select a valid department'),
  body('terminal').isIn(['Kigali', 'Kampala', 'Nairobi', 'Juba']).withMessage('Please select a valid terminal'),

  body('employmentStatus').optional().isIn(['active', 'inactive', 'suspended', 'terminated', 'on_leave']).withMessage('Please select a valid employment status'),
  body('licenseNumber').optional().trim(),
  body('licenseType').optional().custom((value) => {
    if (!value || value.trim().length === 0) return true;
    if (!['A', 'B', 'C', 'D', 'E', 'F'].includes(value)) throw new Error('Please select a valid license type');
    return true;
  }),
  body('licenseExpiryDate').optional().custom((value) => {
    if (!value || value.trim().length === 0) return true;
    if (!Date.parse(value)) throw new Error('Please enter a valid license expiry date');
    return true;
  }),
  body('drivingPoints').optional().custom((value) => {
    if (!value || value === '') return true;
    const num = parseInt(value);
    if (isNaN(num) || num < 0 || num > 100) throw new Error('Driving points must be between 0 and 100');
    return true;
  }),
  body('assignedVehicle').optional().custom((value) => {
    if (!value || value.trim().length === 0) return true;
    if (!/^[0-9a-fA-F]{24}$/.test(value)) throw new Error('Please enter a valid vehicle ID');
    return true;
  }),
  body('assignedRoute').optional().trim(),
  body('performanceRating').optional().custom((value) => {
    if (!value || value === '') return true;
    const num = parseFloat(value);
    if (isNaN(num) || num < 1 || num > 5) throw new Error('Performance rating must be between 1 and 5');
    return true;
  }),
  body('lastEvaluationDate').optional().custom((value) => {
    if (!value || value.trim().length === 0) return true;
    if (!Date.parse(value)) throw new Error('Please enter a valid evaluation date');
    return true;
  }),
  body('workSchedule.shift').optional().isIn(['morning', 'afternoon', 'night', 'flexible']).withMessage('Please select a valid shift'),
  body('workSchedule.workingDays').optional().isArray().withMessage('Working days must be an array'),
  body('workSchedule.startTime').optional().trim(),
  body('workSchedule.endTime').optional().trim(),
  body('notes').optional().trim(),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('languages').optional().isArray().withMessage('Languages must be an array')
];

// @desc    Get all personnel
// @route   GET /api/personnel
// @access  Private
router.get('/', protect, authorize('personnel', 'read'), async (req, res) => {
  try {
    const {
      search,
      role,
      department,
      employmentStatus,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },

        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') query.role = role;
    if (department && department !== 'all') query.department = department;

    if (employmentStatus && employmentStatus !== 'all') query.employmentStatus = employmentStatus;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const personnel = await Personnel.find(query)
      .populate('assignedVehicle', 'plateNumber make model')
      .populate('supervisor', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Personnel.countDocuments(query);

    res.json({
      success: true,
      data: personnel,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching personnel:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get personnel by ID
// @route   GET /api/personnel/:id
// @access  Private
router.get('/:id', protect, authorize('personnel', 'read'), async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id)
      .populate('assignedVehicle', 'plateNumber make model year')
      .populate('supervisor', 'firstName lastName role')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!personnel) {
      return res.status(404).json({ success: false, message: 'Personnel not found' });
    }

    res.json({ success: true, data: personnel });
  } catch (error) {
    console.error('Error fetching personnel:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create new personnel
// @route   POST /api/personnel
// @access  Private
router.post('/', protect, authorize('personnel', 'create'), validatePersonnel, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if email already exists (only if email is provided)
    if (req.body.email) {
      const existingEmail = await Personnel.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }



    // Check if license number already exists (for drivers)
    if (req.body.role === 'driver' && req.body.licenseNumber) {
      const existingLicense = await Personnel.findOne({ licenseNumber: req.body.licenseNumber });
      if (existingLicense) {
        return res.status(400).json({ success: false, message: 'License number already exists' });
      }
    }

    // Validate assigned vehicle exists (if provided)
    if (req.body.assignedVehicle) {
      const vehicle = await Vehicle.findById(req.body.assignedVehicle);
      if (!vehicle) {
        return res.status(400).json({ success: false, message: 'Assigned vehicle not found' });
      }
    }

    // Clean up empty strings to prevent validation errors
    const cleanData = { ...req.body };
    
    // Convert empty strings to null for ObjectId fields
    if (cleanData.supervisor === '') cleanData.supervisor = null;
    if (cleanData.assignedVehicle === '') cleanData.assignedVehicle = null;
    
    // Convert empty strings to null for enum fields
    if (cleanData.licenseType === '') cleanData.licenseType = null;
    if (cleanData.licenseExpiryDate === '') cleanData.licenseExpiryDate = null;
    if (cleanData.lastEvaluationDate === '') cleanData.lastEvaluationDate = null;
    
    // Convert empty strings to null for other optional fields
    if (cleanData.licenseNumber === '') cleanData.licenseNumber = null;
    if (cleanData.assignedRoute === '') cleanData.assignedRoute = null;
    
    const personnel = new Personnel({
      ...cleanData,
      createdBy: req.user.id
    });

    await personnel.save();

    const populatedPersonnel = await Personnel.findById(personnel._id)
      .populate('assignedVehicle', 'plateNumber make model')
      .populate('supervisor', 'firstName lastName');

    res.status(201).json({ success: true, data: populatedPersonnel });
  } catch (error) {
    console.error('Error creating personnel:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update personnel
// @route   PUT /api/personnel/:id
// @access  Private
router.put('/:id', protect, authorize('personnel', 'edit'), validatePersonnel, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const personnel = await Personnel.findById(req.params.id);
    if (!personnel) {
      return res.status(404).json({ success: false, message: 'Personnel not found' });
    }

    // Check if email already exists (excluding current personnel)
    if (req.body.email && req.body.email !== personnel.email) {
      const existingEmail = await Personnel.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }



    // Check if license number already exists (for drivers)
    if (req.body.role === 'driver' && req.body.licenseNumber && req.body.licenseNumber !== personnel.licenseNumber) {
      const existingLicense = await Personnel.findOne({ licenseNumber: req.body.licenseNumber });
      if (existingLicense) {
        return res.status(400).json({ success: false, message: 'License number already exists' });
      }
    }

    // Validate assigned vehicle exists (if provided)
    if (req.body.assignedVehicle) {
      const vehicle = await Vehicle.findById(req.body.assignedVehicle);
      if (!vehicle) {
        return res.status(400).json({ success: false, message: 'Assigned vehicle not found' });
      }
    }

    // Clean up empty strings to prevent validation errors
    const cleanData = { ...req.body };
    
    // Convert empty strings to null for ObjectId fields
    if (cleanData.supervisor === '') cleanData.supervisor = null;
    if (cleanData.assignedVehicle === '') cleanData.assignedVehicle = null;
    
    // Convert empty strings to null for enum fields
    if (cleanData.licenseType === '') cleanData.licenseType = null;
    if (cleanData.licenseExpiryDate === '') cleanData.licenseExpiryDate = null;
    if (cleanData.lastEvaluationDate === '') cleanData.lastEvaluationDate = null;
    
    // Convert empty strings to null for other optional fields
    if (cleanData.licenseNumber === '') cleanData.licenseNumber = null;
    if (cleanData.assignedRoute === '') cleanData.assignedRoute = null;
    
    // Remove createdBy from update to prevent modification
    delete cleanData.createdBy;

    const updatedPersonnel = await Personnel.findByIdAndUpdate(
      req.params.id,
      {
        ...cleanData,
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    ).populate('assignedVehicle', 'plateNumber make model')
     .populate('supervisor', 'firstName lastName employeeId');

    res.json({ success: true, data: updatedPersonnel });
  } catch (error) {
    console.error('Error updating personnel:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete personnel
// @route   DELETE /api/personnel/:id
// @access  Private
router.delete('/:id', protect, authorize('personnel', 'delete'), async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    if (!personnel) {
      return res.status(404).json({ success: false, message: 'Personnel not found' });
    }

    await Personnel.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Personnel deleted successfully' });
  } catch (error) {
    console.error('Error deleting personnel:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get personnel statistics
// @route   GET /api/personnel/stats/overview
// @access  Private
router.get('/stats/overview', protect, authorize('personnel', 'read'), async (req, res) => {
  try {
    const query = {};

    const [
      totalPersonnel,
      activePersonnel,
      drivers,
      teamLeaders,
      customerCare,
      mechanics,
      supervisors,
      managers,
      admins,
      otherRoles,
      
      personnelByDepartment,
      personnelByStatus,
      recentHires,
      expiringLicenses
    ] = await Promise.all([
      Personnel.countDocuments(query),
      Personnel.countDocuments({ ...query, employmentStatus: 'active' }),
      Personnel.countDocuments({ ...query, role: 'driver' }),
      Personnel.countDocuments({ ...query, role: 'team_leader' }),
      Personnel.countDocuments({ ...query, role: 'customer_care' }),
      Personnel.countDocuments({ ...query, role: 'mechanic' }),
      Personnel.countDocuments({ ...query, role: 'supervisor' }),
      Personnel.countDocuments({ ...query, role: 'manager' }),
      Personnel.countDocuments({ ...query, role: 'admin' }),
      Personnel.countDocuments({ ...query, role: 'other' }),

      Personnel.aggregate([
        { $match: query },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Personnel.aggregate([
        { $match: query },
        { $group: { _id: '$employmentStatus', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Personnel.find({ ...query, hireDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
        .select('firstName lastName role hireDate')
        .sort({ hireDate: -1 })
        .limit(5),
      Personnel.find({
        ...query,
        role: 'driver',
        licenseExpiryDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
        .select('firstName lastName licenseExpiryDate licenseNumber')
        .sort({ licenseExpiryDate: 1 })
        .limit(10)
    ]);

    res.json({
      success: true,
      data: {
        totalPersonnel,
        activePersonnel,
        roleBreakdown: {
          drivers,
          teamLeaders,
          customerCare,
          mechanics,
          supervisors,
          managers,
          admins,
          otherRoles
        },

        personnelByDepartment,
        personnelByStatus,
        recentHires,
        expiringLicenses
      }
    });
  } catch (error) {
    console.error('Error fetching personnel statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get drivers only
// @route   GET /api/personnel/drivers
// @access  Private
router.get('/drivers', protect, authorize('personnel', 'read'), async (req, res) => {
  try {
    const {
      search,
      employmentStatus,
      licenseStatus,
      page = 1,
      limit = 10
    } = req.query;

    const query = { role: 'driver' };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }
    

    if (employmentStatus && employmentStatus !== 'all') query.employmentStatus = employmentStatus;

    // Filter by license status
    if (licenseStatus) {
      const today = new Date();
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      switch (licenseStatus) {
        case 'expired':
          query.licenseExpiryDate = { $lt: today };
          break;
        case 'expiring_soon':
          query.licenseExpiryDate = { $gte: today, $lte: thirtyDaysFromNow };
          break;
        case 'valid':
          query.licenseExpiryDate = { $gt: thirtyDaysFromNow };
          break;
      }
    }

    const skip = (page - 1) * limit;
    
    const drivers = await Personnel.find(query)
      .populate('assignedVehicle', 'plateNumber make model')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Personnel.countDocuments(query);

    res.json({
      success: true,
      data: drivers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Add infraction to personnel
// @route   POST /api/personnel/:id/infractions
// @access  Private
router.post('/:id/infractions', protect, authorize('personnel', 'edit'), [
  body('date').isISO8601().withMessage('Please enter a valid date'),
  body('type').trim().isLength({ min: 1 }).withMessage('Infraction type is required'),
  body('description').optional().trim(),
  body('points').isInt({ min: 0 }).withMessage('Points must be a positive number'),
  body('severity').isIn(['minor', 'major', 'critical']).withMessage('Please select a valid severity'),
  body('status').optional().isIn(['pending', 'resolved', 'appealed']).withMessage('Please select a valid status'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const personnel = await Personnel.findById(req.params.id);
    if (!personnel) {
      return res.status(404).json({ success: false, message: 'Personnel not found' });
    }

    const infraction = {
      date: req.body.date,
      type: req.body.type,
      description: req.body.description,
      points: req.body.points,
      severity: req.body.severity,
      status: req.body.status || 'pending',
      notes: req.body.notes
    };

    // Update driving points for drivers
    if (personnel.role === 'driver') {
      personnel.drivingPoints = Math.max(0, personnel.drivingPoints - req.body.points);
    }

    personnel.infractions.push(infraction);
    personnel.updatedBy = req.user.id;

    await personnel.save();

    const updatedPersonnel = await Personnel.findById(req.params.id)
      .populate('assignedVehicle', 'plateNumber make model')
      .populate('supervisor', 'firstName lastName employeeId');

    res.json({ success: true, data: updatedPersonnel });
  } catch (error) {
    console.error('Error adding infraction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update infraction status
// @route   PUT /api/personnel/:id/infractions/:infractionId
// @access  Private
router.put('/:id/infractions/:infractionId', protect, authorize('personnel', 'edit'), [
  body('status').isIn(['pending', 'resolved', 'appealed']).withMessage('Please select a valid status'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const personnel = await Personnel.findById(req.params.id);
    if (!personnel) {
      return res.status(404).json({ success: false, message: 'Personnel not found' });
    }

    const infraction = personnel.infractions.id(req.params.infractionId);
    if (!infraction) {
      return res.status(404).json({ success: false, message: 'Infraction not found' });
    }

    infraction.status = req.body.status;
    if (req.body.notes) {
      infraction.notes = req.body.notes;
    }

    personnel.updatedBy = req.user.id;
    await personnel.save();

    const updatedPersonnel = await Personnel.findById(req.params.id)
      .populate('assignedVehicle', 'plateNumber make model')
      .populate('supervisor', 'firstName lastName employeeId');

    res.json({ success: true, data: updatedPersonnel });
  } catch (error) {
    console.error('Error updating infraction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
