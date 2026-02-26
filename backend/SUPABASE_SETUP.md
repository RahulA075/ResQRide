# Supabase Setup Guide

## 🔑 Current Configuration Status

✅ **Publishable Key**: `sb_publishable_B0Z5KMYcUVW4SqD5Xedvng_UkfzglAm`
❌ **Project URL**: Missing
❌ **Service Role Key**: Missing

## 📋 Steps to Complete Setup

### 1. Find Your Supabase Project URL

1. Go to [supabase.com](https://supabase.com) and sign in
2. Open your project dashboard
3. Go to **Settings** → **API**
4. Copy your **Project URL** (looks like: `https://abcdefghijk.supabase.co`)

### 2. Get Your Service Role Key

1. In the same **Settings** → **API** page
2. Find the **Service Role Key** (starts with `eyJ...`)
3. **⚠️ IMPORTANT**: This is a secret key - never share it publicly!

### 3. Update Backend Configuration

Update `backend/.env` with your actual values:

```env
SUPABASE_URL=https://your-actual-project-id.supabase.co
SUPABASE_ANON_KEY=sb_publishable_B0Z5KMYcUVW4SqD5Xedvng_UkfzglAm
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `backend/database/schema.sql`
4. Click **Run** to create all tables and policies

### 5. Test the Connection

After updating the configuration:

```bash
# Restart the backend server
cd backend
npm run dev

# Test the health endpoint
curl http://localhost:3001/health

# Test user registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "phone": "+91-9876543210",
    "role": "driver"
  }'
```

## 🔍 How to Find Your Supabase Info

### Method 1: Supabase Dashboard
1. **Login** to [supabase.com](https://supabase.com)
2. **Select your project**
3. **Settings** → **API**
4. Copy **Project URL** and **Service Role Key**

### Method 2: Project Settings
1. In your project dashboard
2. **Settings** → **General**
3. **Project URL** is shown in the **Configuration** section

## 🚨 Security Notes

- **Never commit** the service role key to version control
- **Use environment variables** for all sensitive data
- **The service role key** bypasses Row Level Security - use carefully
- **The publishable key** is safe to use in frontend applications

## 📝 Example Configuration

Once you have all the values, your `backend/.env` should look like:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_ANON_KEY=sb_publishable_B0Z5KMYcUVW4SqD5Xedvng_UkfzglAm
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYzNjU0ODAwMCwiZXhwIjoxOTUyMTI0MDAwfQ.signature

# JWT Configuration
JWT_SECRET=roadside_assistance_super_secret_key_2024
JWT_EXPIRES_IN=7d

# Google Maps API
GOOGLE_MAPS_API_KEY=AIzaSyAt6gdjqf7wZvfzDMMVAd_stw9whZJVwOg

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## ✅ Verification Checklist

- [ ] Project URL obtained from Supabase dashboard
- [ ] Service Role Key copied (starts with `eyJ`)
- [ ] Backend `.env` file updated
- [ ] Database schema executed in Supabase SQL Editor
- [ ] Backend server restarted
- [ ] Health check endpoint working
- [ ] User registration test successful

## 🆘 Troubleshooting

### "Invalid API key" Error
- Check that SUPABASE_URL and keys are correct
- Ensure no extra spaces in the .env file
- Verify the project is active in Supabase

### "Connection refused" Error
- Check if Supabase project is paused
- Verify network connectivity
- Ensure API keys haven't expired

### "Table doesn't exist" Error
- Run the database schema in Supabase SQL Editor
- Check if all tables were created successfully
- Verify Row Level Security policies are enabled

Need help? Share your Project URL (it's safe to share) and I'll help you complete the setup!