require('dotenv').config()
const bcrypt = require('bcryptjs')
const { supabase } = require('./utils/supabaseClient')

async function createDemoUsers() {
  console.log('🔧 Creating demo users...')
  
  try {
    // Hash password for demo users
    const hashedPassword = await bcrypt.hash('password', 12)
    
    const demoUsers = [
      {
        full_name: 'John Driver',
        email: 'driver@test.com',
        phone: '+91-9876543210',
        role: 'driver',
        password_hash: hashedPassword,
        is_verified: true,
        is_active: true
      },
      {
        full_name: 'Fleet Manager',
        email: 'fleet@test.com',
        phone: '+91-9876543211',
        role: 'fleet_owner',
        password_hash: hashedPassword,
        business_name: 'Demo Fleet Company',
        business_address: '123 Fleet Street, Madurai',
        is_verified: true,
        is_active: true
      },
      {
        full_name: 'Service Provider',
        email: 'provider@test.com',
        phone: '+91-9876543212',
        role: 'service_provider',
        password_hash: hashedPassword,
        business_name: 'Demo Auto Service',
        business_address: '456 Service Road, Madurai',
        is_verified: true,
        is_active: true
      }
    ]
    
    for (const user of demoUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()
      
      if (existingUser) {
        console.log(`✅ User ${user.email} already exists`)
      } else {
        const { data, error } = await supabase
          .from('users')
          .insert([user])
          .select()
          .single()
        
        if (error) {
          console.log(`❌ Failed to create ${user.email}:`, error.message)
        } else {
          console.log(`✅ Created user: ${user.email} (${user.role})`)
        }
      }
    }
    
    console.log('')
    console.log('🎯 Demo credentials ready:')
    console.log('- driver@test.com / password (Driver)')
    console.log('- fleet@test.com / password (Fleet Owner)')
    console.log('- provider@test.com / password (Service Provider)')
    
  } catch (err) {
    console.error('❌ Error creating demo users:', err.message)
  }
}

createDemoUsers()