import React, { useEffect, useRef, useState } from 'react'

const TestMapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    const loadMap = () => {
      const apiKey = 'AIzaSyAt6gdjqf7wZvfzDMMVAd_stw9whZJVwOg' // Your API key directly
      
      setStatus('Loading Google Maps API...')
      
      // Check if already loaded
      if (window.google && window.google.maps) {
        setStatus('Google Maps already loaded, initializing...')
        initMap()
        return
      }

      // Create script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initTestMap`
      script.async = true
      script.defer = true

      // Global callback
      window.initTestMap = () => {
        setStatus('✅ Google Maps loaded successfully!')
        initMap()
        delete (window as any).initTestMap
      }

      script.onerror = () => {
        setStatus('❌ Failed to load Google Maps API')
      }

      document.head.appendChild(script)
    }

    const initMap = () => {
      if (!mapRef.current) return

      try {
        // Create map centered on Madurai
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 9.9252, lng: 78.1198 },
          zoom: 13,
          mapTypeId: 'roadmap'
        })

        // Add marker for Madurai
        const marker = new window.google.maps.Marker({
          position: { lat: 9.9252, lng: 78.1198 },
          map: map,
          title: 'Madurai, Tamil Nadu',
          animation: window.google.maps.Animation.DROP
        })

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; font-family: Arial, sans-serif;">
              <h3 style="margin: 0 0 5px 0; color: #333;">🎉 Map Working!</h3>
              <p style="margin: 0; color: #666;">Madurai, Tamil Nadu</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">
                Your Google Maps API is working perfectly!
              </p>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        // Auto-open info window after 2 seconds
        setTimeout(() => {
          infoWindow.open(map, marker)
        }, 2000)

        setStatus('🗺️ Map initialized successfully!')

      } catch (error) {
        console.error('Map initialization error:', error)
        setStatus('❌ Map initialization failed')
      }
    }

    loadMap()
  }, [])

  return (
    <div className="w-full">
      {/* Status Bar */}
      <div className="bg-gray-100 border border-gray-300 rounded-t-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status: {status}</span>
          <span className="text-xs text-gray-500">
            API Key: AIzaSyAt6gdjqf7wZvfzDMMVAd_stw9whZJVwOg
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-96 bg-gray-200 border-l border-r border-b border-gray-300 rounded-b-lg"
      >
        {status.includes('Loading') && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">🎯 Test Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• If you see a map above, your API key is working! ✅</li>
          <li>• Click the marker to see the info window</li>
          <li>• You can zoom, pan, and interact with the map</li>
          <li>• Check browser console for any error messages</li>
        </ul>
      </div>
    </div>
  )
}

export default TestMapComponent