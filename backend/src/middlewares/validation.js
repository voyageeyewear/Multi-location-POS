const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// Common validation schemas
const schemas = {
  // User schemas
  user: {
    register: Joi.object({
      firstName: Joi.string().min(2).max(100).required(),
      lastName: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      phone: Joi.string().optional(),
      roleId: Joi.string().uuid().required(),
      companyId: Joi.string().uuid().required()
    }),
    
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }),
    
    update: Joi.object({
      firstName: Joi.string().min(2).max(100).optional(),
      lastName: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional(),
      roleId: Joi.string().uuid().optional(),
      isActive: Joi.boolean().optional()
    }),
    
    changePassword: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    })
  },

  // Company schemas
  company: {
    create: Joi.object({
      name: Joi.string().min(2).max(255).required(),
      description: Joi.string().optional(),
      address: Joi.string().optional(),
      phone: Joi.string().optional(),
      email: Joi.string().email().optional(),
      website: Joi.string().uri().optional(),
      settings: Joi.object().optional()
    }),
    
    update: Joi.object({
      name: Joi.string().min(2).max(255).optional(),
      description: Joi.string().optional(),
      address: Joi.string().optional(),
      phone: Joi.string().optional(),
      email: Joi.string().email().optional(),
      website: Joi.string().uri().optional(),
      settings: Joi.object().optional(),
      isActive: Joi.boolean().optional()
    })
  },

  // Role schemas
  role: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().optional(),
      permissions: Joi.object().required(),
      companyId: Joi.string().uuid().optional()
    }),
    
    update: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      description: Joi.string().optional(),
      permissions: Joi.object().optional(),
      isActive: Joi.boolean().optional()
    })
  },

  // Product schemas
  product: {
    create: Joi.object({
      name: Joi.string().min(2).max(255).required(),
      description: Joi.string().optional(),
      sku: Joi.string().min(1).max(100).required(),
      barcode: Joi.string().optional(),
      price: Joi.number().positive().required(),
      cost: Joi.number().positive().optional(),
      category: Joi.string().max(100).optional(),
      brand: Joi.string().max(100).optional(),
      image: Joi.string().uri().optional(),
      attributes: Joi.object().optional(),
      trackInventory: Joi.boolean().optional(),
      minStockLevel: Joi.number().integer().min(0).optional(),
      isActive: Joi.boolean().optional()
    }),
    
    update: Joi.object({
      name: Joi.string().min(2).max(255).optional(),
      description: Joi.string().optional(),
      sku: Joi.string().min(1).max(100).optional(),
      barcode: Joi.string().optional(),
      price: Joi.number().positive().optional(),
      cost: Joi.number().positive().optional(),
      category: Joi.string().max(100).optional(),
      brand: Joi.string().max(100).optional(),
      image: Joi.string().uri().optional(),
      attributes: Joi.object().optional(),
      trackInventory: Joi.boolean().optional(),
      minStockLevel: Joi.number().integer().min(0).optional(),
      isActive: Joi.boolean().optional()
    })
  },

  // Location schemas
  location: {
    create: Joi.object({
      name: Joi.string().min(2).max(255).required(),
      address: Joi.string().optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      zipCode: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional(),
      phone: Joi.string().max(20).optional(),
      email: Joi.string().email().optional(),
      type: Joi.string().valid('store', 'kiosk', 'warehouse', 'office').optional(),
      settings: Joi.object().optional()
    }),
    
    update: Joi.object({
      name: Joi.string().min(2).max(255).optional(),
      address: Joi.string().optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      zipCode: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional(),
      phone: Joi.string().max(20).optional(),
      email: Joi.string().email().optional(),
      type: Joi.string().valid('store', 'kiosk', 'warehouse', 'office').optional(),
      settings: Joi.object().optional(),
      isActive: Joi.boolean().optional()
    })
  },

  // Sale schemas
  sale: {
    create: Joi.object({
      customerName: Joi.string().max(255).optional(),
      customerEmail: Joi.string().email().optional(),
      customerPhone: Joi.string().max(20).optional(),
      locationId: Joi.string().uuid().required(),
      paymentMethod: Joi.string().valid('cash', 'card', 'online', 'cod', 'other').required(),
      notes: Joi.string().optional(),
      items: Joi.array().items(
        Joi.object({
          productId: Joi.string().uuid().required(),
          quantity: Joi.number().integer().positive().required(),
          unitPrice: Joi.number().positive().required(),
          discountAmount: Joi.number().min(0).optional(),
          notes: Joi.string().optional()
        })
      ).min(1).required()
    }),
    
    update: Joi.object({
      customerName: Joi.string().max(255).optional(),
      customerEmail: Joi.string().email().optional(),
      customerPhone: Joi.string().max(20).optional(),
      paymentMethod: Joi.string().valid('cash', 'card', 'online', 'cod', 'other').optional(),
      paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded', 'partially_refunded').optional(),
      status: Joi.string().valid('pending', 'completed', 'cancelled', 'refunded').optional(),
      notes: Joi.string().optional()
    })
  },

  // Report schemas
  report: {
    generate: Joi.object({
      name: Joi.string().min(2).max(255).required(),
      type: Joi.string().valid('sales', 'inventory', 'customer', 'financial', 'custom').required(),
      format: Joi.string().valid('pdf', 'excel', 'csv', 'json').required(),
      parameters: Joi.object().optional(),
      locationId: Joi.string().uuid().optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional()
    })
  }
};

module.exports = {
  validate,
  schemas
};
