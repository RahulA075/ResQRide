const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { supabase } = require('../utils/supabaseClient')

const router = express.Router()

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, role, password, businessName, businessAddress, services } = req.body

    // Validation
    if (!fullName || !email || !phone || !role || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Full name, email, phone, role, and password are required'
      })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user record
    const userData = {
      full_name: fullName,
      email,
      phone,
      role,
      password_hash: hashedPassword,
      is_verified: false,
      is_active: true
    }

    // Add business fields for service providers
    if (role === 'service_provider') {
      userData.business_name = businessName
      userData.business_address = businessAddress
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert([userData])
      .select('id, full_name, email, phone, role, business_name, business_address, is_verified, created_at')
      .single()

    if (error) {
      console.error('User creation error:', error)
      return res.status(500).json({
        error: 'Failed to create user',
        message: error.message
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      })
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Remove password from response
    const { password_hash, ...userResponse } = user

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(401).json({
        error: 'Token required',
        message: 'Refresh token is required'
      })
    }

    // Verify current token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    
    // Get updated user data
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone, role, business_name, business_address, is_verified, created_at')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or user not found'
      })
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      message: 'Token refreshed successfully',
      user,
      token: newToken
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({
      error: 'Invalid token',
      message: 'Token is invalid or expired'
    })
  }
})

module.exports = router