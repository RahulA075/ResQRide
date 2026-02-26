-- Roadside Assistance Platform - Database Schema
-- Copy and paste this into your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS fleet_owners CASCADE;

-- 🚗 DRIVERS TABLE
CREATE TABLE drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('motorcycle', 'car', 'truck', 'van')),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🏢 FLEET OWNERS TABLE
CREATE TABLE fleet_owners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🚨 SERVICE REQUESTS TABLE
CREATE TABLE service_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    fleet_owner_id UUID REFERENCES fleet_owners(id) ON DELETE SET NULL,
    issue_type VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_drivers_location ON drivers(location_lat, location_lng);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_vehicle_type ON drivers(vehicle_type);

CREATE INDEX idx_fleet_owners_email ON fleet_owners(email);
CREATE INDEX idx_fleet_owners_company ON fleet_owners(company_name);

CREATE INDEX idx_service_requests_driver ON service_requests(driver_id);
CREATE INDEX idx_service_requests_fleet_owner ON service_requests(fleet_owner_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_location ON service_requests(latitude, longitude);
CREATE INDEX idx_service_requests_created ON service_requests(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fleet_owners_updated_at BEFORE UPDATE ON fleet_owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO drivers (name, phone, vehicle_type, location_lat, location_lng, status) VALUES
('John Driver', '+91-9876543210', 'car', 9.9252, 78.1198, 'available'),
('Mike Trucker', '+91-9876543211', 'truck', 9.9300, 78.1250, 'available'),
('Sara Biker', '+91-9876543212', 'motorcycle', 9.9200, 78.1150, 'busy'),
('Tom Van Driver', '+91-9876543213', 'van', 9.9350, 78.1300, 'available');

INSERT INTO fleet_owners (name, company_name, contact_number, email) VALUES
('Fleet Manager One', 'Madurai Transport Co', '+91-9876543220', 'fleet1@example.com'),
('Fleet Manager Two', 'Tamil Nadu Logistics', '+91-9876543221', 'fleet2@example.com'),
('Fleet Manager Three', 'South India Fleet', '+91-9876543222', 'fleet3@example.com');

INSERT INTO service_requests (driver_id, fleet_owner_id, issue_type, latitude, longitude, status, description) 
SELECT 
    d.id,
    f.id,
    'Engine Problem',
    9.9280,
    78.1220,
    'pending',
    'Car engine making strange noise and losing power'
FROM drivers d, fleet_owners f 
WHERE d.name = 'John Driver' AND f.company_name = 'Madurai Transport Co'
LIMIT 1;

INSERT INTO service_requests (driver_id, fleet_owner_id, issue_type, latitude, longitude, status, description) 
SELECT 
    d.id,
    f.id,
    'Flat Tire',
    9.9320,
    78.1180,
    'assigned',
    'Front left tire is flat, need immediate assistance'
FROM drivers d, fleet_owners f 
WHERE d.name = 'Mike Trucker' AND f.company_name = 'Tamil Nadu Logistics'
LIMIT 1;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Roadside Assistance database setup completed!';
    RAISE NOTICE '✅ Created tables: drivers, fleet_owners, service_requests';
    RAISE NOTICE '✅ Added indexes for performance optimization';
    RAISE NOTICE '✅ Inserted sample data for testing';
    RAISE NOTICE '🚀 Your backend is ready to connect!';
END $$;