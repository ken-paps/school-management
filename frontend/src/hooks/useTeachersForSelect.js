import { useEffect, useState } from 'react'
import api from '../lib/axios'

/**
 * Fetches a lightweight list of all teachers (users with role=teacher)
 * for use in <Select> dropdowns. Cached for the component's lifetime.
 */
export default function useTeachersForSelect() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/api/users', {
          params: { role: 'teacher', per_page: 100 },
        })
        if (!cancelled) setTeachers(data.data || [])
      } catch {
        if (!cancelled) setTeachers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { teachers, loading }
}
