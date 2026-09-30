import { useCallback, useEffect, useState } from 'react'
import api from '../lib/axios'

export default function useGrades() {
  const [grades, setGrades] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    exam_id: '',
    student_id: '',
    subject_id: '',
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
        const { data } = await api.get('/api/grades', { params: cleanParams })
        setGrades(data.data || [])
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
  }, [filters.exam_id, filters.student_id, filters.subject_id, filters.page, filters.per_page])

  // Fetch the grade entry sheet for exam+class+subject
  const fetchSheet = useCallback(async ({ exam_id, class_id, subject_id }) => {
    const { data } = await api.get('/api/grades/sheet', {
      params: { exam_id, class_id, subject_id },
    })
    return data
  }, [])

  // Bulk save a sheet
  const bulkStore = useCallback(
    async (payload) => {
      const { data } = await api.post('/api/grades/bulk', payload)
      await refresh()
      return data
    },
    [refresh],
  )

  const deleteGrade = useCallback(
    async (id) => {
      await api.delete(`/api/grades/${id}`)
      await refresh()
    },
    [refresh],
  )

  return {
    grades,
    meta,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    fetchSheet,
    bulkStore,
    deleteGrade,
  }
}
