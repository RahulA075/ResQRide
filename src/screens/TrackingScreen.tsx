import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, Phone, CheckCircle, Star } from 'lucide-react'
import { ServiceProvider, Coordinates } from '../types'
import GoogleMapComponent from '../components/GoogleMapComponent'

interface ServiceSession {
  id: string
  provider: ServiceProvider
  status: 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed'
  estimatedArrival: Date
  actualArrival?: Date
  serviceStarted?: Date
  serviceCompleted?: Date
  cost: {
    estimated: number
    final?: number
  }
  currentLocation?: Coordinates
}

const TrackingScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<ServiceSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')

  useEffect(() => {
    loadSession()
    // Set up real-time updates
    const interval = setInterval(updateSession, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [sessionId])

  const loadSession = async () => {
    // Mock data - in real app, this would be an API call
    const mockSession: ServiceSession = {
      id: sessionId!,
      provider: {
        id: '1',
        businessName: 'Quick Fix Auto',
        contactInfo: { phone: '+1-555-0123', email: 'info@quickfix.com' },
        location: { latitude: 40.7128, longitude: -74.0060 },
        services: [{ id: '1', name: 'Engine Repair', category: 'mechanical' }],
        rating: { average: 4.5, totalReviews: 127 },
        availability: true,
        operatingHours: { open: '08:00', close: '18:00' },
        isVerified: true,
        distance: 1.2,
        estimatedArrival: 15
      },
      status: 'en_route',
      estimatedArrival: new Date(Date.now() + 12 * 60 * 1000), // 12 minutes from now
      cost: {
        estimated: 12450
      },
      currentLocation: { latitude: 40.7200, longitude: -74.0100 }
    }
    setSession(mockSession)
    setLoading(false)
  }

  const updateSession = async () => {
    // Mock real-time updates
    if (session) {
      // Simulate status progression
      const statuses: ServiceSession['status'][] = ['accepted', 'en_route', 'arrived', 'in_progress', 'completed']
      const currentIndex = statuses.indexOf(session.status)
      if (currentIndex < statuses.length - 1 && Math.random() > 0.7) {
        const newStatus = statuses[currentIndex + 1]
        setSession(prev => prev ? { ...prev, status: newStatus } : null)
        
        if (newStatus === 'completed') {
          setShowRatingModal(true)
        }
      }
    }
  }

  const handleCall = () => {
    if (session) {
      window.location.href = `tel:${session.provider.contactInfo.phone}`
    }
  }

  const submitRating = async () => {
    // In real app, this would submit to API
    console.log('Rating submitted:', { rating, review })
    setShowRatingModal(false)
    // Navigate back or show completion message
  }

  const getStatusInfo = (status: ServiceSession['status']) => {
    switch (status) {
      case 'accepted':
        return {
          title: 'Service Request Accepted',
          description: 'Your service provider has accepted your request and is preparing to come to you.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        }
      case 'en_route':
        return {
          title: 'On the Way',
          description: 'Your service provider is currently traveling to your location.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        }
      case 'arrived':
        return {
          title: 'Arrived',
          description: 'Your service provider has arrived at your location.',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case 'in_progress':
        return {
          title: 'Service in Progress',
          description: 'Your vehicle is currently being serviced.',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        }
      case 'completed':
        return {
          title: 'Service Completed',
          description: 'Your service has been completed successfully.',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      default:
        return {
          title: 'Unknown Status',
          description: '',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        }
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600">Session not found</p>
      </div>
    )
  }

  const statusInfo = getStatusInfo(session.status)

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
          <h1 className="text-lg font-semibold text-gray-900">Service Tracking</h1>
        </div>
      </div>

      {/* Status */}
      <div className={`${statusInfo.bgColor} border-b px-4 py-4`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${statusInfo.color.replace('text-', 'bg-')}`}></div>
          <div>
            <h2 className={`font-semibold ${statusInfo.color}`}>{statusInfo.title}</h2>
            <p className="text-sm text-gray-600">{statusInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Provider Info */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{session.provider.businessName}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{session.provider.rating.average}</span>
              <span>({session.provider.rating.totalReviews})</span>
            </div>
          </div>
          <button
            onClick={handleCall}
            className="flex items-center space-x-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
          >
            <Phone className="h-3 w-3" />
            <span>Call</span>
          </button>
        </div>
      </div>

      {/* ETA */}
      {session.status === 'en_route' && (
        <div className="bg-white border-b p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-primary-500" />
            <h3 className="font-semibold text-gray-900">Estimated Arrival</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {session.estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-gray-600">
            Approximately {Math.ceil((session.estimatedArrival.getTime() - Date.now()) / 60000)} minutes
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white border-b p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Service Timeline</h3>
        <div className="space-y-4">
          {[
            { status: 'accepted', title: 'Request Accepted', time: '2:30 PM' },
            { status: 'en_route', title: 'On the Way', time: session.status === 'accepted' ? null : '2:35 PM' },
            { status: 'arrived', title: 'Arrived', time: session.status === 'accepted' || session.status === 'en_route' ? null : '2:47 PM' },
            { status: 'in_progress', title: 'Service Started', time: ['completed', 'in_progress'].includes(session.status) ? '2:50 PM' : null },
            { status: 'completed', title: 'Service Completed', time: session.status === 'completed' ? '3:25 PM' : null }
          ].map((item, _index) => {
            const isActive = session.status === item.status
            const isCompleted = ['accepted', 'en_route', 'arrived', 'in_progress', 'completed'].indexOf(session.status) > 
                              ['accepted', 'en_route', 'arrived', 'in_progress', 'completed'].indexOf(item.status)
            
            return (
              <div key={item.status} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  isCompleted || isActive 
                    ? 'bg-primary-500 border-primary-500' 
                    : 'border-gray-300'
                }`}>
                  {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isActive ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.title}
                  </p>
                  {item.time && (
                    <p className="text-sm text-gray-600">{item.time}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cost */}
      <div className="bg-white border-b p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Cost Estimate</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Service Cost:</span>
          <span className="text-lg font-bold text-gray-900">
            ₹{(session.cost.final || session.cost.estimated).toLocaleString('en-IN')}
            {!session.cost.final && <span className="text-sm font-normal text-gray-600"> (estimated)</span>}
          </span>
        </div>
      </div>

      {/* Live Tracking Map */}
      <div className="flex-1">
        {session.currentLocation ? (
          <GoogleMapComponent
            center={session.currentLocation}
            providers={[session.provider]}
            onProviderClick={() => {}}
            height="100%"
          />
        ) : (
          <div className="h-full bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Loading tracking map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Service</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">How was your experience?</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="w-full h-full fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave a review (optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={submitRating}
                disabled={rating === 0}
                className="flex-1 bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrackingScreen