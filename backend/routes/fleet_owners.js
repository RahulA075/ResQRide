const express = require('express')
const { supabase } = require('../config/supabase')

const router = express.Router()

// 🏢 GET /api/fleet-owners - Get all fleet owners
router.get('/', async (req, res) => {
  try {
    const { data: fleetOwners, error } = await supabase
      .from('fleet_owners')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching fleet owners:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch fleet owners',
        details: error.message
      })
    }

    res.json({
      success: true,
      data: fleetOwners,
      count: fleetOwners.length
    })
  } catch (err) {
    console.error('Fleet owners fetch error:', err)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 🏢 GET /api/fleet-owners/:id - Get fleet owner by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: fleetOwner, error } = await supabase
      .from('fleet_owners')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching fleet owner:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch fleet owner',
        details: error.message
      })
    }

    if (!fleetOwner) {
      return res.status(404).json({
        success: false,
        error: 'Fleet owner not found'
      })
    }

    res.json({
      success: true,
      data: fleetOwner
    })
  } catch (err) {
    console.error('Fleet owner fetch error:', err)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 🏢 GET /api/fleet-owners/:id/service-requests - Get service requests for a fleet owner
router.get('/:id/service-requests', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.query

    let query = supabase
      .from('service_requests')
      .select(`
        *,
        driver:drivers(name, phone, vehicle_type)
      `)
      .eq('fleet_owner_id', id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: serviceRequests, error } = await query

    if (error) {
      console.error('Error fetching service requests:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch service requests',
        details: error.message
      })
    }

    res.json({
      success: true,
      data: serviceRequests,
      count: serviceRequests.length
    })
  } catch (err) {
    console.error('Service requests fetch error:', err)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 🏢 POST /api/fleet-owners - Add new fleet owner
router.post('/', async (req, res) => {
  try {
    const { name, company_name, contact_number, email } = req.body

    // Validation
    if (!name || !company_name || !contact_number || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name, company_name, contact_number, and email are required'
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
    }

    const { data: fleetOwner, error } = await supabase
      .from('fleet_owners')
      .insert([{
        name,
        company_name,
        contact_number,
        email
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating fleet owner:', error)
      
      // Handle unique constraint violation
      if (error.code === '23505' && error.message.includes('email')) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        })
      }

      return res.status(500).json({
        success: false,
        error: 'Failed to create fleet owner',
        details: error.message
      })
    }

    res.status(201).json({
      success: true,
      message: 'Fleet owner created successfully',
      data: fleetOwner
    })
  } catch (err) {
    console.error('Fleet owner creation error:', err)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 🏢 PUT /api/fleet-owners/:id - Update fleet owner
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, company_name, contact_number, email } = req.body

    const updateData = {}
    if (name) updateData.name = name
    if (company_name) updateData.company_name = company_name
    if (contact_number) updateData.contact_number = contact_number
    if (email) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        })
      }
      updateData.email = email
    }

    const { data: fleetOwner, error } = await supabase
      .from('fleet_owners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating fleet owner:', error)
      
      // Handle unique constraint violation
      if (error.code === '23505' && error.message.includes('email')) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        })
      }

      return res.status(500).json({
        success: false,
        error: 'Failed to update fleet owner',
        details: error.message
      })
    }

    if (!fleetOwner) {
      return res.status(404).json({
        success: false,
        error: 'Fleet owner not found'
      })
    }

    res.json({
      success: true,
      message: 'Fleet owner updated successfully',
      data: fleetOwner
    })
  } catch (err) {
    console.error('Fleet owner update error:', err)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 🏢 DELETE /api/fleet-owners/:id - Delete fleet owner
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Check if fleet owner has any service requests
    const { data: serviceRequests, error: checkError } = await supabase
      .from('service_requests')
      .select('id')
      .eq('fleet_owner_id', id)
      .limit(1)

    if (checkError) {
      console.error('Error checking service requests:', checkError)
      return res.status(500).json({
        success: false,
        error: 'Failed to check service requests'
      })
    }

    if (serviceRequests && serviceRequests.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete fleet owner with existing service requests'
      })
    }

    const { error } = await supabase
      .from('fleet_owners')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting fleet owner:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to delete fleet owner',
        details: error.message
      })
    }

    res.json({
      success: true,
      message: 'Fleet owner deleted successfully'
    })
  } catch (err) {
    console.error('Fleet owner deletion error:', err)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// 🏢 GET /api/fleet-owners/search - Search fleet owners by company name or email
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required'
      })
    }

    const { data: fleetOwners, error } = await supabase
      .from('fleet_owners')
      .select('*')
      .or(`company_name.ilike.%${q}%,email.ilike.%${q}%,name.ilike.%${q}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching fleet owners:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to search fleet owners',
        details: error.message
      })
    }

    res.json({
      success: true,
      data: fleetOwners,
      count: fleetOwners.length,
      search_query: q
    })
  } catch (err) {
    console.error('Fleet owners search error:', err)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

module.exports = router