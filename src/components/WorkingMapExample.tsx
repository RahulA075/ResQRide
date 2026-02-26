import React, { useEffect, useRef } from 'react'

// This component uses a different approach to load Google Maps
const WorkingMapExample: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap()
      return
    }

    // Load Google Maps with a more reliable method
    const loadGoogleMaps = () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        console.error('No API key found')
        return
      }

      // Create script element
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true

      // Handle successful load
      script.onload = () => {
        console.log('Google Maps script loaded successfully')
        // Wait a bit for the API to be fully ready
        setTimeout(() => {
          if (window.google && window.google.maps) {
            initializeMap()
          } else {
            console.error('Google Maps API not available after script load')
          }
        }, 100)
      }

      // Handle errors
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error)
      }

      // Add to document
      document.head.appendChild(script)
    }

    const initializeMap = () => {
      if (!mapRef.current) {
        console.error('Map container not found')
        return
      }

      try {
        console.log('Initializing Google Map...')
        
        // Create map
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 9.9252, lng: 78.1198 }, // Madurai coordinates
          zoom: 13,
          mapTypeId: 'roadmap',
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          fullscreenControl: true
        })

        // Add a marker
        const marker = new window.google.maps.Marker({
          position: { lat: 9.9252, lng: 78.1198 },
          map: map,
          title: 'Madurai, Tamil Nadu',
          animation: window.google.maps.Animation.DROP
        })

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 5px 0;">Madurai</h3>
              <p style="margin: 0; color: #666;">Tamil Nadu, India</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">
                Lat: 9.9252, Lng: 78.1198
              </p>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        console.log('Map initialized successfully!')

      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    loadGoogleMaps()
  }, [])

  return (
    <div className="w-full">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-medium text-blue-900">Working Map Example</h3>
        <p className="text-sm text-blue-700 mt-1">
          This uses a simplified loading approach. Check browser console for detailed logs.
        </p>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-96 bg-gray-200 border border-gray-300 rounded-lg"
        style={{ minHeight: '400px' }}
      >
        <div className="h-full flex items-center justify-center text-gray-600">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div>Loading Google Maps...</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkingMapExample