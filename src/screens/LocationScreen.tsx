import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, AlertTriangle, LogOut } from 'lucide-react'
import { Coordinates, ServiceProvider } from '../types'
import DriverMapComponent from '../components/DriverMapComponent'
import LocationPermissionModal from '../components/LocationPermissionModal'
import SOSButton from '../components/SOSButton'
import { useAuth } from '../contexts/AuthContext'

const LocationScreen: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null)
  const [nearbyProviders, setNearbyProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        setCurrentLocation(coords)
        findNearbyProviders(coords)
        setLoading(false)
      },
      (error) => {
        console.error('Location error:', error)
        setLocationError('Unable to get your location. Please enable location services.')
        setShowPermissionModal(true)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 300000
      }
    )
  }

  const findNearbyProviders = async (location: Coordinates) => {
    // Mock data - in real app, this would be an API call
    const mockProviders: ServiceProvider[] = [
      {
        id: '1',
        businessName: 'Quick Fix Auto',
        contactInfo: { phone: '+1-555-0123', email: 'info@quickfix.com' },
        location: { latitude: location.latitude + 0.01, longitude: location.longitude + 0.01 },
        services: [{ id: '1', name: 'Engine Repair', category: 'mechanical' }],
        rating: { average: 4.5, totalReviews: 127 },
        availability: true,
        operatingHours: { open: '08:00', close: '18:00' },
        isVerified: true,
        distance: 1.2,
        estimatedArrival: 15
      },
      {
        id: '2',
        businessName: 'Emergency Towing Co',
        contactInfo: { phone: '+1-555-0456', email: 'help@emergencytow.com' },
        location: { latitude: location.latitude - 0.005, longitude: location.longitude + 0.015 },
        services: [{ id: '2', name: 'Towing Service', category: 'towing' }],
        rating: { average: 4.2, totalReviews: 89 },
        availability: true,
        operatingHours: { open: '24/7', close: '24/7' },
        isVerified: true,
        distance: 0.8,
        estimatedArrival: 10
      },
      {
        id: '3',
        businessName: 'Battery Express',
        contactInfo: { phone: '+1-555-0789', email: 'help@batteryexpress.com' },
        location: { latitude: location.latitude + 0.008, longitude: location.longitude - 0.012 },
        services: [{ id: '3', name: 'Battery Replacement', category: 'electrical' }],
        rating: { average: 4.7, totalReviews: 156 },
        availability: false,
        operatingHours: { open: '09:00', close: '17:00' },
        isVerified: true,
        distance: 1.5,
        estimatedArrival: 20
      }
    ]
    setNearbyProviders(mockProviders)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleManualLocation = (coords: Coordinates) => {
    setCurrentLocation(coords)
    findNearbyProviders(coords)
    setShowPermissionModal(false)
    setLocationError(null)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Detecting your location...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with Legend and Logout */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Legend */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Busy</span>
              </div>
            </div>
          </div>

          {/* Right: User info, Find Help, and Logout */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              Welcome, {user?.full_name}
            </span>
            <button
              onClick={() => navigate('/providers')}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Find Help Nearby
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <span>Logout</span>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {locationError && (
          <div className="mt-2 flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{locationError}</span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div className="h-full p-4">
          <div className="h-full bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Map Header */}
            <div className="bg-gray-50 border-b px-4 py-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Find Nearby Service Providers</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {currentLocation 
                      ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                      : 'Detecting location...'
                    }
                  </span>
                </div>
              </div>
            </div>
            
            {/* Map Content */}
            <div className="h-full">
              {currentLocation ? (
                <DriverMapComponent
                  center={currentLocation}
                  providers={nearbyProviders}
                  onProviderClick={(provider) => navigate(`/provider/${provider.id}`)}
                />
              ) : (
                <div className="h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Location not available</p>
                    <button
                      onClick={getCurrentLocation}
                      className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600 transition-colors"
                    >
                      Retry Location Detection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating SOS Button */}
        <div className="absolute top-4 right-4 z-20">
          <SOSButton currentLocation={currentLocation} size="large" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-t px-4 py-3">
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/providers')}
            className="flex-1 bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>Find Mechanics</span>
          </button>
          <button
            onClick={() => navigate('/parts')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Find Parts
          </button>
        </div>
      </div>

      {/* Location Permission Modal */}
      {showPermissionModal && (
        <LocationPermissionModal
          onLocationSelected={handleManualLocation}
          onClose={() => setShowPermissionModal(false)}
        />
      )}
    </div>
  )
}

export default LocationScreen