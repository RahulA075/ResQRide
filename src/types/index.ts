export interface Coordinates {
  latitude: number
  longitude: number
}

export interface ServiceProvider {
  id: string
  businessName: string
  contactInfo: {
    phone: string
    email: string
  }
  location: Coordinates
  services: ServiceType[]
  rating: {
    average: number
    totalReviews: number
  }
  availability: boolean
  operatingHours: {
    open: string
    close: string
  }
  isVerified: boolean
  distance?: number
  estimatedArrival?: number
}

export interface ServiceType {
  id: string
  name: string
  category: 'mechanical' | 'electrical' | 'towing' | 'parts'
}

export interface VehicleInfo {
  make: string
  model: string
  year: number
  type: 'motorcycle' | 'car' | 'truck'
  licensePlate: string
}

export interface ServiceRequest {
  id: string
  location: Coordinates
  vehicleInfo: VehicleInfo
  issueDescription: string
  symptoms: string[]
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency'
  status: 'pending' | 'accepted' | 'in_progress' | 'completed'
}

export interface Part {
  id: string
  name: string
  partNumber: string
  category: string
  price: number
  availability: number
  supplier: {
    name: string
    location: Coordinates
    distance: number
  }
}

// Fleet Management Types
export interface FleetVehicle {
  id: string
  vehicleNumber: string
  licensePlate: string
  make: string
  model: string
  year: number
  driverId?: string
  driverName?: string
  status: 'active' | 'waiting' | 'breakdown' | 'maintenance'
  location: Coordinates
  lastUpdate: Date
  address?: string
}

export interface FleetDriver {
  id: string
  name: string
  phone: string
  email: string
  licenseNumber: string
  assignedVehicleId?: string
  status: 'available' | 'driving' | 'on_break'
  joinDate: Date
}

export interface FleetServiceRequest {
  id: string
  vehicleId: string
  vehicleNumber: string
  driverId: string
  driverName: string
  location: Coordinates
  address: string
  issue: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'emergency'
  status: 'requested' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled'
  requestedAt: Date
  assignedMechanicId?: string
  assignedMechanicName?: string
  resolvedAt?: Date
  estimatedCost?: number
  actualCost?: number
}

export interface FleetAnalytics {
  totalVehicles: number
  activeVehicles: number
  vehiclesInService: number
  totalDrivers: number
  availableDrivers: number
  totalServiceRequests: number
  pendingRequests: number
  resolvedRequests: number
  averageResolutionTime: number // in minutes
  totalCost: number
  mostCommonIssues: Array<{
    issue: string
    count: number
  }>
}