import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, 
  Search, 
  Package, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Users,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

interface DashboardProps {
  providersCount?: number
  currentLocation?: string
}

const EnhancedBottomDashboard: React.FC<DashboardProps> = ({ 
  providersCount = 3, 
  currentLocation = "Madurai, TN" 
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)

  const dashboardItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/home',
      color: 'text-blue-500'
    },
    {
      id: 'find-help',
      label: 'Find Help',
      icon: Search,
      path: '/providers',
      color: 'text-gray-500'
    },
    {
      id: 'parts',
      label: 'Parts',
      icon: Package,
      path: '/parts',
      color: 'text-gray-500'
    },
    {
      id: 'sos',
      label: 'SOS',
      icon: AlertTriangle,
      path: '/emergency',
      color: 'text-red-500'
    }
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      {/* Expandable Info Panel */}
      {isExpanded && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Quick Stats</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">{currentLocation}</p>
                <p className="text-gray-600">Current Location</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">{providersCount} Available</p>
                <p className="text-gray-600">Service Providers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="font-medium text-gray-900">7-15 min</p>
                <p className="text-gray-600">Avg Response</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Navigation Items */}
          <div className="flex justify-around flex-1 max-w-md">
            {dashboardItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || 
                              (item.id === 'home' && location.pathname === '/')
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 scale-105' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isActive ? 'bg-blue-100' : ''
                  }`}>
                    <Icon 
                      className={`h-5 w-5 ${
                        isActive 
                          ? item.id === 'sos' ? 'text-red-500' : 'text-blue-500'
                          : item.id === 'sos' ? 'text-red-400' : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    isActive 
                      ? item.id === 'sos' ? 'text-red-500' : 'text-blue-500'
                      : item.id === 'sos' ? 'text-red-400' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EnhancedBottomDashboard