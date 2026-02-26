import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import SimpleGoogleMapTest from '../components/SimpleGoogleMapTest'
import WorkingMapExample from '../components/WorkingMapExample'
import ApiKeyTester from '../components/ApiKeyTester'

const GoogleMapDebugScreen: React.FC = () => {
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
          <h1 className="text-lg font-semibold text-gray-900">Google Maps Debug</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* API Key Test */}
        <ApiKeyTester />

        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Environment Configuration</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">API Key:</span>
              <span className="ml-2">
                {import.meta.env.VITE_GOOGLE_MAPS_API_KEY 
                  ? `${import.meta.env.VITE_GOOGLE_MAPS_API_KEY.substring(0, 10)}...` 
                  : '❌ Not set'
                }
              </span>
            </div>
            <div>
              <span className="font-medium">Region:</span>
              <span className="ml-2">{import.meta.env.VITE_GOOGLE_MAPS_REGION || 'IN'}</span>
            </div>
            <div>
              <span className="font-medium">Language:</span>
              <span className="ml-2">{import.meta.env.VITE_GOOGLE_MAPS_LANGUAGE || 'en'}</span>
            </div>
            <div>
              <span className="font-medium">Google Object:</span>
              <span className="ml-2">{window.google ? '✅ Available' : '❌ Not loaded'}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Troubleshooting Steps</h3>
              <ol className="mt-2 text-sm text-blue-800 space-y-1">
                <li>1. Check if your API key is valid in Google Cloud Console</li>
                <li>2. Enable "Maps JavaScript API" in Google Cloud Console</li>
                <li>3. Enable "Places API" if using autocomplete features</li>
                <li>4. Check API key restrictions (HTTP referrers, IP addresses)</li>
                <li>5. Verify billing is enabled for your Google Cloud project</li>
                <li>6. Check browser console for detailed error messages</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Map Test */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Google Maps Test</h2>
          <SimpleGoogleMapTest />
        </div>

        {/* Working Example */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Alternative Loading Method</h2>
          <WorkingMapExample />
        </div>

        {/* Console Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-2">Check Browser Console</h3>
          <p className="text-sm text-yellow-800">
            Open your browser's developer tools (F12) and check the Console tab for detailed error messages.
            Common errors include:
          </p>
          <ul className="mt-2 text-sm text-yellow-800 space-y-1">
            <li>• "InvalidKeyMapError" - Invalid API key</li>
            <li>• "RefererNotAllowedMapError" - Domain not allowed</li>
            <li>• "ApiNotActivatedMapError" - API not enabled</li>
            <li>• "BillingNotEnabledMapError" - Billing not enabled</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default GoogleMapDebugScreen