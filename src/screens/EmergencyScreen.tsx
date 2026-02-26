import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, AlertTriangle, Users } from 'lucide-react'
import { Coordinates } from '../types'

const EmergencyScreen: React.FC = () => {
  const navigate = useNavigate()
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null)
  const [sosActivated, setSosActivated] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [emergencyContacts] = useState([
    { name: 'Emergency Services', phone: '911', type: 'emergency' },
    { name: 'John Doe', phone: '+1-555-0123', type: 'personal' },
    { name: 'Jane Smith', phone: '+1-555-0456', type: 'personal' }
  ])

  useEffect(() => {
    getCurrentLocation()
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0 && sosActivated) {
      // SOS activated - send alerts
      sendEmergencyAlerts()
    }
    return () => clearTimeout(timer)
  }, [countdown, sosActivated])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.error('Location error:', error)
        }
      )
    }
  }

  const activateSOS = () => {
    setSosActivated(true)
    setCountdown(5) // 5 second countdown
  }

  const cancelSOS = () => {
    setSosActivated(false)
    setCountdown(0)
  }

  const sendEmergencyAlerts = async () => {
    // In a real app, this would send actual alerts
    console.log('Sending emergency alerts...')
    console.log('Location:', currentLocation)
    
    // Mock API call
    try {
      // await sendSOSAlert(currentLocation, userInfo)
      alert('Emergency alerts sent successfully!')
    } catch (error) {
      console.error('Failed to send emergency alerts:', error)
      alert('Failed to send emergency alerts. Please call manually.')
    }
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="flex-1 flex flex-col bg-emergency-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-emergency-500" />
            <h1 className="text-lg font-semibold text-gray-900">Emergency Assistance</h1>
          </div>
        </div>
      </div>

      {/* SOS Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        {sosActivated ? (
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-emergency-500 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="h-16 w-16 text-white" />
              </div>
              {countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-emergency-500">{countdown}</span>
                  </div>
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {countdown > 0 ? 'SOS Activating...' : 'SOS Activated!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {countdown > 0 
                ? 'Emergency alerts will be sent in ' + countdown + ' seconds'
                : 'Emergency alerts have been sent to your contacts and emergency services'
              }
            </p>

            {countdown > 0 && (
              <button
                onClick={cancelSOS}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel SOS
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-32 h-32 bg-emergency-500 rounded-full flex items-center justify-center mb-4 mx-auto hover:bg-emergency-600 transition-colors cursor-pointer"
                   onClick={activateSOS}>
                <AlertTriangle className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency SOS</h2>
              <p className="text-gray-600 mb-6">
                Tap the button above to send emergency alerts to your contacts and emergency services
              </p>
            </div>

            <button
              onClick={activateSOS}
              className="bg-emergency-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-emergency-600 transition-colors shadow-lg"
            >
              Activate SOS
            </button>
          </div>
        )}
      </div>

      {/* Location Info */}
      {currentLocation && (
        <div className="bg-white border-t px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>
              Location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      <div className="bg-white border-t">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Emergency Contacts</h3>
          </div>
        </div>
        <div className="divide-y">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.phone}</p>
              </div>
              <button
                onClick={() => handleCall(contact.phone)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  contact.type === 'emergency'
                    ? 'bg-emergency-500 text-white hover:bg-emergency-600'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                <Phone className="h-3 w-3" />
                <span>Call</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-amber-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Safety Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Stay in your vehicle if it's safe</li>
              <li>• Turn on hazard lights</li>
              <li>• Move to the shoulder if possible</li>
              <li>• Stay visible to other drivers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyScreen