import React, { useState } from 'react'
import { FleetVehicle, FleetDriver } from '../types'
import { 
  MapPin, 
  User, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Eye,
  Clock,
  Truck
} from 'lucide-react'

interface FleetManagementTableProps {
  vehicles: FleetVehicle[]
  drivers: FleetDriver[]
  onViewVehicle: (vehicle: FleetVehicle) => void
  onEditVehicle: (vehicle: FleetVehicle) => void
  onRemoveVehicle: (vehicleId: string) => void
  onAssignDriver: (vehicleId: string, driverId: string) => void
  onAddVehicle: () => void
}

const FleetManagementTable: React.FC<FleetManagementTableProps> = ({
  vehicles,
  drivers,
  onViewVehicle,
  onEditVehicle,
  onRemoveVehicle,
  onAssignDriver,
  onAddVehicle
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)

  const getStatusBadge = (status: FleetVehicle['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      waiting: { color: 'bg-yellow-100 text-yellow-800', label: 'Waiting' },
      breakdown: { color: 'bg-red-100 text-red-800', label: 'Breakdown' },
      maintenance: { color: 'bg-gray-100 text-gray-800', label: 'Maintenance' }
    }
    
    const config = statusConfig[status]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const availableDrivers = drivers.filter(driver => !driver.assignedVehicleId)

  const handleAssignDriver = (driverId: string) => {
    if (selectedVehicle) {
      onAssignDriver(selectedVehicle, driverId)
      setShowAssignModal(false)
      setSelectedVehicle(null)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Fleet Management</h2>
          </div>
          <button
            onClick={onAddVehicle}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Update
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {vehicle.vehicleNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {vehicle.driverName ? (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{vehicle.driverName}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle.id)
                          setShowAssignModal(true)
                        }}
                        className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                      >
                        Assign Driver
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-32">
                      {vehicle.address || `${vehicle.location.latitude.toFixed(4)}, ${vehicle.location.longitude.toFixed(4)}`}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getStatusBadge(vehicle.status)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{vehicle.lastUpdate.toLocaleTimeString()}</span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewVehicle(vehicle)}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditVehicle(vehicle)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Vehicle"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRemoveVehicle(vehicle.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove Vehicle"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {vehicles.length === 0 && (
        <div className="p-8 text-center">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicles</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first vehicle to the fleet.</p>
          <button
            onClick={onAddVehicle}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Add Vehicle
          </button>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Driver</h3>
            
            {availableDrivers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600">No available drivers to assign.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableDrivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleAssignDriver(driver.id)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{driver.name}</div>
                    <div className="text-sm text-gray-500">{driver.phone}</div>
                    <div className="text-xs text-gray-400">License: {driver.licenseNumber}</div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedVehicle(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FleetManagementTable