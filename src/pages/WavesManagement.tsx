// Import React for JSX and useState for component state
import { useState } from 'react'
// Import mock data
import { mockWaves, mockLocations } from '../services/mockData'
import type { Wave, Region, CustomerCohort } from '../types'

// WavesManagement component - create and monitor migration waves
function WavesManagement() {
  // State to store waves
  const [waves, setWaves] = useState<Wave[]>(mockWaves)
  const [locations] = useState(mockLocations)
  
  // State for modal (wave creation form)
  const [showModal, setShowModal] = useState(false)
  
  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    region: 'Lower Mainland' as Region,
    customer_cohort: 'Hospitals' as CustomerCohort,
  })

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // Update form data state
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle wave creation (placeholder - will save to Supabase in Phase 3)
  const handleCreateWave = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create new wave object
    const newWave: Wave = {
      id: `wave${waves.length + 1}`,
      name: formData.name,
      start_date: formData.start_date,
      end_date: formData.end_date,
      region: formData.region,
      customer_cohort: formData.customer_cohort,
      progress_status: 'Planning',
      progress_percentage: 0,
    }
    
    // Add to waves array (in real app, this would save to Supabase)
    setWaves([...waves, newWave])
    
    // Reset form and close modal
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      region: 'Lower Mainland',
      customer_cohort: 'Hospitals',
    })
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Page title and create button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Waves Management</h1>
        
        {/* Button to open wave creation modal */}
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          Create New Wave
        </button>
      </div>

      {/* Waves List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map through waves to show cards */}
        {waves.map((wave) => {
          // Count locations assigned to this wave
          const assignedLocations = locations.filter(loc => loc.wave_id === wave.id).length
          
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
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    wave.progress_status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : wave.progress_status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {wave.progress_status}
                </span>
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
              </div>
            </div>
          )
        })}
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
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Wave creation form */}
            <form onSubmit={handleCreateWave} className="space-y-4">
              {/* Wave name input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wave Name
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
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
                >
                  Create Wave
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

