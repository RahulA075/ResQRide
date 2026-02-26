const Joi = require('joi')

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      })
    }
    
    next()
  }
}

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).required(),
    role: Joi.string().valid('driver', 'service_provider', 'fleet_owner').required(),
    // Optional fields for service providers
    businessName: Joi.string().when('role', {
      is: 'service_provider',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    businessAddress: Joi.string().when('role', {
      is: 'service_provider',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    services: Joi.array().items(Joi.string()).when('role', {
      is: 'service_provider',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    businessName: Joi.string().optional(),
    businessAddress: Joi.string().optional()
  }),

  createService: Joi.object({
    name: Joi.string().required(),
    category: Joi.string().valid('mechanical', 'electrical', 'towing', 'parts').required(),
    description: Joi.string().optional(),
    basePrice: Joi.number().min(0).optional()
  }),

  emergencyRequest: Joi.object({
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    description: Joi.string().required(),
    vehicleInfo: Joi.object({
      make: Joi.string().required(),
      model: Joi.string().required(),
      year: Joi.number().min(1900).max(new Date().getFullYear() + 1).required(),
      licensePlate: Joi.string().required()
    }).required(),
    serviceType: Joi.string().valid('mechanical', 'electrical', 'towing', 'parts').required()
  })
}

module.exports = {
  validateRequest,
  schemas
}