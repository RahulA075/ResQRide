-- Add users table for authentication
-- Run this in your Supabase SQL Editor

-- Users table for authentication (drivers, service providers, fleet owners)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('driver', 'service_provider', 'fleet_owner')),
    password_hash VARCHAR(255) NOT NULL,
    
    -- Business information (for service providers)
    business_name VARCHAR(255),
    business_address TEXT,
    
    -- Location information
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    
    -- Status and verification
    availability BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Insert sample users for testing (password is 'password123' for all)
INSERT INTO users (full_name, email, phone, role, password_hash, business_name, business_address, is_verified) VALUES
('John Driver', 'john.driver@example.com', '+91-9876543210', 'driver', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', NULL, NULL, true),
('Quick Fix Auto', 'quickfix@example.com', '+91-9876543211', 'service_provider', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Quick Fix Auto Services', '123 Main St, Madurai', true),
('Fleet Manager', 'fleet@example.com', '+91-9876543212', 'fleet_owner', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'ABC Transport Co', '456 Business Park, Madurai', true)
ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Users table created successfully!';
    RAISE NOTICE '👥 Sample users added for testing';
    RAISE NOTICE '🔐 Password for all test users: password123';
    RAISE NOTICE '📧 Test emails: john.driver@example.com, quickfix@example.com, fleet@example.com';
END $$;