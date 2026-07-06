const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get fleet owner's vehicles
router.get('/vehicles', authenticateToken, requireRole('fleet_owner'), async (req, res) => {
  try {
    const { data: vehicles, error } = await supabase
      .from('fleet_vehicles')
      .select(`
        *,
        driver:users!fleet_vehicles_driver_id_fkey (
          id, full_name, phone, email
        )
      `)
      .eq('fleet_owner_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ vehicles });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add vehicle
router.post('/vehicles', authenticateToken, requireRole('fleet_owner'), async (req, res) => {
  try {
    const { make, model, year, licensePlate, vin, driverId } = req.body;
    if (!make || !model || !year || !licensePlate) {
      return res.status(400).json({ error: 'make, model, year, and licensePlate are required' });
    }

    const { data: vehicle, error } = await supabase
      .from('fleet_vehicles')
      .insert([{
        fleet_owner_id: req.user.id,
        make, model, year,
        license_plate: licensePlate,
        vin: vin || null,
        driver_id: driverId || null,
        status: 'active'
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: 'Vehicle added', vehicle });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update vehicle
router.patch('/vehicles/:id', authenticateToken, requireRole('fleet_owner'), async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, year, licensePlate, vin, driverId, status } = req.body;

    const updates = {};
    if (make) updates.make = make;
    if (model) updates.model = model;
    if (year) updates.year = year;
    if (licensePlate) updates.license_plate = licensePlate;
    if (vin !== undefined) updates.vin = vin;
    if (driverId !== undefined) updates.driver_id = driverId;
    if (status) updates.status = status;

    const { data: vehicle, error } = await supabase
      .from('fleet_vehicles')
      .update(updates)
      .eq('id', id)
      .eq('fleet_owner_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Vehicle updated', vehicle });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete vehicle
router.delete('/vehicles/:id', authenticateToken, requireRole('fleet_owner'), async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('fleet_vehicles')
      .delete()
      .eq('id', id)
      .eq('fleet_owner_id', req.user.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Vehicle removed' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get fleet's service requests (emergency requests for fleet's vehicles/drivers)
router.get('/service-requests', authenticateToken, requireRole('fleet_owner'), async (req, res) => {
  try {
    // Get all drivers linked to this fleet's vehicles
    const { data: vehicles } = await supabase
      .from('fleet_vehicles')
      .select('driver_id')
      .eq('fleet_owner_id', req.user.id)
      .not('driver_id', 'is', null);

    const driverIds = vehicles?.map(v => v.driver_id).filter(Boolean) || [];

    if (driverIds.length === 0) {
      return res.json({ requests: [] });
    }

    const { data: requests, error } = await supabase
      .from('emergency_requests')
      .select(`
        *,
        driver:users!emergency_requests_driver_id_fkey (
          full_name, phone
        ),
        assigned_provider:users!emergency_requests_assigned_provider_id_fkey (
          full_name, phone, business_name
        )
      `)
      .in('driver_id', driverIds)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get fleet analytics
router.get('/analytics', authenticateToken, requireRole('fleet_owner'), async (req, res) => {
  try {
    const { data: vehicles } = await supabase
      .from('fleet_vehicles')
      .select('*, driver:users!fleet_vehicles_driver_id_fkey(id, full_name, phone)')
      .eq('fleet_owner_id', req.user.id);

    const driverIds = vehicles?.map(v => v.driver_id).filter(Boolean) || [];

    let requests = [];
    if (driverIds.length > 0) {
      const { data } = await supabase
        .from('emergency_requests')
        .select('*')
        .in('driver_id', driverIds);
      requests = data || [];
    }

    const analytics = {
      totalVehicles: vehicles?.length || 0,
      activeVehicles: vehicles?.filter(v => v.status === 'active').length || 0,
      vehiclesInMaintenance: vehicles?.filter(v => v.status === 'maintenance').length || 0,
      totalServiceRequests: requests.length,
      pendingRequests: requests.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status)).length,
      completedRequests: requests.filter(r => r.status === 'completed').length,
    };

    res.json({ analytics, vehicles, requests });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
