const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    if (user.isLocked()) {
      return res.status(423).json({ error: 'Account is locked due to too many failed attempts' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Middleware to check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

// Middleware to check if user has permission for a specific module
const requirePermission = (module) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.hasPermission(module)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions for this module',
        module: module,
        currentRole: req.user.role
      });
    }

    next();
  };
};

// Specific role middlewares
const requireSuperAdmin = requireRole('super_admin');
const requireAdmin = requireRole(['super_admin', 'admin']);
const requireGarageStaff = requireRole(['super_admin', 'admin', 'garage_staff']);
const requireTransportStaff = requireRole(['super_admin', 'admin', 'transport_staff']);
const requireInventoryStaff = requireRole(['super_admin', 'admin', 'inventory_staff']);
const requireManagementStaff = requireRole(['super_admin', 'admin', 'garage_staff', 'transport_staff', 'inventory_staff']);

// Module-specific permission middlewares
const requireAssetRegisterPermission = requirePermission('assetRegister');
const requireInventoryPermission = requirePermission('inventory');
const requireGaragePermission = requirePermission('garage');
const requireDriverPerformancePermission = requirePermission('driverPerformance');
const requireTransportOperationsPermission = requirePermission('transportOperations');
const requirePackageManagementPermission = requirePermission('packageManagement');
const requireReportsPermission = requirePermission('reports');

// Helper function to check if user can manage users
const canManageUsers = (userRole) => {
  return ['super_admin', 'admin'].includes(userRole);
};

// Helper function to check if user can reset passwords
const canResetPasswords = (userRole) => {
  return userRole === 'super_admin';
};

// Helper function to check if user can create users
const canCreateUsers = (userRole) => {
  return ['super_admin', 'admin'].includes(userRole);
};

// Helper function to check if user can access management features
const canAccessManagement = (userRole) => {
  return ['super_admin', 'admin', 'garage_staff', 'transport_staff', 'inventory_staff'].includes(userRole);
};

// Optional authentication (for public routes that can show different content for logged-in users)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive && !user.isLocked()) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireSuperAdmin,
  requireAdmin,
  requireGarageStaff,
  requireTransportStaff,
  requireInventoryStaff,
  requireManagementStaff,
  requireAssetRegisterPermission,
  requireInventoryPermission,
  requireGaragePermission,
  requireDriverPerformancePermission,
  requireTransportOperationsPermission,
  requirePackageManagementPermission,
  requireReportsPermission,
  optionalAuth,
  canManageUsers,
  canResetPasswords,
  canCreateUsers,
  canAccessManagement
}; 