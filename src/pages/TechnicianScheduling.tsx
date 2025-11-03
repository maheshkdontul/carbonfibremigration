// Import React for JSX and useState for component state
import { useState } from 'react'
// Import mock data
import { mockWorkOrders, mockTechnicians, mockLocations } from '../services/mockData'
import type { WorkOrder, Technician, WorkOrderStatus } from '../types'

// TechnicianScheduling component - assign and track technician jobs
function TechnicianScheduling() {
  // State to store data
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders)
  const [technicians] = useState<Technician[]>(mockTechnicians)
  const [locations] = useState(mockLocations)

  // Handle technician assignment (placeholder - will save to Supabase in Phase 4)
  const handleAssignTechnician = (workOrderId: string, technicianId: string) => {
    // Update local state (in real app, this would update Supabase)
    setWorkOrders(
      workOrders.map((wo) =>
        wo.id === workOrderId ? { ...wo, technician_id: technicianId } : wo
      )
    )
  }

  // Handle status update (placeholder - will save to Supabase in Phase 4)
  const handleStatusUpdate = (workOrderId: string, newStatus: WorkOrderStatus) => {
    // Update local state
    setWorkOrders(
      workOrders.map((wo) =>
        wo.id === workOrderId ? { ...wo, status: newStatus } : wo
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-3xl font-bold text-gray-900">Technician Scheduling</h1>

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
              {/* Map through work orders */}
              {workOrders.map((workOrder) => {
                // Find associated location and technician
                const location = locations.find(loc => loc.id === workOrder.location_id)
                const technician = technicians.find(tech => tech.id === workOrder.technician_id)

                return (
                  <tr key={workOrder.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {workOrder.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {location?.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Technician assignment dropdown */}
                      <select
                        value={workOrder.technician_id || ''}
                        onChange={(e) => handleAssignTechnician(workOrder.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">Unassigned</option>
                        {technicians.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Status badge */}
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          workOrder.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : workOrder.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : workOrder.status === 'Assigned'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {workOrder.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {/* Status update dropdown */}
                      <select
                        value={workOrder.status}
                        onChange={(e) => handleStatusUpdate(workOrder.id, e.target.value as WorkOrderStatus)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technicians Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Technician Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Map through technicians to show summary cards */}
          {technicians.map((tech) => (
            <div key={tech.id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-gray-900">{tech.name}</p>
              <p className="text-sm text-gray-600 mt-1">{tech.phone}</p>
              <p className="text-sm text-gray-500 mt-2">
                Assigned Jobs: <span className="font-semibold">{tech.assigned_jobs}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TechnicianScheduling

