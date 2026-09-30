import { useCallback, useEffect, useState } from 'react'
import api from '../lib/axios'

export default function useNotices() {
  const [notices, setNotices] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    audience: '',
    status: '',
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
        const { data } = await api.get('/api/notices', { params: cleanParams })
        setNotices(data.data)
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
  }, [filters.search, filters.audience, filters.status, filters.page, filters.per_page])

  const createNotice = useCallback(
    async (payload) => {
      const { data } = await api.post('/api/notices', payload)
      await refresh()
      return data.notice
    },
    [refresh],
  )

  const updateNotice = useCallback(
    async (id, payload) => {
      const { data } = await api.put(`/api/notices/${id}`, payload)
      await refresh()
      return data.notice
    },
    [refresh],
  )

  const deleteNotice = useCallback(
    async (id) => {
      await api.delete(`/api/notices/${id}`)
      await refresh()
    },
    [refresh],
  )

  return {
    notices,
    meta,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    createNotice,
    updateNotice,
    deleteNotice,
  }
}
