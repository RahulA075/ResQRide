const express = require('express')
const { supabase } = require('../config/supabase')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// Get tracking session
router.get('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params

    const { data: session, error } = await supabase
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
          business_name,
          current_latitude,
          current_longitude
        )
      `)
      .eq('id', sessionId)
      .single()

    if (error || !session) {
      return res.status(404).json({ error: 'Tracking session not found' })
    }

    // Check if user has access to this tracking session
    const hasAccess = (
      session.driver_id === req.user.id ||
      session.assigned_provider_id === req.user.id
    )

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({ session })
  } catch (error) {
    console.error('Get tracking session error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update provider location during service
router.patch('/:sessionId/location', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    const { latitude, longitude } = req.body

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }

    // Verify session exists and user is the assigned provider
    const { data: session } = await supabase
      .from('emergency_requests')
      .select('assigned_provider_id')
      .eq('id', sessionId)
      .single()

    if (!session || session.assigned_provider_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Update provider's current location
    const { error: locationError } = await supabase
      .from('users')
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)

    if (locationError) {
      console.error('Location update error:', locationError)
      return res.status(500).json({ error: 'Failed to update location' })
    }

    // Also update the emergency request with provider location
    const { error: sessionError } = await supabase
      .from('emergency_requests')
      .update({
        provider_latitude: latitude,
        provider_longitude: longitude,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (sessionError) {
      console.error('Session update error:', sessionError)
    }

    res.json({
      message: 'Location updated successfully',
      location: { latitude, longitude }
    })
  } catch (error) {
    console.error('Update tracking location error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add tracking update/message
router.post('/:sessionId/updates', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    const { message, updateType = 'message' } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Verify session exists and user has access
    const { data: session } = await supabase
      .from('emergency_requests')
      .select('driver_id, assigned_provider_id')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const hasAccess = (
      session.driver_id === req.user.id ||
      session.assigned_provider_id === req.user.id
    )

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Create tracking update
    const { data: update, error } = await supabase
      .from('tracking_updates')
      .insert([{
        emergency_request_id: sessionId,
        user_id: req.user.id,
        message,
        update_type: updateType,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        user:users (
          full_name,
          business_name,
          role
        )
      `)
      .single()

    if (error) {
      console.error('Tracking update creation error:', error)
      return res.status(500).json({ error: 'Failed to create update' })
    }

    res.status(201).json({
      message: 'Update added successfully',
      update
    })
  } catch (error) {
    console.error('Add tracking update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get tracking updates for session
router.get('/:sessionId/updates', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params

    // Verify session exists and user has access
    const { data: session } = await supabase
      .from('emergency_requests')
      .select('driver_id, assigned_provider_id')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const hasAccess = (
      session.driver_id === req.user.id ||
      session.assigned_provider_id === req.user.id
    )

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Get tracking updates
    const { data: updates, error } = await supabase
      .from('tracking_updates')
      .select(`
        *,
        user:users (
          full_name,
          business_name,
          role
        )
      `)
      .eq('emergency_request_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Tracking updates fetch error:', error)
      return res.status(500).json({ error: 'Failed to fetch updates' })
    }

    res.json({ updates })
  } catch (error) {
    console.error('Get tracking updates error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router