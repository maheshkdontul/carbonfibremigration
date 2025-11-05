// CSV parsing utility for asset uploads
// Handles parsing CSV files and converting to asset/location data

import type { Asset, Location } from '../types'
import { VALID_REGIONS, VALID_ASSET_TYPES, VALID_ASSET_STATUSES, DATE_FORMAT_REGEX } from './constants'

/**
 * CSV row structure expected for asset upload
 * Format: address,region,type,status,installation_date,technician_id
 */
interface CSVRow {
  address: string
  region: string
  type: string
  status: string
  installation_date?: string
  technician_id?: string
  coordinates_lat?: string
  coordinates_lng?: string
}

/**
 * Parse CSV file content into array of objects
 */
export function parseCSV(csvText: string): CSVRow[] {
  // Split by newlines and filter out empty lines
  const lines = csvText.split('\n').filter((line) => line.trim().length > 0)
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain header row and at least one data row')
  }

  // Parse header row
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''))
  
  // Parse data rows
  const rows: CSVRow[] = []
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const values = parseCSVLine(line)
    
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`)
      continue
    }

    // Create object from headers and values
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim().replace(/"/g, '') || ''
    })

    // Type assertion with proper structure validation
    const csvRow: CSVRow = {
      address: row.address || '',
      region: row.region || '',
      type: row.type || '',
      status: row.status || '',
      installation_date: row.installation_date,
      technician_id: row.technician_id,
      coordinates_lat: row.coordinates_lat,
      coordinates_lng: row.coordinates_lng,
    }
    rows.push(csvRow)
  }

  if (errors.length > 0 && rows.length === 0) {
    throw new Error(`CSV parsing errors:\n${errors.join('\n')}`)
  }

  return rows
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last value
  values.push(current)
  
  return values
}

/**
 * Validate CSV row data
 */
export function validateCSVRow(row: CSVRow, rowNumber: number): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required fields
  if (!row.address || row.address.trim().length === 0) {
    errors.push(`Row ${rowNumber}: Missing address`)
  }

  if (!row.region || row.region.trim().length === 0) {
    errors.push(`Row ${rowNumber}: Missing region`)
  } else {
    if (!VALID_REGIONS.includes(row.region.trim() as typeof VALID_REGIONS[number])) {
      errors.push(`Row ${rowNumber}: Invalid region "${row.region}". Must be one of: ${VALID_REGIONS.join(', ')}`)
    }
  }

  if (!row.type || row.type.trim().length === 0) {
    errors.push(`Row ${rowNumber}: Missing asset type`)
  } else {
    if (!VALID_ASSET_TYPES.includes(row.type.trim().toLowerCase() as typeof VALID_ASSET_TYPES[number])) {
      errors.push(`Row ${rowNumber}: Invalid asset type "${row.type}". Must be one of: ${VALID_ASSET_TYPES.join(', ')}`)
    }
  }

  if (!row.status || row.status.trim().length === 0) {
    errors.push(`Row ${rowNumber}: Missing status`)
  } else {
    if (!VALID_ASSET_STATUSES.includes(row.status.trim().toLowerCase() as typeof VALID_ASSET_STATUSES[number])) {
      errors.push(`Row ${rowNumber}: Invalid status "${row.status}". Must be one of: ${VALID_ASSET_STATUSES.join(', ')}`)
    }
  }

  // Validate date format if provided
  if (row.installation_date && row.installation_date.trim().length > 0) {
    if (!DATE_FORMAT_REGEX.test(row.installation_date.trim())) {
      errors.push(`Row ${rowNumber}: Invalid date format "${row.installation_date}". Use YYYY-MM-DD format`)
    }
  }

  // Validate coordinates if provided
  if (row.coordinates_lat && row.coordinates_lng) {
    const lat = parseFloat(row.coordinates_lat)
    const lng = parseFloat(row.coordinates_lng)
    if (isNaN(lat) || isNaN(lng)) {
      errors.push(`Row ${rowNumber}: Invalid coordinates (lat: ${row.coordinates_lat}, lng: ${row.coordinates_lng})`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Convert CSV rows to Location and Asset objects
 */
export async function convertCSVToData(
  rows: CSVRow[]
): Promise<{ locations: Omit<Location, 'id'>[]; assets: Omit<Asset, 'id'>[]; errors: string[] }> {
  const locations: Omit<Location, 'id'>[] = []
  const assets: Omit<Asset, 'id'>[] = []
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const validation = validateCSVRow(row, i + 2) // +2 because row 1 is header

    if (!validation.valid) {
      errors.push(...validation.errors)
      continue
    }

    // Create location
    const coordinates = row.coordinates_lat && row.coordinates_lng
      ? { lat: parseFloat(row.coordinates_lat), lng: parseFloat(row.coordinates_lng) }
      : { lat: 0, lng: 0 } // Default coordinates (could geocode address later)

    const location: Omit<Location, 'id'> = {
      address: row.address.trim(),
      region: row.region.trim() as Location['region'],
      coordinates,
      fiber_status: 'Pending Feasibility', // Default status
    }

    locations.push(location)

    // Create asset (will be linked after location is created)
    const asset: Omit<Asset, 'id' | 'location_id'> = {
      type: row.type.trim().toLowerCase() as Asset['type'],
      status: row.status.trim().toLowerCase() as Asset['status'],
      installation_date: row.installation_date?.trim() || undefined,
      technician_id: row.technician_id?.trim() || undefined,
    }

    // Store asset with location reference (will be set after location creation)
    assets.push({ ...asset, location_id: '' })
  }

  return { locations, assets, errors }
}

/**
 * Example CSV format for user reference:
 * 
 * address,region,type,status,installation_date,technician_id,coordinates_lat,coordinates_lng
 * "123 Main St, Vancouver, BC",Lower Mainland,copper,active,2020-01-15,,49.2827,-123.1207
 * "456 Oak Ave, Victoria, BC",Vancouver Island,fiber,completed,2023-06-20,tech-123,48.4284,-123.3656
 */

