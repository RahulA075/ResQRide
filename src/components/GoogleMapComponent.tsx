import React, { useEffect, useRef, useState } from 'react'
import { Coordinates, ServiceProvider } from '../types'
import { validateGoogleMapsApiKey, getGoogleMapsApiKey } from '../utils/maps'

interface GoogleMapComponentProps {
  center: Coordinates
  providers: ServiceProvider[]
  onProviderClick: (provider: ServiceProvider) => void
  zoom?: number
  height?: string
}

declare global {
  interface Window {
    google: any
    initMap?: () => void
    selectProvider?: (providerId: string) => void
  }
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  center,
  providers,
  onProviderClick,
  zoom = 13,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

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
      document.head.removeChild(script)
      delete (window as any).initMap
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    setMap(newMap)
  }, [isLoaded, center, zoom, map])

  // Update markers when providers change
  useEffect(() => {
    if (!map || !window.google) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))

    const newMarkers: any[] = []

    // Add user location marker
    const userMarker = new window.google.maps.Marker({
      position: { lat: center.latitude, lng: center.longitude },
      map: map,
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

    const userInfoWindow = new window.google.maps.InfoWindow({
      content: '<div class="p-2"><strong>Your Location</strong></div>'
    })

    userMarker.addListener('click', () => {
      userInfoWindow.open(map, userMarker)
    })

    newMarkers.push(userMarker)

    // Add provider markers
    providers.forEach((provider) => {
      const marker = new window.google.maps.Marker({
        position: { lat: provider.location.latitude, lng: provider.location.longitude },
        map: map,
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

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-gray-900 mb-1">${provider.businessName}</h3>
            <div class="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <span>⭐ ${provider.rating.average}</span>
              <span>•</span>
              <span>${provider.distance}km away</span>
            </div>
            <div class="flex items-center space-x-2 text-sm mb-2">
              <span class="px-2 py-1 rounded-full text-xs ${
                provider.availability 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }">
                ${provider.availability ? 'Available' : 'Busy'}
              </span>
              <span class="text-gray-600">ETA: ${provider.estimatedArrival} min</span>
            </div>
            <button 
              onclick="window.selectProvider('${provider.id}')"
              class="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              View Details
            </button>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)

    // Global function for info window buttons
    window.selectProvider = (providerId: string) => {
      const provider = providers.find(p => p.id === providerId)
      if (provider) {
        onProviderClick(provider)
      }
    }

    return () => {
      delete (window as any).selectProvider
    }
  }, [map, providers, center, onProviderClick])

  // Update map center when center changes
  useEffect(() => {
    if (map) {
      map.setCenter({ lat: center.latitude, lng: center.longitude })
    }
  }, [map, center])

  if (!isLoaded) {
    // Check if API key is valid
    if (!validateGoogleMapsApiKey()) {
      return (
        <div 
          className="flex items-center justify-center bg-red-50 border border-red-200 rounded-lg"
          style={{ height }}
        >
          <div className="text-center p-4">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-700 text-sm font-medium">Google Maps API Error</p>
            <p className="text-red-600 text-xs mt-1">Please check your API key configuration</p>
          </div>
        </div>
      )
    }

    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full rounded-lg"
      />
      
      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-10">
        <button 
          onClick={() => {
            if (map) {
              map.setZoom(map.getZoom() + 1)
            }
          }}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <span className="text-lg font-bold text-gray-600">+</span>
        </button>
        <button 
          onClick={() => {
            if (map) {
              map.setZoom(map.getZoom() - 1)
            }
          }}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <span className="text-lg font-bold text-gray-600">−</span>
        </button>
      </div>

      {/* Recenter Button */}
      <div className="absolute bottom-4 left-4 z-10">
        <button 
          onClick={() => {
            if (map) {
              map.setCenter({ lat: center.latitude, lng: center.longitude })
              map.setZoom(13)
            }
          }}
          className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50 transition-colors"
        >
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default GoogleMapComponent