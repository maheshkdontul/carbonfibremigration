// Import React for JSX and useState for component state
import { useState } from 'react'
// Import mock data
import { mockCustomers, mockWaves, mockConsentLogs } from '../services/mockData'
import type { Customer, ConsentStatus } from '../types'

// CustomerEngagement component - manage customer calls and consent
function CustomerEngagement() {
  // State to store data
  const [customers, setCustomers] = useState<typeof mockCustomers>(mockCustomers)
  const [waves] = useState(mockWaves)
  const [consentLogs] = useState(mockConsentLogs)
  
  // State for wave filter
  const [selectedWave, setSelectedWave] = useState<string>('All')

  // Handle click-to-call (placeholder - will integrate with telephony in Phase 4)
  const handleClickToCall = (phoneNumber: string) => {
    // Placeholder: show alert (actual integration will be in Phase 4)
    alert(`Click-to-call placeholder: Calling ${phoneNumber}`)
  }

  // Handle consent update (placeholder - will save to Supabase in Phase 4)
  const handleConsentUpdate = (customerId: string, newStatus: ConsentStatus) => {
    // Update local state (in real app, this would create a consent log in Supabase)
    setCustomers(
      customers.map((cust) =>
        cust.id === customerId ? { ...cust, consent_status: newStatus } : cust
      )
    )
  }

  // Filter customers by wave (for now, show all customers)
  const filteredCustomers = customers

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-3xl font-bold text-gray-900">Customer Engagement</h1>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Wave
        </label>
        <select
          value={selectedWave}
          onChange={(e) => setSelectedWave(e.target.value)}
          className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="All">All Waves</option>
          {waves.map((wave) => (
            <option key={wave.id} value={wave.id}>
              {wave.name}
            </option>
          ))}
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consent Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Map through filtered customers */}
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {customer.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Consent status badge */}
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.consent_status === 'Consented'
                          ? 'bg-green-100 text-green-800'
                          : customer.consent_status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {customer.consent_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {/* Click-to-call button */}
                    <button
                      onClick={() => handleClickToCall(customer.phone)}
                      className="btn-primary text-xs"
                    >
                      📞 Call
                    </button>
                    {/* Consent status update dropdown */}
                    <select
                      value={customer.consent_status}
                      onChange={(e) => handleConsentUpdate(customer.id, e.target.value as ConsentStatus)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs ml-2"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Consented">Consented</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consent Log Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Consent Log</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Map through consent logs */}
              {consentLogs.map((log) => {
                // Find associated customer
                const customer = customers.find(cust => cust.id === log.customer_id)
                
                return (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.agent_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Status badge */}
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          log.status === 'Consented'
                            ? 'bg-green-100 text-green-800'
                            : log.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.notes || 'No notes'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CustomerEngagement

