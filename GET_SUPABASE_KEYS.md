# 🔑 How to Get Your Supabase Keys

## 📍 **Your Supabase Project**
- **Project URL**: `https://klvlswrvzkuetiydrbpi.supabase.co` ✅
- **Project ID**: `klvlswrvzkuetiydrbpi` ✅

## 🔍 **Step-by-Step Guide**

### 1. **Go to Supabase Dashboard**
1. Visit: https://supabase.com/dashboard
2. Sign in to your account
3. Click on your project: `klvlswrvzkuetiydrbpi`

### 2. **Get API Keys**
1. In your project dashboard, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see two important keys:

#### **Anon Key (Public)**
- **Label**: "anon public"
- **Starts with**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Safe to use**: In frontend applications
- **Copy this entire key**

#### **Service Role Key (Secret)**
- **Label**: "service_role secret"  
- **Starts with**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Keep secret**: Never expose in frontend
- **Copy this entire key**

### 3. **Update Configuration Files**

#### **Backend Configuration** (`backend/.env`)
```env
SUPABASE_URL=https://klvlswrvzkuetiydrbpi.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

#### **Frontend Configuration** (`.env`)
```env
VITE_SUPABASE_URL=https://klvlswrvzkuetiydrbpi.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## 🎯 **What Each Key Does**

### **Anon Key**
- Used for **client-side** operations
- Respects **Row Level Security (RLS)** policies
- Safe to include in frontend code
- Used for user authentication and authorized data access

### **Service Role Key**
- Used for **server-side** operations
- **Bypasses RLS** policies (admin access)
- Must be kept secret on the server
- Used for administrative operations and system tasks

## 🔧 **After Getting Keys**

### 1. **Update Environment Files**
Replace the placeholder keys with your actual keys from Supabase dashboard.

### 2. **Restart Servers**
```bash
# Restart backend
cd backend
npm run dev

# Restart frontend
npm run dev
```

### 3. **Test Connection**
```bash
cd backend
node test_supabase.js
```

### 4. **Set Up Database**
1. Go to **SQL Editor** in Supabase dashboard
2. Copy contents of `backend/database/supabase_setup.sql`
3. Paste and run the SQL script

## 🚨 **Security Notes**

- **Never commit** service role key to version control
- **Only use anon key** in frontend applications
- **Keep service role key** in backend environment variables only
- **Use HTTPS** in production for all API calls

## 📱 **Example Keys Format**

Your keys should look like this:

```env
# Anon Key (starts with eyJ and is very long)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsdmxzd3J2emt1ZXRpeWRyYnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzA0MzE4NzQsImV4cCI6MjA0NjAwNzg3NH0.actual_signature_here

# Service Role Key (also starts with eyJ and is very long)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsdmxzd3J2emt1ZXRpeWRyYnBpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MDQzMTg3NCwiZXhwIjoyMDQ2MDA3ODc0fQ.different_signature_here
```

## ✅ **Verification Checklist**

- [ ] Got anon key from Supabase dashboard
- [ ] Got service role key from Supabase dashboard  
- [ ] Updated `backend/.env` with both keys
- [ ] Updated `.env` with anon key
- [ ] Restarted both servers
- [ ] Ran `node test_supabase.js` successfully
- [ ] Set up database schema in Supabase SQL Editor

Once you have the correct keys, your Supabase integration will work perfectly! 🚀