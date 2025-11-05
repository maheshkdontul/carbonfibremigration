/**
 * Reconciliation Component
 * Asset tracking reconciliation - compare inventory vs completed work orders
 */

import { useMemo, useState } from 'react'
import { useDataFetching } from '../hooks/useDataFetching'
import { fetchAssets, fetchWorkOrders, fetchLocations } from '../services/api'
import { generateReconciliationReport, generateCSV, downloadCSV } from '../utils/reportGenerator'
import { getErrorMessage } from '../utils/errorHandler'
import { FILTER_ALL, VALID_REGIONS } from '../utils/constants'
import type { Asset, WorkOrder, Location } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'
import Notification, { useNotification } from '../components/Notification'

function Reconciliation() {
  // Fetch data using custom hooks
  const assetsData = useDataFetching<Asset>({ fetchFn: fetchAssets })
  const workOrdersData = useDataFetching<WorkOrder>({ fetchFn: fetchWorkOrders })
  const locationsData = useDataFetching<Location>({ fetchFn: fetchLocations })

  // Notification system
  const { notification, showNotification, dismissNotification } = useNotification()

  // State for filters
  const [selectedRegion, setSelectedRegion] = useState<string>(FILTER_ALL)

  // Calculate reconciliation data
  const reconciliationData = useMemo(() => {
    const completedWorkOrders = workOrdersData.data.filter((wo) => wo.status === 'Completed')
    const completedLocationIds = new Set(completedWorkOrders.map((wo) => wo.location_id))

    let filteredAssets = assetsData.data

    // Filter by region
    if (selectedRegion !== FILTER_ALL) {
      const locationIds = locationsData.data
        .filter((loc) => loc.region === selectedRegion)
        .map((loc) => loc.id)
      filteredAssets = filteredAssets.filter((asset) =>
        locationIds.includes(asset.location_id)
      )
    }

    return filteredAssets.map((asset) => {
      const location = locationsData.data.find((loc) => loc.id === asset.location_id)
      const hasCompletedWorkOrder = completedLocationIds.has(asset.location_id)
      const workOrder = completedWorkOrders.find((wo) => wo.location_id === asset.location_id)

      // Flag discrepancies
      const discrepancy = asset.status !== 'completed' && hasCompletedWorkOrder

      return {
        asset,
        location,
        hasCompletedWorkOrder,
        workOrder,
        discrepancy,
      }
    })
  }, [assetsData.data, workOrdersData.data, locationsData.data, selectedRegion])

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = reconciliationData.length
    const withDiscrepancies = reconciliationData.filter((item) => item.discrepancy).length
    const completed = reconciliationData.filter(
      (item) => item.asset.status === 'completed'
    ).length
    const pending = reconciliationData.filter(
      (item) => item.asset.status === 'pending'
    ).length

    return {
      total,
      withDiscrepancies,
      completed,
      pending,
      matchRate: total > 0 ? ((total - withDiscrepancies) / total) * 100 : 0,
    }
  }, [reconciliationData])

  // Handle export reconciliation report
  const handleExportReconciliation = () => {
    try {
      const reportData = generateReconciliationReport(
        assetsData.data,
        workOrdersData.data,
        locationsData.data
      )

      if (reportData.length === 0) {
        showNotification('No reconciliation data to export', 'warning')
        return
      }

      const csvContent = generateCSV(reportData)
      const filename = `reconciliation-${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csvContent, filename)
      showNotification('Reconciliation report exported successfully', 'success')
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showNotification(`Failed to export reconciliation: ${errorMessage}`, 'error')
    }
  }

  // Loading state
  if (assetsData.loading || workOrdersData.loading || locationsData.loading) {
    return <LoadingSpinner message="Loading reconciliation data..." />
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

      {/* Page title and export button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Asset Tracking Reconciliation</h1>
        <button onClick={handleExportReconciliation} className="btn-primary">
          📊 Export Reconciliation Report
        </button>
      </div>

      {/* Error messages */}
      {(assetsData.error || workOrdersData.error || locationsData.error) && (
        <ErrorMessage
          message={
            assetsData.error || workOrdersData.error || locationsData.error || ''
          }
          onDismiss={() => {
            assetsData.clearError()
            workOrdersData.clearError()
            locationsData.clearError()
          }}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Assets</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{summary.completed}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{summary.pending}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Discrepancies</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{summary.withDiscrepancies}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Match Rate</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {summary.matchRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Region</label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value={FILTER_ALL}>All Regions</option>
          {VALID_REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset ID
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
                  Asset Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Order Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discrepancy
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reconciliationData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No assets found for the selected filters.
                  </td>
                </tr>
              ) : (
                reconciliationData.map((item) => (
                  <tr
                    key={item.asset.id}
                    className={item.discrepancy ? 'bg-red-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.asset.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.asset.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.location?.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.location?.region || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.asset.status} type="asset" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.workOrder ? (
                        <StatusBadge status={item.workOrder.status} type="workorder" />
                      ) : (
                        <span className="text-sm text-gray-400">No Work Order</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.discrepancy ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          ⚠️ Discrepancy
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ✓ Match
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discrepancy Details */}
      {summary.withDiscrepancies > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ {summary.withDiscrepancies} Discrepancy(s) Found
          </h3>
          <p className="text-sm text-yellow-700">
            These assets have completed work orders but their status is not marked as
            "completed". Please review and update asset statuses accordingly.
          </p>
        </div>
      )}
    </div>
  )
}

export default Reconciliation

