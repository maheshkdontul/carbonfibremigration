/**
 * WavesManagement Component
 * Create and monitor migration waves with Supabase integration
 */

import { useState } from 'react'
import { useDataFetching } from '../hooks/useDataFetching'
import { useAsyncOperation } from '../hooks/useAsyncOperation'
import { fetchWaves, fetchLocations, createWave, updateWaveProgress } from '../services/api'
import { getErrorMessage } from '../utils/errorHandler'
import { DEFAULT_REGION, DEFAULT_CUSTOMER_COHORT } from '../utils/constants'
import { validateWaveForm } from '../utils/validation'
import type { Wave, Location, Region, CustomerCohort } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'
import Notification, { useNotification } from '../components/Notification'

function WavesManagement() {
  // Fetch data using custom hooks
  const wavesData = useDataFetching<Wave>({ fetchFn: fetchWaves })
  const locationsData = useDataFetching<Location>({ fetchFn: fetchLocations })

  // Notification system
  const { notification, showNotification, dismissNotification } = useNotification()

  // State for modal (wave creation form)
  const [showModal, setShowModal] = useState(false)

  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    region: DEFAULT_REGION as Region,
    customer_cohort: DEFAULT_CUSTOMER_COHORT as CustomerCohort,
  })

  // Async operation for wave creation
  const createWaveOperation = useAsyncOperation({
    operationFn: async () => {
      return await createWave({
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        region: formData.region,
        customer_cohort: formData.customer_cohort,
        progress_status: 'Planning',
      })
    },
    onSuccess: () => {
      showNotification('Wave created successfully', 'success')
      // Reset form and close modal
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        region: DEFAULT_REGION as Region,
        customer_cohort: DEFAULT_CUSTOMER_COHORT as CustomerCohort,
      })
      setShowModal(false)
      wavesData.refetch()
    },
    onError: (error) => {
      showNotification(`Failed to create wave: ${error}`, 'error')
    },
  })

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle wave creation - saves to Supabase
  const handleCreateWave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const validation = validateWaveForm(formData)
    if (!validation.valid) {
      showNotification(`Validation errors: ${validation.errors.join(', ')}`, 'error')
      return
    }

    await createWaveOperation.execute()
  }

  // Refresh wave progress when needed
  const refreshWaveProgress = async (waveId: string) => {
    try {
      await updateWaveProgress(waveId)
      // Update local state
      wavesData.refetch()
      showNotification('Wave progress refreshed', 'success')
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showNotification(`Failed to refresh progress: ${errorMessage}`, 'error')
    }
  }

  // Refresh all wave progress
  const refreshAllProgress = async () => {
    try {
      await Promise.all(wavesData.data.map((wave) => updateWaveProgress(wave.id)))
      wavesData.refetch()
      showNotification('All wave progress refreshed', 'success')
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showNotification(`Failed to refresh all progress: ${errorMessage}`, 'error')
    }
  }

  // Loading state
  if (wavesData.loading || locationsData.loading) {
    return <LoadingSpinner message="Loading waves..." />
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
        <h1 className="text-3xl font-bold text-gray-900">Waves Management</h1>

        <div className="flex space-x-3">
          {/* Refresh all progress button */}
          {wavesData.data.length > 0 && (
            <button onClick={refreshAllProgress} className="btn-secondary">
              🔄 Refresh All Progress
            </button>
          )}
          {/* Button to open wave creation modal */}
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Create New Wave
          </button>
        </div>
      </div>

      {/* Error message */}
      {(wavesData.error || locationsData.error) && (
        <ErrorMessage
          message={wavesData.error || locationsData.error || ''}
          onDismiss={() => {
            wavesData.clearError()
            locationsData.clearError()
          }}
        />
      )}

      {/* Waves List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {wavesData.data.length === 0 ? (
          <div className="col-span-2 bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No waves found. Create your first migration wave to get started.</p>
          </div>
        ) : (
          wavesData.data.map((wave) => {
            // Count locations assigned to this wave
            const assignedLocations = locationsData.data.filter(
              (loc) => loc.wave_id === wave.id
            ).length

            return (
              <div key={wave.id} className="bg-white rounded-lg shadow p-6">
                {/* Wave header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{wave.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {wave.start_date} to {wave.end_date}
                    </p>
                  </div>
                  {/* Status badge */}
                  <StatusBadge status={wave.progress_status} type="wave" />
                </div>

                {/* Wave details */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Region:</span> {wave.region}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Cohort:</span> {wave.customer_cohort}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Assigned Locations:</span> {assignedLocations}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">{wave.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all"
                      style={{ width: `${wave.progress_percentage}%` }}
                    />
                  </div>
                  {/* Refresh progress button */}
                  <button
                    onClick={() => refreshWaveProgress(wave.id)}
                    className="text-xs text-primary-600 hover:text-primary-700 mt-1"
                  >
                    Refresh Progress
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Wave Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            {/* Modal header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Wave</h2>
              {/* Close button */}
              <button
                onClick={() => {
                  setShowModal(false)
                  wavesData.clearError()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Wave creation form */}
            <form onSubmit={handleCreateWave} className="space-y-4">
              {/* Wave name input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wave Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Wave 1 - Lower Mainland Hospitals"
                />
              </div>

              {/* Start date input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* End date input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Region dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Lower Mainland">Lower Mainland</option>
                  <option value="Vancouver Island">Vancouver Island</option>
                  <option value="Interior">Interior</option>
                  <option value="North">North</option>
                </select>
              </div>

              {/* Customer cohort dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Cohort
                </label>
                <select
                  name="customer_cohort"
                  value={formData.customer_cohort}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Hospitals">Hospitals</option>
                  <option value="Government">Government</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              {/* Form buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={createWaveOperation.loading}
                >
                  {createWaveOperation.loading ? 'Creating...' : 'Create Wave'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    wavesData.clearError()
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default WavesManagement
