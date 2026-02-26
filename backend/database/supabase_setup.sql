-- 🚗 Roadside Assistance App - Complete Supabase Setup
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS tracking_updates CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS emergency_requests CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS fleet_vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS service_providers_view CASCADE;

-- 👥 USERS TABLE (Drivers, Service Providers, Fleet Owners)
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

-- 🚗 FLEET VEHICLES TABLE (Enhanced with relationships)
CREATE TABLE fleet_vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fleet_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Vehicle details
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE,
    color VARCHAR(50),
    
    -- Vehicle specifications
    vehicle_type VARCHAR(50) DEFAULT 'car' CHECK (vehicle_type IN ('car', 'truck', 'motorcycle', 'van', 'bus')),
    fuel_type VARCHAR(20) DEFAULT 'gasoline' CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid')),
    engine_size VARCHAR(20),
    
    -- Status and maintenance
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive', 'accident')),
    mileage INTEGER DEFAULT 0,
    last_service_date DATE,
    next_service_due DATE,
    insurance_expiry DATE,
    registration_expiry DATE,
    
    -- Location tracking
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_location_update TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_fleet_owner CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = fleet_owner_id AND role = 'fleet_owner')
    ),
    CONSTRAINT valid_driver CHECK (
        assigned_driver_id IS NULL OR 
        EXISTS (SELECT 1 FROM users WHERE id = assigned_driver_id AND role = 'driver')
    )
);

-- 🛠️ SERVICES TABLE (What service providers offer)
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('mechanical', 'electrical', 'towing', 'parts', 'inspection', 'cleaning')),
    description TEXT,
    base_price DECIMAL(10, 2),
    price_per_hour DECIMAL(10, 2),
    is_emergency_service BOOLEAN DEFAULT false,
    is_mobile_service BOOLEAN DEFAULT true,
    service_radius_km INTEGER DEFAULT 25,
    estimated_duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint to ensure only service providers can offer services
    CONSTRAINT valid_service_provider CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = provider_id AND role = 'service_provider')
    )
);

-- 🚨 EMERGENCY REQUESTS TABLE (Enhanced with vehicle relationships)
CREATE TABLE emergency_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES fleet_vehicles(id) ON DELETE SET NULL,
    assigned_provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Location information
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    provider_latitude DECIMAL(10, 8), -- Provider's current location during service
    provider_longitude DECIMAL(11, 8),
    
    -- Request details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('mechanical', 'electrical', 'towing', 'parts', 'inspection', 'fuel')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Vehicle information (if not linked to fleet vehicle)
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    license_plate VARCHAR(20),
    
    -- Status and timing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired')),
    estimated_arrival INTEGER, -- in minutes
    estimated_cost DECIMAL(10, 2),
    final_cost DECIMAL(10, 2),
    
    -- Payment information
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_driver CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = driver_id AND role = 'driver')
    ),
    CONSTRAINT valid_assigned_provider CHECK (
        assigned_provider_id IS NULL OR 
        EXISTS (SELECT 1 FROM users WHERE id = assigned_provider_id AND role = 'service_provider')
    )
);

-- ⭐ REVIEWS TABLE (Enhanced with more details)
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emergency_request_id UUID REFERENCES emergency_requests(id) ON DELETE SET NULL,
    
    -- Review details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    -- Detailed ratings
    service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Review metadata
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate reviews for the same emergency request
    UNIQUE(reviewer_id, emergency_request_id),
    
    -- Constraints
    CONSTRAINT valid_provider CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = provider_id AND role = 'service_provider')
    )
);

-- 🔔 NOTIFICATIONS TABLE (Enhanced with more types)
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emergency_request_id UUID REFERENCES emergency_requests(id) ON DELETE CASCADE,
    
    -- Notification details
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'emergency_request', 'emergency_accepted', 'emergency_completed', 'emergency_cancelled',
        'provider_arrived', 'service_started', 'service_completed', 'payment_required',
        'review_request', 'system_update', 'maintenance_reminder', 'insurance_expiry'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data for the notification
    
    -- Notification status
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Delivery channels
    send_push BOOLEAN DEFAULT true,
    send_email BOOLEAN DEFAULT false,
    send_sms BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- 📍 TRACKING UPDATES TABLE (Real-time communication)
