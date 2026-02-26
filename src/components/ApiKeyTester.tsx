import React, { useEffect, useState } from 'react'

const ApiKeyTester: React.FC = () => {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [message, setMessage] = useState('Testing API key...')

  useEffect(() => {
    const testApiKey = () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        setStatus('error')
        setMessage('❌ No API key found in environment variables')
        return
      }

      setStatus('testing')
      setMessage('🔄 Testing Google Maps API key...')

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setStatus('success')
        setMessage('✅ Google Maps API already loaded and working')
        return
      }

      // Create a unique callback name
      const callbackName = `testCallback_${Date.now()}`
      
      // Set up the callback
      ;(window as any)[callbackName] = () => {
        setStatus('success')
        setMessage('✅ Google Maps API loaded successfully')
        // Cleanup
        delete (window as any)[callbackName]
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }

      // Create and load the script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`
      script.async = true
      script.defer = true
      
      script.onerror = () => {
        setStatus('error')
        setMessage('❌ Failed to load Google Maps API - check your API key')
        // Cleanup
        delete (window as any)[callbackName]
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
      
      document.head.appendChild(script)
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (status === 'testing') {
          setStatus('error')
          setMessage('❌ API key test timed out')
          // Cleanup
          delete (window as any)[callbackName]
          if (document.head.contains(script)) {
            document.head.removeChild(script)
          }
        }
      }, 10000)
    }

    testApiKey()
  }, [])

  return (
    <div className={`p-4 rounded-lg border ${
      status === 'success' ? 'bg-green-50 border-green-200' :
      status === 'error' ? 'bg-red-50 border-red-200' :
      'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-center space-x-2">
        {status === 'testing' && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
        )}
        <span className={`text-sm font-medium ${
          status === 'success' ? 'text-green-800' :
          status === 'error' ? 'text-red-800' :
          'text-yellow-800'
        }`}>
          {message}
        </span>
      </div>
      
      {status === 'error' && (
        <div className="mt-2 text-xs text-red-700">
          <p>Common solutions:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Get a valid API key from Google Cloud Console</li>
            <li>Enable "Maps JavaScript API" in your project</li>
            <li>Add localhost:3000 to API key restrictions</li>
            <li>Enable billing for your Google Cloud project</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ApiKeyTester