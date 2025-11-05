/**
 * TechnicianScheduling Component
 * Assign and track technician jobs with Supabase integration
 */

import { useMemo, useState } from 'react'
import { useDataFetching } from '../hooks/useDataFetching'
import { useAsyncOperation } from '../hooks/useAsyncOperation'
import {
  fetchWorkOrders,
  fetchTechnicians,
  fetchLocations,
  assignTechnicianToWorkOrder,
  updateWorkOrderStatus,
  createWorkOrder,
  updateWaveProgress,
} from '../services/api'
import { getErrorMessage } from '../utils/errorHandler'
import type { WorkOrder, Technician, Location, WorkOrderStatus } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'
import Notification, { useNotification } from '../components/Notification'

function TechnicianScheduling() {
  // Fetch data using custom hooks
  const workOrdersData = useDataFetching<WorkOrder>({ fetchFn: fetchWorkOrders })
  const techniciansData = useDataFetching<Technician>({ fetchFn: fetchTechnicians })
  const locationsData = useDataFetching<Location>({ fetchFn: fetchLocations })

  // Notification system
  const { notification, showNotification, dismissNotification } = useNotification()

  // State for creating new work orders
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkOrderLocation, setNewWorkOrderLocation] = useState<string>('')

  // State for tracking updates
  const [updating, setUpdating] = useState<string | null>(null)

  // Calculate technician job counts
  const technicianJobCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    techniciansData.data.forEach((tech) => {
      counts[tech.id] = workOrdersData.data.filter(
        (wo) => wo.technician_id === tech.id && wo.status !== 'Completed'
      ).length
    })
    return counts
  }, [techniciansData.data, workOrdersData.data])

  // Async operation for technician assignment
  const assignTechnicianOperation = useAsyncOperation({
    operationFn: async () => {
      // This will be called with context in handleAssignTechnician
      return Promise.resolve()
    },
    onSuccess: () => {
      showNotification('Technician assigned successfully', 'success')
      workOrdersData.refetch()
    },
    onError: (error) => {
      showNotification(`Failed to assign technician: ${error}`, 'error')
    },
  })

  // Handle technician assignment
  const handleAssignTechnician = async (workOrderId: string, technicianId: string) => {
    setUpdating(workOrderId)
    try {
      await assignTechnicianToWorkOrder(workOrderId, technicianId)
      assignTechnicianOperation.onSuccess?.()
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      assignTechnicianOperation.onError?.(errorMessage)
    } finally {
      setUpdating(null)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (
    workOrderId: string,
    newStatus: WorkOrderStatus,
    startTime?: string,
    endTime?: string
  ) => {
    setUpdating(workOrderId)
    try {
      await updateWorkOrderStatus(workOrderId, newStatus, startTime, endTime)
      showNotification('Work order status updated successfully', 'success')
      workOrdersData.refetch()
      
      // Automatically refresh wave progress if status changed to Completed
      // This implements Phase 5.2: Wave Progress Automation
      if (newStatus === 'Completed') {
        // Find which wave this work order belongs to
        const workOrder = workOrdersData.data.find(wo => wo.id === workOrderId)
        if (workOrder) {
          const location = locationsData.data.find(loc => loc.id === workOrder.location_id)
          if (location?.wave_id) {
            // Update wave progress in background (don't wait for it)
            updateWaveProgress(location.wave_id).catch(() => {
              // Silently fail - wave progress will update on next page visit
            })
          }
        }
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showNotification(`Failed to update status: ${errorMessage}`, 'error')
    } finally {
      setUpdating(null)
    }
  }

  // Handle create new work order
  const handleCreateWorkOrder = async () => {
    if (!newWorkOrderLocation) {
      showNotification('Please select a location', 'error')
      return
    }

    try {
      await createWorkOrder({
        location_id: newWorkOrderLocation,
        technician_id: '', // Unassigned initially
        status: 'Assigned',
      })
      showNotification('Work order created successfully', 'success')
      setShowCreateModal(false)
      setNewWorkOrderLocation('')
      workOrdersData.refetch()
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showNotification(`Failed to create work order: ${errorMessage}`, 'error')
    }
  }

  // Loading state
  if (workOrdersData.loading || techniciansData.loading || locationsData.loading) {
    return <LoadingSpinner message="Loading technician scheduling data..." />
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

      {/* Page title and create button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Technician Scheduling</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          Create Work Order
        </button>
      </div>

      {/* Error messages */}
      {(workOrdersData.error || techniciansData.error || locationsData.error) && (
        <ErrorMessage
          message={
            workOrdersData.error || techniciansData.error || locationsData.error || ''
          }
          onDismiss={() => {
            workOrdersData.clearError()
            techniciansData.clearError()
            locationsData.clearError()
          }}
        />
      )}

      {/* Work Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workOrdersData.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No work orders found. Create a work order to get started.
                  </td>
                </tr>
              ) : (
                workOrdersData.data.map((workOrder) => {
                  const location = locationsData.data.find(
                    (loc) => loc.id === workOrder.location_id
                  )
                  const technician = techniciansData.data.find(
                    (tech) => tech.id === workOrder.technician_id
                  )

                  return (
                    <tr key={workOrder.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {workOrder.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {location?.address || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Technician assignment dropdown */}
                        <select
                          value={workOrder.technician_id || ''}
                          onChange={(e) => handleAssignTechnician(workOrder.id, e.target.value)}
                          disabled={updating === workOrder.id}
                          className="border border-gray-300 rounded px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Unassigned</option>
                          {techniciansData.data.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                              {tech.name}
                            </option>
                          ))}
                        </select>
                        {updating === workOrder.id && (
                          <span className="ml-2 text-xs text-gray-500">Updating...</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={workOrder.status} type="workorder" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {/* Status update dropdown */}
                        <select
                          value={workOrder.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as WorkOrderStatus
                            // Auto-set timestamps based on status
                            if (newStatus === 'In Progress' && !workOrder.start_time) {
                              handleStatusUpdate(workOrder.id, newStatus, new Date().toISOString())
                            } else if (newStatus === 'Completed' && !workOrder.end_time) {
                              handleStatusUpdate(
                                workOrder.id,
                                newStatus,
                                workOrder.start_time,
                                new Date().toISOString()
                              )
                            } else {
                              handleStatusUpdate(workOrder.id, newStatus)
                            }
                          }}
                          disabled={updating === workOrder.id}
                          className="border border-gray-300 rounded px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="Assigned">Assigned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technicians Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Technician Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {techniciansData.data.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500">
              No technicians found. Add technicians to the database.
            </div>
          ) : (
            techniciansData.data.map((tech) => (
              <div key={tech.id} className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{tech.name}</p>
                <p className="text-sm text-gray-600 mt-1">{tech.phone}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Active Jobs: <span className="font-semibold">{technicianJobCounts[tech.id] || 0}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Total Assigned: <span className="font-semibold">{tech.assigned_jobs}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create Work Order</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewWorkOrderLocation('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={newWorkOrderLocation}
                  onChange={(e) => setNewWorkOrderLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select a location</option>
                  {locationsData.data.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button onClick={handleCreateWorkOrder} className="flex-1 btn-primary">
                  Create Work Order
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewWorkOrderLocation('')
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

export default TechnicianScheduling
