import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Filter, Star, MapPin, Clock, Phone } from 'lucide-react'
import { ServiceProvider } from '../types'
import FilterModal from '../components/FilterModal'

const ServiceProviderList: React.FC = () => {
  const navigate = useNavigate()
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    vehicleType: '',
    serviceType: '',
    minRating: 0,
    maxDistance: 25,
    availability: 'all'
  })

  useEffect(() => {
    loadProviders()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [providers, filters])

  const loadProviders = async () => {
    // Mock data - in real app, this would be an API call
    const mockProviders: ServiceProvider[] = [
      {
        id: '1',
        businessName: 'Quick Fix Auto',
        contactInfo: { phone: '+1-555-0123', email: 'info@quickfix.com' },
        location: { latitude: 40.7128, longitude: -74.0060 },
        services: [
          { id: '1', name: 'Engine Repair', category: 'mechanical' },
          { id: '2', name: 'Brake Service', category: 'mechanical' }
        ],
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
        location: { latitude: 40.7589, longitude: -73.9851 },
        services: [{ id: '3', name: 'Towing Service', category: 'towing' }],
        rating: { average: 4.2, totalReviews: 89 },
        availability: true,
        operatingHours: { open: '24/7', close: '24/7' },
        isVerified: true,
        distance: 0.8,
        estimatedArrival: 10
      },
      {
        id: '3',
        businessName: 'AutoParts Express',
        contactInfo: { phone: '+1-555-0789', email: 'sales@autoparts.com' },
        location: { latitude: 40.7505, longitude: -73.9934 },
        services: [{ id: '4', name: 'Parts Supply', category: 'parts' }],
        rating: { average: 4.7, totalReviews: 203 },
        availability: false,
        operatingHours: { open: '09:00', close: '17:00' },
        isVerified: true,
        distance: 2.1,
        estimatedArrival: 25
      }
    ]
    setProviders(mockProviders)
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...providers]

    if (filters.minRating > 0) {
      filtered = filtered.filter(p => p.rating.average >= filters.minRating)
    }

    if (filters.maxDistance < 25) {
      filtered = filtered.filter(p => (p.distance || 0) <= filters.maxDistance)
    }

    if (filters.availability === 'available') {
      filtered = filtered.filter(p => p.availability)
    }

    if (filters.serviceType) {
      filtered = filtered.filter(p => 
        p.services.some(s => s.category === filters.serviceType)
      )
    }

    // Sort by distance
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    setFilteredProviders(filtered)
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Service Providers</h1>
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Filter</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-white border-b">
        <p className="text-sm text-gray-600">
          {filteredProviders.length} providers found within {filters.maxDistance}km
        </p>
      </div>

      {/* Provider List */}
      <div className="flex-1 overflow-y-auto">
        {filteredProviders.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
              <p className="text-gray-600">Try adjusting your filters or expanding your search radius.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/provider/${provider.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{provider.businessName}</h3>
                      {provider.isVerified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{provider.rating.average}</span>
                        <span>({provider.rating.totalReviews})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{provider.distance}km away</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      provider.availability 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {provider.availability ? 'Available' : 'Busy'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>ETA: {provider.estimatedArrival} min</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCall(provider.contactInfo.phone)
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {provider.services.slice(0, 3).map((service) => (
                    <span
                      key={service.id}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      {service.name}
                    </span>
                  ))}
                  {provider.services.length > 3 && (
                    <span className="text-gray-500 text-xs px-2 py-1">
                      +{provider.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <FilterModal
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}

export default ServiceProviderList