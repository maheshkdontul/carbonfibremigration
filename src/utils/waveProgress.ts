/**
 * Wave Progress Automation Utilities
 * Functions for automatically calculating and updating wave progress
 */

import { updateWaveProgress } from '../services/api'
import type { Wave, WorkOrder, Location } from '../types'

/**
 * Calculate wave progress from work orders
 */
export function calculateWaveProgress(
  wave: Wave,
  locations: Location[],
  workOrders: WorkOrder[]
): number {
  // Get all locations assigned to this wave
  const waveLocations = locations.filter((loc) => loc.wave_id === wave.id)

  if (waveLocations.length === 0) {
    return 0
  }

  const locationIds = waveLocations.map((loc) => loc.id)

  // Get all work orders for these locations
  const waveWorkOrders = workOrders.filter((wo) => locationIds.includes(wo.location_id))

  if (waveWorkOrders.length === 0) {
    return 0
  }

  // Calculate progress based on completed work orders
  const completedCount = waveWorkOrders.filter((wo) => wo.status === 'Completed').length
  const progressPercentage = Math.round(
    (completedCount / waveWorkOrders.length) * 100
  )

  return progressPercentage
}

/**
 * Update all wave progress percentages
 */
export async function refreshAllWaveProgress(
  waves: Wave[],
  locations: Location[],
  workOrders: WorkOrder[]
): Promise<Wave[]> {
  const updatedWaves = await Promise.all(
    waves.map(async (wave) => {
      try {
        const newProgress = await updateWaveProgress(wave.id)
        return {
          ...wave,
          progress_percentage: newProgress,
        }
      } catch (error) {
        // If update fails, calculate locally
        const localProgress = calculateWaveProgress(wave, locations, workOrders)
        return {
          ...wave,
          progress_percentage: localProgress,
        }
      }
    })
  )

  return updatedWaves
}

