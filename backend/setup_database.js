// Database setup script for Supabase
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Try to connect with current credentials
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

console.log('🚀 Setting up Supabase database...')
console.log('📍 URL:', supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials')
  console.log('Please add your Supabase keys to backend/.env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('🔍 Testing connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('📋 Database tables not found. Need to run SQL setup.')
        console.log('🎯 Next steps:')
        console.log('1. Go to https://supabase.com/dashboard')
        console.log('2. Open your project: klvlswrvzkuetiydrbpi')
        console.log('3. Go to SQL Editor')
        console.log('4. Copy and paste the contents of: backend/database/supabase_setup.sql')
        console.log('5. Run the SQL script')
        return
      } else {
        console.log('❌ Connection error:', error.message)
        if (error.message.includes('Invalid API key')) {
          console.log('🔑 Please get the correct API keys from your Supabase dashboard')
        }
        return
      }
    }
    
    console.log('✅ Database connection successful!')
    console.log('📊 Tables are set up and ready')
    
  } catch (err) {
    console.log('❌ Setup failed:', err.message)
  }
}

setupDatabase()