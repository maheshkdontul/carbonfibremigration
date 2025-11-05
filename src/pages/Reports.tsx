/**
 * Reports Component
 * Analytics and reporting with export functionality
 */

import { useMemo, useState } from 'react'
import { useDataFetching } from '../hooks/useDataFetching'
import {
  fetchAssets,
  fetchWorkOrders,
  fetchWaves,
  fetchLocations,
} from '../services/api'
import {
  generateDailyReportData,
  generateWorkOrderReport,
  generateReconciliationReport,
  generateCSV,
  downloadCSV,
  generatePDFReport,
} from '../utils/reportGenerator'
import { getErrorMessage } from '../utils/errorHandler'
import { FILTER_ALL, VALID_REGIONS } from '../utils/constants'
import type { Asset, WorkOrder, Wave, Location } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import Notification, { useNotification } from '../components/Notification'

function Reports() {
  // Fetch data using custom hooks
  const assetsData = useDataFetching<Asset>({ fetchFn: fetchAssets })
  const workOrdersData = useDataFetching<WorkOrder>({ fetchFn: fetchWorkOrders })
  const wavesData = useDataFetching<Wave>({ fetchFn: fetchWaves })
  const locationsData = useDataFetching<Location>({ fetchFn: fetchLocations })

  // Notification system
  const { notification, showNotification, dismissNotification } = useNotification()

  // State for filters
  const [selectedWave, setSelectedWave] = useState<string>(FILTER_ALL)
  const [selectedRegion, setSelectedRegion] = useState<string>(FILTER_ALL)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // Calculate filtered metrics
  const filteredData = useMemo(() => {
    let filteredWorkOrders = workOrdersData.data

    // Filter by date range
    if (dateRange.start || dateRange.end) {
      filteredWorkOrders = filteredWorkOrders.filter((wo) => {
        if (wo.start_time) {
          const woDate = new Date(wo.start_time).toISOString().split('T')[0]
          if (dateRange.start && woDate < dateRange.start) return false
          if (dateRange.end && woDate > dateRange.end) return false
        }
        return true
      })
    }

    // Filter by region
    if (selectedRegion !== FILTER_ALL) {
      const locationIds = locationsData.data
        .filter((loc) => loc.region === selectedRegion)
        .map((loc) => loc.id)
      filteredWorkOrders = filteredWorkOrders.filter((wo) =>
        locationIds.includes(wo.location_id)
      )
    }

    // Filter by wave
    if (selectedWave !== FILTER_ALL) {
      const locationIds = locationsData.data
        .filter((loc) => loc.wave_id === selectedWave)
        .map((loc) => loc.id)
      filteredWorkOrders = filteredWorkOrders.filter((wo) =>
        locationIds.includes(wo.location_id)
      )
    }

    return filteredWorkOrders
  }, [
    workOrdersData.data,
    locationsData.data,
    dateRange,
    selectedRegion,
    selectedWave,
  ])

  // Calculate KPIs from filtered data
  const metrics = useMemo(() => {
    const completed = assetsData.data.filter((a) => a.status === 'completed').length
    const inProgress = filteredData.filter((wo) => wo.status === 'In Progress').length
    const failed = filteredData.filter((wo) => wo.status === 'Failed').length

    // Calculate average time per install
    const completedWorkOrders = filteredData.filter(
      (wo) => wo.status === 'Completed' && wo.start_time && wo.end_time
    )
    let avgTime = 'N/A'
    if (completedWorkOrders.length > 0) {
      const totalTime = completedWorkOrders.reduce((sum, wo) => {
        const start = new Date(wo.start_time!).getTime()
        const end = new Date(wo.end_time!).getTime()
        return sum + (end - start)
      }, 0)
      const avgMs = totalTime / completedWorkOrders.length
      const avgHours = avgMs / (1000 * 60 * 60)
      avgTime = `${avgHours.toFixed(1)} hours`
    }

    // Calculate average wave progress
    const avgWaveProgress =
      wavesData.data.length > 0
        ? wavesData.data.reduce((sum, wave) => sum + wave.progress_percentage, 0) /
          wavesData.data.length
        : 0

    return {
      completed,
      inProgress,
      failed,
      avgTime,
      avgWaveProgress: avgWaveProgress.toFixed(1),
    }
  }, [assetsData.data, filteredData, wavesData.data])

  // Generate daily summary data
  const dailySummary = useMemo(
    () =>
      generateDailyReportData(
        assetsData.data,
        workOrdersData.data,
        wavesData.data,
        locationsData.data,
        dateRange.start || undefined,
        dateRange.end || undefined,
        selectedRegion !== FILTER_ALL ? selectedRegion : undefined,
        selectedWave !== FILTER_ALL ? selectedWave : undefined
      ),
    [
      assetsData.data,
      workOrdersData.data,
      wavesData.data,
      locationsData.data,
      dateRange,
      selectedRegion,
      selectedWave,
    ]
  )

  // Handle CSV export
  const handleExportCSV = () => {
    try {
      const reportData = generateDailyReportData(
        assetsData.data,
        workOrdersData.data,
        wavesData.data,
        locationsData.data,
        dateRange.start || undefined,
        dateRange.end || undefined,
        selectedRegion !== FILTER_ALL ? selectedRegion : undefined,
        selectedWave !== FILTER_ALL ? selectedWave : undefined
      )

      if (reportData.length === 0) {
        showNotification('No data to export', 'warning')
        return
      }

      const csvContent = generateCSV(reportData)
      const filename = `migration-report-${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csvContent, filename)
      showNotification('CSV report exported successfully', 'success')
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showNotification(`Failed to export CSV: ${errorMessage}`, 'error')
    }
  }

  // Handle PDF export
  const handleExportPDF = () => {
    try {
      const reportData = generateDailyReportData(
        assetsData.data,
        workOrdersData.data,
        wavesData.data,
        locationsData.data,
        dateRange.start || undefined,
        dateRange.end || undefined,
        selectedRegion !== FILTER_ALL ? selectedRegion : undefined,
        selectedWave !== FILTER_ALL ? selectedWave : undefined
      )

      if (reportData.length === 0) {
        showNotification('No data to export', 'warning')
        return
      }

      // Create HTML table for PDF
      const tableHtml = `
        <table>
          <thead>
            <tr>
              ${Object.keys(reportData[0])
                .map((key) => `<th>${key}</th>`)
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${reportData
              .map(
                (row) =>
                  `<tr>${Object.values(row)
                    .map((val) => `<td>${val}</td>`)
                    .join('')}</tr>`
              )
              .join('')}
          </tbody>
        </table>
      `

      generatePDFReport(
        `Migration Report - ${new Date().toLocaleDateString()}`,
        tableHtml
      )
      showNotification('PDF report generated - use print dialog to save', 'info')
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showNotification(`Failed to export PDF: ${errorMessage}`, 'error')
    }
  }

  // Handle work order detail export
  const handleExportWorkOrderCSV = () => {
    try {
      const reportData = generateWorkOrderReport(
        workOrdersData.data,
        locationsData.data,
        dateRange.start || undefined,
        dateRange.end || undefined,
        selectedRegion !== FILTER_ALL ? selectedRegion : undefined,
        selectedWave !== FILTER_ALL ? selectedWave : undefined
      )

      if (reportData.length === 0) {
        showNotification('No work order data to export', 'warning')
        return
      }

      const csvContent = generateCSV(reportData)
      const filename = `work-orders-${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csvContent, filename)
      showNotification('Work order CSV exported successfully', 'success')
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showNotification(`Failed to export work orders: ${errorMessage}`, 'error')
    }
  }

  // Handle reconciliation report export
  const handleExportReconciliationCSV = () => {
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
  if (
    assetsData.loading ||
    workOrdersData.loading ||
    wavesData.loading ||
    locationsData.loading
  ) {
    return <LoadingSpinner message="Loading reports data..." />
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

      {/* Page title */}
      <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Error messages */}
      {(assetsData.error ||
        workOrdersData.error ||
        wavesData.error ||
        locationsData.error) && (
        <ErrorMessage
          message={
            assetsData.error ||
            workOrdersData.error ||
            wavesData.error ||
            locationsData.error ||
            ''
          }
          onDismiss={() => {
            assetsData.clearError()
            workOrdersData.clearError()
            wavesData.clearError()
            locationsData.clearError()
          }}
        />
      )}

      {/* Export Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportCSV} className="btn-primary">
            📊 Export Daily Report (CSV)
          </button>
          <button onClick={handleExportPDF} className="btn-secondary">
            📄 Export Daily Report (PDF)
          </button>
          <button onClick={handleExportWorkOrderCSV} className="btn-secondary">
            📋 Export Work Orders (CSV)
          </button>
          <button onClick={handleExportReconciliationCSV} className="btn-secondary">
            🔍 Export Reconciliation (CSV)
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Wave filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Wave
            </label>
            <select
              value={selectedWave}
              onChange={(e) => setSelectedWave(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value={FILTER_ALL}>All Waves</option>
              {wavesData.data.map((wave) => (
                <option key={wave.id} value={wave.id}>
                  {wave.name}
                </option>
              ))}
            </select>
          </div>

          {/* Region filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value={FILTER_ALL}>All Regions</option>
              {VALID_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Start"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="End"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Completed Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Completed</p>
          <p className="text-3xl font-bold text-primary-700 mt-2">{metrics.completed}</p>
        </div>

        {/* In Progress Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{metrics.inProgress}</p>
        </div>

        {/* Failed Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Failed</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{metrics.failed}</p>
        </div>

        {/* Average Time Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Avg. Time/Install</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.avgTime}</p>
        </div>

        {/* Average Wave Progress Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Avg. Wave Progress</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{metrics.avgWaveProgress}%</p>
        </div>
      </div>

      {/* Daily Summary Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailySummary.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No data available for the selected filters.
                  </td>
                </tr>
              ) : (
                dailySummary.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(row.Date as string).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.Completed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row['In Progress']}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.Failed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.Total}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
