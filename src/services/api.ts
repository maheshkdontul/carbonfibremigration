// Supabase API service functions
// This file contains all functions to interact with Supabase database
// Replaces mock data with actual database queries

import { supabase } from './supabase'
import { handleApiError, ApiError } from '../utils/errorHandler'
import { CSV_BATCH_SIZE } from '../utils/constants'
import type { Database } from '../types/supabase'
import type {
  Asset,
  Location,
  Wave,
  Technician,
  Customer,
  WorkOrder,
  ConsentLog,
  Region,
  CustomerCohort,
  FiberStatus,
  AssetStatus,
  WorkOrderStatus,
  ConsentStatus,
} from '../types'

// ============================================================================
// ASSETS API
// ============================================================================

/**
 * Fetch all assets from Supabase
 * Returns array of assets with their associated locations
 */
export async function fetchAssets(): Promise<Asset[]> {
  const response = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })

  const { data, error } = response as {
    data: Database['public']['Tables']['assets']['Row'][] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'fetchAssets')
  }

  // Transform Supabase data to our Asset type
  return ((data || []) as Database['public']['Tables']['assets']['Row'][]).map((asset) => ({
    id: asset.id,
    type: asset.type as Asset['type'],
    location_id: asset.location_id || '',
    status: asset.status as AssetStatus,
    installation_date: asset.installation_date || undefined,
    technician_id: asset.technician_id || undefined,
  }))
}

/**
 * Create a new asset in Supabase
 */
export async function createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
  const response = await supabase
    .from('assets')
    .insert({
      type: asset.type,
      location_id: asset.location_id || null,
      status: asset.status,
      installation_date: asset.installation_date || null,
      technician_id: asset.technician_id || null,
    } as Database['public']['Tables']['assets']['Insert'])
    .select()
    .single()

  const { data, error } = response as {
    data: Database['public']['Tables']['assets']['Row'] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'createAsset')
  }

  if (!data) {
    throw new ApiError('No data returned from create asset operation')
  }

  const assetData = data
  return {
    id: assetData.id,
    type: assetData.type as Asset['type'],
    location_id: assetData.location_id || '',
    status: assetData.status as AssetStatus,
    installation_date: assetData.installation_date || undefined,
    technician_id: assetData.technician_id || undefined,
  }
}

/**
 * Update an existing asset
 */
export async function updateAsset(id: string, updates: Partial<Asset>): Promise<void> {
  const updatePayload: Database['public']['Tables']['assets']['Update'] = {}
  if (updates.type !== undefined) updatePayload.type = updates.type
  if (updates.location_id !== undefined) updatePayload.location_id = updates.location_id || null
  if (updates.status !== undefined) updatePayload.status = updates.status
  if (updates.installation_date !== undefined) updatePayload.installation_date = updates.installation_date || null
  if (updates.technician_id !== undefined) updatePayload.technician_id = updates.technician_id || null

  const { error } = await supabase
    .from('assets')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    throw handleApiError(error, 'updateAsset')
  }
}

/**
 * Bulk insert assets from CSV upload
 */
export async function bulkCreateAssets(assets: Omit<Asset, 'id'>[]): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0
  let failed = 0
  const errors: string[] = []

  // Process in batches to avoid overwhelming Supabase
  const batchSize = CSV_BATCH_SIZE
  for (let i = 0; i < assets.length; i += batchSize) {
    const batch = assets.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1
    
    try {
      const batchResponse = await supabase
        .from('assets')
        .insert(
          batch.map((asset) => ({
            type: asset.type,
            location_id: asset.location_id || null,
            status: asset.status,
            installation_date: asset.installation_date || null,
            technician_id: asset.technician_id || null,
          })) as Database['public']['Tables']['assets']['Insert'][]
        )
        .select()

      const { data, error } = batchResponse as {
        data: Database['public']['Tables']['assets']['Row'][] | null
        error: any
      }

      if (error) {
        const apiError = handleApiError(error, `bulkCreateAssets batch ${batchNumber}`)
        failed += batch.length
        errors.push(`Batch ${batchNumber}: ${apiError.message}`)
      } else {
        success += data?.length || 0
      }
    } catch (error) {
      const apiError = handleApiError(error, `bulkCreateAssets batch ${batchNumber}`)
      failed += batch.length
      errors.push(`Batch ${batchNumber}: ${apiError.message}`)
    }
  }

  return { success, failed, errors }
}

