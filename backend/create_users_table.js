// Create users table directly via Supabase client
require('dotenv').config()
const { supabase } = require('./utils/supabaseClient')

async function createUsersTable() {
  console.log('🔧 Creating users table...')
  
  try {
    // Since we can't run DDL directly through the client, let's create a workaround
    // We'll try to insert a test record to see if the table exists, and if not, provide instructions
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Users table does not exist')
      console.log('📋 Please run the following SQL in your Supabase dashboard:')
      console.log('')
      console.log('1. Go to https://supabase.com/dashboard')
      console.log('2. Open your project: klvlswrvzkuetiydrbpi')
      console.log('3. Go to SQL Editor')
      console.log('4. Copy and paste the contents of: backend/database/add_users_table.sql')
      console.log('5. Click Run')
      console.log('')
      console.log('Or copy this SQL:')
      console.log('---')
      console.log(`
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('driver', 'service_provider', 'fleet_owner')),
    password_hash VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    business_address TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    availability BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      `)
      console.log('---')
    } else {
      console.log('✅ Users table already exists!')
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

createUsersTable()