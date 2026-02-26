-- Roadside Assistance Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license_number VARCHAR(50),
    vehicle_info JSONB,
    location JSONB, -- {latitude: number, longitude: number}
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'busy')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fleet Owners table
CREATE TABLE IF NOT EXISTS fleet_owners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    business_license VARCHAR(100),
    address TEXT,
    fleet_size INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Requests table
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    fleet_owner_id UUID REFERENCES fleet_owners(id) ON DELETE SET NULL,
    service_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location JSONB NOT NULL, -- {latitude: number, longitude: number, address?: string}
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    vehicle_info JSONB,
    assigned_provider_id UUID,
    estimated_cost DECIMAL(10, 2),
    completion_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table (for fleet management)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fleet_owner_id UUID REFERENCES fleet_owners(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    location JSONB, -- Current location
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_location ON drivers USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_fleet_owners_status ON fleet_owners(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_location ON service_requests USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_vehicles_fleet_owner ON vehicles(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver ON vehicles(driver_id);

-- Insert sample data
INSERT INTO drivers (name, email, phone, license_number, location, status) VALUES
('John Doe', 'john.doe@example.com', '+91-9876543210', 'DL123456789', '{"latitude": 9.9252, "longitude": 78.1198}', 'active'),
('Jane Smith', 'jane.smith@example.com', '+91-9876543211', 'DL987654321', '{"latitude": 9.9300, "longitude": 78.1250}', 'active'),
('Mike Johnson', 'mike.johnson@example.com', '+91-9876543212', 'DL456789123', '{"latitude": 9.9200, "longitude": 78.1150}', 'busy')
ON CONFLICT (email) DO NOTHING;

INSERT INTO fleet_owners (name, email, phone, company_name, business_license, address, fleet_size) VALUES
('ABC Transport', 'admin@abctransport.com', '+91-9876543213', 'ABC Transport Ltd', 'BL123456', '123 Main St, Madurai', 25),
('XYZ Logistics', 'contact@xyzlogistics.com', '+91-9876543214', 'XYZ Logistics Pvt Ltd', 'BL789012', '456 Business Park, Madurai', 50)
ON CONFLICT (email) DO NOTHING;

INSERT INTO service_requests (service_type, description, location, priority, status) VALUES
('Engine Repair', 'Car engine making strange noise', '{"latitude": 9.9252, "longitude": 78.1198, "address": "Near Madurai Junction"}', 'high', 'pending'),
('Tire Change', 'Flat tire on highway', '{"latitude": 9.9300, "longitude": 78.1250, "address": "NH44 Highway"}', 'urgent', 'pending'),
('Battery Jump', 'Car battery dead', '{"latitude": 9.9200, "longitude": 78.1150, "address": "Meenakshi Temple Area"}', 'medium', 'completed');

-- Enable Row Level Security (optional)
-- ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fleet_owners ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database tables created successfully!';
    RAISE NOTICE '📊 Sample data inserted';
    RAISE NOTICE '🚀 Roadside Assistance Platform is ready!';
END $$;