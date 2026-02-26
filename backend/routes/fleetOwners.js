const express = require('express')
const { supabase } = require('../utils/supabaseClient')

const router = express.Router()

// GET /fleet-owners - Fetch all fleet owners
router.get('/fleet-owners', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fleet_owners')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch fleet owners',
        message: error.message
      })
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (err) {
    console.error('Get fleet owners error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

// POST /fleet-owners - Add new fleet owner
router.post('/fleet-owners', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      company_name, 
      business_license, 
      address, 
      fleet_size 
    } = req.body

    // Validation
    if (!name || !email || !phone || !company_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, email, phone, and company name are required'
      })
    }

    const { data, error } = await supabase
      .from('fleet_owners')
      .insert([{
        name,
        email,
        phone,
        company_name,
        business_license,
        address,
        fleet_size: fleet_size || 0,
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      return res.status(500).json({
        error: 'Failed to create fleet owner',
        message: error.message
      })
    }

    res.status(201).json({
      success: true,
      message: 'Fleet owner created successfully',
      data: data[0]
    })

  } catch (err) {
    console.error('Create fleet owner error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

// PUT /fleet-owners/:id - Update fleet owner
router.put('/fleet-owners/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { 
      name, 
      email, 
      phone, 
      company_name, 
      business_license, 
      address, 
      fleet_size,
      status 
    } = req.body

    const { data, error } = await supabase
      .from('fleet_owners')
      .update({
        name,
        email,
        phone,
        company_name,
        business_license,
        address,
        fleet_size,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      return res.status(500).json({
        error: 'Failed to update fleet owner',
        message: error.message
      })
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'Fleet owner not found',
        message: `No fleet owner found with id: ${id}`
      })
    }

    res.json({
      success: true,
      message: 'Fleet owner updated successfully',
      data: data[0]
    })

  } catch (err) {
    console.error('Update fleet owner error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

// DELETE /fleet-owners/:id - Remove fleet owner
router.delete('/fleet-owners/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('fleet_owners')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      return res.status(500).json({
        error: 'Failed to delete fleet owner',
        message: error.message
      })
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'Fleet owner not found',
        message: `No fleet owner found with id: ${id}`
      })
    }

    res.json({
      success: true,
      message: 'Fleet owner deleted successfully',
      data: data[0]
    })

  } catch (err) {
    console.error('Delete fleet owner error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    })
  }
})

module.exports = router