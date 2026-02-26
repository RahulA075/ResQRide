import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FleetVehicle, FleetDriver, FleetServiceRequest, FleetAnalytics } from '../types'
import FleetMapComponent from '../components/FleetMapComponent'
import FleetManagementTable from '../components/FleetManagementTable'
import ServiceRequestsOverview from '../components/ServiceRequestsOverview'
import FleetAnalyticsDashboard from '../components/FleetAnalyticsDashboard'
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
  const [drivers, setDrivers] = useState<FleetDriver[]>([])
  const [serviceRequests, setServiceRequests] = useState<FleetServiceRequest[]>([])
  const [analytics, setAnalytics] = useState<FleetAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'map' | 'table' | 'requests' | 'analytics'>('map')

  useEffect(() => {
    loadFleetData()
  }, [])

  const loadFleetData = async () => {
    // Mock data - replace with actual API calls
    const mockVehicles: FleetVehicle[] = [
      {
        id: '1',
        vehicleNumber: 'TN-01-AB-1234',
        licensePlate: 'TN-01-AB-1234',
        make: 'Tata',
        model: 'Ace',
        year: 2022,
        driverId: 'driver1',
        driverName: 'Rajesh Kumar',
        status: 'active',
        location: { latitude: 9.9252, longitude: 78.1198 },
        address: 'Madurai Main Road, Tamil Nadu',
        lastUpdate: new Date()
      },
      {
        id: '2',
        vehicleNumber: 'TN-02-CD-5678',
        licensePlate: 'TN-02-CD-5678',
        make: 'Mahindra',
        model: 'Bolero',
        year: 2021,
        driverId: 'driver2',
        driverName: 'Priya Sharma',
        status: 'breakdown',
        location: { latitude: 9.930, longitude: 78.115 },
        address: 'Meenakshi Temple Area, Madurai',
        lastUpdate: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: '3',
        vehicleNumber: 'TN-03-EF-9012',
        licensePlate: 'TN-03-EF-9012',
        make: 'Ashok Leyland',
        model: 'Dost',
        year: 2023,
        driverId: 'driver3',
        driverName: 'Suresh Babu',
        status: 'waiting',
        location: { latitude: 9.915, longitude: 78.125 },
        address: 'Thirumalai Nayakkar Palace, Madurai',
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: '4',
        vehicleNumber: 'TN-04-GH-3456',
        licensePlate: 'TN-04-GH-3456',
        make: 'Force',
        model: 'Traveller',
        year: 2020,
        status: 'maintenance',
        location: { latitude: 9.940, longitude: 78.130 },
        address: 'Madurai Junction Railway Station',
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ]

    const mockDrivers: FleetDriver[] = [
      {
        id: 'driver1',
        name: 'Rajesh Kumar',
        phone: '+91-9876543210',
        email: 'rajesh@fleet.com',
        licenseNumber: 'TN-DL-123456789',
        assignedVehicleId: '1',
        status: 'driving',
        joinDate: new Date('2023-01-15')
      },
      {
        id: 'driver2',
        name: 'Priya Sharma',
        phone: '+91-9876543211',
        email: 'priya@fleet.com',
        licenseNumber: 'TN-DL-987654321',
        assignedVehicleId: '2',
        status: 'driving',
        joinDate: new Date('2023-03-20')
      },
      {
        id: 'driver3',
        name: 'Suresh Babu',
        phone: '+91-9876543212',
        email: 'suresh@fleet.com',
        licenseNumber: 'TN-DL-456789123',
        assignedVehicleId: '3',
        status: 'driving',
        joinDate: new Date('2023-02-10')
      },
      {
        id: 'driver4',
        name: 'Anitha Devi',
        phone: '+91-9876543213',
        email: 'anitha@fleet.com',
        licenseNumber: 'TN-DL-789123456',
        status: 'available',
        joinDate: new Date('2023-04-05')
      }
    ]

    const mockServiceRequests: FleetServiceRequest[] = [
      {
        id: 'req1',
        vehicleId: '2',
        vehicleNumber: 'TN-02-CD-5678',
        driverId: 'driver2',
        driverName: 'Priya Sharma',
        location: { latitude: 9.930, longitude: 78.115 },
        address: 'Meenakshi Temple Area, Madurai',
        issue: 'Engine Overheating',
        description: 'Engine temperature gauge showing red, steam coming from hood',
        severity: 'high',
        status: 'requested',
        requestedAt: new Date(Date.now() - 30 * 60 * 1000),
        estimatedCost: 5000
      },
      {
        id: 'req2',
        vehicleId: '1',
        vehicleNumber: 'TN-01-AB-1234',
        driverId: 'driver1',
        driverName: 'Rajesh Kumar',
        location: { latitude: 9.9252, longitude: 78.1198 },
        address: 'Madurai Main Road, Tamil Nadu',
        issue: 'Flat Tire',
        description: 'Front left tire punctured, need replacement',
        severity: 'medium',
        status: 'resolved',
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        assignedMechanicId: 'mech1',
        assignedMechanicName: 'Kumar Auto Works',
        resolvedAt: new Date(Date.now() - 30 * 60 * 1000),
        estimatedCost: 1500,
        actualCost: 1200
      }
    ]

    const mockAnalytics: FleetAnalytics = {
      totalVehicles: mockVehicles.length,
      activeVehicles: mockVehicles.filter(v => v.status === 'active').length,
      vehiclesInService: mockVehicles.filter(v => ['breakdown', 'maintenance'].includes(v.status)).length,
      totalDrivers: mockDrivers.length,
      availableDrivers: mockDrivers.filter(d => d.status === 'available').length,
      totalServiceRequests: mockServiceRequests.length,
      pendingRequests: mockServiceRequests.filter(r => ['requested', 'assigned', 'in_progress'].includes(r.status)).length,
      resolvedRequests: mockServiceRequests.filter(r => r.status === 'resolved').length,
      averageResolutionTime: 45, // minutes
      totalCost: mockServiceRequests.reduce((sum, req) => sum + (req.actualCost || req.estimatedCost || 0), 0),
      mostCommonIssues: [
        { issue: 'Engine Problems', count: 5 },
        { issue: 'Tire Issues', count: 3 },
        { issue: 'Brake Problems', count: 2 },
        { issue: 'Electrical Issues', count: 1 }
      ]
    }

    setVehicles(mockVehicles)
    setDrivers(mockDrivers)
    setServiceRequests(mockServiceRequests)
    setAnalytics(mockAnalytics)
    setLoading(false)
  }

  // Fleet Management Functions
  const handleVehicleClick = (vehicle: FleetVehicle) => {
    console.log('Vehicle clicked:', vehicle)
    // Could open a detailed modal or navigate to vehicle details
  }

  const handleViewVehicle = (vehicle: FleetVehicle) => {
    console.log('View vehicle:', vehicle)
    // Open vehicle details modal
  }

  const handleEditVehicle = (vehicle: FleetVehicle) => {
    console.log('Edit vehicle:', vehicle)
    // Open edit vehicle modal
  }

  const handleRemoveVehicle = (vehicleId: string) => {
    if (confirm('Are you sure you want to remove this vehicle?')) {
      setVehicles(vehicles.filter(v => v.id !== vehicleId))
    }
  }

  const handleAssignDriver = (vehicleId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId)
    if (driver) {
      // Update vehicle with driver
      setVehicles(vehicles.map(v => 
        v.id === vehicleId 
          ? { ...v, driverId, driverName: driver.name }
          : v
      ))
      // Update driver assignment
      setDrivers(drivers.map(d => 
        d.id === driverId 
          ? { ...d, assignedVehicleId: vehicleId }
          : d
      ))
    }
  }

  const handleAddVehicle = () => {
    console.log('Add new vehicle')
    // Open add vehicle modal
  }

  const handleAssignMechanic = (requestId: string) => {
    console.log('Assign mechanic to request:', requestId)
    // Open mechanic assignment modal
  }

  const handleViewRequest = (request: FleetServiceRequest) => {
    console.log('View request:', request)
    // Open request details modal
  }

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
            <p className="text-sm text-gray-600">Welcome back, {user?.fullName} • Fleet Owner</p>
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