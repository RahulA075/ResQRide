import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import MapComponent from '../components/MapComponent'
import MapDebugComponent from '../components/MapDebugComponent'
import { INDIAN_CITIES } from '../utils/maps'

const BasicMapTestScreen: React.FC = () => {
  const navigate = useNavigate()

  // Mock data for testing
  const mockProviders = [
    {
      id: '1',
      businessName: 'Quick Fix Auto',
      contactInfo: { phone: '+91-9876543210', email: 'info@quickfix.com' },
      location: { 
        latitude: INDIAN_CITIES.MADURAI.latitude + 0.01, 
        longitude: INDIAN_CITIES.MADURAI.longitude + 0.01 
      },
      services: [{ id: '1', name: 'Engine Repair', category: 'mechanical' as const }],
      rating: { average: 4.5, totalReviews: 127 },
      availability: true,
      operatingHours: { open: '08:00', close: '18:00' },
      isVerified: true,
      distance: 1.2,
      estimatedArrival: 15
    },
    {
      id: '2',
      businessName: 'Emergency Towing',
      contactInfo: { phone: '+91-9876543211', email: 'help@towing.com' },
      location: { 
        latitude: INDIAN_CITIES.MADURAI.latitude - 0.005, 
        longitude: INDIAN_CITIES.MADURAI.longitude + 0.015 
      },
      services: [{ id: '2', name: 'Towing Service', category: 'towing' as const }],
      rating: { average: 4.2, totalReviews: 89 },
      availability: false,
      operatingHours: { open: '24/7', close: '24/7' },
      isVerified: true,
      distance: 0.8,
      estimatedArrival: 10
    }
  ]

  const handleProviderClick = (provider: any) => {
    alert(`Clicked on: ${provider.businessName}`)
  }

  const handleLogout = () => {
    alert('Logout clicked')
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3 z-30 relative">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Basic Map Test</h1>
        </div>
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-gray-50">
        <MapDebugComponent />
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapComponent
          center={INDIAN_CITIES.MADURAI}
          providers={mockProviders}
          onProviderClick={handleProviderClick}
          onLogout={handleLogout}
        />
      </div>
    </div>
  )
}

export default BasicMapTestScreen