// Mock data service - provides sample data for prototyping
// This will be replaced with Supabase API calls in Phase 2

import type {
  Asset,
  Location,
  Wave,
  Technician,
  Customer,
  WorkOrder,
  ConsentLog,
} from '../types'

// Mock Assets - sample infrastructure data
export const mockAssets: Asset[] = [
  { id: '1', type: 'copper', location_id: 'loc1', status: 'active', installation_date: '2020-01-15' },
  { id: '2', type: 'fiber', location_id: 'loc2', status: 'completed', installation_date: '2023-06-20' },
  { id: '3', type: 'ONT', location_id: 'loc3', status: 'pending', technician_id: 'tech1' },
  { id: '4', type: 'copper', location_id: 'loc4', status: 'active', installation_date: '2019-03-10' },
  { id: '5', type: 'fiber', location_id: 'loc5', status: 'completed', installation_date: '2023-08-15' },
]

// Mock Locations - sample addresses across BC
export const mockLocations: Location[] = [
  {
    id: 'loc1',
    address: '123 Main Street, Vancouver, BC',
    region: 'Lower Mainland',
    coordinates: { lat: 49.2827, lng: -123.1207 },
    wave_id: 'wave1',
    fiber_status: 'Fiber Ready',
  },
  {
    id: 'loc2',
    address: '456 Government Way, Victoria, BC',
    region: 'Vancouver Island',
    coordinates: { lat: 48.4284, lng: -123.3656 },
    wave_id: 'wave2',
    fiber_status: 'Fiber Ready',
  },
  {
    id: 'loc3',
    address: '789 Hospital Drive, Vancouver, BC',
    region: 'Lower Mainland',
    coordinates: { lat: 49.2806, lng: -123.1300 },
    wave_id: 'wave1',
    fiber_status: 'Pending Feasibility',
  },
  {
    id: 'loc4',
    address: '321 Enterprise Blvd, Kelowna, BC',
    region: 'Interior',
    coordinates: { lat: 49.8880, lng: -119.4960 },
    wave_id: 'wave3',
    fiber_status: 'Copper Only',
  },
  {
    id: 'loc5',
    address: '654 Agency Street, Victoria, BC',
    region: 'Vancouver Island',
    coordinates: { lat: 48.4284, lng: -123.3656 },
    wave_id: 'wave2',
    fiber_status: 'Fiber Ready',
  },
]

// Mock Waves - migration cohorts from PRD
export const mockWaves: Wave[] = [
  {
    id: 'wave1',
    name: 'Wave 1 - Lower Mainland Hospitals',
    start_date: '2024-01-05',
    end_date: '2024-01-20',
    region: 'Lower Mainland',
    customer_cohort: 'Hospitals',
    progress_status: 'In Progress',
    progress_percentage: 65,
  },
  {
    id: 'wave2',
    name: 'Wave 2 - Vancouver Island Government',
    start_date: '2024-01-21',
    end_date: '2024-02-10',
    region: 'Vancouver Island',
    customer_cohort: 'Government',
    progress_status: 'In Progress',
    progress_percentage: 45,
  },
  {
    id: 'wave3',
    name: 'Wave 3 - BC Interior Enterprises',
    start_date: '2024-02-11',
    end_date: '2024-03-01',
    region: 'Interior',
    customer_cohort: 'Enterprise',
    progress_status: 'Planning',
    progress_percentage: 10,
  },
]

// Mock Technicians - field service personnel
export const mockTechnicians: Technician[] = [
  { id: 'tech1', name: 'John Smith', phone: '604-555-0101', assigned_jobs: 5 },
  { id: 'tech2', name: 'Sarah Johnson', phone: '604-555-0102', assigned_jobs: 3 },
  { id: 'tech3', name: 'Mike Chen', phone: '250-555-0103', assigned_jobs: 7 },
  { id: 'tech4', name: 'Emily Davis', phone: '604-555-0104', assigned_jobs: 2 },
]

// Mock Customers - business clients
export const mockCustomers: Customer[] = [
  { id: 'cust1', name: 'Vancouver General Hospital', phone: '604-555-0201', address: '123 Main Street, Vancouver, BC', consent_status: 'Consented' },
  { id: 'cust2', name: 'BC Ministry Office', phone: '250-555-0202', address: '456 Government Way, Victoria, BC', consent_status: 'Pending' },
  { id: 'cust3', name: 'St. Paul\'s Hospital', phone: '604-555-0203', address: '789 Hospital Drive, Vancouver, BC', consent_status: 'Consented' },
  { id: 'cust4', name: 'TechCorp Industries', phone: '250-555-0204', address: '321 Enterprise Blvd, Kelowna, BC', consent_status: 'Declined' },
]

// Mock Work Orders - technician assignments
export const mockWorkOrders: WorkOrder[] = [
  { id: 'wo1', location_id: 'loc1', technician_id: 'tech1', status: 'In Progress', start_time: '2024-01-10T09:00:00Z' },
  { id: 'wo2', location_id: 'loc3', technician_id: 'tech1', status: 'Assigned' },
  { id: 'wo3', location_id: 'loc2', technician_id: 'tech2', status: 'Completed', start_time: '2024-01-08T08:00:00Z', end_time: '2024-01-08T14:30:00Z' },
  { id: 'wo4', location_id: 'loc5', technician_id: 'tech3', status: 'In Progress', start_time: '2024-01-11T10:00:00Z' },
]

// Mock Consent Logs - customer engagement records
export const mockConsentLogs: ConsentLog[] = [
  { id: 'consent1', customer_id: 'cust1', agent_name: 'Alice Agent', status: 'Consented', timestamp: '2024-01-05T10:30:00Z', notes: 'Customer confirmed availability for migration' },
  { id: 'consent2', customer_id: 'cust2', agent_name: 'Bob Agent', status: 'Pending', timestamp: '2024-01-06T14:15:00Z', notes: 'Left voicemail, awaiting callback' },
  { id: 'consent3', customer_id: 'cust3', agent_name: 'Alice Agent', status: 'Consented', timestamp: '2024-01-07T09:00:00Z', notes: 'Scheduled for next week' },
  { id: 'consent4', customer_id: 'cust4', agent_name: 'Bob Agent', status: 'Declined', timestamp: '2024-01-08T11:45:00Z', notes: 'Deferred to next quarter' },
]

