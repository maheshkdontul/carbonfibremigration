// Import React for JSX
import { ReactNode } from 'react'
// Import React Router's useLocation to get current route
import { useLocation } from 'react-router-dom'
// Import layout components
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

// Props interface - defines what props this component accepts
interface LayoutProps {
  // children is the content that will be rendered inside the layout
  children: ReactNode
}

// Layout component - provides consistent page structure (header, sidebar, footer)
function Layout({ children }: LayoutProps) {
  // Get current route path for highlighting active nav item
  const location = useLocation()
  
  return (
    // Flex container - makes layout flexible
    <div className="min-h-screen flex flex-col">
      {/* Header component - appears at top of every page */}
      <Header />
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar component - navigation menu on the left */}
        <Sidebar currentPath={location.pathname} />
        
        {/* Main content area - where page-specific content renders */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {/* children prop contains the page component (Dashboard, Assets, etc.) */}
          {children}
        </main>
      </div>
      
      {/* Footer component - appears at bottom of every page */}
      <Footer />
    </div>
  )
}

export default Layout

