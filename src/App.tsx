// Import React for JSX support
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// Import the layout component that wraps all pages
import Layout from './components/Layout'
// Import all page components
import Dashboard from './pages/Dashboard'
import AssetsLocations from './pages/AssetsLocations'
import FiberFeasibility from './pages/FiberFeasibility'
import TechnicianScheduling from './pages/TechnicianScheduling'
import CustomerEngagement from './pages/CustomerEngagement'
import WavesManagement from './pages/WavesManagement'
import Reports from './pages/Reports'

// Main App component - sets up routing
function App() {
  return (
    // BrowserRouter enables client-side routing (no page refreshes)
    <Router>
      {/* Layout component wraps all routes to provide consistent header/sidebar */}
      <Layout>
        {/* Routes defines all available paths in the application */}
        <Routes>
          {/* Root path redirects to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Dashboard route - main overview page */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Assets & Locations route - manage inventory */}
          <Route path="/assets-locations" element={<AssetsLocations />} />
          {/* Fiber Feasibility route - validate fiber readiness */}
          <Route path="/fiber-feasibility" element={<FiberFeasibility />} />
          {/* Technician Scheduling route - assign and track jobs */}
          <Route path="/technician-scheduling" element={<TechnicianScheduling />} />
          {/* Customer Engagement route - manage consent */}
          <Route path="/customer-engagement" element={<CustomerEngagement />} />
          {/* Waves Management route - create and track migration waves */}
          <Route path="/waves-management" element={<WavesManagement />} />
          {/* Reports route - analytics and exports */}
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

