import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import api from '../api'
import { formatDate, getBmiCategory } from '../helpers'
import { TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Progress() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const res = await api.get('/bmi/mine')
      setRecords(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading-spinner">Loading progress...</div>

  if (records.length === 0) {
    return (
      <div>
        <h2 className="page-title">Monthly Progress</h2>
        {error && <div className="alert alert-danger alert-gym">{error}</div>}
        <div className="empty-state">
          <TrendingUp />
          <p>No progress data yet. Record your monthly height and weight on the BMI Calculator page.</p>
        </div>
      </div>
    )
  }

  const chartData = records.map((r) => ({
    month: new Date(r.recordDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    bmi: r.bmi,
    weight: Number(r.weight),
  }))

  const first = records[0]
  const latest = records[records.length - 1]
  const hasChange = records.length > 1
  const bmiChange = hasChange ? (latest.bmi - first.bmi).toFixed(2) : null
  const weightChange = hasChange ? (Number(latest.weight) - Number(first.weight)).toFixed(1) : null
  const cat = getBmiCategory(latest.bmi)

  return (
    <div>
      <h2 className="page-title">Monthly Progress — {user?.name}</h2>

      <div className="row g-3 mb-3">
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-value" style={{ color: cat.color }}>{latest.bmi}</div>
            <div className="stat-label">Current BMI <span className="fw-bold" style={{ color: cat.color }}>({cat.label})</span></div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-value">{bmiChange !== null ? (bmiChange > 0 ? '+' : '') + bmiChange : '—'}</div>
            <div className="stat-label">BMI Change (all time)</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-value">{latest.weight} kg</div>
            <div className="stat-label">Current Weight</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-value">{weightChange !== null ? (weightChange > 0 ? '+' : '') + weightChange + ' kg' : '—'}</div>
            <div className="stat-label">Weight Change (all time)</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="chart-card">
            <h5>BMI Over Time</h5>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bmi" name="BMI" stroke="#ff6b35" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="chart-card">
            <h5>Weight Over Time (kg)</h5>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" name="Weight" stroke="#28a745" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="table-card mt-3">
        <div className="card-header-custom"><h5>All Records</h5></div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead><tr><th>Date</th><th>Height (cm)</th><th>Weight (kg)</th><th>BMI</th><th>Category</th></tr></thead>
            <tbody>
              {records.map((r) => {
                const c = getBmiCategory(r.bmi)
                return (
                  <tr key={r._id}>
                    <td>{formatDate(r.recordDate)}</td>
                    <td>{r.height}</td>
                    <td>{r.weight}</td>
                    <td className="fw-bold">{r.bmi}</td>
                    <td><span style={{ color: c.color }} className="fw-semibold">{c.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
