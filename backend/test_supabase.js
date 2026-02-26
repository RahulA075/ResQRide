// Quick Supabase connection test
require('dotenv').config()
const { supabase } = require('./config/supabase')

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      if (error.message.includes('relation "users" does not exist')) {
        console.log('💡 The database schema hasn\'t been set up yet.')
        console.log('📋 Please run the SQL setup in your Supabase dashboard.')
      }
    } else {
      console.log('✅ Supabase connection successful!')
      console.log('📊 Database is ready for use.')
    }
  } catch (err) {
    console.error('❌ Connection test failed:', err.message)
  }
}

testSupabaseConnection()