// ============================================================================
// LOCATIONS API
// ============================================================================

/**
 * Fetch all locations from Supabase
 */
export async function fetchLocations(): Promise<Location[]> {
  const response = await supabase
    .from('locations')
    .select('*')
    .order('address', { ascending: true })

  const { data, error } = response as {
    data: Database['public']['Tables']['locations']['Row'][] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'fetchLocations')
  }

  return ((data || []) as Database['public']['Tables']['locations']['Row'][]).map((loc) => ({
    id: loc.id,
    address: loc.address,
    region: loc.region as Region,
    coordinates: loc.coordinates as { lat: number; lng: number },
    wave_id: loc.wave_id || undefined,
    fiber_status: loc.fiber_status as FiberStatus,
  }))
}

/**
 * Create a new location
 */
export async function createLocation(location: Omit<Location, 'id'>): Promise<Location> {
  const response = await supabase
    .from('locations')
    .insert({
      address: location.address,
      region: location.region,
      coordinates: location.coordinates,
      wave_id: location.wave_id || null,
      fiber_status: location.fiber_status,
    } as Database['public']['Tables']['locations']['Insert'])
    .select()
    .single()

  const { data, error } = response as {
    data: Database['public']['Tables']['locations']['Row'] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'createLocation')
  }

  if (!data) {
    throw new ApiError('No data returned from create location operation')
  }

  const locationData = data
  return {
    id: locationData.id,
    address: locationData.address,
    region: locationData.region as Region,
    coordinates: locationData.coordinates as { lat: number; lng: number },
    wave_id: locationData.wave_id || undefined,
    fiber_status: locationData.fiber_status as FiberStatus,
  }
}

/**
 * Update location fiber status
 */
export async function updateLocationFiberStatus(
  locationId: string,
  fiberStatus: FiberStatus
): Promise<void> {
  const { error } = await supabase
    .from('locations')
    .update({ fiber_status: fiberStatus } as Database['public']['Tables']['locations']['Update'])
    .eq('id', locationId)

  if (error) {
    throw handleApiError(error, 'updateLocationFiberStatus')
  }
}

// ============================================================================
// WAVES API
// ============================================================================

/**
 * Fetch all waves from Supabase
 */
export async function fetchWaves(): Promise<Wave[]> {
  const response = await supabase
    .from('waves')
    .select('*')
    .order('start_date', { ascending: false })

  const { data, error } = response as {
    data: Database['public']['Tables']['waves']['Row'][] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'fetchWaves')
  }

  return ((data || []) as Database['public']['Tables']['waves']['Row'][]).map((wave) => ({
    id: wave.id,
    name: wave.name,
    start_date: wave.start_date,
    end_date: wave.end_date,
    region: wave.region as Region,
    customer_cohort: wave.customer_cohort as CustomerCohort,
    progress_status: wave.progress_status as Wave['progress_status'],
    progress_percentage: wave.progress_percentage,
  }))
}

/**
 * Create a new wave
 */
export async function createWave(wave: Omit<Wave, 'id' | 'progress_percentage'>): Promise<Wave> {
  const response = await supabase
    .from('waves')
    .insert({
      name: wave.name,
      start_date: wave.start_date,
      end_date: wave.end_date,
      region: wave.region,
      customer_cohort: wave.customer_cohort,
      progress_status: wave.progress_status || 'Planning',
      progress_percentage: 0,
    } as Database['public']['Tables']['waves']['Insert'])
    .select()
    .single()

  const { data, error } = response as {
    data: Database['public']['Tables']['waves']['Row'] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'createWave')
  }

  if (!data) {
    throw new ApiError('No data returned from create wave operation')
  }

  const waveData = data
  return {
    id: waveData.id,
    name: waveData.name,
    start_date: waveData.start_date,
    end_date: waveData.end_date,
    region: waveData.region as Region,
    customer_cohort: waveData.customer_cohort as CustomerCohort,
    progress_status: waveData.progress_status as Wave['progress_status'],
    progress_percentage: waveData.progress_percentage,
  }
}

