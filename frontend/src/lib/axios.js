import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

/**
 * Fetch the CSRF cookie from Sanctum.
 * MUST be called before any state-changing request (POST/PUT/DELETE).
 */
export const getCsrfCookie = () => api.get('/sanctum/csrf-cookie')

/**
 * Read the XSRF-TOKEN cookie value (set by Sanctum).
 * Laravel expects this in the X-XSRF-TOKEN header.
 */
const getXsrfToken = () => {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

// Attach X-XSRF-TOKEN to every state-changing request
api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase()
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = getXsrfToken()
    if (token) {
      config.headers['X-XSRF-TOKEN'] = token
    }
  }
  return config
})

/**
 * Surface backend error messages in a consistent shape.
 * After this, catch blocks can read: err.message
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data

    // Prefer: validation message > generic message > status fallback
    const message = (data?.errors && Object.values(data.errors)?.[0]?.[0]) || data?.message || error.message || 'Something went wrong.'

    error.message = message
    return Promise.reject(error)
  },
)

export default api
