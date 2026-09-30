import { useCallback, useEffect, useState } from 'react'
import api from '../lib/axios'

export default function useSubjects() {
  const [subjects, setSubjects] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    is_active: '',
    page: 1,
    per_page: 15,
  })

  const refresh = useCallback(
    async (overrideFilters) => {
      const params = overrideFilters ?? filters
      setLoading(true)
      setError(null)
      try {
        const cleanParams = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))

        const { data } = await api.get('/api/subjects', { params: cleanParams })
        setSubjects(data.data)
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

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.is_active, filters.page, filters.per_page])

  const createSubject = useCallback(
    async (payload) => {
      const { data } = await api.post('/api/subjects', payload)
      await refresh()
      return data.subject
    },
    [refresh],
  )

  const updateSubject = useCallback(
    async (id, payload) => {
      const { data } = await api.put(`/api/subjects/${id}`, payload)
      await refresh()
      return data.subject
    },
    [refresh],
  )

  const deleteSubject = useCallback(
    async (id) => {
      await api.delete(`/api/subjects/${id}`)
      await refresh()
    },
    [refresh],
  )

  return {
    subjects,
    meta,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    createSubject,
    updateSubject,
    deleteSubject,
  }
}
