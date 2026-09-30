import { useCallback, useEffect, useState } from 'react'
import api from '../lib/axios'

/**
 * Manages the attendance *sheet* for a given class + date.
 * Different from other CRUD hooks — this one is bulk-oriented.
 */
export default function useAttendance() {
  const [rows, setRows] = useState([])
  const [sheetMeta, setSheetMeta] = useState({
    class_id: null,
    date: null,
    has_existing: false,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  /**
   * Load the attendance sheet for a class + date.
   */
  const loadSheet = useCallback(async (classId, date) => {
    if (!classId || !date) return

    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const { data } = await api.get('/api/attendance/sheet', {
        params: { class_id: classId, date },
      })
      setRows(data.rows)
      setSheetMeta({
        class_id: data.class_id,
        date: data.date,
        has_existing: data.has_existing,
      })
    } catch (err) {
      setError(err.message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update a single row's status locally (not yet saved).
   */
  const setRowStatus = (studentId, status) => {
    setRows((r) => r.map((row) => (row.student_id === studentId ? { ...row, status } : row)))
    setSaved(false)
  }

  const setRowNotes = (studentId, notes) => {
    setRows((r) => r.map((row) => (row.student_id === studentId ? { ...row, notes } : row)))
    setSaved(false)
  }

  /**
   * Mark all rows with a given status.
   */
  const markAll = (status) => {
    setRows((r) => r.map((row) => ({ ...row, status })))
    setSaved(false)
  }

  /**
   * Save all rows in one request.
   */
  const saveSheet = useCallback(async () => {
    if (!sheetMeta.class_id || !sheetMeta.date || rows.length === 0) return

    setSaving(true)
    setError(null)
    try {
      await api.post('/api/attendance/bulk', {
        class_id: sheetMeta.class_id,
        date: sheetMeta.date,
        records: rows.map((r) => ({
          student_id: r.student_id,
          status: r.status,
          notes: r.notes || null,
        })),
      })
      setSaved(true)
      // Refresh to get server-side IDs and timestamps
      await loadSheet(sheetMeta.class_id, sheetMeta.date)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [rows, sheetMeta, loadSheet])

  return {
    rows,
    sheetMeta,
    loading,
    saving,
    error,
    saved,
    loadSheet,
    setRowStatus,
    setRowNotes,
    markAll,
    saveSheet,
  }
}
