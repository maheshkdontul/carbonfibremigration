// Type definitions for the application
// These ensure type safety throughout the codebase

// Asset types (copper, fiber, ONT)
export type AssetType = 'copper' | 'fiber' | 'ONT'

// Asset status types
export type AssetStatus = 'active' | 'pending' | 'completed' | 'failed'

// BC Region types from PRD
export type Region = 'Vancouver Island' | 'Lower Mainland' | 'Interior' | 'North'

// Customer cohort types from PRD
export type CustomerCohort = 'Hospitals' | 'Government' | 'Enterprise'

// Fiber feasibility status
export type FiberStatus = 'Fiber Ready' | 'Pending Feasibility' | 'Copper Only'

// Work order status
export type WorkOrderStatus = 'Assigned' | 'In Progress' | 'Completed' | 'Failed'

// Consent status
export type ConsentStatus = 'Consented' | 'Pending' | 'Declined'

// Wave progress status
export type WaveProgressStatus = 'Planning' | 'In Progress' | 'Completed' | 'On Hold'

// Asset entity - represents physical infrastructure
export interface Asset {
  // Unique identifier
  id: string
  // Type of asset (copper/fiber/ONT)
  type: AssetType
  // Reference to location
  location_id: string
  // Current status
  status: AssetStatus
  // Installation date (optional - may not be installed yet)
  installation_date?: string
  // Assigned technician ID (optional)
  technician_id?: string
}

// Location entity - represents a physical address
export interface Location {
  // Unique identifier
  id: string
  // Street address
  address: string
  // BC region
  region: Region
  // Geographic coordinates (latitude, longitude)
  coordinates: {
    lat: number
    lng: number
  }
  // Associated wave ID (optional - may not be assigned yet)
  wave_id?: string
  // Fiber readiness status
  fiber_status: FiberStatus
}

// Wave entity - represents a migration wave/cohort
export interface Wave {
  // Unique identifier
  id: string
  // Wave name (e.g., "Wave 1 - Lower Mainland Hospitals")
  name: string
  // Start date (ISO format: YYYY-MM-DD)
  start_date: string
  // End date (ISO format: YYYY-MM-DD)
  end_date: string
  // BC region
  region: Region
  // Customer type
  customer_cohort: CustomerCohort
  // Overall progress status
  progress_status: WaveProgressStatus
  // Progress percentage (0-100)
  progress_percentage: number
}

// Technician entity - represents field technician
export interface Technician {
  // Unique identifier
  id: string
  // Full name
  name: string
  // Phone number
  phone: string
  // Count of assigned jobs
  assigned_jobs: number
}

// Customer entity - represents business customer
export interface Customer {
  // Unique identifier
  id: string
  // Business name
  name: string
  // Contact phone
  phone: string
  // Physical address
  address: string
  // Consent status
  consent_status: ConsentStatus
}

// Work order entity - represents technician assignment
export interface WorkOrder {
  // Unique identifier
  id: string
  // Location ID for this work order
  location_id: string
  // Assigned technician ID
  technician_id: string
  // Current status
  status: WorkOrderStatus
  // Start time (ISO format)
  start_time?: string
  // End time (ISO format)
  end_time?: string
}

// Consent log entity - audit trail for customer consent
export interface ConsentLog {
  // Unique identifier
  id: string
  // Customer ID
  customer_id: string
  // Agent name who recorded consent
  agent_name: string
  // Consent status recorded
  status: ConsentStatus
  // Timestamp of record (ISO format)
  timestamp: string
  // Additional notes
  notes?: string
}

