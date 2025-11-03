// Import React - required for JSX
import React from 'react'
// ReactDOM is used to render React components into the DOM
import ReactDOM from 'react-dom/client'
// Import the main App component
import App from './App.tsx'
// Import global CSS styles including Tailwind
import './index.css'

// Get the root DOM element (div with id="root" from index.html)
// The non-null assertion (!) tells TypeScript we're sure this element exists
ReactDOM.createRoot(document.getElementById('root')!).render(
  // React.StrictMode helps identify potential problems during development
  <React.StrictMode>
    {/* Render the App component as the root of our application */}
    <App />
  </React.StrictMode>,
)

