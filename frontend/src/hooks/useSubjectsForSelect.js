import { useEffect, useState } from 'react'
import api from '../lib/axios'

export default function useSubjectsForSelect() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/api/subjects', {
          params: { is_active: 'true', per_page: 100 },
        })
        if (!cancelled) setSubjects(data.data || [])
      } catch {
        if (!cancelled) setSubjects([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { subjects, loading }
}
