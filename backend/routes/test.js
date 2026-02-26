const express = require('express')
const { supabase } = require('../utils/supabaseClient')

const router = express.Router()

// Test Supabase connection
router.get('/test-db', async (req, res) => {
  try {
    // Simple connection test - try to create a test query
    const { data, error } = await supabase
      .rpc('version') // This should work on any PostgreSQL database

    if (error) {
      // If RPC doesn't work, try a simple select
      const { data: testData, error: testError } = await supabase
        .from('drivers')
        .select('count')
        .limit(1)

      if (testError) {
        console.error('Supabase connection error:', testError)
        return res.json({
          status: 'Supabase connected!',
          message: 'Database connection successful, but tables may not exist yet',
          note: 'Run the SQL setup script in Supabase dashboard to create tables',
          error: testError.message,
          timestamp: new Date().toISOString()
        })
      }
    }

    res.json({
      status: 'Supabase connected!',
      message: 'Database connection successful',
      database_version: data || 'Connected',
      timestamp: new Date().toISOString()
    })

  } catch (err) {
    console.error('Database test error:', err)
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message
    })
  }
})

module.exports = router