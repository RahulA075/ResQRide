import React, { useEffect, useRef, useState } from 'react'

const SimpleGoogleMapTest: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('Initializing...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        setStatus('Checking API key...')
        
        // Get API key from environment
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found')
        
        if (!apiKey) {
          throw new Error('Google Maps API key not found in environment variables')
        }

        setStatus('Loading Google Maps script...')
        
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          setStatus('Google Maps already loaded, initializing map...')
          initializeMap()
          return
        }

        // Create and load the script
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMap`
        script.async = true
        script.defer = true

        // Set up callback
        window.initGoogleMap = () => {
          console.log('Google Maps callback triggered')
          setStatus('Google Maps loaded, initializing map...')
          initializeMap()
          delete (window as any).initGoogleMap
        }

        // Handle script errors
        script.onerror = (e) => {
          console.error('Script loading error:', e)
          setError('Failed to load Google Maps script')
          setStatus('Error loading script')
        }

        // Add script to document
        document.head.appendChild(script)
        console.log('Google Maps script added to document')

      } catch (err) {
        console.error('Error in loadGoogleMaps:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('Error')
      }
    }

    const initializeMap = () => {
      try {
        if (!mapRef.current) {
          throw new Error('Map container not found')
        }

        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps API not available')
        }

        console.log('Initializing map...')
        
        // Create map
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 9.9252, lng: 78.1198 }, // Madurai
          zoom: 13,
          mapTypeId: 'roadmap'
        })

        // Add marker
        new window.google.maps.Marker({
          position: { lat: 9.9252, lng: 78.1198 },
          map: map,
          title: 'Madurai, Tamil Nadu'
        })

        setStatus('✅ Map loaded successfully!')
        console.log('Map initialized successfully')

      } catch (err) {
        console.error('Error initializing map:', err)
        setError(err instanceof Error ? err.message : 'Map initialization failed')
        setStatus('❌ Map initialization failed')
      }
    }

    loadGoogleMaps()

    // Cleanup
    return () => {
      if ((window as any).initGoogleMap) {
        delete (window as any).initGoogleMap
      }
    }
  }, [])

  return (
    <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
      {/* Status Display */}
      <div className="bg-gray-100 p-3 border-b">
        <div className="text-sm">
          <div className="font-medium">Status: {status}</div>
          {error && (
            <div className="text-red-600 mt-1">Error: {error}</div>
          )}
          <div className="text-xs text-gray-600 mt-1">
            API Key: {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Present' : '❌ Missing'}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-80 bg-gray-200 flex items-center justify-center"
      >
        {!window.google && (
          <div className="text-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div>Loading Google Maps...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SimpleGoogleMapTest