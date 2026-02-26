const express = require('express')
const { supabase } = require('../utils/supabaseClient')

const router = express.Router()

// GET /service-requests - Fetch all service requests
router.get('/service-requests', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch service requests',
        message: error.message
      })
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (err) {
    console.error('Get service requests error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

// POST /service-requests - Add new service request
router.post('/service-requests', async (req, res) => {
  try {
    const { 
      driver_id,
      fleet_owner_id,
      service_type,
      description,
      location,
      priority,
      vehicle_info
    } = req.body

    // Validation
    if (!service_type || !description || !location) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Service type, description, and location are required'
      })
    }

    const { data, error } = await supabase
      .from('service_requests')
      .insert([{
        driver_id,
        fleet_owner_id,
        service_type,
        description,
        location,
        priority: priority || 'medium',
        vehicle_info,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      return res.status(500).json({
        error: 'Failed to create service request',
        message: error.message
      })
    }

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: data[0]
    })

  } catch (err) {
    console.error('Create service request error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

// PUT /service-requests/:id - Update service request
router.put('/service-requests/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { 
      service_type,
      description,
      location,
      priority,
      status,
      assigned_provider_id,
      estimated_cost,
      completion_notes
    } = req.body

    const { data, error } = await supabase
      .from('service_requests')
      .update({
        service_type,
        description,
        location,
        priority,
        status,
        assigned_provider_id,
        estimated_cost,
        completion_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      return res.status(500).json({
        error: 'Failed to update service request',
        message: error.message
      })
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'Service request not found',
        message: `No service request found with id: ${id}`
      })
    }

    res.json({
      success: true,
      message: 'Service request updated successfully',
      data: data[0]
    })

  } catch (err) {
    console.error('Update service request error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

// DELETE /service-requests/:id - Remove service request
router.delete('/service-requests/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('service_requests')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      return res.status(500).json({
        error: 'Failed to delete service request',
        message: error.message
      })
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'Service request not found',
        message: `No service request found with id: ${id}`
      })
    }

    res.json({
      success: true,
      message: 'Service request deleted successfully',
      data: data[0]
    })

  } catch (err) {
    console.error('Delete service request error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

module.exports = router