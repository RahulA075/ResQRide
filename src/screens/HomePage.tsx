import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MapComponent from '../components/MapComponent'
import WelcomeHeader from '../components/WelcomeHeader'
import SimpleBottomNav from '../components/SimpleBottomNav'
import { INDIAN_CITIES } from '../utils/maps'
import { ServiceProvider, Coordinates } from '../types'
import { useAuth } from '../contexts/AuthContext'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [center] = useState<Coordinates>(INDIAN_CITIES.MADURAI)
  const [providers, setProviders] = useState<ServiceProvider[]>([])

  useEffect(() => {
    // Load mock providers around Madurai
    const mockProviders: ServiceProvider[] = [
      {
        id: '1',
        businessName: 'Madurai Auto Works',
        contactInfo: { phone: '+91-9876543210', email: 'info@maduraiauto.com' },
        location: { latitude: 9.927, longitude: 78.121 },
        services: [
          { id: '1', name: 'Engine Repair', category: 'mechanical' },
          { id: '2', name: 'Brake Service', category: 'mechanical' }
        ],
        rating: { average: 4.6, totalReviews: 50 },
        availability: true,
        operatingHours: { open: '08:00', close: '18:00' },
        isVerified: true,
        distance: 2.1,
        estimatedArrival: 10
      },
      {
        id: '2',
        businessName: 'Sakthi Mechanics',
        contactInfo: { phone: '+91-9876543211', email: 'help@sakthi.com' },
        location: { latitude: 9.929, longitude: 78.118 },
        services: [
          { id: '3', name: 'Electrical Repair', category: 'electrical' },
          { id: '4', name: 'AC Service', category: 'mechanical' }
        ],
        rating: { average: 4.1, totalReviews: 31 },
        availability: false,
        operatingHours: { open: '09:00', close: '17:00' },
        isVerified: true,
        distance: 1.3,
        estimatedArrival: 7
      },
      {
        id: '3',
        businessName: 'Emergency Towing Madurai',
        contactInfo: { phone: '+91-9876543212', email: 'emergency@towing.com' },
        location: { latitude: 9.920, longitude: 78.125 },
        services: [
          { id: '5', name: 'Towing Service', category: 'towing' }
        ],
        rating: { average: 4.8, totalReviews: 89 },
        availability: true,
        operatingHours: { open: '24/7', close: '24/7' },
        isVerified: true,
        distance: 3.2,
        estimatedArrival: 15
      }
    ]
    setProviders(mockProviders)
  }, [])

  const handleProviderClick = (provider: ServiceProvider) => {
    console.log('Provider clicked:', provider.businessName)
    // Navigate to provider details
    navigate(`/provider/${provider.id}`)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Welcome Header */}
      <WelcomeHeader />
      
      {/* Map takes the remaining space */}
      <div className="flex-1 relative">
        <MapComponent
          center={center}
          providers={providers}
          onProviderClick={handleProviderClick}
          onLogout={handleLogout}
        />
      </div>

      {/* Bottom Navigation Dashboard */}
      <SimpleBottomNav />
    </div>
  )
}

export default HomePage