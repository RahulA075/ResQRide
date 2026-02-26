// Test minimal insert
require('dotenv').config()
const { supabase } = require('./utils/supabaseClient')

async function testMinimal() {
  console.log('🧪 Testing minimal insert...')
  
  try {
    // Try with just name (let ID auto-generate)
    const { data, error } = await supabase
      .from('drivers')
      .insert([{ name: 'Test Driver' }])
      .select()
    
    if (error) {
      console.log('❌ Name only failed:', error.message)
    } else {
      console.log('✅ Success with name only!')
      console.log('📊 Returned columns:', Object.keys(data[0]))
      console.log('📋 Full data:', data[0])
      
      // Clean up
      await supabase
        .from('drivers')
        .delete()
        .eq('id', data[0].id)
      
      return
    }
    
    // If name failed, the table might have been created with different schema
    // Let's check if it's using the users table structure instead
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (!userError) {
      console.log('💡 Found users table - might be using different schema')
      console.log('📊 Users table exists and is accessible')
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message)
  }
}

testMinimal()