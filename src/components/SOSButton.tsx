import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Coordinates } from '../types'

interface SOSButtonProps {
  className?: string
  size?: 'small' | 'large'
  currentLocation?: Coordinates | null
}

const SOSButton: React.FC<SOSButtonProps> = ({ 
  className = '', 
  size = 'small',
  currentLocation 
}) => {
  const { user } = useAuth()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSOSClick = () => {
    setShowConfirmation(true)
  }

  const confirmSOS = async () => {
    setSending(true)
    
    try {
      // Send SOS alert to nearby mechanics
      await sendSOSAlert({
        userId: user?.id || '',
        userInfo: {
          name: user?.fullName || '',
          phone: user?.phone || '',
          email: user?.email || ''
        },
        location: currentLocation || { latitude: 0, longitude: 0 },
        timestamp: new Date()
      })
      
      setShowConfirmation(false)
      alert('SOS alert sent successfully! Help is on the way.')
    } catch (error) {
      console.error('Failed to send SOS alert:', error)
      alert('Failed to send SOS alert. Please try calling emergency services directly.')
    } finally {
      setSending(false)
    }
  }

  const cancelSOS = () => {
    setShowConfirmation(false)
  }

  const buttonSize = size === 'large' ? 'w-16 h-16' : 'w-10 h-10'
  const iconSize = size === 'large' ? 'h-8 w-8' : 'h-5 w-5'

  return (
    <>
      <button
        onClick={handleSOSClick}
        className={`${buttonSize} bg-emergency-500 hover:bg-emergency-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center ${className}`}
        title="Emergency SOS"
      >
        <AlertTriangle className={`${iconSize} animate-pulse`} />
      </button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-emergency-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-emergency-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Send Emergency Alert?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                This will immediately notify nearby verified mechanics and emergency contacts of your location and situation.
              </p>
              
              {currentLocation && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4 text-left">
                  <p className="text-xs text-gray-600 mb-1">Your location will be shared:</p>
                  <p className="text-sm font-mono text-gray-800">
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={cancelSOS}
                  disabled={sending}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSOS}
                  disabled={sending}
                  className="flex-1 bg-emergency-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-emergency-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Send SOS'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Mock SOS alert function - replace with actual API call
const sendSOSAlert = async (alertData: {
  userId: string
  userInfo: {
    name: string
    phone: string
    email: string
  }
  location: Coordinates
  timestamp: Date
}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  console.log('SOS Alert sent:', alertData)
  
  // In a real implementation, this would:
  // 1. Send location and user info to nearby verified mechanics
  // 2. Notify emergency contacts via SMS/call
  // 3. Log the emergency in the database
  // 4. Potentially contact emergency services based on severity
}

export default SOSButton