// Import React for JSX

// Footer component - displays footer information
function Footer() {
  return (
    // Footer container
    // bg-white: white background
    // border-t: top border
    // py-4: vertical padding
    <footer className="bg-white border-t py-4 mt-auto">
      <div className="container mx-auto px-4">
        {/* Footer content */}
        <div className="text-center text-sm text-gray-600">
          {/* Copyright notice */}
          <p>© 2024 CFMS - Copper-to-Fiber Migration System</p>
          {/* Version or additional info */}
          <p className="mt-1">Built for BC Telecom Service Provider</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

