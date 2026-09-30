import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import Users from './pages/users/Users'
import Classes from './pages/classes/Classes'
import Subjects from './pages/subjects/Subjects'
import Students from './pages/students/Students'
import Teachers from './pages/teachers/Teachers'
import Notices from './pages/notices/Notices'
import Attendance from './pages/attendance/Attendance'
import Exams from './pages/exams/Exams'
import Grades from './pages/grades/Grades'

/**
 * Placeholder page — used for routes we haven't built yet.
 * Keeps the sidebar + topbar visible when you click a nav item.
 */
function ComingSoon({ title }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-200">{title}</span> — coming in a future phase.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Everything below requires auth AND shares the AppShell layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute roles={['admin', 'teacher']}>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute roles={['admin']}>
              <Teachers />
            </ProtectedRoute>
          }
        />
        <Route path="/classes" element={<Classes />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/notices" element={<Notices />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
