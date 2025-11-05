/**
 * Report Generation Utilities
 * Functions for generating CSV and PDF reports
 */

import type { Asset, WorkOrder, Wave, Location } from '../types'

/**
 * Generate CSV content from data
 */
export function generateCSV(data: Array<Record<string, string | number>>): string {
  if (data.length === 0) {
    return ''
  }

  // Get headers from first row
  const headers = Object.keys(data[0])
  
  // Create CSV rows
  const rows = [
    // Header row
    headers.map(h => `"${h}"`).join(','),
    // Data rows
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes
        const escaped = String(value).replace(/"/g, '""')
        return `"${escaped}"`
      }).join(',')
    ),
  ]

  return rows.join('\n')
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Generate daily migration report data
 */
export function generateDailyReportData(
  _assets: Asset[],
  workOrders: WorkOrder[],
  _waves: Wave[],
  locations: Location[],
  startDate?: string,
  endDate?: string,
  region?: string,
  waveId?: string
): Array<Record<string, string | number>> {
  // Filter work orders by date range if provided
  let filteredWorkOrders = workOrders
  
  if (startDate || endDate) {
    filteredWorkOrders = workOrders.filter(wo => {
      if (wo.start_time) {
        const woDate = new Date(wo.start_time).toISOString().split('T')[0]
        if (startDate && woDate < startDate) return false
        if (endDate && woDate > endDate) return false
      }
      return true
    })
  }

  // Filter by region if provided
  if (region && region !== 'All') {
    const locationIds = locations
      .filter(loc => loc.region === region)
      .map(loc => loc.id)
    filteredWorkOrders = filteredWorkOrders.filter(wo =>
      locationIds.includes(wo.location_id)
    )
  }

  // Filter by wave if provided
  if (waveId && waveId !== 'All') {
    const locationIds = locations
      .filter(loc => loc.wave_id === waveId)
      .map(loc => loc.id)
    filteredWorkOrders = filteredWorkOrders.filter(wo =>
      locationIds.includes(wo.location_id)
    )
  }

  // Group by date
  const dailyData: Record<string, {
    completed: number
    inProgress: number
    failed: number
    total: number
  }> = {}

  filteredWorkOrders.forEach(wo => {
    const date = wo.start_time
      ? new Date(wo.start_time).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
    
    if (!dailyData[date]) {
      dailyData[date] = { completed: 0, inProgress: 0, failed: 0, total: 0 }
    }

    dailyData[date].total++
    if (wo.status === 'Completed') dailyData[date].completed++
    if (wo.status === 'In Progress') dailyData[date].inProgress++
    if (wo.status === 'Failed') dailyData[date].failed++
  })

  // Convert to array format
  return Object.entries(dailyData)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, stats]) => ({
      Date: date,
      Completed: stats.completed,
      'In Progress': stats.inProgress,
      Failed: stats.failed,
      Total: stats.total,
    }))
}

/**
 * Generate work order detail report
 */
export function generateWorkOrderReport(
  workOrders: WorkOrder[],
  locations: Location[],
  startDate?: string,
  endDate?: string,
  region?: string,
  waveId?: string
): Array<Record<string, string | number>> {
  let filtered = workOrders

  // Filter by date
  if (startDate || endDate) {
    filtered = filtered.filter(wo => {
      if (wo.start_time) {
        const woDate = new Date(wo.start_time).toISOString().split('T')[0]
        if (startDate && woDate < startDate) return false
        if (endDate && woDate > endDate) return false
      }
      return true
    })
  }

  // Filter by region
  if (region && region !== 'All') {
    const locationIds = locations
      .filter(loc => loc.region === region)
      .map(loc => loc.id)
    filtered = filtered.filter(wo => locationIds.includes(wo.location_id))
  }

  // Filter by wave
  if (waveId && waveId !== 'All') {
    const locationIds = locations
      .filter(loc => loc.wave_id === waveId)
      .map(loc => loc.id)
    filtered = filtered.filter(wo => locationIds.includes(wo.location_id))
  }

  return filtered.map(wo => {
    const location = locations.find(loc => loc.id === wo.location_id)
    return {
      'Work Order ID': wo.id.substring(0, 8),
      Location: location?.address || 'N/A',
      Region: location?.region || 'N/A',
      Status: wo.status,
      'Start Time': wo.start_time ? new Date(wo.start_time).toLocaleString() : 'N/A',
      'End Time': wo.end_time ? new Date(wo.end_time).toLocaleString() : 'N/A',
    }
  })
}

/**
 * Generate asset reconciliation report
 */
export function generateReconciliationReport(
  assets: Asset[],
  workOrders: WorkOrder[],
  locations: Location[]
): Array<Record<string, string | number>> {
  const report: Array<Record<string, string | number>> = []

  // Find assets with completed work orders
  const completedWorkOrders = workOrders.filter(wo => wo.status === 'Completed')
  const completedLocationIds = new Set(
    completedWorkOrders.map(wo => wo.location_id)
  )

  // Check each asset
  assets.forEach(asset => {
    const location = locations.find(loc => loc.id === asset.location_id)
    const hasCompletedWorkOrder = completedLocationIds.has(asset.location_id)
    const workOrder = completedWorkOrders.find(wo => wo.location_id === asset.location_id)

    // Flag discrepancies
    const discrepancy = asset.status !== 'completed' && hasCompletedWorkOrder

    report.push({
      'Asset ID': asset.id.substring(0, 8),
      Type: asset.type,
      Location: location?.address || 'N/A',
      Region: location?.region || 'N/A',
      'Asset Status': asset.status,
      'Work Order Status': workOrder?.status || 'N/A',
      'Has Completed WO': hasCompletedWorkOrder ? 'Yes' : 'No',
      Discrepancy: discrepancy ? 'Yes' : 'No',
    })
  })

  return report
}

/**
 * Generate PDF report (simplified - opens print dialog)
 * For full PDF generation, consider using a library like jsPDF or react-pdf
 */
export function generatePDFReport(title: string, content: string): void {
  // Create a new window with the report content
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to generate PDF report')
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}

