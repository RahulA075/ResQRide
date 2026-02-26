import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string
          role: 'driver' | 'service_provider' | 'fleet_owner'
          business_name?: string
          business_address?: string
          latitude?: number
          longitude?: number
          current_latitude?: number
          current_longitude?: number
          availability: boolean
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
          last_login?: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          phone: string
          role: 'driver' | 'service_provider' | 'fleet_owner'
          business_name?: string
          business_address?: string
          latitude?: number
          longitude?: number
          availability?: boolean
          is_verified?: boolean
          is_active?: boolean
        }
        Update: {
          full_name?: string
          phone?: string
          business_name?: string
          business_address?: string
          latitude?: number
          longitude?: number
          current_latitude?: number
          current_longitude?: number
          availability?: boolean
          last_login?: string
        }
      }
      fleet_vehicles: {
        Row: {
          id: string
          fleet_owner_id: string
          assigned_driver_id?: string
          make: string
          model: string
          year: number
          license_plate: string
          vin?: string
          color?: string
          vehicle_type: string
          fuel_type: string
          status: 'active' | 'maintenance' | 'inactive' | 'accident'
          mileage: number
          current_latitude?: number
          current_longitude?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          fleet_owner_id: string
          assigned_driver_id?: string
          make: string
          model: string
          year: number
          license_plate: string
          vin?: string
          color?: string
          vehicle_type?: string
          fuel_type?: string
          status?: string
          mileage?: number
        }
        Update: {
          assigned_driver_id?: string
          status?: string
          mileage?: number
          current_latitude?: number
          current_longitude?: number
        }
      }
      emergency_requests: {
        Row: {
          id: string
          driver_id: string
          vehicle_id?: string
          assigned_provider_id?: string
          latitude: number
          longitude: number
          address?: string
          title: string
          description: string
          service_type: string
          priority: string
          status: string
          estimated_arrival?: number
          estimated_cost?: number
          final_cost?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          driver_id: string
          vehicle_id?: string
          latitude: number
          longitude: number
          address?: string
          title: string
          description: string
          service_type: string
          priority?: string
        }
        Update: {
          assigned_provider_id?: string
          status?: string
          estimated_arrival?: number
          estimated_cost?: number
          final_cost?: number
        }
      }
    }
  }
}

// Real-time subscriptions
export const subscribeToEmergencyRequests = (callback: (payload: any) => void) => {
  return supabase
    .channel('emergency_requests')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'emergency_requests' }, 
      callback
    )
    .subscribe()
}

export const subscribeToNotifications = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, 
      callback
    )
    .subscribe()
}

export const subscribeToTrackingUpdates = (requestId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`tracking:${requestId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'tracking_updates',
        filter: `emergency_request_id=eq.${requestId}`
      }, 
      callback
    )
    .subscribe()
}