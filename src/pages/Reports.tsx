// Import React for JSX and useState for component state
import { useState } from 'react'
// Import mock data
import { mockAssets, mockWorkOrders, mockWaves } from '../services/mockData'

// Reports component - analytics and reporting
function Reports() {
  // State to store data
  const [assets] = useState(mockAssets)
  const [workOrders] = useState(mockWorkOrders)
  const [waves] = useState(mockWaves)
  
  // State for filters
  const [selectedWave, setSelectedWave] = useState<string>('All')
  const [selectedRegion, setSelectedRegion] = useState<string>('All')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // Calculate metrics
  const totalCompleted = assets.filter(a => a.status === 'completed').length
  const totalInProgress = workOrders.filter(wo => wo.status === 'In Progress').length
  const totalFailed = workOrders.filter(wo => wo.status === 'Failed').length
  const averageWaveProgress = waves.reduce((sum, wave) => sum + wave.progress_percentage, 0) / waves.length

  // Handle CSV export (placeholder - will implement actual export in Phase 5)
  const handleExportCSV = () => {
    // Placeholder: show alert (actual CSV generation will be in Phase 5)
    alert('CSV export placeholder - will be implemented in Phase 5')
  }

  // Handle PDF export (placeholder - will implement actual export in Phase 5)
  const handleExportPDF = () => {
    // Placeholder: show alert (actual PDF generation will be in Phase 5)
    alert('PDF export placeholder - will be implemented in Phase 5')
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Export Controls */}
      <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
        <div className="flex space-x-4">
          {/* Export buttons */}
          <button onClick={handleExportCSV} className="btn-primary">
            Export CSV
          </button>
          <button onClick={handleExportPDF} className="btn-secondary">
            Export PDF
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
              <option value="All">All Waves</option>
              {waves.map((wave) => (
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
              <option value="All">All Regions</option>
              <option value="Lower Mainland">Lower Mainland</option>
              <option value="Vancouver Island">Vancouver Island</option>
              <option value="Interior">Interior</option>
              <option value="North">North</option>
            </select>
          </div>

          {/* Date range filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Start"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                placeholder="End"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Completed Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Completed</p>
          <p className="text-3xl font-bold text-primary-700 mt-2">{totalCompleted}</p>
        </div>

        {/* In Progress Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{totalInProgress}</p>
        </div>

        {/* Failed Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Failed</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{totalFailed}</p>
        </div>

        {/* Average Progress Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Avg. Wave Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {averageWaveProgress.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Migration Progress Over Time</h2>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          {/* Placeholder for charts - will implement with chart library in Phase 5 */}
          <p className="text-gray-500">Charts will be implemented in Phase 5</p>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Placeholder row - will show actual daily data in Phase 5 */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {totalCompleted}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {totalInProgress}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {totalFailed}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports

