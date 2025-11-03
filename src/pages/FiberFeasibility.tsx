// Import React for JSX and useState for component state
import { useState } from 'react'
// Import mock data
import { mockLocations } from '../services/mockData'
import type { Location, FiberStatus } from '../types'

// FiberFeasibility component - validate fiber readiness
function FiberFeasibility() {
  // State to store locations
  const [locations, setLocations] = useState<Location[]>(mockLocations)
  
  // State for filter
  const [selectedRegion, setSelectedRegion] = useState<string>('All')

  // Get unique regions
  const regions = ['All', ...new Set(locations.map(loc => loc.region))]

  // Filter locations by region
  const filteredLocations = locations.filter(
    (loc) => selectedRegion === 'All' || loc.region === selectedRegion
  )

  // Count locations by fiber status
  const fiberReadyCount = filteredLocations.filter(loc => loc.fiber_status === 'Fiber Ready').length
  const pendingCount = filteredLocations.filter(loc => loc.fiber_status === 'Pending Feasibility').length
  const copperOnlyCount = filteredLocations.filter(loc => loc.fiber_status === 'Copper Only').length

  // Handle manual status update (placeholder - will save to Supabase in Phase 3)
  const handleStatusUpdate = (locationId: string, newStatus: FiberStatus) => {
    // Update local state (in real app, this would update Supabase)
    setLocations(
      locations.map((loc) =>
        loc.id === locationId ? { ...loc, fiber_status: newStatus } : loc
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-3xl font-bold text-gray-900">Fiber Feasibility Validation</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fiber Ready Card */}
        <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Fiber Ready</p>
              <p className="text-3xl font-bold text-green-800 mt-2">{fiberReadyCount}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        {/* Pending Feasibility Card */}
        <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Pending Feasibility</p>
              <p className="text-3xl font-bold text-yellow-800 mt-2">{pendingCount}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        {/* Copper Only Card */}
        <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Copper Only</p>
              <p className="text-3xl font-bold text-red-800 mt-2">{copperOnlyCount}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Region
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2"
        >
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Locations Table with Manual Update */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Map through filtered locations */}
              {filteredLocations.map((location) => (
                <tr key={location.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {location.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {location.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Current status badge */}
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        location.fiber_status === 'Fiber Ready'
                          ? 'bg-green-100 text-green-800'
                          : location.fiber_status === 'Pending Feasibility'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {location.fiber_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {/* Status update dropdown - allows Network Planner to override */}
                    <select
                      value={location.fiber_status}
                      onChange={(e) => handleStatusUpdate(location.id, e.target.value as FiberStatus)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="Fiber Ready">Fiber Ready</option>
                      <option value="Pending Feasibility">Pending Feasibility</option>
                      <option value="Copper Only">Copper Only</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Visualization Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Fiber Status Map</h2>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          {/* Placeholder for color-coded map - will implement in Phase 3 */}
          <p className="text-gray-500">Color-coded map visualization will be implemented in Phase 3</p>
        </div>
      </div>
    </div>
  )
}

export default FiberFeasibility

