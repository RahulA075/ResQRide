import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import {
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
  LogOut,
  Settings,
  MapPin,
  Phone,
  User,
  Star,
  TrendingUp,
  Bell,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

interface ServiceRequest {
  id: string
  driverName: string
  driverPhone: string
  issue: string
  description: string
  location: string
  distance: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  requestedAt: Date
  vehicleMake?: string
  vehicleModel?: string
}

const ServiceProviderDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [isAvailable, setIsAvailable] = useState(true)
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history' | 'profile'>('requests')
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await api.get<{ requests: any[] }>('/users/emergency-requests')
      const mapped: ServiceRequest[] = (data.requests || []).map((r: any) => ({
        id: r.id,
        driverName: r.driver?.full_name || 'Unknown Driver',
        driverPhone: r.driver?.phone || '',
        issue: r.service_type,
        description: r.description,
        location: `${r.latitude?.toFixed(4)}, ${r.longitude?.toFixed(4)}`,
        distance: r.distance ? `${r.distance.toFixed(1)} km` : 'Nearby',
        status: r.status,
        requestedAt: new Date(r.created_at),
        vehicleMake: r.vehicle_make,
        vehicleModel: r.vehicle_model
      }))
      setRequests(mapped)
    } catch (err) {
      console.error('Failed to load requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId: string) => {
    try {
      await api.post(`/emergency/request/${requestId}/accept`, { estimatedArrival: 15 })
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r))
    } catch (err) {
      console.error('Failed to accept:', err)
    }
  }

  const handleMarkInProgress = async (requestId: string) => {
    try {
      await api.patch(`/emergency/request/${requestId}/status`, { status: 'in_progress' })
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'in_progress' } : r))
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleComplete = async (requestId: string) => {
    try {
      await api.patch(`/emergency/request/${requestId}/status`, { status: 'completed' })
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'completed' } : r))
    } catch (err) {
      console.error('Failed to complete:', err)
    }
  }

  const handleDecline = async (requestId: string) => {
    try {
      await api.patch(`/emergency/request/${requestId}/status`, { status: 'cancelled' })
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'cancelled' } : r))
    } catch (err) {
      console.error('Failed to decline:', err)
    }
  }

  const handleToggleAvailability = async () => {
    try {
      await api.patch(`/providers/${user?.id}/availability`, { available: !isAvailable })
      setIsAvailable(!isAvailable)
    } catch (err) {
      console.error('Failed to update availability:', err)
      setIsAvailable(!isAvailable) // optimistic still toggle UI
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const activeRequests = requests.filter(r => ['accepted', 'in_progress'].includes(r.status))
  const historyRequests = requests.filter(r => ['completed', 'cancelled'].includes(r.status))

  const getStatusBadge = (status: ServiceRequest['status']) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-500'
    }
    const labels: Record<string, string> = {
      pending: 'Pending',
      accepted: 'Accepted',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    return `${hrs}h ago`
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
            <h1 className="text-xl font-bold text-gray-900">Service Provider</h1>
            <p className="text-sm text-gray-600">
              {user?.business_name || user?.full_name} • Provider
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Availability toggle */}
            <button
              onClick={handleToggleAvailability}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isAvailable
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isAvailable ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              <span>{isAvailable ? 'Available' : 'Offline'}</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center space-x-1 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Pending', value: pendingRequests.length, icon: Bell, color: 'text-yellow-500' },
            { label: 'Active', value: activeRequests.length, icon: Wrench, color: 'text-blue-500' },
            { label: 'Completed', value: historyRequests.filter(r => r.status === 'completed').length, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Rating', value: '4.8★', icon: Star, color: 'text-orange-400' }
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="text-center">
                <Icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-4">
        <div className="flex space-x-6">
          {[
            { id: 'requests', label: 'New Requests', count: pendingRequests.length },
            { id: 'active', label: 'Active', count: activeRequests.length },
            { id: 'history', label: 'History', count: null },
            { id: 'profile', label: 'Profile', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {/* New Requests Tab */}
        {activeTab === 'requests' && (
          <>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No new requests</p>
                <p className="text-sm">You'll be notified when drivers need help nearby</p>
              </div>
            ) : (
              pendingRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-yellow-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{req.issue}</h3>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{req.vehicleMake} {req.vehicleModel}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatTime(req.requestedAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{req.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{req.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>{req.distance}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{req.driverName}</span>
                      <a href={`tel:${req.driverPhone}`} className="flex items-center space-x-1 text-primary-600">
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="px-3 py-1.5 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Active Tab */}
        {activeTab === 'active' && (
          <>
            {activeRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No active jobs</p>
                <p className="text-sm">Accept requests to see them here</p>
              </div>
            ) : (
              activeRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{req.issue}</h3>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-sm text-gray-500">{req.driverName} • {req.location}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatTime(req.requestedAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{req.description}</p>
                  <div className="flex justify-between items-center">
                    <a
                      href={`tel:${req.driverPhone}`}
                      className="flex items-center space-x-1 text-sm text-primary-600"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Driver</span>
                    </a>
                    <div className="flex space-x-2">
                      {req.status === 'accepted' && (
                        <button
                          onClick={() => handleMarkInProgress(req.id)}
                          className="px-3 py-1.5 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                        >
                          Start Work
                        </button>
                      )}
                      {req.status === 'in_progress' && (
                        <button
                          onClick={() => handleComplete(req.id)}
                          className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            {historyRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No history yet</p>
              </div>
            ) : (
              historyRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{req.issue}</h3>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{req.driverName} • {req.location}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatTime(req.requestedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{user?.full_name}</h2>
                <p className="text-sm text-gray-500">{user?.business_name || 'Service Provider'}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-sm text-gray-400">(24 reviews)</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{user?.phone}</span>
              </div>
              {user?.business_address && (
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{user?.business_address}</span>
                </div>
              )}
            </div>
            <div className="border-t pt-4">
              <button className="flex items-center space-x-2 text-sm text-primary-600">
                <Settings className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceProviderDashboard
