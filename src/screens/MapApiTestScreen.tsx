import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import TestMapComponent from '../components/TestMapComponent'

const MapApiTestScreen: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Google Maps API Test</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900">API Key Updated!</h3>
              <p className="text-sm text-green-800 mt-1">
                Your Google Maps API key has been updated to: <code>AIzaSyAt6gdjqf7wZvfzDMMVAd_stw9whZJVwOg</code>
              </p>
            </div>
          </div>
        </div>

        {/* API Key Info */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">API Configuration</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">API Key:</span>
              <span className="ml-2 font-mono text-xs">AIzaSyAt6gdjqf7wZvfzDMMVAd_stw9whZJVwOg</span>
            </div>
            <div>
              <span className="font-medium">Region:</span>
              <span className="ml-2">India (IN)</span>
            </div>
            <div>
              <span className="font-medium">Language:</span>
              <span className="ml-2">English (en)</span>
            </div>
            <div>
              <span className="font-medium">Libraries:</span>
              <span className="ml-2">places</span>
            </div>
          </div>
        </div>

        {/* Map Test */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Map Test</h2>
          <TestMapComponent />
        </div>

        {/* Next Steps */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">🚀 Next Steps:</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>If the map loads successfully above:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Visit <code>/home</code> to see your complete MapComponent</li>
              <li>Visit <code>/map-demo</code> for the interactive city demo</li>
              <li>Visit <code>/find-help</code> for the full location screen</li>
            </ul>
            <p className="mt-3">
              <strong>All your maps should now work perfectly! 🎉</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapApiTestScreen