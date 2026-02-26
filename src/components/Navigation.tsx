import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, Package, AlertTriangle, BarChart3 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Navigation: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Don't show navigation on tracking screen or auth pages
  if (location.pathname.startsWith('/tracking/') || 
      location.pathname.includes('/login') || 
      location.pathname.includes('/register')) {
    return null
  }

  const driverNavItems = [
    { path: '/find-help', icon: Home, label: 'Home' },
    { path: '/providers', icon: Search, label: 'Find Help' },
    { path: '/parts', icon: Package, label: 'Parts' },
    { path: '/emergency', icon: AlertTriangle, label: 'SOS' },
  ]

  const fleetOwnerNavItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  ]

  const navItems = user?.role === 'driver' ? driverNavItems : fleetOwnerNavItems

  // Don't show navigation on tracking screen
  if (location.pathname.startsWith('/tracking/')) {
    return null
  }

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-5 w-5 ${item.path === '/emergency' ? 'text-emergency-500' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Navigation