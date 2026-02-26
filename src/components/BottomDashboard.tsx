import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Package, AlertTriangle } from 'lucide-react'

const BottomDashboard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

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
    <div className="bg-white border-t border-gray-200 px-4 py-2 shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
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
                  className={`h-6 w-6 ${
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
    </div>
  )
}

export default BottomDashboard