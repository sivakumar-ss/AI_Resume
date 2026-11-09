/**
 * Convert an Axios/API failure into a friendly, displayable message and
 * per-field validation errors.
 */
export function parseApiError(error, fallback = 'Something went wrong. Please try again.') {
  const response = error?.response
  const data = response?.data

  if (data && typeof data === 'object') {
    const fields =
      data.fields && typeof data.fields === 'object' && !Array.isArray(data.fields)
        ? data.fields
        : {}

    if (typeof data.error === 'string' && data.error.trim()) {
      return { message: data.error, fields }
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return { message: data.message, fields }
    }
  }

  if (error?.code === 'ECONNABORTED') {
    return {
      message: 'The request took too long. Check your connection and try again.',
      fields: {},
    }
  }

  if (!response) {
    return {
      message:
        'We could not reach the server. Make sure the backend is running and try again.',
      fields: {},
    }
  }

  if (response.status === 401) {
    return { message: 'Your session has expired. Please sign in again.', fields: {} }
  }

  if (response.status === 403) {
    return {
      message: 'You do not have permission to perform this action.',
      fields: {},
    }
  }

  if (response.status === 404) {
    return { message: 'The requested resource was not found.', fields: {} }
  }

  if (response.status >= 500) {
    return {
      message: 'The server ran into a problem. Please try again in a moment.',
      fields: {},
    }
  }

  return { message: fallback, fields: {} }
}

export function getFieldError(fields, name) {
  if (!fields || !name) return undefined
  const value = fields[name]
  if (Array.isArray(value)) return value.join(' ')
  return typeof value === 'string' ? value : undefined
}
