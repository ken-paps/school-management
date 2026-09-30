import { useCallback, useEffect, useState } from 'react'
import api from '../lib/axios'

export default function useExams() {
  const [exams, setExams] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    search: '',
    term: '',
    year: '',
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
        const { data } = await api.get('/api/exams', { params: cleanParams })
        setExams(data.data)
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
  }, [filters.search, filters.term, filters.year, filters.page, filters.per_page])

  const createExam = useCallback(
    async (payload) => {
      const { data } = await api.post('/api/exams', payload)
      await refresh()
      return data.exam
    },
    [refresh],
  )

  const updateExam = useCallback(
    async (id, payload) => {
      const { data } = await api.put(`/api/exams/${id}`, payload)
      await refresh()
      return data.exam
    },
    [refresh],
  )

  const deleteExam = useCallback(
    async (id) => {
      await api.delete(`/api/exams/${id}`)
      await refresh()
    },
    [refresh],
  )

  const togglePublish = useCallback(
    async (id, isPublished) => {
      const { data } = await api.patch(`/api/exams/${id}`, {
        is_published: isPublished,
      })
      await refresh()
      return data.exam
    },
    [refresh],
  )

  return {
    exams,
    meta,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    createExam,
    updateExam,
    deleteExam,
    togglePublish,
  }
}
