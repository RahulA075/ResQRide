import React from 'react'
import { X } from 'lucide-react'

interface FilterModalProps {
  filters: {
    vehicleType: string
    serviceType: string
    minRating: number
    maxDistance: number
    availability: string
  }
  onFiltersChange: (filters: any) => void
  onClose: () => void
}

const FilterModal: React.FC<FilterModalProps> = ({ filters, onFiltersChange, onClose }) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFiltersChange({
      vehicleType: '',
      serviceType: '',
      minRating: 0,
      maxDistance: 25,
      availability: 'all'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50">
      <div className="bg-white rounded-t-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Filter Results</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 space-y-6">
          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <select
              value={filters.vehicleType}
              onChange={(e) => updateFilter('vehicleType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Vehicles</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="truck">Truck</option>
            </select>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              value={filters.serviceType}
              onChange={(e) => updateFilter('serviceType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Services</option>
              <option value="mechanical">Mechanical Repair</option>
              <option value="electrical">Electrical</option>
              <option value="towing">Towing</option>
              <option value="parts">Parts Supply</option>
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => updateFilter('minRating', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Any Rating</span>
                <span className="font-medium">{filters.minRating > 0 ? `${filters.minRating}+ stars` : 'Any'}</span>
                <span>5 stars</span>
              </div>
            </div>
          </div>

          {/* Maximum Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Distance
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={filters.maxDistance}
                onChange={(e) => updateFilter('maxDistance', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>1km</span>
                <span className="font-medium">{filters.maxDistance}km</span>
                <span>50km</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="availability"
                  value="all"
                  checked={filters.availability === 'all'}
                  onChange={(e) => updateFilter('availability', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">All Providers</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="availability"
                  value="available"
                  checked={filters.availability === 'available'}
                  onChange={(e) => updateFilter('availability', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Available Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-gray-50 flex space-x-3">
          <button
            onClick={resetFilters}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterModal