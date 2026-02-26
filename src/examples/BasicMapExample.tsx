import React, { useEffect, useRef } from 'react'

// Basic Map Component Example (as requested)
export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 9.9252, lng: 78.1198 }, // Example: Madurai
        zoom: 13,
      })

      new window.google.maps.Marker({
        position: { lat: 9.9252, lng: 78.1198 },
        map,
        title: "You are here!",
      })
    }
  }, [])

  return <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />
}

// Enhanced version with TypeScript and better features
export function EnhancedMapComponent() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.google && mapRef.current) {
      // Initialize map with Indian styling
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 9.9252, lng: 78.1198 }, // Madurai, Tamil Nadu
        zoom: 13,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      })

      // Add animated marker
      const marker = new window.google.maps.Marker({
        position: { lat: 9.9252, lng: 78.1198 },
        map,
        title: "You are here!",
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      })

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">Madurai, Tamil Nadu</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              Lat: 9.9252, Lng: 78.1198
            </p>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })
    }
  }, [])

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: "100%", 
        height: "100vh",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }} 
    />
  )
}