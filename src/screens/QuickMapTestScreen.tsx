import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ArrowRight, CheckCircle } from 'lucide-react'

const QuickMapTestScreen: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🗺️ Google Maps Ready!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your API key has been updated. Let's test if your maps are working!
          </p>

          {/* API Key Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">API Key Updated</span>
            </div>
            <code className="text-xs text-gray-500 break-all">
              AIzaSyAt6gdjqf7wZvfzDMMVAd_stw9whZJVwOg
            </code>
          </div>

          {/* Test Button */}
          <button
            onClick={() => navigate('/api-test')}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 mb-4"
          >
            <span>Test Maps Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Other Options */}
          <div className="space-y-2">
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Go to HomePage
            </button>
            <button
              onClick={() => navigate('/maps')}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              View All Tests
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>🎯 Expected: Map loads with Madurai location</p>
          <p>📍 Coordinates: 9.9252, 78.1198</p>
        </div>
      </div>
    </div>
  )
}

export default QuickMapTestScreen