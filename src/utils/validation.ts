/**
 * Form Validation Utilities
 * Client-side validation for forms
 */

/**
 * Validate email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email.trim()) {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): { valid: boolean; error?: string } {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` }
  }
  return { valid: true }
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: string, endDate: string): { valid: boolean; error?: string } {
  if (!startDate || !endDate) {
    return { valid: false, error: 'Both start and end dates are required' }
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > end) {
    return { valid: false, error: 'Start date must be before end date' }
  }

  return { valid: true }
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone.trim()) {
    return { valid: false, error: 'Phone number is required' }
  }

  // Basic phone validation (allows various formats)
  const phoneRegex = /^[\d\s\-\(\)\+]+$/
  if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
    return { valid: false, error: 'Invalid phone number format' }
  }

  return { valid: true }
}

/**
 * Validate wave creation form
 */
export function validateWaveForm(formData: {
  name: string
  start_date: string
  end_date: string
  region: string
  customer_cohort: string
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate name
  const nameValidation = validateRequired(formData.name, 'Wave name')
  if (!nameValidation.valid) {
    errors.push(nameValidation.error!)
  }

  // Validate dates
  const dateValidation = validateDateRange(formData.start_date, formData.end_date)
  if (!dateValidation.valid) {
    errors.push(dateValidation.error!)
  }

  // Validate region
  const regionValidation = validateRequired(formData.region, 'Region')
  if (!regionValidation.valid) {
    errors.push(regionValidation.error!)
  }

  // Validate customer cohort
  const cohortValidation = validateRequired(formData.customer_cohort, 'Customer cohort')
  if (!cohortValidation.valid) {
    errors.push(cohortValidation.error!)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate CSV file
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Please select a file' }
  }

  if (!file.name.endsWith('.csv')) {
    return { valid: false, error: 'File must be a CSV file (.csv)' }
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  return { valid: true }
}

