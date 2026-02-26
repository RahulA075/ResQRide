const express = require('express')
const { supabase } = require('../config/supabase')
const { authenticateToken, requireRole } = require('../middleware/auth')
const { validateRequest, schemas } = require('../middleware/validation')

const router = express.Router()

// Create emergency request
router.post('/request', authenticateToken, requireRole('driver'), validateRequest(schemas.emergencyRequest), async (req, res) => {
  try {
    const { location, description, vehicleInfo, serviceType } = req.body

    // Create emergency request
    const { data: emergency, error } = await supabase
      .from('emergency_requests')
      .insert([{
        driver_id: req.user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        description,
        vehicle_make: vehicleInfo.make,
        vehicle_model: vehicleInfo.model,
        vehicle_year: vehicleInfo.year,
        license_plate: vehicleInfo.licensePlate,
        service_type: serviceType,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Emergency request creation error:', error)
      return res.status(500).json({ error: 'Failed to create emergency request' })
    }

    // Find nearby providers
    const { data: providers } = await supabase
      .from('service_providers_view')
      .select('*')
      .eq('is_verified', true)
      .eq('availability', true)
      .contains('service_categories', [serviceType])

    // Calculate distances and get closest providers
    const providersWithDistance = providers
      .map(provider => ({
        ...provider,
        distance: calculateDistance(
          location.latitude,
          location.longitude,
          provider.latitude,
          provider.longitude
        )
      }))
      .filter(provider => provider.distance <= 50) // 50km radius
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5) // Top 5 closest providers

    // Notify providers (in a real app, you'd send push notifications)
    const notifications = providersWithDistance.map(provider => ({
      user_id: provider.id,
      emergency_request_id: emergency.id,
      type: 'emergency_request',
      title: 'New Emergency Request',
      message: `Emergency ${serviceType} request ${provider.distance.toFixed(1)}km away`,
      data: JSON.stringify({
        emergencyId: emergency.id,
        distance: provider.distance,
        serviceType
      }),
      created_at: new Date().toISOString()
    }))

    if (notifications.length > 0) {
      await supabase
        .from('notifications')
        .insert(notifications)
    }

    res.status(201).json({
      message: 'Emergency request created successfully',
      emergency,
      notifiedProviders: providersWithDistance.length
    })
  } catch (error) {
    console.error('Emergency request error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get emergency request status
router.get('/request/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const { data: emergency, error } = await supabase
      .from('emergency_requests')
      .select(`
        *,
        driver:users!emergency_requests_driver_id_fkey (
          full_name,
          phone
        ),
        assigned_provider:users!emergency_requests_assigned_provider_id_fkey (
          full_name,
          phone,
          business_name
        )
      `)
      .eq('id', id)
      .single()

    if (error || !emergency) {
      return res.status(404).json({ error: 'Emergency request not found' })
    }

    // Check if user has access to this emergency request
    if (req.user.role === 'driver' && emergency.driver_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (req.user.role === 'service_provider' && emergency.assigned_provider_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({ emergency })
  } catch (error) {
    console.error('Get emergency request error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Accept emergency request (service provider)
router.post('/request/:id/accept', authenticateToken, requireRole('service_provider'), async (req, res) => {
  try {
    const { id } = req.params
    const { estimatedArrival } = req.body

    // Check if request exists and is still pending
    const { data: emergency, error: fetchError } = await supabase
      .from('emergency_requests')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !emergency) {
      return res.status(404).json({ error: 'Emergency request not found or already assigned' })
    }

    // Update emergency request
    const { data: updatedEmergency, error } = await supabase
      .from('emergency_requests')
      .update({
        assigned_provider_id: req.user.id,
        status: 'accepted',
        estimated_arrival: estimatedArrival,
        accepted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Emergency accept error:', error)
      return res.status(500).json({ error: 'Failed to accept emergency request' })
    }

    // Notify driver
    await supabase
      .from('notifications')
      .insert([{
        user_id: emergency.driver_id,
        emergency_request_id: id,
        type: 'emergency_accepted',
        title: 'Help is on the way!',
        message: `${req.user.business_name || req.user.full_name} is coming to help you`,
        data: JSON.stringify({
          providerId: req.user.id,
          providerName: req.user.business_name || req.user.full_name,
          estimatedArrival
        }),
        created_at: new Date().toISOString()
      }])

    res.json({
      message: 'Emergency request accepted successfully',
      emergency: updatedEmergency
    })
  } catch (error) {
    console.error('Accept emergency error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update emergency status
router.patch('/request/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status, location } = req.body

    const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    // Get current emergency request
    const { data: emergency } = await supabase
      .from('emergency_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency request not found' })
    }

    // Check permissions
    const canUpdate = (
      (req.user.role === 'driver' && emergency.driver_id === req.user.id) ||
      (req.user.role === 'service_provider' && emergency.assigned_provider_id === req.user.id)
    )

    if (!canUpdate) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Update emergency request
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    }

    if (location) {
      updateData.current_latitude = location.latitude
      updateData.current_longitude = location.longitude
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data: updatedEmergency, error } = await supabase
      .from('emergency_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Status update error:', error)
      return res.status(500).json({ error: 'Failed to update status' })
    }

    res.json({
      message: 'Status updated successfully',
      emergency: updatedEmergency
    })
  } catch (error) {
    console.error('Update emergency status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

module.exports = router