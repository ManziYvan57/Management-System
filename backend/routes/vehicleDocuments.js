const express = require('express');
const { body, validationResult } = require('express-validator');
const VehicleDocument = require('../models/VehicleDocument');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all vehicle documents with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      vehicle,
      documentType,
      status,
      complianceStatus,
      expiryStatus,
      search,
      page = 1,
      limit = 10,
      sortBy = 'expiryDate',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (vehicle) query.vehicle = vehicle;
    if (documentType) query.documentType = documentType;
    if (status) query.status = status;
    if (complianceStatus) query.complianceStatus = complianceStatus;
    
    // Search functionality
    if (search) {
      query.$or = [
        { documentNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { issuingAuthority: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } }
      ];
    }

    // Expiry status filtering
    if (expiryStatus) {
      const today = new Date();
      switch (expiryStatus) {
        case 'expired':
          query.expiryDate = { $lt: today };
          break;
        case 'expiring_soon':
          const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
          query.expiryDate = { $gte: today, $lte: thirtyDaysFromNow };
          break;
        case 'expiring_later':
          const ninetyDaysFromNow = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
          query.expiryDate = { $gt: new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)), $lte: ninetyDaysFromNow };
          break;
        case 'valid':
          const futureDate = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
          query.expiryDate = { $gt: futureDate };
          break;
      }
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const documents = await VehicleDocument.find(query)
      .populate('vehicle', 'plateNumber make model year')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VehicleDocument.countDocuments(query);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching vehicle documents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicle documents' });
  }
});

// Get documents by vehicle ID
router.get('/vehicle/:vehicleId', auth, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { documentType, status } = req.query;

    const query = { vehicle: vehicleId, isActive: true };
    if (documentType) query.documentType = documentType;
    if (status) query.status = status;

    const documents = await VehicleDocument.find(query)
      .populate('vehicle', 'plateNumber make model year')
      .populate('createdBy', 'firstName lastName')
      .sort({ expiryDate: 1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching vehicle documents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicle documents' });
  }
});

// Get document by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await VehicleDocument.findById(req.params.id)
      .populate('vehicle', 'plateNumber make model year')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch document' });
  }
});

// Create new vehicle document
router.post('/', auth, [
  body('vehicle').isMongoId().withMessage('Valid vehicle ID is required'),
  body('documentType').isIn([
    'insurance',
    'technical_control',
    'registration',
    'inspection_certificate',
    'emission_test',
    'safety_certificate',
    'compliance_certificate',
    'other'
  ]).withMessage('Invalid document type'),
  body('documentNumber').notEmpty().withMessage('Document number is required'),
  body('title').notEmpty().withMessage('Document title is required'),
  body('issuingAuthority').notEmpty().withMessage('Issuing authority is required'),
  body('issueDate').isISO8601().withMessage('Valid issue date is required'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
  body('status').optional().isIn(['active', 'expired', 'pending_renewal', 'suspended', 'cancelled']).withMessage('Invalid status'),
  body('complianceStatus').optional().isIn(['compliant', 'non_compliant', 'pending_review', 'under_review']).withMessage('Invalid compliance status')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(req.body.vehicle);
    if (!vehicle) {
      return res.status(400).json({ success: false, message: 'Vehicle not found' });
    }

    // Create document
    const documentData = {
      ...req.body,
      createdBy: req.user.id
    };

    const document = new VehicleDocument(documentData);
    await document.save();

    // Populate references
    await document.populate('vehicle', 'plateNumber make model year');
    await document.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Vehicle document created successfully',
      data: document
    });
  } catch (error) {
    console.error('Error creating vehicle document:', error);
    res.status(500).json({ success: false, message: 'Failed to create vehicle document' });
  }
});

// Update vehicle document
router.put('/:id', auth, [
  body('documentType').optional().isIn([
    'insurance',
    'technical_control',
    'registration',
    'inspection_certificate',
    'emission_test',
    'safety_certificate',
    'compliance_certificate',
    'other'
  ]).withMessage('Invalid document type'),
  body('documentNumber').optional().notEmpty().withMessage('Document number cannot be empty'),
  body('title').optional().notEmpty().withMessage('Document title cannot be empty'),
  body('issuingAuthority').optional().notEmpty().withMessage('Issuing authority cannot be empty'),
  body('issueDate').optional().isISO8601().withMessage('Valid issue date is required'),
  body('expiryDate').optional().isISO8601().withMessage('Valid expiry date is required'),
  body('status').optional().isIn(['active', 'expired', 'pending_renewal', 'suspended', 'cancelled']).withMessage('Invalid status'),
  body('complianceStatus').optional().isIn(['compliant', 'non_compliant', 'pending_review', 'under_review']).withMessage('Invalid compliance status')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const document = await VehicleDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Update document
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    Object.assign(document, updateData);
    await document.save();

    // Populate references
    await document.populate('vehicle', 'plateNumber make model year');
    await document.populate('createdBy', 'firstName lastName');
    await document.populate('updatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Vehicle document updated successfully',
      data: document
    });
  } catch (error) {
    console.error('Error updating vehicle document:', error);
    res.status(500).json({ success: false, message: 'Failed to update vehicle document' });
  }
});

// Delete vehicle document (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await VehicleDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    document.isActive = false;
    document.updatedBy = req.user.id;
    await document.save();

    res.json({
      success: true,
      message: 'Vehicle document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle document:', error);
    res.status(500).json({ success: false, message: 'Failed to delete vehicle document' });
  }
});

// Get documents expiring soon (dashboard alerts)
router.get('/alerts/expiring', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = new Date();
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));

    const expiringDocuments = await VehicleDocument.find({
      expiryDate: { $gte: today, $lte: futureDate },
      isActive: true
    })
    .populate('vehicle', 'plateNumber make model year')
    .populate('createdBy', 'firstName lastName')
    .sort({ expiryDate: 1 });

    res.json({
      success: true,
      data: expiringDocuments
    });
  } catch (error) {
    console.error('Error fetching expiring documents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expiring documents' });
  }
});

// Get compliance summary
router.get('/compliance/summary', auth, async (req, res) => {
  try {
    const { vehicle } = req.query;
    const query = { isActive: true };
    if (vehicle) query.vehicle = vehicle;

    const summary = await VehicleDocument.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$complianceStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await VehicleDocument.countDocuments(query);
    const expired = await VehicleDocument.countDocuments({
      ...query,
      expiryDate: { $lt: new Date() }
    });

    res.json({
      success: true,
      data: {
        summary,
        total,
        expired
      }
    });
  } catch (error) {
    console.error('Error fetching compliance summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch compliance summary' });
  }
});

// Bulk update document statuses (for automated processes)
router.post('/bulk-update-status', auth, async (req, res) => {
  try {
    const { documentIds, status, complianceStatus } = req.body;

    if (!documentIds || !Array.isArray(documentIds)) {
      return res.status(400).json({ success: false, message: 'Document IDs array is required' });
    }

    const updateData = { updatedBy: req.user.id };
    if (status) updateData.status = status;
    if (complianceStatus) updateData.complianceStatus = complianceStatus;

    const result = await VehicleDocument.updateMany(
      { _id: { $in: documentIds }, isActive: true },
      updateData
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} documents`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error bulk updating documents:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk update documents' });
  }
});

module.exports = router;
