/**
 * CustomerEngagement Component
 * Manage customer calls and consent with Supabase integration
 */

import { useMemo, useState } from 'react'
import { useDataFetching } from '../hooks/useDataFetching'
import {
  fetchCustomers,
  fetchWaves,
  fetchConsentLogs,
  updateCustomerConsent,
  createConsentLog,
} from '../services/api'
import { getErrorMessage } from '../utils/errorHandler'
import { FILTER_ALL } from '../utils/constants'
import type { Customer, Wave, ConsentLog, ConsentStatus } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'
import Notification, { useNotification } from '../components/Notification'

function CustomerEngagement() {
  // Fetch data using custom hooks
  const customersData = useDataFetching<Customer>({ fetchFn: fetchCustomers })
  const wavesData = useDataFetching<Wave>({ fetchFn: fetchWaves })
  const consentLogsData = useDataFetching<ConsentLog>({ fetchFn: fetchConsentLogs })

  // Notification system
  const { notification, showNotification, dismissNotification } = useNotification()

  // State for wave filter
  const [selectedWave, setSelectedWave] = useState<string>(FILTER_ALL)

  // State for consent recording
  const [showConsentModal, setShowConsentModal] = useState<string | null>(null)
  const [consentFormData, setConsentFormData] = useState({
    agentName: '',
    status: 'Pending' as ConsentStatus,
    notes: '',
  })

  // State for tracking updates
  const [updating, setUpdating] = useState<string | null>(null)

  // Filter customers by wave (for now, all customers are shown - wave filtering would require customer.wave_id)
  const filteredCustomers = useMemo(() => {
    if (selectedWave === FILTER_ALL) {
      return customersData.data
    }
    // Note: In a real implementation, customers would have wave_id
    // For now, we show all customers when a wave is selected
    return customersData.data
  }, [customersData.data, selectedWave])

  // Get consent summary counts
  const consentSummary = useMemo(() => {
    const consented = filteredCustomers.filter((c) => c.consent_status === 'Consented').length
    const pending = filteredCustomers.filter((c) => c.consent_status === 'Pending').length
    const declined = filteredCustomers.filter((c) => c.consent_status === 'Declined').length
    return { consented, pending, declined }
  }, [filteredCustomers])

  // Handle click-to-call (placeholder for telephony integration)
  const handleClickToCall = (phoneNumber: string, customerName: string) => {
    // Placeholder: In production, this would integrate with telephony system
    // For now, we open a tel: link
    window.location.href = `tel:${phoneNumber}`
    showNotification(`Initiating call to ${customerName} at ${phoneNumber}`, 'info')
  }

  // Handle consent update
  const handleConsentUpdate = async (customerId: string, newStatus: ConsentStatus) => {
    setUpdating(customerId)
    try {
      // Update customer consent status
      await updateCustomerConsent(customerId, newStatus)
      showNotification('Consent status updated successfully', 'success')
      customersData.refetch()
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showNotification(`Failed to update consent: ${errorMessage}`, 'error')
    } finally {
      setUpdating(null)
    }
  }

  // Handle consent log creation
  const handleRecordConsent = async (customerId: string) => {
    if (!consentFormData.agentName.trim()) {
      showNotification('Please enter agent name', 'error')
      return
    }

    setUpdating(customerId)
    try {
      // Create consent log
      await createConsentLog(
        customerId,
        consentFormData.agentName,
        consentFormData.status,
        consentFormData.notes || undefined
      )

      // Update customer consent status
      await updateCustomerConsent(customerId, consentFormData.status)

      showNotification('Consent recorded successfully', 'success')
      setShowConsentModal(null)
      setConsentFormData({
        agentName: '',
        status: 'Pending',
        notes: '',
      })
      customersData.refetch()
      consentLogsData.refetch()
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showNotification(`Failed to record consent: ${errorMessage}`, 'error')
    } finally {
      setUpdating(null)
    }
  }

  // Loading state
  if (customersData.loading || wavesData.loading || consentLogsData.loading) {
    return <LoadingSpinner message="Loading customer engagement data..." />
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
      <h1 className="text-3xl font-bold text-gray-900">Customer Engagement</h1>

      {/* Error messages */}
      {(customersData.error || wavesData.error || consentLogsData.error) && (
        <ErrorMessage
          message={
            customersData.error || wavesData.error || consentLogsData.error || ''
          }
          onDismiss={() => {
            customersData.clearError()
            wavesData.clearError()
            consentLogsData.clearError()
          }}
        />
      )}

      {/* Consent Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Consented</p>
              <p className="text-3xl font-bold text-green-800 mt-2">{consentSummary.consented}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Pending</p>
              <p className="text-3xl font-bold text-yellow-800 mt-2">{consentSummary.pending}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Declined</p>
              <p className="text-3xl font-bold text-red-800 mt-2">{consentSummary.declined}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Wave</label>
        <select
          value={selectedWave}
          onChange={(e) => setSelectedWave(e.target.value)}
          className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value={FILTER_ALL}>All Waves</option>
          {wavesData.data.map((wave) => (
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
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No customers found. Add customers to the database.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{customer.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={customer.consent_status} type="consent" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {/* Click-to-call button */}
                      <button
                        onClick={() => handleClickToCall(customer.phone, customer.name)}
                        className="btn-primary text-xs"
                      >
                        📞 Call
                      </button>
                      {/* Record consent button */}
                      <button
                        onClick={() => setShowConsentModal(customer.id)}
                        className="btn-secondary text-xs"
                        disabled={updating === customer.id}
                      >
                        Record Consent
                      </button>
                      {/* Quick status update dropdown */}
                      <select
                        value={customer.consent_status}
                        onChange={(e) =>
                          handleConsentUpdate(customer.id, e.target.value as ConsentStatus)
                        }
                        disabled={updating === customer.id}
                        className="border border-gray-300 rounded px-2 py-1 text-xs ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Consented">Consented</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
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
              {consentLogsData.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No consent logs found. Record consent to see logs here.
                  </td>
                </tr>
              ) : (
                consentLogsData.data.map((log) => {
                  const customer = customersData.data.find((cust) => cust.id === log.customer_id)

                  return (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.agent_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={log.status} type="consent" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.notes || 'No notes'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consent Recording Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Record Consent</h2>
              <button
                onClick={() => {
                  setShowConsentModal(null)
                  setConsentFormData({
                    agentName: '',
                    status: 'Pending',
                    notes: '',
                  })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={consentFormData.agentName}
                  onChange={(e) =>
                    setConsentFormData({ ...consentFormData, agentName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter agent name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consent Status *
                </label>
                <select
                  value={consentFormData.status}
                  onChange={(e) =>
                    setConsentFormData({
                      ...consentFormData,
                      status: e.target.value as ConsentStatus,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Consented">Consented</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={consentFormData.notes}
                  onChange={(e) =>
                    setConsentFormData({ ...consentFormData, notes: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Add any notes about the conversation..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleRecordConsent(showConsentModal)}
                  className="flex-1 btn-primary"
                  disabled={updating === showConsentModal}
                >
                  {updating === showConsentModal ? 'Recording...' : 'Record Consent'}
                </button>
                <button
                  onClick={() => {
                    setShowConsentModal(null)
                    setConsentFormData({
                      agentName: '',
                      status: 'Pending',
                      notes: '',
                    })
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerEngagement
