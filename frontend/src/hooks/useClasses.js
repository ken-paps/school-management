import { useCallback, useEffect, useState } from 'react'
import api from '../lib/axios'

export default function useClasses() {
  const [classes, setClasses] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    grade_level: '',
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

        const { data } = await api.get('/api/classes', { params: cleanParams })
        setClasses(data.data)
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
  }, [filters.search, filters.grade_level, filters.page, filters.per_page])

  const createClass = useCallback(
    async (payload) => {
      const { data } = await api.post('/api/classes', payload)
      await refresh()
      return data.class
    },
    [refresh],
  )

  const updateClass = useCallback(
    async (id, payload) => {
      const { data } = await api.put(`/api/classes/${id}`, payload)
      await refresh()
      return data.class
    },
    [refresh],
  )

  const deleteClass = useCallback(
    async (id) => {
      await api.delete(`/api/classes/${id}`)
      await refresh()
    },
    [refresh],
  )

  return {
    classes,
    meta,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    createClass,
    updateClass,
    deleteClass,
  }
}