CREATE TABLE tracking_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    emergency_request_id UUID NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Update details
    message TEXT NOT NULL,
    update_type VARCHAR(20) DEFAULT 'message' CHECK (update_type IN (
        'message', 'status', 'location', 'eta', 'photo', 'arrival', 'departure'
    )),
    
    -- Location data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Media attachments
    photo_url TEXT,
    attachment_urls TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💰 PAYMENTS TABLE (Payment tracking)
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    emergency_request_id UUID NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    
    -- Payment status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Breakdown
    service_cost DECIMAL(10, 2),
    parts_cost DECIMAL(10, 2),
    tax_amount DECIMAL(10, 2),
    platform_fee DECIMAL(10, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 📊 Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(latitude, longitude);
CREATE INDEX idx_users_availability ON users(availability, is_verified);

CREATE INDEX idx_fleet_vehicles_owner ON fleet_vehicles(fleet_owner_id);
CREATE INDEX idx_fleet_vehicles_driver ON fleet_vehicles(assigned_driver_id);
CREATE INDEX idx_fleet_vehicles_status ON fleet_vehicles(status);
CREATE INDEX idx_fleet_vehicles_location ON fleet_vehicles(current_latitude, current_longitude);

CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);

CREATE INDEX idx_emergency_requests_driver ON emergency_requests(driver_id);
CREATE INDEX idx_emergency_requests_provider ON emergency_requests(assigned_provider_id);
CREATE INDEX idx_emergency_requests_vehicle ON emergency_requests(vehicle_id);
CREATE INDEX idx_emergency_requests_status ON emergency_requests(status);
CREATE INDEX idx_emergency_requests_location ON emergency_requests(latitude, longitude);
CREATE INDEX idx_emergency_requests_created ON emergency_requests(created_at);

CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at);

CREATE INDEX idx_tracking_updates_emergency ON tracking_updates(emergency_request_id);
CREATE INDEX idx_tracking_updates_created ON tracking_updates(created_at);

CREATE INDEX idx_payments_request ON payments(emergency_request_id);
CREATE INDEX idx_payments_status ON payments(status);

-- 📈 Create enhanced views for better data access
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
    COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as average_rating,
    COUNT(r.id) as total_reviews,
    ARRAY_AGG(DISTINCT s.category) FILTER (WHERE s.is_active = true) as service_categories,
    COUNT(DISTINCT CASE WHEN er.status = 'completed' THEN er.id END) as completed_jobs,
    COUNT(DISTINCT s.id) FILTER (WHERE s.is_active = true) as active_services
FROM users u
LEFT JOIN reviews r ON u.id = r.provider_id
LEFT JOIN services s ON u.id = s.provider_id
LEFT JOIN emergency_requests er ON u.id = er.assigned_provider_id
WHERE u.role = 'service_provider' AND u.is_active = true
GROUP BY u.id, u.email, u.full_name, u.phone, u.business_name, u.business_address, 
         u.latitude, u.longitude, u.availability, u.is_verified, u.created_at, u.updated_at;

-- Fleet dashboard view
CREATE VIEW fleet_dashboard_view AS
SELECT 
    fo.id as fleet_owner_id,
    fo.full_name as owner_name,
    fo.business_name,
    COUNT(fv.id) as total_vehicles,
    COUNT(CASE WHEN fv.status = 'active' THEN 1 END) as active_vehicles,
    COUNT(CASE WHEN fv.status = 'maintenance' THEN 1 END) as maintenance_vehicles,
    COUNT(CASE WHEN fv.assigned_driver_id IS NOT NULL THEN 1 END) as assigned_vehicles,
    COUNT(DISTINCT fv.assigned_driver_id) as total_drivers,
    COUNT(CASE WHEN er.status IN ('pending', 'accepted', 'in_progress') THEN 1 END) as active_requests
FROM users fo
LEFT JOIN fleet_vehicles fv ON fo.id = fv.fleet_owner_id
LEFT JOIN emergency_requests er ON fv.id = er.vehicle_id
WHERE fo.role = 'fleet_owner' AND fo.is_active = true
GROUP BY fo.id, fo.full_name, fo.business_name;

-- 🔒 Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Public can view service providers" ON users
    FOR SELECT USING (role = 'service_provider' AND is_active = true);

-- Fleet vehicles policies
CREATE POLICY "Fleet owners can manage own vehicles" ON fleet_vehicles
    FOR ALL USING (auth.uid()::text = fleet_owner_id::text);

CREATE POLICY "Drivers can view assigned vehicles" ON fleet_vehicles
    FOR SELECT USING (auth.uid()::text = assigned_driver_id::text);

-- Services policies
CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage own services" ON services
    FOR ALL USING (auth.uid()::text = provider_id::text);

-- Emergency requests policies
CREATE POLICY "Users can view related emergency requests" ON emergency_requests
    FOR SELECT USING (
        auth.uid()::text = driver_id::text OR 
        auth.uid()::text = assigned_provider_id::text OR
        EXISTS (SELECT 1 FROM fleet_vehicles WHERE id = vehicle_id AND fleet_owner_id::text = auth.uid()::text)
    );

CREATE POLICY "Drivers can create emergency requests" ON emergency_requests
    FOR INSERT WITH CHECK (auth.uid()::text = driver_id::text);