/**
 * Update wave progress based on work orders
 */
export async function updateWaveProgress(waveId: string): Promise<number> {
  // Count completed work orders for locations in this wave
  const locationsResponse = await supabase
    .from('locations')
    .select('id')
    .eq('wave_id', waveId)

  const { data: locations, error: locationsError } = locationsResponse as {
    data: Array<{ id: string }> | null
    error: any
  }

  if (locationsError) {
    throw handleApiError(locationsError, 'updateWaveProgress - fetch locations')
  }

  if (!locations || locations.length === 0) {
    // Update wave to 0% if no locations
    const { error: updateError } = await supabase
      .from('waves')
      .update({ progress_percentage: 0 } as Database['public']['Tables']['waves']['Update'])
      .eq('id', waveId)

    if (updateError) {
      throw handleApiError(updateError, 'updateWaveProgress - update to 0%')
    }

    return 0
  }

  const locationIds = locations.map((loc) => loc.id)

  // Fetch all work orders for these locations
  const workOrdersResponse = await supabase
    .from('work_orders')
    .select('status')
    .in('location_id', locationIds)

  const { data: workOrders, error: workOrdersError } = workOrdersResponse as {
    data: Array<{ status: string }> | null
    error: any
  }

  if (workOrdersError) {
    throw handleApiError(workOrdersError, 'updateWaveProgress - fetch work orders')
  }

  // Calculate progress
  const totalWorkOrders = workOrders?.length || 0
  const completedWorkOrders = workOrders?.filter((wo) => wo.status === 'Completed').length || 0

  const progressPercentage = totalWorkOrders > 0
    ? Math.round((completedWorkOrders / totalWorkOrders) * 100)
    : 0

  // Update wave progress
  const { error: updateError } = await supabase
    .from('waves')
    .update({ progress_percentage: progressPercentage } as Database['public']['Tables']['waves']['Update'])
    .eq('id', waveId)

  if (updateError) {
    throw handleApiError(updateError, 'updateWaveProgress - update percentage')
  }

  return progressPercentage
}

// ============================================================================
// TECHNICIANS API
// ============================================================================

/**
 * Fetch all technicians
 */
export async function fetchTechnicians(): Promise<Technician[]> {
  const response = await supabase
    .from('technicians')
    .select('*')
    .order('name', { ascending: true })

  const { data, error } = response as {
    data: Database['public']['Tables']['technicians']['Row'][] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'fetchTechnicians')
  }

  return ((data || []) as Database['public']['Tables']['technicians']['Row'][]).map((tech) => ({
    id: tech.id,
    name: tech.name,
    phone: tech.phone,
    assigned_jobs: tech.assigned_jobs,
  }))
}

// ============================================================================
// WORK ORDERS API
// ============================================================================

/**
 * Fetch all work orders
 */
export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  const response = await supabase
    .from('work_orders')
    .select('*')
    .order('created_at', { ascending: false })

  const { data, error } = response as {
    data: Database['public']['Tables']['work_orders']['Row'][] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'fetchWorkOrders')
  }

  return ((data || []) as Database['public']['Tables']['work_orders']['Row'][]).map((wo) => ({
    id: wo.id,
    location_id: wo.location_id,
    technician_id: wo.technician_id,
    status: wo.status as WorkOrderStatus,
    start_time: wo.start_time || undefined,
    end_time: wo.end_time || undefined,
  }))
}

/**
 * Create a new work order
 */
export async function createWorkOrder(workOrder: Omit<WorkOrder, 'id'>): Promise<WorkOrder> {
  const response = await supabase
    .from('work_orders')
    .insert({
      location_id: workOrder.location_id,
      technician_id: workOrder.technician_id,
      status: workOrder.status,
      start_time: workOrder.start_time || null,
      end_time: workOrder.end_time || null,
    } as Database['public']['Tables']['work_orders']['Insert'])
    .select()
    .single()

  const { data, error } = response as {
    data: Database['public']['Tables']['work_orders']['Row'] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'createWorkOrder')
  }

  if (!data) {
    throw new ApiError('No data returned from create work order operation')
  }

  const workOrderData = data
  return {
    id: workOrderData.id,
    location_id: workOrderData.location_id,
    technician_id: workOrderData.technician_id,
    status: workOrderData.status as WorkOrderStatus,
    start_time: workOrderData.start_time || undefined,
    end_time: workOrderData.end_time || undefined,
  }
}

