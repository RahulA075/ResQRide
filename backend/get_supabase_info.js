// Script to help get correct Supabase configuration
require('dotenv').config()

console.log('🔍 Current Supabase Configuration:')
console.log('📍 Project URL:', process.env.SUPABASE_URL)
console.log('🔑 Anon Key (first 50 chars):', process.env.SUPABASE_ANON_KEY?.substring(0, 50) + '...')
console.log('🔐 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set')

console.log('\n📋 To get your correct Supabase keys:')
console.log('1. Go to: https://supabase.com/dashboard')
console.log('2. Open your project: klvlswrvzkuetiydrbpi')
console.log('3. Go to Settings → API')
console.log('4. Copy the "anon public" key (starts with eyJhbGciOi...)')
console.log('5. Copy the "service_role secret" key (starts with eyJhbGciOi...)')

console.log('\n🎯 Your project URL is correct: https://klvlswrvzkuetiydrbpi.supabase.co')
console.log('✅ Just need the correct API keys from your dashboard!')

// Test if we can at least reach the Supabase URL
const https = require('https')
const url = new URL(process.env.SUPABASE_URL + '/rest/v1/')

console.log('\n🌐 Testing if Supabase URL is reachable...')
const req = https.get(url, (res) => {
  if (res.statusCode === 401) {
    console.log('✅ Supabase URL is reachable (got 401 - expected without proper auth)')
  } else {
    console.log(`📡 Got response code: ${res.statusCode}`)
  }
}).on('error', (err) => {
  console.log('❌ Cannot reach Supabase URL:', err.message)
})

setTimeout(() => {
  req.destroy()
}, 5000)