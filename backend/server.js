// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Test Supabase connection
(async () => {
  try {
    const { data, error } = await supabase.from('drivers').select('count').limit(1);
    if (error) {
      console.log('⚠️ Supabase connected, but tables may not exist yet:', error.message);
      console.log('💡 Run the database setup SQL in Supabase dashboard if needed');
    } else {
      console.log('✅ Supabase connected successfully');
      console.log('📊 Database tables are ready');
    }
  } catch (err) {
    console.error('❌ Error testing Supabase connection:', err.message);
  }
})();

// Import routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const driversRoutes = require('./routes/drivers');
const fleetOwnersRoutes = require('./routes/fleetOwners');
const serviceRequestsRoutes = require('./routes/serviceRequests');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Roadside Assistance API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', testRoutes);
app.use('/api', driversRoutes);
app.use('/api', fleetOwnersRoutes);
app.use('/api', serviceRequestsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚗 Roadside Assistance API running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
