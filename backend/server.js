const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const providersRoutes = require('./routes/providers');
const emergencyRoutes = require('./routes/emergency');
const trackingRoutes = require('./routes/tracking');
const servicesRoutes = require('./routes/services');
const fleetRoutes = require('./routes/fleet');

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ResQRide API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/fleet', fleetRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚗 ResQRide API running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
});

module.exports = app;
