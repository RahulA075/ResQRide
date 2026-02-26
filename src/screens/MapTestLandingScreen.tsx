import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Navigation, Wrench } from 'lucide-react'

const MapTestLandingScreen: React.FC = () => {
  const navigate = useNavigate()

  const mapTests = [
    {
      title: '🎯 API Test',
      description: 'Test your Google Maps API key with guaranteed working example',
      path: '/api-test',
      icon: MapPin,
      color: 'bg-green-500'
    },
    {
      title: '🐛 Debug Maps',
      description: 'Debug Google Maps API loading and test different approaches',
      path: '/debug-maps',
      icon: MapPin,
      color: 'bg-red-500'
    },
    {
      title: 'Basic Map Test',
      description: 'Test the basic MapComponent with providers and user location',
      path: '/map-test',
      icon: MapPin,
      color: 'bg-blue-500'
    },
    {
      title: 'Map Demo',
      description: 'Interactive demo with Indian cities using SimpleMapComponent',
      path: '/map-demo',
      icon: Navigation,
      color: 'bg-green-500'
    },
    {
      title: 'HomePage with Map',
      description: 'Complete homepage with MapComponent and provider data',
      path: '/home',
      icon: Wrench,
      color: 'bg-purple-500'
    },
    {
      title: 'Location Screen',
      description: 'Full location screen with Google Maps integration (requires login)',
      path: '/find-help',
      icon: Wrench,
      color: 'bg-indigo-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗺️ Google Maps Test Center
          </h1>
          <p className="text-gray-600">
            Test different map implementations and configurations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {mapTests.map((test) => {
            const Icon = test.icon
            return (
              <div
                key={test.path}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(test.path)}
              >
                <div className={`w-12 h-12 ${test.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {test.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {test.description}
                </p>
                <button className="text-primary-500 text-sm font-medium hover:text-primary-600">
                  Open Test →
                </button>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔧 Troubleshooting Guide
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900">Map not showing?</h3>
              <ul className="mt-1 text-gray-600 space-y-1">
                <li>• Check if your Google Maps API key is valid</li>
                <li>• Ensure the API key has Maps JavaScript API enabled</li>
                <li>• Verify the API key is correctly set in .env file</li>
                <li>• Check browser console for any error messages</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Places autocomplete not working?</h3>
              <ul className="mt-1 text-gray-600 space-y-1">
                <li>• Enable Places API in Google Cloud Console</li>
                <li>• Ensure libraries=places is loaded</li>
                <li>• Check if API key has Places API permissions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Current API Configuration:</h3>
              <ul className="mt-1 text-gray-600 space-y-1">
                <li>• Region: {import.meta.env.VITE_GOOGLE_MAPS_REGION || 'IN'}</li>
                <li>• Language: {import.meta.env.VITE_GOOGLE_MAPS_LANGUAGE || 'en'}</li>
                <li>• API Key: {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Missing'}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-500 text-sm hover:text-gray-700"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default MapTestLandingScreen