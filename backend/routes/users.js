const express = require('express')
const { supabase } = require('../config/supabase')
const { authenticateToken } = require('../middleware/auth')
const { validateRequest, schemas } = require('../middleware/validation')

const router = express.Router()

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        business_name,
        business_address,
        latitude,
        longitude,
        availability,
        is_verified,
        created_at,
        updated_at
      `)
      .eq('id', req.user.id)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
      return res.status(500).json({ error: 'Failed to fetch profile' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user profile
router.patch('/profile', authenticateToken, validateRequest(schemas.updateProfile), async (req, res) => {
  try {
    const updates = req.body
    updates.updated_at = new Date().toISOString()

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        business_name,
        business_address,
        latitude,
        longitude,
        availability,
        is_verified,
        created_at,
        updated_at
      `)
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return res.status(500).json({ error: 'Failed to update profile' })
    }

    res.json({
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user location
router.patch('/location', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' })
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({
        latitude,
        longitude,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single()

    if (error) {
      console.error('Location update error:', error)
      return res.status(500).json({ error: 'Failed to update location' })
    }

    res.json({
      message: 'Location updated successfully',
      location: { latitude, longitude }
    })
  } catch (error) {
    console.error('Update location error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Notifications fetch error:', error)
      return res.status(500).json({ error: 'Failed to fetch notifications' })
    }

    res.json({
      notifications,
      page: parseInt(page),
      limit: parseInt(limit)
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Mark notification as read
router.patch('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) {
      console.error('Notification update error:', error)
      return res.status(500).json({ error: 'Failed to update notification' })
    }

    res.json({
      message: 'Notification marked as read',
      notification
    })
  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's emergency requests (for drivers)
router.get('/emergency-requests', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    let query = supabase
      .from('emergency_requests')
      .select(`
        *,
        assigned_provider:users!emergency_requests_assigned_provider_id_fkey (
          full_name,
          business_name,
          phone
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (req.user.role === 'driver') {
      query = query.eq('driver_id', req.user.id)
    } else if (req.user.role === 'service_provider') {
      query = query.eq('assigned_provider_id', req.user.id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: requests, error } = await query

    if (error) {
      console.error('Emergency requests fetch error:', error)
      return res.status(500).json({ error: 'Failed to fetch emergency requests' })
    }

    res.json({
      requests,
      page: parseInt(page),
      limit: parseInt(limit)
    })
  } catch (error) {
    console.error('Get emergency requests error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router