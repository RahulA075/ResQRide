import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, ArrowRight } from 'lucide-react'

const RedirectTestScreen: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/home')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome! 👋
          </h1>
          
          <p className="text-gray-600 mb-4">
            You visited: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{location.pathname}</code>
          </p>
          
          <p className="text-gray-600 mb-6">
            Redirecting to your HomePage with Google Maps...
          </p>

          <div className="flex items-center justify-center space-x-2 text-blue-600 mb-6">
            <span className="text-sm">Auto-redirecting in 3 seconds</span>
            <ArrowRight className="h-4 w-4" />
          </div>

          <button
            onClick={() => navigate('/home')}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Go to HomePage Now
          </button>

          <div className="mt-4 text-xs text-gray-500">
            <p>🗺️ Your maps should load with Madurai location</p>
            <p>📍 3 service providers will be shown</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RedirectTestScreen