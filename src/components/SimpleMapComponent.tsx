import React, { useEffect, useRef } from 'react'
import { Coordinates } from '../types'

interface SimpleMapComponentProps {
  center?: Coordinates
  zoom?: number
  height?: string
  showUserMarker?: boolean
  title?: string
}

const SimpleMapComponent: React.FC<SimpleMapComponentProps> = ({
  center = { latitude: 9.9252, longitude: 78.1198 }, // Default: Madurai, Tamil Nadu
  zoom = 13,
  height = "100vh",
  showUserMarker = true,
  title = "You are here!"
}) => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.google && mapRef.current) {
      // Initialize the map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: center.latitude, lng: center.longitude },
        zoom: zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      })

      // Add user location marker if enabled
      if (showUserMarker) {
        new window.google.maps.Marker({
          position: { lat: center.latitude, lng: center.longitude },
          map,
          title: title,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          },
          animation: window.google.maps.Animation.DROP
        })
      }

      // Add info window for user location
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-gray-900">${title}</h3>
            <p class="text-sm text-gray-600">
              Lat: ${center.latitude.toFixed(6)}<br>
              Lng: ${center.longitude.toFixed(6)}
            </p>
          </div>
        `
      })

      // Show info window on map click
      map.addListener('click', (event: any) => {
        infoWindow.setPosition(event.latLng)
        infoWindow.setContent(`
          <div class="p-2">
            <h3 class="font-semibold text-gray-900">Selected Location</h3>
            <p class="text-sm text-gray-600">
              Lat: ${event.latLng.lat().toFixed(6)}<br>
              Lng: ${event.latLng.lng().toFixed(6)}
            </p>
          </div>
        `)
        infoWindow.open(map)
      })
    }
  }, [center, zoom, showUserMarker, title])

  // Loading state while Google Maps loads
  if (!window.google) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ width: "100%", height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      style={{ width: "100%", height }}
      className="rounded-lg shadow-sm"
    />
  )
}

export default SimpleMapComponent