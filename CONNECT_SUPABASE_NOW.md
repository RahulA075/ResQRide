# 🚀 Connect Supabase - Step by Step

## ✅ Current Status
- **Project URL**: `https://klvlswrvzkuetiydrbpi.supabase.co` ✅ Working
- **Connection**: URL is reachable ✅
- **Issue**: Need correct API keys from dashboard

## 🔧 Step 1: Get Your API Keys

### Go to Supabase Dashboard
1. **Visit**: https://supabase.com/dashboard
2. **Sign in** to your account
3. **Click on your project**: `klvlswrvzkuetiydrbpi`

### Get API Keys
1. In the left sidebar, click **Settings** (gear icon)
2. Click **API** in the settings menu
3. You'll see two keys:

#### **Copy the Anon Key**
- Look for **"anon public"** 
- It's a long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Copy the entire key**

#### **Copy the Service Role Key**
- Look for **"service_role secret"**
- Also starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Copy the entire key**

## 🔧 Step 2: Update Configuration

### Backend Configuration
Edit `backend/.env` and replace these lines:

```env
SUPABASE_ANON_KEY=your_copied_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_copied_service_role_key_here
```

### Frontend Configuration  
Edit `.env` and replace this line:

```env
VITE_SUPABASE_ANON_KEY=your_copied_anon_key_here
```

## 🔧 Step 3: Set Up Database

### Run SQL Setup
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. **Copy and paste** the entire contents of `backend/database/supabase_setup.sql`
4. Click **Run** to execute

This will create:
- All database tables (users, fleet_vehicles, emergency_requests, etc.)
- Row Level Security policies
- Sample data for testing

## 🔧 Step 4: Test Connection

### Restart Servers
```bash
# Restart backend
cd backend
npm run dev

# Test connection
node setup_database.js
```

### Test API
```bash
# Test health endpoint
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

## 🎯 What You'll Get

### ✅ **Working Features**
- **User Registration & Login** with real database
- **Role-based Authentication** (Driver, Service Provider, Fleet Owner)
- **Real-time Maps** with location tracking
- **Emergency Request System** with provider matching
- **Fleet Management** with vehicle assignment
- **Review & Rating System**
- **Real-time Notifications**

### ✅ **Sample Data**
After running the SQL setup, you'll have:
- **3 Sample Drivers** ready to test
- **3 Service Providers** with different specialties
- **1 Fleet Owner** with sample vehicles
- **Various Services** (mechanical, towing, electrical)

## 🚨 Quick Fix

If you want to test immediately, I can help you create a temporary setup. But for the full experience, you'll need the real API keys from your Supabase dashboard.

## 📞 Need Help?

If you're having trouble finding the keys:
1. Make sure you're signed into the correct Supabase account
2. Ensure you have access to the project `klvlswrvzkuetiydrbpi`
3. The keys are in **Settings → API** (not in the main dashboard)

Once you have the keys, the entire app will work perfectly with real-time features! 🚗✨