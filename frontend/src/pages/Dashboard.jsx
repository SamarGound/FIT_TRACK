import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import api from '../api'
import { formatDate, getBmiCategory } from '../helpers'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import {
  Users, IndianRupee, CalendarCheck, AlertTriangle, TrendingUp,
  Dumbbell, Salad, Trophy,
} from 'lucide-react'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [diet, setDiet] = useState([])
  const [workoutsList, setWorkoutsList] = useState([]);
  

  
  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const res = await api.get('/diet-plans/my')
        setDiet(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Failed to load diet plans:', err)
      }
    }

    fetchDiet()
  }, [])

  useEffect(() => {
    if (isAdmin) return

    const fetchWorkouts = async () => {
      try {
        const res = await api.get('/workouts/my')
        setWorkoutsList(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Failed to load workout plans:', err)
      }
    }

    fetchWorkouts()
  }, [isAdmin])

  console.log(diet, 'diet')


  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(isAdmin ? '/dashboard/admin' : '/dashboard/member')
      setStats(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard. Is the server running?')
    } finally {
      setLoading(false)
    }
  }
  console.log(stats, 'stats')

  if (loading) return <div className="loading-spinner">Loading dashboard...</div>
  if (error) return <div className="alert alert-danger alert-gym">{error}</div>
  if (!stats) return null

  if (!isAdmin) {
    const { currentMembership, attendance, totalPaid, latestBmi, bmiHistory, workouts, dietPlans, unreadNotifications } = stats
    const presentCount = attendance?.present || 0
    const attendanceCount = attendance?.total || 0
    const cat = latestBmi ? getBmiCategory(latestBmi.bmi) : null
    const bmiData = (bmiHistory || []).map((b) => ({
      month: new Date(b.recordDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      bmi: b.bmi,
    }))

    return (
      <div>
        <h2 className="page-title">Welcome, {user?.name || 'Member'}</h2>

        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fff3e0' }}><Trophy size={24} color="#ff6b35" /></div>
              <div className="stat-value">{currentMembership ? 'Active' : 'None'}</div>
              <div className="stat-label">Membership</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e8f5e9' }}><CalendarCheck size={24} color="#28a745" /></div>
              <div className="stat-value">{presentCount}/{attendanceCount}</div>
              <div className="stat-label">Days Present</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e3f2fd' }}><IndianRupee size={24} color="#17a2b8" /></div>
              <div className="stat-value">₹{totalPaid.toLocaleString('en-IN')}</div>
              <div className="stat-label">Total Paid</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fce4ec' }}><TrendingUp size={24} color="#dc3545" /></div>
              <div className="stat-value">{latestBmi ? latestBmi.bmi : '-'}</div>
              <div className="stat-label">Current BMI</div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-8">
            <div className="chart-card">
              <h5>BMI Progress Over Time</h5>
              {bmiData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bmiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bmi" stroke="#ff6b35" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">
                  <TrendingUp />
                  <p>No BMI records yet. Use the BMI Calculator to record your first measurement.</p>
                </div>
              )}
            </div>
          </div>


          <div className="col-lg-4">
            <div className="chart-card mb-3">
              <h5>Quick Stats</h5>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted"><Dumbbell size={18} className="me-2" />Workout Plans</span>
                  <strong>{workouts}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted"><Salad size={18} className="me-2" />Diet Plans</span>
                  <strong>{dietPlans}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted"><AlertTriangle size={18} className="me-2" />Unread Alerts</span>
                  <strong>{unreadNotifications}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Diet Plan Card */}
        <div className="card border-0 mt-3 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1">🥗 My Diet Plan</h4>
                <p className="text-muted mb-0">
                  Your personalized nutrition plan
                </p>
              </div>
              <span className="badge bg-success-subtle text-success px-3 py-2">
                {diet.length > 0 ? 'Assigned' : 'Pending'}
              </span>
            </div>

            {diet.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-4">
                <div style={{ fontSize: '42px' }}>🍽️</div>
                <h5 className="fw-bold mt-2">No diet plan assigned yet</h5>
                <p className="text-muted mb-0">
                  Your trainer will assign your diet plan soon.
                </p>
              </div>
            ) : (
              <div className="row g-3">
                {diet.map((plan) => (
                  <div className="col-12" key={plan._id}>
                    <div className="border rounded-4 p-3 p-md-4">
                      <h5 className="fw-bold mb-2">{plan.title}</h5>

                      {plan.description && (
                        <p className="text-muted mb-3">
                          {plan.description}
                        </p>
                      )}

                      <div className="row g-3 mb-3">
                        <div className="col-6 col-md-4">
                          <div className="bg-light rounded-3 p-3 h-100">
                            <div className="text-muted small">Daily Calories</div>
                            <h5 className="fw-bold mb-0">
                              {plan.calories ?? '—'}
                              {plan.calories != null ? ' kcal' : ''}
                            </h5>
                          </div>
                        </div>

                        <div className="col-6 col-md-4">
                          <div className="bg-light rounded-3 p-3 h-100">
                            <div className="text-muted small">Trainer</div>
                            <h6 className="fw-semibold mb-0">
                              {plan.trainer?.name || 'Not assigned'}
                            </h6>
                          </div>
                        </div>

                        <div className="col-12 col-md-4">
                          <div className="bg-light rounded-3 p-3 h-100">
                            <div className="text-muted small">Plan Status</div>
                            <h6 className="fw-semibold text-success mb-0">
                              Active
                            </h6>
                          </div>
                        </div>
                      </div>

                      <div className="bg-success bg-opacity-10 rounded-3 p-3">
                        <h6 className="fw-bold mb-2">🍳 Meals & Nutrition</h6>
                        <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
                          {plan.meals || 'Meal details have not been added yet.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Workout Plan Card */}
<div className="card shadow-sm border-0 rounded-4 mb-4">
  <div className="card-body p-4">
    <div className="d-flex align-items-center mb-3">
      <div
        className="rounded-3 p-3 me-3"
        style={{ backgroundColor: '#e8f0ff', color: '#0d6efd' }}
      >
        <Dumbbell size={24} />
      </div>
      <div>
        <h5 className="card-title fw-bold mb-1">My Workout Plan</h5>
        <p className="text-muted small mb-0">
          Your assigned exercises and training routine
        </p>
      </div>
    </div>

    {workoutsList.length === 0 ? (
      <p className="text-muted mb-0">
        No workout plan assigned yet.
      </p>
    ) : (
      <div className="row g-3">
        {workoutsList.map((workout) => (
          <div className="col-12" key={workout._id}>
            <div className="border rounded-3 p-3">
              <h6 className="fw-bold mb-2">{workout.title}</h6>

              {workout.description && (
                <p className="text-muted mb-2">
                  {workout.description}
                </p>
              )}

              <p className="mb-2">
                <strong>Trainer:</strong>{' '}
                {workout.trainer?.name || 'Not assigned'}
              </p>

              {workout.exercises && (
                <div>
                  <strong>Exercises:</strong>
                  <p className="mb-0 mt-1" style={{ whiteSpace: 'pre-line' }}>
                    {workout.exercises}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

      </div>
    )
  }

  const { counts, totalRevenue, expiringMemberships, monthlyRevenue } = stats
  const totals = {
    members: counts.members,
    trainers: counts.trainers,
    membershipPlans: counts.plans,
    workouts: counts.workouts,
    diets: counts.dietPlans,
    attendanceRecords: counts.attendance,
    revenue: totalRevenue,
  }

  return (
    <div>
      <h2 className="page-title">Admin Dashboard</h2>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fff3e0' }}><Users size={24} color="#ff6b35" /></div>
            <div className="stat-value">{totals.members}</div>
            <div className="stat-label">Total Members</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e8f5e9' }}><IndianRupee size={24} color="#28a745" /></div>
            <div className="stat-value">₹{totals.revenue.toLocaleString('en-IN')}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e3f2fd' }}><Dumbbell size={24} color="#17a2b8" /></div>
            <div className="stat-value">{totals.workouts}</div>
            <div className="stat-label">Workout Plans</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fce4ec' }}><Salad size={24} color="#dc3545" /></div>
            <div className="stat-value">{totals.diets}</div>
            <div className="stat-label">Diet Plans</div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><div className="stat-card"><div className="stat-value">{totals.trainers}</div><div className="stat-label">Trainers</div></div></div>
        <div className="col-6 col-lg-3"><div className="stat-card"><div className="stat-value">{totals.membershipPlans}</div><div className="stat-label">Membership Plans</div></div></div>
        <div className="col-6 col-lg-3"><div className="stat-card"><div className="stat-value">{totals.attendanceRecords}</div><div className="stat-label">Attendance Records</div></div></div>
        <div className="col-6 col-lg-3"><div className="stat-card"><div className="stat-value" style={{ color: '#dc3545' }}>{expiringMemberships.length}</div><div className="stat-label">Expiring Soon</div></div></div>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="chart-card">
            <h5>Monthly Revenue ({new Date().getFullYear()})</h5>
            {monthlyRevenue.some((d) => d.total > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                  <Bar dataKey="total" fill="#ff6b35" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><IndianRupee /><p>No payment data recorded yet this year.</p></div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="chart-card">
            <h5 className="d-flex align-items-center gap-2"><AlertTriangle size={20} color="#dc3545" /> Expiring Memberships</h5>
            {expiringMemberships.length > 0 ? (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: 300, overflowY: 'auto' }}>
                {expiringMemberships.map((m) => (
                  <div key={m._id} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold">{m.member?.name || 'Unknown'}</span>
                    <span className="text-danger small">{formatDate(m.endDate)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted mt-2">No memberships expiring in the next 30 days.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
