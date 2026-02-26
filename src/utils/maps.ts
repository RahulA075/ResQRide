// Google Maps utility functions

// Indian Cities Coordinates
export const INDIAN_CITIES = {
  MADURAI: { latitude: 9.9252, longitude: 78.1198 },
  CHENNAI: { latitude: 13.0827, longitude: 80.2707 },
  BANGALORE: { latitude: 12.9716, longitude: 77.5946 },
  MUMBAI: { latitude: 19.0760, longitude: 72.8777 },
  DELHI: { latitude: 28.7041, longitude: 77.1025 },
  HYDERABAD: { latitude: 17.3850, longitude: 78.4867 },
  PUNE: { latitude: 18.5204, longitude: 73.8567 },
  KOLKATA: { latitude: 22.5726, longitude: 88.3639 },
  AHMEDABAD: { latitude: 23.0225, longitude: 72.5714 },
  JAIPUR: { latitude: 26.9124, longitude: 75.7873 }
} as const

export const validateGoogleMapsApiKey = (): boolean => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    console.error('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.')
    return false
  }
  
  if (apiKey === 'your_google_maps_api_key_here') {
    console.warn('Please replace the placeholder Google Maps API key with your actual API key.')
    return false
  }
  
  return true
}

export const getGoogleMapsApiKey = (): string => {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
}

export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

export const isPlacesApiLoaded = (): boolean => {
  return !!(window.google && window.google.maps && window.google.maps.places)
}

export const waitForPlacesApi = (): Promise<void> => {
  return new Promise((resolve) => {
    const checkApi = () => {
      if (isPlacesApiLoaded()) {
        resolve()
      } else {
        setTimeout(checkApi, 100)
      }
    }
    checkApi()
  })
}