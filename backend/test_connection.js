// Simple connection test
require('dotenv').config()

const https = require('https')

console.log('🔍 Testing Supabase Project Connection...')
console.log('📍 Project URL:', process.env.SUPABASE_URL)

// Test if we can reach the Supabase REST API
const testUrl = process.env.SUPABASE_URL + '/rest/v1/'

https.get(testUrl, (res) => {
  console.log(`📡 Response Status: ${res.statusCode}`)
  
  if (res.statusCode === 401) {
    console.log('✅ Supabase project is reachable!')
    console.log('🔑 Just need valid API keys to authenticate')
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Get your API keys from Supabase dashboard')
    console.log('2. Update backend/.env with correct keys')
    console.log('3. Run the database setup SQL script')
    console.log('4. Test the full connection')
  } else if (res.statusCode === 200) {
    console.log('✅ Connection successful!')
  } else {
    console.log('⚠️ Unexpected response code')
  }
  
  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    if (data.includes('supabase')) {
      console.log('✅ This is definitely a Supabase project')
    }
  })
  
}).on('error', (err) => {
  console.log('❌ Cannot reach Supabase:', err.message)
  console.log('🔍 Check if the project URL is correct')
})

// Also test the auth endpoint
setTimeout(() => {
  const authUrl = process.env.SUPABASE_URL + '/auth/v1/settings'
  
  https.get(authUrl, (res) => {
    console.log(`🔐 Auth endpoint status: ${res.statusCode}`)
    if (res.statusCode === 200) {
      console.log('✅ Authentication service is available')
    }
  }).on('error', () => {
    console.log('⚠️ Auth endpoint not reachable')
  })
}, 1000)