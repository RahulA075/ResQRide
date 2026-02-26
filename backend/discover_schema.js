// Discover actual table schema
require('dotenv').config()
const { supabase } = require('./utils/supabaseClient')

async function discoverSchema() {
  console.log('🔍 Discovering actual table schema...')
  
  try {
    // Try to get schema information using Supabase's built-in functions
    const { data, error } = await supabase
      .rpc('get_schema_info')
    
    if (error) {
      console.log('❌ RPC not available, trying alternative method...')
      
      // Try inserting with common column names to see what works
      const commonColumns = [
        { id: 'test-id', name: 'Test' },
        { id: 'test-id', full_name: 'Test' },
        { id: 'test-id', driver_name: 'Test' },
        { id: 'test-id', email: 'test@test.com' },
        { id: 'test-id', phone: '+91-1234567890' }
      ]
      
      for (const testData of commonColumns) {
        const { data: insertData, error: insertError } = await supabase
          .from('drivers')
          .insert([testData])
          .select()
        
        if (!insertError) {
          console.log('✅ Successful insert with:', Object.keys(testData))
          console.log('📊 Returned data:', insertData)
          
          // Clean up test data
          if (insertData && insertData[0]) {
            await supabase
              .from('drivers')
              .delete()
              .eq('id', insertData[0].id)
          }
          break
        } else {
          console.log(`❌ Failed with ${Object.keys(testData).join(', ')}:`, insertError.message)
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Discovery failed:', err.message)
  }
}

discoverSchema()