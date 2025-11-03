// Import React for JSX
import { Link } from 'react-router-dom'

// Header component - displays top navigation bar with app title
function Header() {
  return (
    // Header container with styling
    // bg-white: white background
    // shadow-md: medium shadow for depth
    // z-10: ensures header stays above other content
    <header className="bg-white shadow-md z-10">
      <div className="container mx-auto px-4 py-4">
        {/* Flexbox container for header content */}
        <div className="flex items-center justify-between">
          {/* Left side - App logo/title */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            {/* App title */}
            <h1 className="text-2xl font-bold text-primary-700">
              CFMS
            </h1>
            {/* Subtitle for clarity */}
            <span className="text-sm text-gray-600">
              Copper-to-Fiber Migration System
            </span>
          </Link>
          
          {/* Right side - User info placeholder */}
          <div className="flex items-center space-x-4">
            {/* Placeholder for user avatar/name */}
            <span className="text-sm text-gray-600">
              User Profile
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

