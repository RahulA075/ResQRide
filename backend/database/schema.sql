-- Roadside Assistance Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'roadside_assistance_super_secret_key_2024';

-- Users table (handles drivers, service providers, and fleet owners)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('driver', 'service_provider', 'fleet_owner')),
    
    -- Business information (for service providers)
    business_name VARCHAR(255),
    business_address TEXT,
    
    -- Location information
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    current_latitude DECIMAL(10, 8), -- For real-time tracking
    current_longitude DECIMAL(11, 8), -- For real-time tracking
    
    -- Status and verification
    availability BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Services table (what service providers offer)
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('mechanical', 'electrical', 'towing', 'parts')),
    description TEXT,
    base_price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency requests table
CREATE TABLE emergency_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Location information
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    provider_latitude DECIMAL(10, 8), -- Provider's current location during service
    provider_longitude DECIMAL(11, 8),
    
    -- Request details
    description TEXT NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('mechanical', 'electrical', 'towing', 'parts')),
    
    -- Vehicle information
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    license_plate VARCHAR(20),
    
    -- Status and timing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    estimated_arrival INTEGER, -- in minutes
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emergency_request_id UUID REFERENCES emergency_requests(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate reviews for the same emergency request
    UNIQUE(reviewer_id, emergency_request_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emergency_request_id UUID REFERENCES emergency_requests(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data for the notification
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Tracking updates table (for real-time communication during service)
CREATE TABLE tracking_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    emergency_request_id UUID NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    update_type VARCHAR(20) DEFAULT 'message' CHECK (update_type IN ('message', 'status', 'location', 'eta')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fleet vehicles table (for fleet owners)
CREATE TABLE fleet_vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fleet_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(latitude, longitude);
CREATE INDEX idx_users_availability ON users(availability, is_verified);

CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);

CREATE INDEX idx_emergency_requests_driver ON emergency_requests(driver_id);
CREATE INDEX idx_emergency_requests_provider ON emergency_requests(assigned_provider_id);
CREATE INDEX idx_emergency_requests_status ON emergency_requests(status);
CREATE INDEX idx_emergency_requests_location ON emergency_requests(latitude, longitude);
CREATE INDEX idx_emergency_requests_created ON emergency_requests(created_at);

CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

CREATE INDEX idx_tracking_updates_emergency ON tracking_updates(emergency_request_id);
CREATE INDEX idx_tracking_updates_created ON tracking_updates(created_at);

-- Create a view for service providers with aggregated data
CREATE VIEW service_providers_view AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.phone,
    u.business_name,
    u.business_address,
    u.latitude,
    u.longitude,
    u.availability,
    u.is_verified,
    u.created_at,
    u.updated_at,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(r.id) as total_reviews,
    ARRAY_AGG(DISTINCT s.category) FILTER (WHERE s.is_active = true) as service_categories
FROM users u
LEFT JOIN reviews r ON u.id = r.provider_id
LEFT JOIN services s ON u.id = s.provider_id
WHERE u.role = 'service_provider' AND u.is_active = true
GROUP BY u.id, u.email, u.full_name, u.phone, u.business_name, u.business_address, 
         u.latitude, u.longitude, u.availability, u.is_verified, u.created_at, u.updated_at;

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and public provider data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Public can view service providers" ON users
    FOR SELECT USING (role = 'service_provider' AND is_active = true);

-- Services policies
CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage own services" ON services
    FOR ALL USING (auth.uid()::text = provider_id::text);

-- Emergency requests policies
CREATE POLICY "Users can view own emergency requests" ON emergency_requests
    FOR SELECT USING (
        auth.uid()::text = driver_id::text OR 
        auth.uid()::text = assigned_provider_id::text
    );

CREATE POLICY "Drivers can create emergency requests" ON emergency_requests
    FOR INSERT WITH CHECK (auth.uid()::text = driver_id::text);

CREATE POLICY "Users can update own emergency requests" ON emergency_requests
    FOR UPDATE USING (
        auth.uid()::text = driver_id::text OR 
        auth.uid()::text = assigned_provider_id::text
    );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = reviewer_id::text);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Tracking updates policies
CREATE POLICY "Users can view tracking updates for their requests" ON tracking_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM emergency_requests er 
            WHERE er.id = emergency_request_id 
            AND (er.driver_id::text = auth.uid()::text OR er.assigned_provider_id::text = auth.uid()::text)
        )
    );

CREATE POLICY "Users can create tracking updates for their requests" ON tracking_updates
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id::text AND
        EXISTS (
            SELECT 1 FROM emergency_requests er 
            WHERE er.id = emergency_request_id 
            AND (er.driver_id::text = auth.uid()::text OR er.assigned_provider_id::text = auth.uid()::text)
        )
    );

-- Fleet vehicles policies
CREATE POLICY "Fleet owners can manage own vehicles" ON fleet_vehicles
    FOR ALL USING (auth.uid()::text = fleet_owner_id::text);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_requests_updated_at BEFORE UPDATE ON emergency_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fleet_vehicles_updated_at BEFORE UPDATE ON fleet_vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO users (email, password_hash, full_name, phone, role, business_name, business_address, latitude, longitude, is_verified) VALUES
('john.driver@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'John Driver', '+91-9876543210', 'driver', NULL, NULL, 9.9252, 78.1198, true),
('quick.fix@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Quick Fix Auto', '+91-9876543211', 'service_provider', 'Quick Fix Auto', '123 Main St, Madurai', 9.927, 78.121, true),
('emergency.tow@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Emergency Towing', '+91-9876543212', 'service_provider', 'Emergency Towing Co', '456 Service Rd, Madurai', 9.920, 78.125, true);

-- Insert sample services
INSERT INTO services (provider_id, name, category, description, base_price) 
SELECT 
    u.id,
    'Engine Repair',
    'mechanical',
    'Complete engine diagnosis and repair',
    2500.00
FROM users u WHERE u.email = 'quick.fix@example.com';

INSERT INTO services (provider_id, name, category, description, base_price) 
SELECT 
    u.id,
    'Towing Service',
    'towing',
    '24/7 emergency towing service',
    1500.00
FROM users u WHERE u.email = 'emergency.tow@example.com';