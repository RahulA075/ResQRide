// Test insert to see actual column requirements
require('dotenv').config()
const { supabase } = require('./utils/supabaseClient')

async function testInsert() {
  console.log('🧪 Testing insert to understand table structure...')
  
  try {
    // Try inserting with just required fields
    const { data, error } = await supabase
      .from('drivers')
      .insert([{
        name: 'Test Driver',
        email: 'test@example.com',
        phone: '+91-9876543220'
      }])
      .select()
    
    if (error) {
      console.log('❌ Insert error:', error.message)
      console.log('📋 This tells us about the expected schema')
      
      // Try with different column names that might exist
      const { data: data2, error: error2 } = await supabase
        .from('drivers')
        .insert([{
          full_name: 'Test Driver',
          email: 'test@example.com', 
          phone: '+91-9876543220'
        }])
        .select()
        
      if (error2) {
        console.log('❌ Second attempt:', error2.message)
      } else {
        console.log('✅ Success with full_name:', data2)
      }
      
    } else {
      console.log('✅ Insert successful:', data)
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message)
  }
}

testInsert()