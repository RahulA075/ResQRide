import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Package, AlertTriangle } from 'lucide-react'

const SimpleBottomNav: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/home'
    },
    {
      id: 'find-help',
      label: 'Find Help',
      icon: Search,
      path: '/providers'
    },
    {
      id: 'parts',
      label: 'Parts',
      icon: Package,
      path: '/parts'
    },
    {
      id: 'sos',
      label: 'SOS',
      icon: AlertTriangle,
      path: '/emergency'
    }
  ]

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
      <div className="flex justify-around items-center max-w-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || 
                          (item.id === 'home' && (location.pathname === '/' || location.pathname === '/home'))
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center space-y-1 py-1 px-2 transition-colors"
            >
              <Icon 
                className={`h-6 w-6 ${
                  isActive 
                    ? item.id === 'sos' ? 'text-red-500' : 'text-blue-500'
                    : 'text-gray-400'
                }`} 
              />
              <span className={`text-xs font-medium ${
                isActive 
                  ? item.id === 'sos' ? 'text-red-500' : 'text-blue-500'
                  : 'text-gray-500'
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

export default SimpleBottomNav