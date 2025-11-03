import { defineConfig } from 'vite'
// Import the React plugin for Vite to handle JSX/TSX files
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Plugins array - Vite uses plugins to transform different file types
  plugins: [react()],
  // Server configuration for development
  server: {
    // Port number for the development server
    port: 3000,
    // Automatically open browser when server starts
    open: true,
    // Configure CORS if needed
    cors: true
  },
  // Preview configuration for production build preview
  preview: {
    port: 3000,
    // This ensures React Router works correctly - all routes serve index.html
    // This is handled automatically by Vite for client-side routing
  }
})

