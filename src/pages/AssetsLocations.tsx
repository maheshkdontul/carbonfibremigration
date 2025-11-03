// Import React for JSX and useState for component state
import { useState } from 'react'
// Import mock data
import { mockAssets, mockLocations } from '../services/mockData'
import type { Asset, Location } from '../types'

// AssetsLocations component - manage inventory
function AssetsLocations() {
  // State to store data
  const [assets] = useState<Asset[]>(mockAssets)
  const [locations] = useState<Location[]>(mockLocations)
  
  // State for filters
  const [selectedRegion, setSelectedRegion] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  // Get unique regions from locations
  const regions = ['All', ...new Set(locations.map(loc => loc.region))]

  // Filter assets based on selected filters
  const filteredAssets = assets.filter((asset) => {
    // Find location for this asset
    const location = locations.find(loc => loc.id === asset.location_id)
    
    // Filter by region
    const regionMatch = selectedRegion === 'All' || location?.region === selectedRegion
    // Filter by asset type
    const typeMatch = selectedType === 'All' || asset.type === selectedType
    // Filter by status
    const statusMatch = selectedStatus === 'All' || asset.status === selectedStatus
    
    // Asset passes if all filters match
    return regionMatch && typeMatch && statusMatch
  })

  // Handle CSV upload (placeholder - will implement actual upload in Phase 3)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Placeholder: show alert (actual parsing will be in Phase 3)
      alert(`CSV upload placeholder: ${file.name} selected`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page title and action buttons */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Assets & Locations</h1>
        
        {/* CSV Upload Button */}
        <label className="btn-primary cursor-pointer">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          Upload CSV
        </label>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Region Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Asset Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="All">All</option>
              <option value="copper">Copper</option>
              <option value="fiber">Fiber</option>
              <option value="ONT">ONT</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="All">All</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Map through filtered assets */}
              {filteredAssets.map((asset) => {
                // Find associated location
                const location = locations.find(loc => loc.id === asset.location_id)
                
                return (
                  <tr key={asset.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {asset.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {location?.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location?.region || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Color-coded status badge */}
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          asset.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : asset.status === 'active'
                            ? 'bg-blue-100 text-blue-800'
                            : asset.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Visualization Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Map</h2>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          {/* Placeholder for map - will implement with Mapbox/Leaflet in Phase 3 */}
          <p className="text-gray-500">Map visualization will be implemented in Phase 3</p>
        </div>
      </div>
    </div>
  )
}

export default AssetsLocations

