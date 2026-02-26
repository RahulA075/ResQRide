const express = require('express')
const { supabase } = require('../config/supabase')
const { authenticateToken, requireRole } = require('../middleware/auth')
const { validateRequest, schemas } = require('../middleware/validation')

const router = express.Router()

// Get all service categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'mechanical', name: 'Mechanical Repair', description: 'Engine, transmission, brakes, etc.' },
      { id: 'electrical', name: 'Electrical', description: 'Battery, alternator, wiring, etc.' },
      { id: 'towing', name: 'Towing Service', description: 'Vehicle towing and recovery' },
      { id: 'parts', name: 'Parts Supply', description: 'Auto parts and accessories' }
    ]

    res.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get services by provider
router.get('/provider/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params

    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Services fetch error:', error)
      return res.status(500).json({ error: 'Failed to fetch services' })
    }

    res.json({ services })
  } catch (error) {
    console.error('Get provider services error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create new service (service providers only)
router.post('/', authenticateToken, requireRole('service_provider'), validateRequest(schemas.createService), async (req, res) => {
  try {
    const { name, category, description, basePrice } = req.body

    const { data: service, error } = await supabase
      .from('services')
      .insert([{
        provider_id: req.user.id,
        name,
        category,
        description,
        base_price: basePrice,
        is_active: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Service creation error:', error)
      return res.status(500).json({ error: 'Failed to create service' })
    }

    res.status(201).json({
      message: 'Service created successfully',
      service
    })
  } catch (error) {
    console.error('Create service error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update service
router.patch('/:id', authenticateToken, requireRole('service_provider'), async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Verify service ownership
    const { data: existingService } = await supabase
      .from('services')
      .select('provider_id')
      .eq('id', id)
      .single()

    if (!existingService || existingService.provider_id !== req.user.id) {
      return res.status(403).json({ error: 'Can only update your own services' })
    }

    updates.updated_at = new Date().toISOString()

    const { data: service, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Service update error:', error)
      return res.status(500).json({ error: 'Failed to update service' })
    }

    res.json({
      message: 'Service updated successfully',
      service
    })
  } catch (error) {
    console.error('Update service error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete service
router.delete('/:id', authenticateToken, requireRole('service_provider'), async (req, res) => {
  try {
    const { id } = req.params

    // Verify service ownership
    const { data: existingService } = await supabase
      .from('services')
      .select('provider_id')
      .eq('id', id)
      .single()

    if (!existingService || existingService.provider_id !== req.user.id) {
      return res.status(403).json({ error: 'Can only delete your own services' })
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('services')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Service deletion error:', error)
      return res.status(500).json({ error: 'Failed to delete service' })
    }

    res.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Delete service error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get my services (for service providers)
router.get('/my-services', authenticateToken, requireRole('service_provider'), async (req, res) => {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', req.user.id)
      .order('name')

    if (error) {
      console.error('My services fetch error:', error)
      return res.status(500).json({ error: 'Failed to fetch services' })
    }

    res.json({ services })
  } catch (error) {
    console.error('Get my services error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router