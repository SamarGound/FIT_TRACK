import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Trainers from './pages/Trainers'
import Memberships from './pages/Memberships'
import Attendance from './pages/Attendance'
import Workout from './pages/Workout'
import Diet from './pages/Diet'
import Payments from './pages/Payments'
import BMI from './pages/BMI'
import Progress from './pages/Progress'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="bmi" element={<BMI />} />
        <Route path="progress" element={<Progress />} />
        <Route path="notifications" element={<Notifications />} />

        <Route path="members" element={<ProtectedRoute adminOnly><Members /></ProtectedRoute>} />
        <Route path="trainers" element={<ProtectedRoute adminOnly><Trainers /></ProtectedRoute>} />
        <Route path="memberships" element={<ProtectedRoute adminOnly><Memberships /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute adminOnly><Attendance /></ProtectedRoute>} />
        <Route path="workout" element={<ProtectedRoute adminOnly><Workout /></ProtectedRoute>} />
        <Route path="diet" element={<ProtectedRoute adminOnly><Diet /></ProtectedRoute>} />
        <Route path="payments" element={<ProtectedRoute adminOnly><Payments /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
