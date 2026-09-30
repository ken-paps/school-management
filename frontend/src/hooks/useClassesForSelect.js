import { useEffect, useState } from 'react'
import api from '../lib/axios'

export default function useClassesForSelect() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/api/classes', {
          params: { per_page: 100 },
        })
        if (!cancelled) setClasses(data.data || [])
      } catch {
        if (!cancelled) setClasses([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { classes, loading }
}
