import React from 'react'
import { MapPin, Users, Wrench } from 'lucide-react'

const WelcomeHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <Wrench className="h-6 w-6" />
            <span>AI Roadside Assistance</span>
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Find nearby mechanics and emergency services in Madurai
          </p>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>Madurai, TN</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>3 Providers</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeHeader