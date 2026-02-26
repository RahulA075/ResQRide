import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import SimpleMapComponent from '../components/SimpleMapComponent'
import { INDIAN_CITIES } from '../utils/maps'
import { Coordinates } from '../types'

const MapDemoScreen: React.FC = () => {
  const navigate = useNavigate()
  const [selectedCity, setSelectedCity] = useState<Coordinates>(INDIAN_CITIES.MADURAI)
  const [selectedCityName, setSelectedCityName] = useState('Madurai')

  const cities = [
    { name: 'Madurai', coords: INDIAN_CITIES.MADURAI },
    { name: 'Chennai', coords: INDIAN_CITIES.CHENNAI },
    { name: 'Bangalore', coords: INDIAN_CITIES.BANGALORE },
    { name: 'Mumbai', coords: INDIAN_CITIES.MUMBAI },
    { name: 'Delhi', coords: INDIAN_CITIES.DELHI },
    { name: 'Hyderabad', coords: INDIAN_CITIES.HYDERABAD },
    { name: 'Pune', coords: INDIAN_CITIES.PUNE },
    { name: 'Kolkata', coords: INDIAN_CITIES.KOLKATA }
  ]

  const handleCityChange = (cityName: string, coords: Coordinates) => {
    setSelectedCity(coords)
    setSelectedCityName(cityName)
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary-500" />
            <h1 className="text-lg font-semibold text-gray-900">Map Demo</h1>
          </div>
        </div>
      </div>

      {/* City Selector */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Select City:</label>
          <select
            value={selectedCityName}
            onChange={(e) => {
              const city = cities.find(c => c.name === e.target.value)
              if (city) {
                handleCityChange(city.name, city.coords)
              }
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Current: {selectedCityName} ({selectedCity.latitude.toFixed(4)}, {selectedCity.longitude.toFixed(4)})
        </p>
      </div>

      {/* Map */}
      <div className="flex-1 p-4">
        <div className="h-full rounded-lg overflow-hidden shadow-lg">
          <SimpleMapComponent
            center={selectedCity}
            zoom={13}
            height="100%"
            showUserMarker={true}
            title={`${selectedCityName}, India`}
          />
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-white border-t px-4 py-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-900">Current Location</p>
            <p className="text-gray-600">{selectedCityName}</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Coordinates</p>
            <p className="text-gray-600">
              {selectedCity.latitude.toFixed(6)}, {selectedCity.longitude.toFixed(6)}
            </p>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <p>💡 Click anywhere on the map to see coordinates</p>
          <p>🗺️ Use map controls to zoom and navigate</p>
        </div>
      </div>
    </div>
  )
}

export default MapDemoScreen