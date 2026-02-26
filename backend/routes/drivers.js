const express = require('express')
const { supabase } = require('../utils/supabaseClient')

const router = express.Router()

// GET /drivers - Fetch all drivers
router.get('/drivers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch drivers',
        message: error.message
      })
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (err) {
    console.error('Get drivers error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

// POST /drivers - Add new driver
router.post('/drivers', async (req, res) => {
  try {
    const { name, phone, license_number, location_lat, location_lng, status } = req.body

    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name and phone are required'
      })
    }

    const { data, error } = await supabase
      .from('drivers')
      .insert([{
        name,
        phone,
        license_number,
        location_lat: location_lat ? parseFloat(location_lat) : null,
        location_lng: location_lng ? parseFloat(location_lng) : null,
        status: status || 'available'
      }])
      .select()

    if (error) {
      return res.status(500).json({
        error: 'Failed to create driver',
        message: error.message
      })
    }

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: data[0]
    })

  } catch (err) {
    console.error('Create driver error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

// PUT /drivers/:id - Update driver
router.put('/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, phone, license_number, location_lat, location_lng, status } = req.body

    const updateData = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (license_number) updateData.license_number = license_number
    if (location_lat !== undefined) updateData.location_lat = parseFloat(location_lat)
    if (location_lng !== undefined) updateData.location_lng = parseFloat(location_lng)
    if (status) updateData.status = status

    const { data, error } = await supabase
      .from('drivers')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return res.status(500).json({
        error: 'Failed to update driver',
        message: error.message
      })
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'Driver not found',
        message: `No driver found with id: ${id}`
      })
    }

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: data[0]
    })

  } catch (err) {
    console.error('Update driver error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

// DELETE /drivers/:id - Remove driver
router.delete('/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      return res.status(500).json({
        error: 'Failed to delete driver',
        message: error.message
      })
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'Driver not found',
        message: `No driver found with id: ${id}`
      })
    }

    res.json({
      success: true,
      message: 'Driver deleted successfully',
      data: data[0]
    })

  } catch (err) {
    console.error('Delete driver error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

// GET /drivers/nearby - Find nearby drivers
router.get('/drivers/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Latitude and longitude are required'
      })
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    const radiusKm = parseFloat(radius)

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      })
    }

    // Fetch all available drivers with location data
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'available')
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null)

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch drivers',
        message: error.message
      })
    }

    // Calculate distances using Haversine formula
    const nearbyDrivers = data
      .map(driver => {
        if (!driver.location_lat || !driver.location_lng) {
          return null
        }

        const distance = calculateDistance(
          lat, lng,
          driver.location_lat, driver.location_lng
        )

        return {
          ...driver,
          distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
        }
      })
      .filter(driver => driver && driver.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)

    res.json({
      success: true,
      data: nearbyDrivers,
      count: nearbyDrivers.length,
      search_params: {
        latitude: lat,
        longitude: lng,
        radius: radiusKm
      }
    })

  } catch (err) {
    console.error('Nearby drivers error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

// Haversine formula to calculate distance between two points
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