import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { Coordinates } from '../types'

interface PlacesAutocompleteProps {
  onPlaceSelected: (coordinates: Coordinates, address: string) => void
  placeholder?: string
  className?: string
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelected,
  placeholder = "Search for a location...",
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Wait for Google Maps to load
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true)
        initializeAutocomplete()
      } else {
        setTimeout(checkGoogleMaps, 100)
      }
    }
    checkGoogleMaps()
  }, [])

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return

    // Create autocomplete instance
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'IN' }, // Restrict to India
        fields: ['place_id', 'geometry', 'name', 'formatted_address']
      }
    )

    // Add place changed listener
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace()
      
      if (place && place.geometry && place.geometry.location) {
        const coordinates: Coordinates = {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng()
        }
        
        const address = place.formatted_address || place.name || 'Selected Location'
        onPlaceSelected(coordinates, address)
      }
    })
  }

  const handleManualSearch = () => {
    const query = inputRef.current?.value
    if (!query || !window.google) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode(
      { 
        address: query,
        componentRestrictions: { country: 'IN' }
      },
      (results: any[], status: string) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location
          const coordinates: Coordinates = {
            latitude: location.lat(),
            longitude: location.lng()
          }
          
          const address = results[0].formatted_address
          onPlaceSelected(coordinates, address)
        } else {
          alert('Location not found. Please try a different search term.')
        }
      }
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleManualSearch()
    }
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Loading location search..."
            disabled
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex-1 relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={handleManualSearch}
        className="px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  )
}

export default PlacesAutocomplete