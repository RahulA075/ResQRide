const express = require('express')
const { supabase } = require('../config/supabase')
const { authenticateToken, requireRole } = require('../middleware/auth')

const router = express.Router()

// Get nearby service providers
router.get('/nearby', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, radius = 25, serviceType, vehicleType } = req.query

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }

    let query = supabase
      .from('service_providers_view')
      .select(`
        *,
        services (
          id,
          name,
          category,
          base_price
        )
      `)
      .eq('is_verified', true)

    // Add service type filter if provided
    if (serviceType) {
      query = query.contains('service_categories', [serviceType])
    }

    const { data: providers, error } = await query

    if (error) {
      console.error('Providers query error:', error)
      return res.status(500).json({ error: 'Failed to fetch providers' })
    }

    // Calculate distances and filter by radius
    const providersWithDistance = providers
      .map(provider => {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          provider.latitude,
          provider.longitude
        )
        
        return {
          ...provider,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          estimatedArrival: Math.ceil(distance * 2) // Rough estimate: 2 min per km
        }
      })
      .filter(provider => provider.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

    res.json({
      providers: providersWithDistance,
      count: providersWithDistance.length
    })
  } catch (error) {
    console.error('Nearby providers error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get provider details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const { data: provider, error } = await supabase
      .from('service_providers_view')
      .select(`
        *,
        services (
          id,
          name,
          category,
          description,
          base_price,
          is_active
        ),
        reviews (
          id,
          rating,
          comment,
          created_at,
          reviewer:users!reviews_reviewer_id_fkey (
            full_name
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !provider) {
      return res.status(404).json({ error: 'Provider not found' })
    }

    res.json({ provider })
  } catch (error) {
    console.error('Provider details error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update provider availability
router.patch('/:id/availability', authenticateToken, requireRole('service_provider'), async (req, res) => {
  try {
    const { id } = req.params
    const { available } = req.body

    // Verify provider ownership
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Can only update your own availability' })
    }

    const { data: provider, error } = await supabase
      .from('users')
      .update({ 
        availability: available,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('role', 'service_provider')
      .select()
      .single()

    if (error) {
      console.error('Availability update error:', error)
      return res.status(500).json({ error: 'Failed to update availability' })
    }

    res.json({
      message: 'Availability updated successfully',
      provider
    })
  } catch (error) {
    console.error('Update availability error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add provider review
router.post('/:id/reviews', authenticateToken, requireRole('driver'), async (req, res) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    // Check if provider exists
    const { data: provider } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .eq('role', 'service_provider')
      .single()

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' })
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([{
        provider_id: id,
        reviewer_id: req.user.id,
        rating,
        comment,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Review creation error:', error)
      return res.status(500).json({ error: 'Failed to create review' })
    }

    res.status(201).json({
      message: 'Review added successfully',
      review
    })
  } catch (error) {
    console.error('Add review error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
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