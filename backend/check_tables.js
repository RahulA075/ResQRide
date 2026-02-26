// Check actual table structure in Supabase
require('dotenv').config()
const { supabase } = require('./utils/supabaseClient')

async function checkTables() {
  console.log('🔍 Checking database table structure...')
  
  try {
    // Try to get table info by attempting to insert with minimal data
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error accessing drivers table:', error.message)
      
      // Try to check what tables exist
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_columns', { table_name: 'drivers' })
      
      if (tablesError) {
        console.log('💡 Let\'s try a different approach...')
        
        // Try inserting a minimal record to see what columns are expected
        const { data: insertData, error: insertError } = await supabase
          .from('drivers')
          .insert([{ name: 'Test' }])
          .select()
        
        if (insertError) {
          console.log('📋 Insert error reveals expected columns:', insertError.message)
        }
      }
    } else {
      console.log('✅ Drivers table accessible')
      console.log('📊 Sample data:', data)
    }
    
    // Check other tables
    const tables = ['fleet_owners', 'service_requests', 'vehicles']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}:`, error.message)
      } else {
        console.log(`✅ ${table}: accessible`)
      }
    }
    
  } catch (err) {
    console.error('❌ Check failed:', err.message)
  }
}

checkTables()