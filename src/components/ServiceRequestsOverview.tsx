import React, { useState } from 'react'
import { FleetServiceRequest } from '../types'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  User, 
  MapPin,
  Wrench,
  Filter,
  Calendar
} from 'lucide-react'

interface ServiceRequestsOverviewProps {
  serviceRequests: FleetServiceRequest[]
  onAssignMechanic: (requestId: string) => void
  onViewRequest: (request: FleetServiceRequest) => void
}

const ServiceRequestsOverview: React.FC<ServiceRequestsOverviewProps> = ({
  serviceRequests,
  onAssignMechanic,
  onViewRequest
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'status'>('date')

  const getStatusConfig = (status: FleetServiceRequest['status']) => {
    const configs = {
      requested: { 
        color: 'bg-red-100 text-red-800', 
        icon: AlertTriangle, 
        label: 'Requested' 
      },
      assigned: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock, 
        label: 'Assigned' 
      },
      in_progress: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: Wrench, 
        label: 'In Progress' 
      },
      resolved: { 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle, 
        label: 'Resolved' 
      },
      cancelled: { 
        color: 'bg-gray-100 text-gray-800', 
        icon: AlertTriangle, 
        label: 'Cancelled' 
      }
    }
    return configs[status]
  }

  const getSeverityColor = (severity: FleetServiceRequest['severity']) => {
    const colors = {
      low: 'text-blue-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      emergency: 'text-red-600'
    }
    return colors[severity]
  }

  const filteredRequests = serviceRequests
    .filter(request => {
      if (filter === 'all') return true
      if (filter === 'pending') return ['requested', 'assigned'].includes(request.status)
      if (filter === 'in_progress') return request.status === 'in_progress'
      if (filter === 'resolved') return request.status === 'resolved'
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.requestedAt.getTime() - a.requestedAt.getTime()
      }
      if (sortBy === 'severity') {
        const severityOrder = { emergency: 4, high: 3, medium: 2, low: 1 }
        return severityOrder[b.severity] - severityOrder[a.severity]
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status)
      }
      return 0
    })

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Service Requests</h2>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="severity">Sort by Severity</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'All', count: serviceRequests.length },
            { key: 'pending', label: 'Pending', count: serviceRequests.filter(r => ['requested', 'assigned'].includes(r.status)).length },
            { key: 'in_progress', label: 'In Progress', count: serviceRequests.filter(r => r.status === 'in_progress').length },
            { key: 'resolved', label: 'Resolved', count: serviceRequests.filter(r => r.status === 'resolved').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === tab.key
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Requests</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'No service requests found.' : `No ${filter.replace('_', ' ')} requests.`}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const statusConfig = getStatusConfig(request.status)
            const StatusIcon = statusConfig.icon

            return (
              <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{request.vehicleNumber}</span>
                        <span className={`text-sm font-medium ${getSeverityColor(request.severity)}`}>
                          {request.severity.toUpperCase()}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} flex items-center space-x-1`}>
                        <StatusIcon className="h-3 w-3" />
                        <span>{statusConfig.label}</span>
                      </span>
                    </div>

                    {/* Issue */}
                    <p className="text-sm text-gray-900 mb-2 font-medium">{request.issue}</p>
                    {request.description && (
                      <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                    )}

                    {/* Details */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{request.driverName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-32">{request.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{getTimeAgo(request.requestedAt)}</span>
                      </div>
                    </div>

                    {/* Mechanic Info */}
                    {request.assignedMechanicName && (
                      <div className="mt-2 flex items-center space-x-1 text-sm text-blue-600">
                        <Wrench className="h-3 w-3" />
                        <span>Assigned to: {request.assignedMechanicName}</span>
                      </div>
                    )}

                    {/* Cost Info */}
                    {(request.estimatedCost || request.actualCost) && (
                      <div className="mt-2 text-sm text-gray-600">
                        {request.actualCost ? (
                          <span>Final Cost: ₹{request.actualCost.toLocaleString('en-IN')}</span>
                        ) : (
                          <span>Estimated Cost: ₹{request.estimatedCost?.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => onViewRequest(request)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      View
                    </button>
                    {request.status === 'requested' && (
                      <button
                        onClick={() => onAssignMechanic(request.id)}
                        className="px-3 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ServiceRequestsOverview