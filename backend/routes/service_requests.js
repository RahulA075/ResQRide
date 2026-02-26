const express = require('express')
const { supabase } = require('../config/supabase')

const router = express.Router()

// 🚨 GET /api/service-requests - Get all service requests
router.get('/', async (req, res) => {
  try {
    const { status, driver_id, fleet_owner_id, limit = 50 } = req.query

    let query = supabase
      .from('service_requests')
      .select(`
        *,
        driver:drivers(id, name, phone, vehicle_type, status),
        fleet_owner:fleet_owners(id, name, company_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (status) {
      query = query.eq('status', status)
    }

    if (driver_id) {
      query = query.eq('driver_id', driver_id)
    }

    if (fleet_owner_id) {
      query = query.eq('fleet_owner_id', fleet_owner_id)
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
      error: 'In