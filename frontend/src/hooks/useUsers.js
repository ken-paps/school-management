import { useCallback, useEffect, useState } from 'react'
import api from '../lib/axios'

/**
 * Hook for managing the user list + CRUD operations.
 *
 * Usage:
 *   const { users, loading, error, filters, setFilters, refresh,
 *           createUser, updateUser, deleteUser, generatePassword } = useUsers();
 */
export default function useUsers() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null) // pagination info
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    page: 1,
    per_page: 15,
  })

  // ─────────────────────────────────────────────
  //  Fetch list
  // ─────────────────────────────────────────────
  const refresh = useCallback(
    async (overrideFilters) => {
      const params = overrideFilters ?? filters
      setLoading(true)
      setError(null)
      try {
        // Strip empty values so we don't send ?role=&search=
        const cleanParams = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))

        const { data } = await api.get('/api/users', { params: cleanParams })
        setUsers(data.data)
        setMeta({
          current_page: data.current_page,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total,
          from: data.from,
          to: data.to,
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  // Refresh when filters change (debounced-ish via dependency)
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.role, filters.page, filters.per_page])

  // ─────────────────────────────────────────────
  //  Create
  // ─────────────────────────────────────────────
  const createUser = useCallback(
    async (payload) => {
      const { data } = await api.post('/api/users', payload)
      await refresh()
      return data.user
    },
    [refresh],
  )

  // ─────────────────────────────────────────────
  //  Update
  // ─────────────────────────────────────────────
  const updateUser = useCallback(
    async (id, payload) => {
      const { data } = await api.put(`/api/users/${id}`, payload)
      await refresh()
      return data.user
    },
    [refresh],
  )

  // ─────────────────────────────────────────────
  //  Delete (soft)
  // ─────────────────────────────────────────────
  const deleteUser = useCallback(
    async (id) => {
      await api.delete(`/api/users/${id}`)
      await refresh()
    },
    [refresh],
  )

  // ─────────────────────────────────────────────
  //  Restore (for future Trash view)
  // ─────────────────────────────────────────────
  const restoreUser = useCallback(
    async (id) => {
      await api.post(`/api/users/${id}/restore`)
      await refresh()
    },
    [refresh],
  )

  // ─────────────────────────────────────────────
  //  Password generator
  // ─────────────────────────────────────────────
  const generatePassword = useCallback(async () => {
    const { data } = await api.get('/api/users/generate-password')
    return data.password
  }, [])

  return {
    users,
    meta,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    createUser,
    updateUser,
    deleteUser,
    restoreUser,
    generatePassword,
  }
}
