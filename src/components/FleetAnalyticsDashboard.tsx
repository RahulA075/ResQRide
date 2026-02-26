import React from 'react'
import { FleetAnalytics } from '../types'
import { 
  Truck, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  BarChart3
} from 'lucide-react'

interface FleetAnalyticsDashboardProps {
  analytics: FleetAnalytics
}

const FleetAnalyticsDashboard: React.FC<FleetAnalyticsDashboardProps> = ({ analytics }) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const getResolutionTimeColor = (minutes: number) => {
    if (minutes <= 30) return 'text-green-600'
    if (minutes <= 60) return 'text-yellow-600'
    if (minutes <= 120) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vehicles */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalVehicles}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {analytics.activeVehicles} active, {analytics.vehiclesInService} in service
          </div>
        </div>

        {/* Total Drivers */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalDrivers}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {analytics.availableDrivers} available
          </div>
        </div>

        {/* Service Requests */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Service Requests</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalServiceRequests}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {analytics.pendingRequests} pending, {analytics.resolvedRequests} resolved
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
              <p className={`text-2xl font-bold ${getResolutionTimeColor(analytics.averageResolutionTime)}`}>
                {formatTime(analytics.averageResolutionTime)}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Response time
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Fleet Status Breakdown */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Fleet Status</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Active Vehicles</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">{analytics.activeVehicles}</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({Math.round((analytics.activeVehicles / analytics.totalVehicles) * 100)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">In Service</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">{analytics.vehiclesInService}</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({Math.round((analytics.vehiclesInService / analytics.totalVehicles) * 100)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Available</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">
                  {analytics.totalVehicles - analytics.activeVehicles - analytics.vehiclesInService}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({Math.round(((analytics.totalVehicles - analytics.activeVehicles - analytics.vehiclesInService) / analytics.totalVehicles) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cost Analysis</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Service Cost</span>
              <span className="text-lg font-bold text-gray-900">
                ₹{analytics.totalCost.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Average per Request</span>
              <span className="text-sm font-bold text-gray-900">
                ₹{analytics.totalServiceRequests > 0 
                  ? Math.round(analytics.totalCost / analytics.totalServiceRequests).toLocaleString('en-IN')
                  : '0'
                }
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Cost per Vehicle</span>
              <span className="text-sm font-bold text-gray-900">
                ₹{analytics.totalVehicles > 0 
                  ? Math.round(analytics.totalCost / analytics.totalVehicles).toLocaleString('en-IN')
                  : '0'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Most Common Issues */}
      {analytics.mostCommonIssues.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Most Common Issues</h3>
          </div>
          
          <div className="space-y-3">
            {analytics.mostCommonIssues.slice(0, 5).map((issue, index) => {
              const percentage = Math.round((issue.count / analytics.totalServiceRequests) * 100)
              return (
                <div key={issue.issue} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{issue.issue}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8">{issue.count}</span>
                    <span className="text-xs text-gray-500 w-10">{percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default FleetAnalyticsDashboard