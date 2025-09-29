const jwt = require('jsonwebtoken');
const AppDataSource = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Handle demo token for testing
    if (token === 'demo-token') {
      console.log('Using demo token for authentication');
      req.user = {
        id: '1',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@possystem.com',
        role: { name: 'super_admin', permissions: { users: { create: true, read: true, update: true, delete: true } } },
        company: { id: '1', name: 'Default Company' },
        userLocations: [],
        isActive: true,
        companyId: '1',
        roleId: '1'
      };
      req.userId = '1';
      req.companyId = '1';
      req.roleId = '1';
      req.permissions = req.user.role.permissions;
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET || 'demo-secret';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Demo users for testing without database
    const demoUsers = {
      '1': {
        id: '1',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@possystem.com',
        role: { name: 'super_admin', permissions: { users: { create: true, read: true, update: true, delete: true } } },
        company: { id: '1', name: 'Default Company' },
        userLocations: [],
        isActive: true,
        companyId: '1',
        roleId: '1'
      },
      '2': {
        id: '2',
        firstName: 'Company',
        lastName: 'Admin',
        email: 'admin@defaultcompany.com',
        role: { name: 'admin', permissions: { users: { create: true, read: true, update: true, delete: false } } },
        company: { id: '1', name: 'Default Company' },
        userLocations: [],
        isActive: true,
        companyId: '1',
        roleId: '2'
      },
      '3': {
        id: '3',
        firstName: 'John',
        lastName: 'Cashier',
        email: 'cashier@defaultcompany.com',
        role: { name: 'cashier', permissions: { sales: { create: true, read: true, update: false, delete: false } } },
        company: { id: '1', name: 'Default Company' },
        userLocations: [],
        isActive: true,
        companyId: '1',
        roleId: '3'
      }
    };

    // Get user from demo data
    const user = demoUsers[decoded.userId];
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    req.user = user;
    req.userId = user.id;
    req.companyId = user.companyId;
    req.roleId = user.roleId;
    req.permissions = user.role.permissions;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.permissions || !req.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission required: ${permission}`
      });
    }
    next();
  };
};

const requireRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.name;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

const requireCompanyAccess = (req, res, next) => {
  const companyId = req.params.companyId || req.body.companyId || req.query.companyId;
  
  if (companyId && companyId !== req.companyId) {
    // Check if user has access to this company (for super admin scenarios)
    if (req.user?.role?.name !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this company'
      });
    }
  }
  
  next();
};

const requireLocationAccess = async (req, res, next) => {
  try {
    const locationId = req.params.locationId || req.body.locationId || req.query.locationId;
    
    if (!locationId) {
      return next();
    }

    const user = req.user;
    
    // Admin users can access any location in their company
    if (user.role.name === 'admin' || user.role.name === 'super_admin') {
      const locationRepository = AppDataSource.getRepository('Location');
      const location = await locationRepository.findOne({
        where: { id: locationId, companyId: user.companyId }
      });
      
      if (!location) {
        return res.status(403).json({
          success: false,
          message: 'Location not found or access denied'
        });
      }
      
      req.location = location;
      return next();
    }

    // Client users can only access their assigned locations
    const userLocation = user.userLocations?.find(ul => ul.locationId === locationId);
    
    if (!userLocation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this location'
      });
    }
    
    req.location = userLocation.location;
    next();
  } catch (error) {
    console.error('Location access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Location access verification error'
    });
  }
};

module.exports = {
  authenticateToken,
  requirePermission,
  requireRole,
  requireCompanyAccess,
  requireLocationAccess
};
