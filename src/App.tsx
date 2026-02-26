import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import LocationScreen from './screens/LocationScreen'
import ServiceProviderList from './screens/ServiceProviderList'
import ServiceProviderDetails from './screens/ServiceProviderDetails'
import EmergencyScreen from './screens/EmergencyScreen'
import PartsMarketplace from './screens/PartsMarketplace'
import TrackingScreen from './screens/TrackingScreen'
import FleetDashboard from './screens/FleetDashboard'
import MapDemoScreen from './screens/MapDemoScreen'
import BasicMapTestScreen from './screens/BasicMapTestScreen'
import MapTestLandingScreen from './screens/MapTestLandingScreen'
import GoogleMapDebugScreen from './screens/GoogleMapDebugScreen'
import HomePage from './screens/HomePage'
import MapApiTestScreen from './screens/MapApiTestScreen'
import QuickMapTestScreen from './screens/QuickMapTestScreen'
import Navigation from './components/Navigation'

const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <div className="h-full flex flex-col">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to={user?.role === 'driver' ? '/find-help' : '/dashboard'} replace />} />
        <Route path="/register" element={!user ? <RegisterScreen /> : <Navigate to={user?.role === 'driver' ? '/find-help' : '/dashboard'} replace />} />
        <Route path="/map-demo" element={<MapDemoScreen />} />
        <Route path="/map-test" element={<BasicMapTestScreen />} />
        <Route path="/maps" element={<MapTestLandingScreen />} />
        <Route path="/debug-maps" element={<GoogleMapDebugScreen />} />
        <Route path="/api-test" element={<MapApiTestScreen />} />
        <Route path="/quick-test" element={<QuickMapTestScreen />} />
        <Route path="/home" element={<HomePage />} />
        
        {/* Default Route - Redirect to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Driver Routes */}
        <Route path="/find-help" element={
          <ProtectedRoute requiredRole="driver">
            <LocationScreen />
          </ProtectedRoute>
        } />
        <Route path="/providers" element={
          <ProtectedRoute requiredRole="driver">
            <ServiceProviderList />
          </ProtectedRoute>
        } />
        <Route path="/provider/:id" element={
          <ProtectedRoute requiredRole="driver">
            <ServiceProviderDetails />
          </ProtectedRoute>
        } />
        <Route path="/emergency" element={
          <ProtectedRoute requiredRole="driver">
            <EmergencyScreen />
          </ProtectedRoute>
        } />
        <Route path="/parts" element={
          <ProtectedRoute requiredRole="driver">
            <PartsMarketplace />
          </ProtectedRoute>
        } />
        <Route path="/tracking/:sessionId" element={
          <ProtectedRoute requiredRole="driver">
            <TrackingScreen />
          </ProtectedRoute>
        } />
        
        {/* Fleet Owner Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="fleet_owner">
            <FleetDashboard />
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Show navigation only for authenticated users and not on auth pages */}
      {user && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && (
        <Navigation />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App