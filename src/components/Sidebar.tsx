// Import React for JSX
import { Link } from 'react-router-dom'

// Interface defining the navigation item structure
interface NavItem {
  // Path in the URL
  path: string
  // Display name in sidebar
  label: string
  // Icon (we'll use emoji for now, could be replaced with icon library)
  icon: string
}

// Sidebar component - displays navigation menu
function Sidebar({ currentPath }: { currentPath: string }) {
  // Navigation items array - defines all menu options
  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/assets-locations', label: 'Assets & Locations', icon: '📍' },
    { path: '/fiber-feasibility', label: 'Fiber Feasibility', icon: '🔌' },
    { path: '/technician-scheduling', label: 'Technician Scheduling', icon: '👷' },
    { path: '/customer-engagement', label: 'Customer Engagement', icon: '📞' },
    { path: '/waves-management', label: 'Waves Management', icon: '🌊' },
    { path: '/reports', label: 'Reports & Analytics', icon: '📈' },
  ]
  
  return (
    // Sidebar container
    // w-64: fixed width of 16rem (256px)
    // bg-white: white background
    // shadow-lg: large shadow for depth
    // min-h-screen: full height
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <nav className="p-4">
        {/* Navigation list */}
        <ul className="space-y-2">
          {/* Map through nav items to create list items */}
          {navItems.map((item) => {
            // Check if this item is currently active (matches current path)
            const isActive = currentPath === item.path
            
            return (
              // List item for each navigation link
              <li key={item.path}>
                {/* Navigation link */}
                <Link
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-colors
                    ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 font-semibold' // Active state
                        : 'text-gray-700 hover:bg-gray-100' // Default/hover state
                    }
                  `}
                >
                  {/* Icon */}
                  <span className="text-xl">{item.icon}</span>
                  {/* Label */}
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

