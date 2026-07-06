import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Phone, Clock, CheckCircle } from 'lucide-react'
import { ServiceProvider } from '../types'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const ServiceProviderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [requestForm, setRequestForm] = useState({
    description: '',
    serviceType: 'mechanical',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    licensePlate: ''
  })

  useEffect(() => {
    loadProviderDetails()
  }, [id])

  const loadProviderDetails = async () => {
    try {
      const data = await api.get<{ provider: any }>(`/providers/${id}`)
      const p = data.provider
      const mapped: ServiceProvider = {
        id: p.id,
        businessName: p.business_name || p.full_name,
        contactInfo: { phone: p.phone, email: p.email },
        location: { latitude: p.latitude || 0, longitude: p.longitude || 0 },
        services: (p.services || []).map((s: any) => ({ id: s.id, name: s.name, category: s.category })),
        rating: { average: parseFloat(p.average_rating) || 0, totalReviews: p.total_reviews || 0 },
        availability: p.availability,
        operatingHours: { open: '24/7', close: '24/7' },
        isVerified: p.is_verified,
        distance: p.distance || 0,
        estimatedArrival: p.estimatedArrival || 15
      }
      setProvider(mapped)
      setReviews(p.reviews || [])
    } catch (err) {
      console.error('Failed to load provider:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCall = () => {
    if (provider) {
      window.location.href = `tel:${provider.contactInfo.phone}`
    }
  }

  const handleRequestService = () => {
    setShowRequestModal(true)
    setRequestError('')
  }

  const handleSubmitRequest = async () => {
    if (!requestForm.description.trim()) {
      setRequestError('Please describe your issue')
      return
    }
    setSubmitting(true)
    setRequestError('')
    try {
      // Get current location
      const getCoords = (): Promise<GeolocationCoordinates | null> =>
        new Promise(resolve =>
          navigator.geolocation?.getCurrentPosition(
            p => resolve(p.coords),
            () => resolve(null),
            { timeout: 5000 }
          )
        )
      const coords = await getCoords()
      const lat = coords?.latitude ?? provider?.location.latitude ?? 9.9252
      const lng = coords?.longitude ?? provider?.location.longitude ?? 78.1198

      const data = await api.post<{ emergency: { id: string } }>('/emergency/request', {
        location: { latitude: lat, longitude: lng },
        description: requestForm.description,
        serviceType: requestForm.serviceType,
        vehicleInfo: {
          make: requestForm.vehicleMake,
          model: requestForm.vehicleModel,
          year: requestForm.vehicleYear,
          licensePlate: requestForm.licensePlate
        }
      })
      setShowRequestModal(false)
      navigate(`/tracking/${data.emergency.id}`)
    } catch (err: any) {
      setRequestError(err.message || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
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
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet</p>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 5).map((review: any) => (
              <div key={review.id} className="border-b pb-3 last:border-0">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700">"{review.comment}"</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  — {review.reviewer?.full_name || 'Anonymous'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Service Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Service</h3>
            {requestError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                {requestError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={requestForm.serviceType}
                  onChange={e => setRequestForm({ ...requestForm, serviceType: e.target.value })}
                >
                  <option value="mechanical">Mechanical Repair</option>
                  <option value="electrical">Electrical</option>
                  <option value="towing">Towing</option>
                  <option value="parts">Parts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe your issue *
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="What's wrong with your vehicle?"
                  value={requestForm.description}
                  onChange={e => setRequestForm({ ...requestForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Make</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Maruti"
                    value={requestForm.vehicleMake}
                    onChange={e => setRequestForm({ ...requestForm, vehicleMake: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Swift"
                    value={requestForm.vehicleModel}
                    onChange={e => setRequestForm({ ...requestForm, vehicleModel: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={requestForm.vehicleYear}
                    onChange={e => setRequestForm({ ...requestForm, vehicleYear: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. TN01AB1234"
                    value={requestForm.licensePlate}
                    onChange={e => setRequestForm({ ...requestForm, licensePlate: e.target.value })}
                  />
                </div>
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
                onClick={handleSubmitRequest}
                disabled={submitting}
                className="flex-1 bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceProviderDetails