import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FleetVehicle, FleetDriver, FleetServiceRequest, FleetAnalytics } from '../types'
import FleetMapComponent from '../components/FleetMapComponent'
import FleetManagementTable from '../components/FleetManagementTable'
import ServiceRequestsOverview from '../components/ServiceRequestsOverview'
import FleetAnalyticsDashboard from '../components/FleetAnalyticsDashboard'
import { api } from '../lib/api'
import {
  MapPin,
  Truck,
  AlertTriangle,
  BarChart3,
  LogOut,
  Settings
} from 'lucide-react'

const FleetDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([])
  const [drivers] = useState<FleetDriver[]>([])
  const [serviceRequests, setServiceRequests] = useState<FleetServiceRequest[]>([])
  const [analytics, setAnalytics] = useState<FleetAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'map' | 'table' | 'requests' | 'analytics'>('map')

  useEffect(() => {
    loadFleetData()
  }, [])

  const loadFleetData = async () => {
    try {
      const data = await api.get<{
        analytics: any
        vehicles: any[]
        requests: any[]
      }>('/fleet/analytics')

      const mappedVehicles: FleetVehicle[] = (data.vehicles || []).map((v: any) => ({
        id: v.id,
        vehicleNumber: v.license_plate,
        licensePlate: v.license_plate,
        make: v.make,
        model: v.model,
        year: v.year,
        driverId: v.driver_id,
        driverName: v.driver?.full_name,
        status: v.status === 'inactive' ? 'waiting' : v.status,
        location: { latitude: 9.9252, longitude: 78.1198 },
        lastUpdate: new Date(v.updated_at || v.created_at),
        address: v.driver?.full_name ? `Driver: ${v.driver.full_name}` : 'No driver assigned'
      }))

      const mappedRequests: FleetServiceRequest[] = (data.requests || []).map((r: any) => ({
        id: r.id,
        vehicleId: '',
        vehicleNumber: r.license_plate || 'Unknown',
        driverId: r.driver_id,
        driverName: r.driver?.full_name || 'Unknown',
        location: { latitude: r.latitude || 9.9252, longitude: r.longitude || 78.1198 },
        address: `${r.latitude?.toFixed(4)}, ${r.longitude?.toFixed(4)}`,
        issue: r.service_type,
        description: r.description,
        severity: 'medium' as const,
        status: r.status === 'pending' ? 'requested' : r.status === 'completed' ? 'resolved' : r.status,
        requestedAt: new Date(r.created_at),
        estimatedCost: 0
      }))

      const a = data.analytics
      const mappedAnalytics: FleetAnalytics = {
        totalVehicles: a.totalVehicles || 0,
        activeVehicles: a.activeVehicles || 0,
        vehiclesInService: a.vehiclesInMaintenance || 0,
        totalDrivers: mappedVehicles.filter(v => v.driverId).length,
        availableDrivers: mappedVehicles.filter(v => v.driverId && v.status === 'active').length,
        totalServiceRequests: a.totalServiceRequests || 0,
        pendingRequests: a.pendingRequests || 0,
        resolvedRequests: a.completedRequests || 0,
        averageResolutionTime: 45,
        totalCost: 0,
        mostCommonIssues: []
      }

      setVehicles(mappedVehicles)
      setServiceRequests(mappedRequests)
      setAnalytics(mappedAnalytics)
    } catch (err) {
      console.error('Failed to load fleet data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVehicleClick = (_vehicle: FleetVehicle) => {}
  const handleViewVehicle = (_vehicle: FleetVehicle) => {}
  const handleEditVehicle = (_vehicle: FleetVehicle) => {}

  const handleRemoveVehicle = async (vehicleId: string) => {
    if (confirm('Are you sure you want to remove this vehicle?')) {
      try {
        await api.delete(`/fleet/vehicles/${vehicleId}`)
        setVehicles(vehicles.filter(v => v.id !== vehicleId))
      } catch (err) {
        alert('Failed to remove vehicle')
      }
    }
  }

  const handleAssignDriver = (_vehicleId: string, _driverId: string) => {}
  const handleAddVehicle = () => {}
  const handleAssignMechanic = (_requestId: string) => {}
  const handleViewRequest = (_request: FleetServiceRequest) => {}

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fleet dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Fleet Management Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.full_name} • Fleet Owner</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white border-b px-4">
        <div className="flex space-x-6">
          {[
            { id: 'map', label: 'Fleet Map', icon: MapPin },
            { id: 'table', label: 'Vehicle Management', icon: Truck },
            { id: 'requests', label: 'Service Requests', icon: AlertTriangle },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'map' && (
          <div className="h-full p-4">
            <FleetMapComponent
              vehicles={vehicles}
              onVehicleClick={handleVehicleClick}
              height="calc(100vh - 200px)"
            />
          </div>
        )}

        {activeView === 'table' && (
          <div className="h-full overflow-y-auto p-4">
            <FleetManagementTable
              vehicles={vehicles}
              drivers={drivers}
              onViewVehicle={handleViewVehicle}
              onEditVehicle={handleEditVehicle}
              onRemoveVehicle={handleRemoveVehicle}
              onAssignDriver={handleAssignDriver}
              onAddVehicle={handleAddVehicle}
            />
          </div>
        )}

        {activeView === 'requests' && (
          <div className="h-full overflow-y-auto p-4">
            <ServiceRequestsOverview
              serviceRequests={serviceRequests}
              onAssignMechanic={handleAssignMechanic}
              onViewRequest={handleViewRequest}
            />
          </div>
        )}

        {activeView === 'analytics' && analytics && (
          <div className="h-full overflow-y-auto p-4">
            <FleetAnalyticsDashboard analytics={analytics} />
          </div>
        )}
      </div>
    </div>
  )
}

export default FleetDashboard