CREATE POLICY "Users can update related emergency requests" ON emergency_requests
    FOR UPDATE USING (
        auth.uid()::text = driver_id::text OR 
        auth.uid()::text = assigned_provider_id::text OR
        EXISTS (SELECT 1 FROM fleet_vehicles WHERE id = vehicle_id AND fleet_owner_id::text = auth.uid()::text)
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
CREATE POLICY "Users can view tracking updates for related requests" ON tracking_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM emergency_requests er 
            WHERE er.id = emergency_request_id 
            AND (er.driver_id::text = auth.uid()::text OR er.assigned_provider_id::text = auth.uid()::text)
        )
    );

CREATE POLICY "Users can create tracking updates for related requests" ON tracking_updates
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id::text AND
        EXISTS (
            SELECT 1 FROM emergency_requests er 
            WHERE er.id = emergency_request_id 
            AND (er.driver_id::text = auth.uid()::text OR er.assigned_provider_id::text = auth.uid()::text)
        )
    );

-- Payments policies
CREATE POLICY "Users can view related payments" ON payments
    FOR SELECT USING (
        auth.uid()::text = payer_id::text OR 
        auth.uid()::text = provider_id::text
    );

-- 🔄 Functions for updating timestamps
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

CREATE TRIGGER update_fleet_vehicles_updated_at BEFORE UPDATE ON fleet_vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_requests_updated_at BEFORE UPDATE ON emergency_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 📝 Insert sample data for testing
INSERT INTO users (email, password_hash, full_name, phone, role, business_name, business_address, latitude, longitude, is_verified) VALUES
-- Drivers
('john.driver@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'John Driver', '+91-9876543210', 'driver', NULL, NULL, 9.9252, 78.1198, true),
('mary.driver@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Mary Johnson', '+91-9876543211', 'driver', NULL, NULL, 9.9300, 78.1250, true),

-- Service Providers
('quickfix.auto@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Quick Fix Auto', '+91-9876543212', 'service_provider', 'Quick Fix Auto Services', '123 Main St, Madurai, Tamil Nadu', 9.927, 78.121, true),
('emergency.tow@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Emergency Towing', '+91-9876543213', 'service_provider', 'Emergency Towing Co', '456 Service Rd, Madurai, Tamil Nadu', 9.920, 78.125, true),
('battery.express@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Battery Express', '+91-9876543214', 'service_provider', 'Battery Express Services', '789 Battery Lane, Madurai, Tamil Nadu', 9.935, 78.115, true),

-- Fleet Owners
('fleet.owner@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK', 'Fleet Manager', '+91-9876543215', 'fleet_owner', 'Madurai Transport Co', '100 Fleet Street, Madurai, Tamil Nadu', 9.9252, 78.1198, true);

-- Insert sample services
INSERT INTO services (provider_id, name, category, description, base_price, is_emergency_service) 
SELECT 
    u.id,
    'Engine Repair',
    'mechanical',
    'Complete engine diagnosis and repair services',
    2500.00,
    true
FROM users u WHERE u.email = 'quickfix.auto@example.com';

INSERT INTO services (provider_id, name, category, description, base_price, is_emergency_service) 
SELECT 
    u.id,
    'Emergency Towing',
    'towing',
    '24/7 emergency towing service within 50km radius',
    1500.00,
    true
FROM users u WHERE u.email = 'emergency.tow@example.com';

INSERT INTO services (provider_id, name, category, description, base_price, is_emergency_service) 
SELECT 
    u.id,
    'Battery Replacement',
    'electrical',
    'Car battery testing, replacement and jump start services',
    800.00,
    true
FROM users u WHERE u.email = 'battery.express@example.com';

-- Insert sample fleet vehicles
INSERT INTO fleet_vehicles (fleet_owner_id, make, model, year, license_plate, vehicle_type, status, assigned_driver_id)
SELECT 
    fo.id,
    'Toyota',
    'Camry',
    2022,
    'TN-01-AB-1234',
    'car',
    'active',
    d.id
FROM users fo, users d 
WHERE fo.email = 'fleet.owner@example.com' 
AND d.email = 'john.driver@example.com';

INSERT INTO fleet_vehicles (fleet_owner_id, make, model, year, license_plate, vehicle_type, status)
SELECT 
    fo.id,
    'Honda',
    'Civic',
    2021,
    'TN-01-CD-5678',
    'car',
    'active'
FROM users fo
WHERE fo.email = 'fleet.owner@example.com';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Supabase setup completed successfully!';
    RAISE NOTICE '✅ Created tables: users, fleet_vehicles, services, emergency_requests, reviews, notifications, tracking_updates, payments';
    RAISE NOTICE '✅ Created views: service_providers_view, fleet_dashboard_view';
    RAISE NOTICE '✅ Enabled Row Level Security with proper policies';
    RAISE NOTICE '✅ Added sample data for testing';
    RAISE NOTICE '🚀 Your roadside assistance app is ready to use!';
END $$;