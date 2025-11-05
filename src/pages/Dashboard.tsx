/**
 * Dashboard Component
 * Main overview page with KPIs from Supabase
 */

import { useMemo } from 'react'
import { useDataFetching } from '../hooks/useDataFetching'
import { fetchAssets, fetchLocations, fetchWaves, fetchWorkOrders, updateWaveProgress } from '../services/api'
import type { Asset, Location, Wave, WorkOrder } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'

function Dashboard() {
  // Fetch all data using custom hook
  const assetsData = useDataFetching<Asset>({ fetchFn: fetchAssets })
  const locationsData = useDataFetching<Location>({ fetchFn: fetchLocations })
  const wavesData = useDataFetching<Wave>({ fetchFn: fetchWaves })
  const workOrdersData = useDataFetching<WorkOrder>({ fetchFn: fetchWorkOrders })

  // Determine loading state (any data still loading)
  const loading = assetsData.loading || locationsData.loading || wavesData.loading || workOrdersData.loading

  // Get first error (if any)
  const error = assetsData.error || locationsData.error || locationsData.error || workOrdersData.error

  // Calculate KPIs from data
  const completedMigrations = useMemo(
    () => assetsData.data.filter((a) => a.status === 'completed').length,
    [assetsData.data]
  )

  const inProgress = useMemo(
    () => workOrdersData.data.filter((wo) => wo.status === 'In Progress').length,
    [workOrdersData.data]
  )

  const failedInstalls = useMemo(
    () => workOrdersData.data.filter((wo) => wo.status === 'Failed').length,
    [workOrdersData.data]
  )

  const averageTimePerInstall = useMemo(() => {
    const completedWorkOrders = workOrdersData.data.filter(
      (wo) => wo.status === 'Completed' && wo.start_time && wo.end_time
    )

    if (completedWorkOrders.length === 0) {
      return 'N/A'
    }

    const totalTime = completedWorkOrders.reduce((sum, wo) => {
      const start = new Date(wo.start_time!).getTime()
      const end = new Date(wo.end_time!).getTime()
      return sum + (end - start)
    }, 0)

    const avgMs = totalTime / completedWorkOrders.length
    const avgHours = avgMs / (1000 * 60 * 60)
    return `${avgHours.toFixed(1)} hours`
  }, [workOrdersData.data])

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Error message */}
      {error && <ErrorMessage message={error} onDismiss={assetsData.clearError} />}

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Migrations Completed Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Migrations</p>
              <p className="text-3xl font-bold text-primary-700 mt-2">{completedMigrations}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{inProgress}</p>
            </div>
            <div className="text-4xl">🔄</div>
          </div>
        </div>

        {/* Failed Installs Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Installs</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{failedInstalls}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>

        {/* Average Time Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Time/Install</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{averageTimePerInstall}</p>
            </div>
            <div className="text-4xl">⏱️</div>
          </div>
        </div>
      </div>

      {/* Waves Progress Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Migration Waves Progress</h2>
          {wavesData.data.length > 0 && (
            <button
              onClick={async () => {
                try {
                  await Promise.all(wavesData.data.map((wave) => updateWaveProgress(wave.id)))
                  wavesData.refetch()
                } catch (error) {
                  // Silently fail - progress will update on next visit
                }
              }}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              🔄 Refresh
            </button>
          )}
        </div>
        {wavesData.data.length === 0 ? (
          <p className="text-gray-500">No waves found. Create waves in the Waves Management page.</p>
        ) : (
          <div className="space-y-4">
            {wavesData.data.map((wave) => (
              <div key={wave.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{wave.name}</span>
                  <span className="text-sm text-gray-600">{wave.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${wave.progress_percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {wave.start_date} to {wave.end_date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Locations</h2>
        {locationsData.data.length === 0 ? (
          <p className="text-gray-500">No locations found. Upload CSV data in Assets & Locations page.</p>
        ) : (
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
                    Fiber Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locationsData.data.slice(0, 5).map((location) => (
                  <tr key={location.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.region}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={location.fiber_status} type="fiber" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
