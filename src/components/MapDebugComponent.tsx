import React, { useEffect, useState } from 'react'
import { validateGoogleMapsApiKey, getGoogleMapsApiKey } from '../utils/maps'

const MapDebugComponent: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking...')
  const [apiKey, setApiKey] = useState<string>('')
  const [googleLoaded, setGoogleLoaded] = useState<boolean>(false)

  useEffect(() => {
    // Check API key
    const key = getGoogleMapsApiKey()
    setApiKey(key ? `${key.substring(0, 10)}...` : 'Not found')
    
    // Check if API key is valid
    if (!validateGoogleMapsApiKey()) {
      setStatus('❌ Invalid or missing API key')
      return
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setStatus('✅ Google Maps already loaded')
      setGoogleLoaded(true)
      return
    }

    setStatus('🔄 Loading Google Maps API...')

    // Load Google Maps API
    const script = document.createElement('script')
    const region = import.meta.env.VITE_GOOGLE_MAPS_REGION || 'IN'
    const language = import.meta.env.VITE_GOOGLE_MAPS_LANGUAGE || 'en'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMapDebug&libraries=places&region=${region}&language=${language}`
    script.async = true
    script.defer = true

    window.initMapDebug = () => {
      setStatus('✅ Google Maps API loaded successfully')
      setGoogleLoaded(true)
      delete (window as any).initMapDebug
    }

    script.onerror = () => {
      setStatus('❌ Failed to load Google Maps API')
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-semibold text-gray-900 mb-3">Google Maps Debug Info</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Status:</span> {status}
        </div>
        <div>
          <span className="font-medium">API Key:</span> {apiKey}
        </div>
        <div>
          <span className="font-medium">Google Object:</span> {window.google ? '✅ Available' : '❌ Not available'}
        </div>
        <div>
          <span className="font-medium">Maps API:</span> {window.google?.maps ? '✅ Available' : '❌ Not available'}
        </div>
        <div>
          <span className="font-medium">Places API:</span> {window.google?.maps?.places ? '✅ Available' : '❌ Not available'}
        </div>
        <div>
          <span className="font-medium">Region:</span> {import.meta.env.VITE_GOOGLE_MAPS_REGION || 'IN'}
        </div>
        <div>
          <span className="font-medium">Language:</span> {import.meta.env.VITE_GOOGLE_MAPS_LANGUAGE || 'en'}
        </div>
      </div>
      
      {googleLoaded && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 text-sm">
            🎉 Google Maps API is ready! You can now use maps in your application.
          </p>
        </div>
      )}
    </div>
  )
}

export default MapDebugComponent