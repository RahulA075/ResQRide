import React, { useEffect, useRef, useState } from 'react'
import { Coordinates, ServiceProvider } from '../types'
import { validateGoogleMapsApiKey, getGoogleMapsApiKey } from '../utils/maps'

interface DriverMapComponentProps {
  center: Coordinates
  providers: ServiceProvider[]
  onProviderClick: (provider: ServiceProvider) => void
}

const DriverMapComponent: React.FC<DriverMapComponentProps> = ({
  center,
  providers,
  onProviderClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [markers, setMarkers] = useState<any[]>([])

  // Load Google Maps API (same pattern as working MapComponent)
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    // Validate API key before loading
    if (!validateGoogleMapsApiKey()) {
      console.error('Cannot load Google Maps: Invalid or missing API key')
      return
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Script is already loading, wait for it
      const checkLoaded = () => {
        if (window.google && window.google.maps) {
          setIsLoaded(true)
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
      return
    }

    const script = document.createElement('script')
    const region = import.meta.env.VITE_GOOGLE_MAPS_REGION || 'IN'
    const language = import.meta.env.VITE_GOOGLE_MAPS_LANGUAGE || 'en'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${getGoogleMapsApiKey()}&callback=initDriverMap&libraries=places&region=${region}&language=${language}`
    script.async = true
    script.defer = true

    window.initDriverMap = () => {
      setIsLoaded(true)
      delete (window as any).initDriverMap
    }

    script.onerror = () => {
      console.error('Failed to load Google Maps API')
    }

    document.head.appendChild(script)

    return () => {
      delete (window as any).initDriverMap
    }
  }, [])

  // Initialize map when loaded (same pattern as working MapComponent)
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance.current) return

    // Initialize map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: 14,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })
  }, [isLoaded, center])

  // Update markers when providers change (same pattern as working MapComponent)
  useEffect(() => {
    if (!mapInstance.current || !window.google) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    const newMarkers: any[] = []

    // Add user location marker (blue)
    const userMarker = new window.google.maps.Marker({
      position: { lat: center.latitude, lng: center.longitude },
      map: mapInstance.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3
      }
    })

    // Add user info window
    const userInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 5px 0; color: #1f2937;">📍 Your Location</h3>
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            Lat: ${center.latitude.toFixed(6)}<br>
            Lng: ${center.longitude.toFixed(6)}
          </p>
        </div>
      `
    })

    userMarker.addListener('click', () => {
      userInfoWindow.open(mapInstance.current, userMarker)
    })

    newMarkers.push(userMarker)

    // Add service provider markers
    providers.forEach((provider) => {
      const providerMarker = new window.google.maps.Marker({
        position: { lat: provider.location.latitude, lng: provider.location.longitude },
        map: mapInstance.current,
        title: provider.businessName,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: provider.availability ? '#10B981' : '#EF4444',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      })

      const providerInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: Arial, sans-serif; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${provider.businessName}</h3>
            <div style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="color: #6b7280; font-size: 12px;">⭐ ${provider.rating.average} (${provider.rating.totalReviews} reviews)</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="color: #6b7280; font-size: 12px;">📍 ${provider.distance}km away</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="color: #6b7280; font-size: 12px;">⏱️ ETA: ${provider.estimatedArrival} min</span>
              </div>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; ${
                provider.availability 
                  ? 'background-color: #dcfce7; color: #166534;' 
                  : 'background-color: #fee2e2; color: #991b1b;'
              }">
                ${provider.availability ? 'Available' : 'Busy'}
              </span>
            </div>
            <button 
              onclick="window.selectDriverProvider('${provider.id}')"
              style="width: 100%; background-color: #3b82f6; color: white; padding: 8px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;"
              onmouseover="this.style.backgroundColor='#2563eb'"
              onmouseout="this.style.backgroundColor='#3b82f6'"
            >
              View Details & Call
            </button>
          </div>
        `
      })

      providerMarker.addListener('click', () => {
        providerInfoWindow.open(mapInstance.current, providerMarker)
      })

      newMarkers.push(providerMarker)
    })

    // Global function for info window buttons
    window.selectDriverProvider = (providerId: string) => {
      const provider = providers.find(p => p.id === providerId)
      if (provider) {
        onProviderClick(provider)
      }
    }

    setMarkers(newMarkers)

    return () => {
      delete (window as any).selectDriverProvider
    }
  }, [center, providers, onProviderClick, isLoaded])

  if (!isLoaded) {
    return (
      <div className="h-full bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-blue-700 font-medium">Loading Driver Map...</p>
          <p className="text-blue-600 text-sm mt-1">Finding nearby service providers</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full relative">
      {/* Google Map */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-10">
        <div className="text-xs font-medium text-gray-900 mb-2">Service Providers</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Busy</span>
          </div>
        </div>
      </div>

      {/* Provider Count */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-2 z-10">
        <div className="text-xs text-gray-600">Nearby Providers</div>
        <div className="text-lg font-bold text-gray-900">{providers.length}</div>
      </div>
    </div>
  )
}

export default DriverMapComponent