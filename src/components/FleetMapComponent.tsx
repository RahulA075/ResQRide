import React, { useEffect, useRef, useState } from 'react'
import { FleetVehicle } from '../types'
import { validateGoogleMapsApiKey, getGoogleMapsApiKey } from '../utils/maps'

interface FleetMapComponentProps {
  vehicles: FleetVehicle[]
  onVehicleClick: (vehicle: FleetVehicle) => void
  center?: { latitude: number; longitude: number }
  height?: string
}

const FleetMapComponent: React.FC<FleetMapComponentProps> = ({
  vehicles,
  onVehicleClick,
  center = { latitude: 9.9252, longitude: 78.1198 }, // Default to Madurai
  height = '400px'
}) => {
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

    if (!validateGoogleMapsApiKey()) {
      console.error('Cannot load Google Maps: Invalid or missing API key')
      return
    }

    const script = document.createElement('script')
    const region = import.meta.env.VITE_GOOGLE_MAPS_REGION || 'IN'
    const language = import.meta.env.VITE_GOOGLE_MAPS_LANGUAGE || 'en'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${getGoogleMapsApiKey()}&callback=initFleetMap&libraries=places&region=${region}&language=${language}`
    script.async = true
    script.defer = true

    window.initFleetMap = () => {
      setIsLoaded(true)
      delete (window as any).initFleetMap
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance.current) return

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })
  }, [isLoaded, center])

  // Update markers when vehicles change
  useEffect(() => {
    if (!mapInstance.current || !window.google) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    const newMarkers: any[] = []

    // Add vehicle markers
    vehicles.forEach((vehicle) => {
      const statusColors = {
        active: '#10B981',      // Green
        waiting: '#F59E0B',     // Yellow/Orange
        breakdown: '#EF4444',   // Red
        maintenance: '#6B7280'  // Gray
      }

      const marker = new window.google.maps.Marker({
        position: { lat: vehicle.location.latitude, lng: vehicle.location.longitude },
        map: mapInstance.current,
        title: `${vehicle.vehicleNumber} - ${vehicle.status}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: statusColors[vehicle.status],
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3
        }
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-gray-900 mb-1">${vehicle.vehicleNumber}</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Vehicle:</span>
                <span class="font-medium">${vehicle.make} ${vehicle.model}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Driver:</span>
                <span class="font-medium">${vehicle.driverName || 'Unassigned'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span class="font-medium capitalize" style="color: ${statusColors[vehicle.status]}">${vehicle.status}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Last Update:</span>
                <span class="font-medium">${vehicle.lastUpdate.toLocaleTimeString()}</span>
              </div>
              ${vehicle.address ? `<div class="mt-2 text-xs text-gray-500">${vehicle.address}</div>` : ''}
            </div>
            <button 
              onclick="window.selectFleetVehicle('${vehicle.id}')"
              class="w-full mt-3 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              View Details
            </button>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker)
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)

    // Global function for info window buttons
    window.selectFleetVehicle = (vehicleId: string) => {
      const vehicle = vehicles.find(v => v.id === vehicleId)
      if (vehicle) {
        onVehicleClick(vehicle)
      }
    }

    return () => {
      delete (window as any).selectFleetVehicle
    }
  }, [vehicles, onVehicleClick, isLoaded])

  if (!isLoaded) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading fleet map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full rounded-lg border"
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-10">
        <div className="text-xs font-medium text-gray-900 mb-2">Vehicle Status</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Waiting</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Breakdown</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Vehicle Count */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 z-10">
        <div className="text-xs text-gray-600">Total Vehicles</div>
        <div className="text-lg font-bold text-gray-900">{vehicles.length}</div>
      </div>
    </div>
  )
}

export default FleetMapComponent