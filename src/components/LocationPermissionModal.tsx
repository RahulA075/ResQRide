import React from 'react'
import { MapPin } from 'lucide-react'
import { Coordinates } from '../types'
import PlacesAutocomplete from './PlacesAutocomplete'

interface LocationPermissionModalProps {
  onLocationSelected: (coords: Coordinates) => void
  onClose: () => void
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  onLocationSelected,
  onClose
}) => {


  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          onLocationSelected(coords)
        },
        (error) => {
          console.error('Location permission denied:', error)
          alert('Location permission denied. Please enter your address manually.')
        }
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <MapPin className="h-12 w-12 text-primary-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Location Access Required
          </h2>
          <p className="text-gray-600 text-sm">
            We need your location to find nearby service providers and give you accurate assistance.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={requestLocationPermission}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
          >
            <MapPin className="h-4 w-4" />
            <span>Allow Location Access</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Search for your location
            </label>
            <PlacesAutocomplete
              onPlaceSelected={(coords, address) => {
                console.log('Selected location:', address, coords)
                onLocationSelected(coords)
              }}
              placeholder="Search for your current location..."
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full text-gray-600 text-sm hover:text-gray-800 transition-colors"
          >
            Skip for now
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>
            Your location data is only used to find nearby services and is not stored or shared.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LocationPermissionModal