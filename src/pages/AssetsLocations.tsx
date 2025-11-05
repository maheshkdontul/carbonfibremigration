/**
 * AssetsLocations Component
 * Manage inventory with Supabase integration and CSV upload
 */

import { useMemo, useState } from 'react'
import { useDataFetching } from '../hooks/useDataFetching'
import { fetchAssets, fetchLocations, bulkCreateAssets, createLocation } from '../services/api'
import { parseCSV, convertCSVToData } from '../utils/csvParser'
import { getErrorMessage } from '../utils/errorHandler'
import { FILTER_ALL, MAP_DISPLAY_LIMIT } from '../utils/constants'
import { validateCSVFile } from '../utils/validation'
import type { Asset, Location } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'
import Notification, { useNotification } from '../components/Notification'

function AssetsLocations() {
  // Fetch data using custom hooks
  const assetsData = useDataFetching<Asset>({ fetchFn: fetchAssets })
  const locationsData = useDataFetching<Location>({ fetchFn: fetchLocations })

  // Notification system
  const { notification, showNotification, dismissNotification } = useNotification()

  // State for CSV upload
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  // State for filters
  const [selectedRegion, setSelectedRegion] = useState<string>(FILTER_ALL)
  const [selectedType, setSelectedType] = useState<string>(FILTER_ALL)
  const [selectedStatus, setSelectedStatus] = useState<string>(FILTER_ALL)

  // Get unique regions from locations
  const regions = useMemo(
    () => [FILTER_ALL, ...new Set(locationsData.data.map((loc) => loc.region))],
    [locationsData.data]
  )

  // Filter assets based on selected filters
  const filteredAssets = useMemo(() => {
    return assetsData.data.filter((asset) => {
      const location = locationsData.data.find((loc) => loc.id === asset.location_id)
      const regionMatch = selectedRegion === FILTER_ALL || location?.region === selectedRegion
      const typeMatch = selectedType === FILTER_ALL || asset.type === selectedType
      const statusMatch = selectedStatus === FILTER_ALL || asset.status === selectedStatus
      return regionMatch && typeMatch && statusMatch
    })
  }, [assetsData.data, locationsData.data, selectedRegion, selectedType, selectedStatus])

  // Handle CSV file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateCSVFile(file)
    if (!validation.valid) {
      assetsData.clearError()
      showNotification(validation.error || 'Invalid file', 'error')
      return
    }

    setUploading(true)
    assetsData.clearError()
    setUploadResult(null)

    try {
      // Read file content
      const fileContent = await file.text()

      // Parse CSV
      const csvRows = parseCSV(fileContent)

      // Convert CSV rows to Location and Asset objects
      const { locations: newLocations, assets: newAssets, errors: validationErrors } =
        await convertCSVToData(csvRows)

      // Show validation errors if any
      if (validationErrors.length > 0) {
        assetsData.clearError()
        showNotification(`Validation errors found:\n${validationErrors.slice(0, 3).join('\n')}`, 'warning')
      }

      // Create locations first (assets need location IDs)
      const createdLocations: Location[] = []
      for (const locationData of newLocations) {
        try {
          const created = await createLocation(locationData)
          createdLocations.push(created)
        } catch (error) {
          // Continue with other locations even if one fails
          const errorMessage = getErrorMessage(error)
          showNotification(`Failed to create location: ${errorMessage}`, 'error')
        }
      }

      // Link assets to created locations
      const assetsWithLocationIds: Omit<Asset, 'id'>[] = newAssets.map((asset, index) => ({
        ...asset,
        location_id: createdLocations[index]?.id || '',
      }))

      // Filter out assets without valid location IDs
      const validAssets = assetsWithLocationIds.filter((asset) => asset.location_id)

      // Bulk create assets
      const result = await bulkCreateAssets(validAssets)

      setUploadResult(result)

      // Refresh data if any assets were created
      if (result.success > 0) {
        await Promise.all([assetsData.refetch(), locationsData.refetch()])
        showNotification(
          `Successfully uploaded ${result.success} assets!${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
          'success'
        )
      } else {
        showNotification(`Upload failed: ${result.errors.slice(0, 2).join(', ')}`, 'error')
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      assetsData.clearError()
      showNotification(`Error: ${errorMessage}`, 'error')
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  // Loading state
  if (assetsData.loading || locationsData.loading) {
    return <LoadingSpinner message="Loading assets and locations..." />
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onDismiss={dismissNotification}
        />
      )}

      {/* Page title and action buttons */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Assets & Locations</h1>

        {/* CSV Upload Button */}
        <label className="btn-primary cursor-pointer">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </label>
      </div>

      {/* Error message */}
      {(assetsData.error || locationsData.error) && (
        <ErrorMessage
          message={assetsData.error || locationsData.error || ''}
          onDismiss={() => {
            assetsData.clearError()
            locationsData.clearError()
          }}
        />
      )}

      {/* Upload result */}
      {uploadResult && (
        <div
          className={`rounded-lg p-4 ${
            uploadResult.success > 0
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <p
            className={`font-medium ${
              uploadResult.success > 0 ? 'text-green-800' : 'text-yellow-800'
            }`}
          >
            Upload complete: {uploadResult.success} successful, {uploadResult.failed} failed
          </p>
          {uploadResult.errors.length > 0 && (
            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
              {uploadResult.errors.slice(0, 5).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
              {uploadResult.errors.length > 5 && (
                <li>... and {uploadResult.errors.length - 5} more errors</li>
              )}
            </ul>
          )}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Region Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value={FILTER_ALL}>All</option>
              <option value="copper">Copper</option>
              <option value="fiber">Fiber</option>
              <option value="ONT">ONT</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value={FILTER_ALL}>All</option>
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
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {assetsData.data.length === 0
                      ? 'No assets found. Upload a CSV file to get started.'
                      : 'No assets match the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const location = locationsData.data.find((loc) => loc.id === asset.location_id)

                  return (
                    <tr key={asset.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {asset.id.substring(0, 8)}...
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
                        <StatusBadge status={asset.status} type="asset" />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Map</h2>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
          {locationsData.data.length > 0 ? (
            <div className="w-full h-full p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                {locationsData.data.slice(0, MAP_DISPLAY_LIMIT).map((location) => (
                  <div
                    key={location.id}
                    className="bg-white p-2 rounded shadow-sm border border-gray-200"
                    title={location.address}
                  >
                    <p className="font-medium truncate">{location.address.split(',')[0]}</p>
                    <p className="text-gray-500 text-xs">
                      {location.coordinates.lat.toFixed(2)}, {location.coordinates.lng.toFixed(2)}
                    </p>
                    <StatusBadge status={location.fiber_status} type="fiber" />
                  </div>
                ))}
              </div>
              {locationsData.data.length > MAP_DISPLAY_LIMIT && (
                <p className="text-center text-gray-500 mt-4">
                  Showing {MAP_DISPLAY_LIMIT} of {locationsData.data.length} locations. Use filters to
                  narrow down.
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">
              No locations to display. Upload CSV data to see locations on the map.
            </p>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Note: Full interactive map with Mapbox/Leaflet integration can be added in future
          enhancement.
        </p>
      </div>
    </div>
  )
}

export default AssetsLocations
