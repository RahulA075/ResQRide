require('dotenv').config()
const { supabase } = require('./utils/supabaseClient')

async function checkUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email, role, full_name')
      .limit(10)
    
    if (error) {
      console.log('❌ Error:', error.message)
    } else {
      console.log('📧 Available users:')
      data.forEach(u => console.log(`- ${u.email} (${u.role}) - ${u.full_name}`))
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

checkUsers()