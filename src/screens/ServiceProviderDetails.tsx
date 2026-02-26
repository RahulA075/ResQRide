import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Phone, Clock, CheckCircle } from 'lucide-react'
import { ServiceProvider } from '../types'

const ServiceProviderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)

  useEffect(() => {
    loadProviderDetails()
  }, [id])

  const loadProviderDetails = async () => {
    // Mock data - in real app, this would be an API call
    const mockProvider: ServiceProvider = {
      id: id!,
      businessName: 'Quick Fix Auto',
      contactInfo: { phone: '+1-555-0123', email: 'info@quickfix.com' },
      location: { latitude: 40.7128, longitude: -74.0060 },
      services: [
        { id: '1', name: 'Engine Repair', category: 'mechanical' },
        { id: '2', name: 'Brake Service', category: 'mechanical' },
        { id: '3', name: 'Oil Change', category: 'mechanical' },
        { id: '4', name: 'Battery Replacement', category: 'electrical' }
      ],
      rating: { average: 4.5, totalReviews: 127 },
      availability: true,
      operatingHours: { open: '08:00', close: '18:00' },
      isVerified: true,
      distance: 1.2,
      estimatedArrival: 15
    }
    setProvider(mockProvider)
    setLoading(false)
  }

  const handleCall = () => {
    if (provider) {
      window.location.href = `tel:${provider.contactInfo.phone}`
    }
  }

  const handleRequestService = () => {
    setShowRequestModal(true)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600">Provider not found</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Service Provider</h1>
        </div>
      </div>

      {/* Provider Info */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-xl font-bold text-gray-900">{provider.businessName}</h2>
              {provider.isVerified && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">{provider.rating.average}</span>
                <span>({provider.rating.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{provider.distance}km away</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Open {provider.operatingHours.open} - {provider.operatingHours.close}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            provider.availability 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {provider.availability ? 'Available' : 'Busy'}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCall}
            className="flex-1 bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Phone className="h-4 w-4" />
            <span>Call Now</span>
          </button>
          <button
            onClick={handleRequestService}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Request Service
          </button>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white border-b p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Services Offered</h3>
        <div className="grid grid-cols-2 gap-2">
          {provider.services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-50 p-3 rounded-lg border"
            >
              <p className="font-medium text-gray-900">{service.name}</p>
              <p className="text-sm text-gray-600 capitalize">{service.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ETA */}
      <div className="bg-white border-b p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Estimated Arrival</h3>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary-500" />
          <span className="text-lg font-medium text-gray-900">{provider.estimatedArrival} minutes</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Based on current location and traffic conditions
        </p>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Reviews</h3>
        <div className="space-y-3">
          {/* Mock reviews */}
          <div className="border-b pb-3">
            <div className="flex items-center space-x-2 mb-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-600">2 days ago</span>
            </div>
            <p className="text-sm text-gray-700">
              "Excellent service! Fixed my engine problem quickly and at a fair price. Highly recommended."
            </p>
            <p className="text-xs text-gray-500 mt-1">- John D.</p>
          </div>
          <div className="border-b pb-3">
            <div className="flex items-center space-x-2 mb-1">
              <div className="flex">
                {[1, 2, 3, 4].map((star) => (
                  <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <Star className="h-4 w-4 text-gray-300" />
              </div>
              <span className="text-sm text-gray-600">1 week ago</span>
            </div>
            <p className="text-sm text-gray-700">
              "Good service, arrived on time. Could have been a bit more thorough with the explanation."
            </p>
            <p className="text-xs text-gray-500 mt-1">- Sarah M.</p>
          </div>
        </div>
        <button className="mt-3 text-primary-500 text-sm font-medium hover:text-primary-600">
          View all reviews
        </button>
      </div>

      {/* Request Service Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Service</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe your issue
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="What's wrong with your vehicle?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency Level
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="low">Low - Can wait</option>
                  <option value="medium">Medium - Soon as possible</option>
                  <option value="high">High - Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRequestModal(false)
                  navigate('/tracking/123')
                }}
                className="flex-1 bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceProviderDetails