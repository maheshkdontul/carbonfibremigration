/**
 * Custom Hook for Async Operations
 * Handles loading state for async operations (create, update, delete)
 */

import { useState, useCallback } from 'react'
import { getErrorMessage } from '../utils/errorHandler'

interface UseAsyncOperationOptions<T> {
  /** Async operation function */
  operationFn: () => Promise<T>
  /** Optional success callback */
  onSuccess?: (result: T) => void
  /** Optional error callback */
  onError?: (error: string) => void
}

interface UseAsyncOperationResult<T> {
  /** Execute the async operation */
  execute: () => Promise<T | null>
  /** Loading state */
  loading: boolean
  /** Error message or null */
  error: string | null
  /** Clear error */
  clearError: () => void
  /** Success callback (if provided) */
  onSuccess?: (result: T) => void
  /** Error callback (if provided) */
  onError?: (error: string) => void
}

/**
 * Custom hook for async operations (create, update, delete)
 */
export function useAsyncOperation<T>({
  operationFn,
  onSuccess,
  onError,
}: UseAsyncOperationOptions<T>): UseAsyncOperationResult<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await operationFn()
      onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      onError?.(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [operationFn, onSuccess, onError])

  return {
    execute,
    loading,
    error,
    clearError: () => setError(null),
    onSuccess,
    onError,
  }
}