/**
 * Update technician assignment for a work order
 */
export async function assignTechnicianToWorkOrder(
  workOrderId: string,
  technicianId: string
): Promise<void> {
  const { error } = await supabase
    .from('work_orders')
    .update({ technician_id: technicianId } as Database['public']['Tables']['work_orders']['Update'])
    .eq('id', workOrderId)

  if (error) {
    throw handleApiError(error, 'assignTechnicianToWorkOrder')
  }
}

/**
 * Update work order status
 */
export async function updateWorkOrderStatus(
  workOrderId: string,
  status: WorkOrderStatus,
  startTime?: string,
  endTime?: string
): Promise<void> {
  const updateData: { status: WorkOrderStatus; start_time?: string; end_time?: string } = { status }
  if (startTime) updateData.start_time = startTime
  if (endTime) updateData.end_time = endTime

  const { error } = await supabase
    .from('work_orders')
    .update(updateData as Database['public']['Tables']['work_orders']['Update'])
    .eq('id', workOrderId)

  if (error) {
    throw handleApiError(error, 'updateWorkOrderStatus')
  }
}

// ============================================================================
// CUSTOMERS API
// ============================================================================

/**
 * Fetch all customers
 */
export async function fetchCustomers(): Promise<Customer[]> {
  const response = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })

  const { data, error } = response as {
    data: Database['public']['Tables']['customers']['Row'][] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'fetchCustomers')
  }

  return ((data || []) as Database['public']['Tables']['customers']['Row'][]).map((cust) => ({
    id: cust.id,
    name: cust.name,
    phone: cust.phone,
    address: cust.address,
    consent_status: cust.consent_status as ConsentStatus,
  }))
}

/**
 * Update customer consent status
 */
export async function updateCustomerConsent(
  customerId: string,
  consentStatus: ConsentStatus
): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .update({ consent_status: consentStatus } as Database['public']['Tables']['customers']['Update'])
    .eq('id', customerId)

  if (error) {
    throw handleApiError(error, 'updateCustomerConsent')
  }
}

// ============================================================================
// CONSENT LOGS API
// ============================================================================

/**
 * Fetch all consent logs
 */
export async function fetchConsentLogs(): Promise<ConsentLog[]> {
  const response = await supabase
    .from('consent_logs')
    .select('*')
    .order('timestamp', { ascending: false })

  const { data, error } = response as {
    data: Database['public']['Tables']['consent_logs']['Row'][] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'fetchConsentLogs')
  }

  return ((data || []) as Database['public']['Tables']['consent_logs']['Row'][]).map((log) => ({
    id: log.id,
    customer_id: log.customer_id,
    agent_name: log.agent_name,
    status: log.status as ConsentStatus,
    timestamp: log.timestamp,
    notes: log.notes || undefined,
  }))
}

/**
 * Create a new consent log entry
 */
export async function createConsentLog(
  customerId: string,
  agentName: string,
  status: ConsentStatus,
  notes?: string
): Promise<ConsentLog> {
  const response = await supabase
    .from('consent_logs')
    .insert({
      customer_id: customerId,
      agent_name: agentName,
      status,
      notes: notes || null,
    } as Database['public']['Tables']['consent_logs']['Insert'])
    .select()
    .single()

  const { data, error } = response as {
    data: Database['public']['Tables']['consent_logs']['Row'] | null
    error: any
  }

  if (error) {
    throw handleApiError(error, 'createConsentLog')
  }

  if (!data) {
    throw new ApiError('No data returned from create consent log operation')
  }

  // Type assertion to handle Supabase return type
  const consentLogData = data

  return {
    id: consentLogData.id,
    customer_id: consentLogData.customer_id,
    agent_name: consentLogData.agent_name,
    status: consentLogData.status as ConsentStatus,
    timestamp: consentLogData.timestamp,
    notes: consentLogData.notes || undefined,
  }
}

