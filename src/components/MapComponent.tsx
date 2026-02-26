import React, { useEffect, useRef, useState } from 'react'
import { MapPin, LogOut } from 'lucide-react'
import { Coordinates, ServiceProvider } from '../types'
import { validateGoogleMapsApiKey, getGoogleMapsApiKey } from '../utils/maps'

interface MapComponentProps {
  center: Coordinates
  providers: ServiceProvider[]
  onProviderClick: (provider: ServiceProvider) => void
  onLogout: () => void
}

const MapComponent: React.FC<MapComponentProps> = ({ center, providers, onProviderClick, onLogout }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [markers, setMarkers] = useState<any[]>([])

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true)
      return
    }

    // Validate API key before loading
    if (!validateGoogleMapsApiKey()) {
      console.error('Cannot load Google Maps: Invalid or missing API key')
      return
    }

    const script = document.createElement('script')
    const region = import.meta.env.VITE_GOOGLE_MAPS_REGION || 'IN'
    const language = import.meta.env.VITE_GOOGLE_MAPS_LANGUAGE || 'en'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${getGoogleMapsApiKey()}&callback=initMap&libraries=places&region=${region}&language=${language}`
    script.async = true
    script.defer = true

    window.initMap = () => {
      setIsLoaded(true)
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
      delete (window as any).initMap
    }
  }, [])

  // Initialize map when loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance.current) return

    // Initialize map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: 13,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })
  }, [isLoaded, center])

  // Update markers when providers change
  useEffect(() => {
    if (!mapInstance.current || !window.google) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    const newMarkers: any[] = []

    // Add user marker
    const userMarker = new window.google.maps.Marker({
      position: { lat: center.latitude, lng: center.longitude },
      map: mapInstance.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      }
    })
    newMarkers.push(userMarker)

    // Add service providers
    providers.forEach((provider) => {
      const marker = new window.google.maps.Marker({
        position: { lat: provider.location.latitude, lng: provider.location.longitude },
        map: mapInstance.current,
        title: provider.businessName,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: provider.availability ? '#10B981' : '#EF4444',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      })

      marker.addListener('click', () => onProviderClick(provider))
      newMarkers.push(marker)
    })

    setMarkers(newMarkers)
  }, [center, providers, onProviderClick, isLoaded])

  if (!isLoaded) {
    return (
      <div className="relative w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      {/* Google Map */}
      <div ref={mapRef} className="absolute inset-0" />

      {/* ✅ Top Bar: Logout + Legend */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 rounded-lg shadow-md px-6 py-3 flex items-center justify-between space-x-8 z-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">You</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Busy</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          <LogOut className="h-4 w-4 text-gray-700" />
          <span className="text-sm text-gray-700">Logout</span>
        </button>
      </div>

      {/* Floating Locate Button */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          onClick={() => {
            if (navigator.geolocation && mapInstance.current) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const newCenter = {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                }
                mapInstance.current.setCenter(newCenter)
                mapInstance.current.setZoom(15)
              })
            }
          }}
          className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition"
        >
          <MapPin className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  )
}

export default MapComponent
