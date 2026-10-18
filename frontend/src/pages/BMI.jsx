import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import api from '../api'
import { calcBMI, getBmiCategory, formatDate } from '../helpers'
import { Calculator, Plus, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function BMI() {
  const { user, isAdmin } = useAuth()
  const [records, setRecords] = useState([])
  const [members, setMembers] = useState([])
  const [memberId, setMemberId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ recordDate: new Date().toISOString().split('T')[0], height: '', weight: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAdmin) {
      api.get('/members').then((res) => setMembers(res.data)).catch(() => {})
      setLoading(false)
    } else if (user) {
      fetchRecords('mine')
    }
  }, [isAdmin, user])

  const fetchRecords = async (which) => {
    setLoading(true)
    try {
      const res = which === 'mine' ? await api.get('/bmi/mine') : await api.get(`/bmi/member/${which}`)
      setRecords(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load BMI records')
    } finally {
      setLoading(false)
    }
  }

  const handleMemberChange = (id) => {
    setMemberId(id)
    if (id) fetchRecords(id)
    else setRecords([])
  }

  const previewBMI = form.height && form.weight ? calcBMI(form.height, form.weight) : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const bmi = calcBMI(form.height, form.weight)
    if (!bmi || bmi <= 0) {
      setError('Please enter valid height and weight')
      return
    }
    try {
      const payload = { recordDate: new Date(form.recordDate), height: parseFloat(form.height), weight: parseFloat(form.weight), bmi }
      if (isAdmin) payload.memberId = memberId
      await api.post('/bmi', payload)
      setShowForm(false)
      setForm({ recordDate: new Date().toISOString().split('T')[0], height: '', weight: '' })
      fetchRecords(isAdmin ? memberId : 'mine')
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this BMI record?')) return
    try {
      await api.delete(`/bmi/${id}`)
      fetchRecords(isAdmin ? memberId : 'mine')
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const latest = records[records.length - 1]
  const cat = latest ? getBmiCategory(latest.bmi) : null
  const chartData = records.map((r) => ({
    month: new Date(r.recordDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    bmi: r.bmi,
  }))

  if (isAdmin && !memberId) {
    return (
      <div>
        <h2 className="page-title">BMI Calculator</h2>
        <div className="table-card p-3">
          <label className="form-label">Select a member to view their BMI records</label>
          <select className="form-select" value={memberId} onChange={(e) => handleMemberChange(e.target.value)}>
            <option value="">Choose member...</option>
            {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="page-title mb-0">BMI Calculator</h2>
        <button className="btn btn-gym-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} className="me-1" /> {showForm ? 'Hide Form' : 'Record Monthly BMI'}
        </button>
      </div>

      {isAdmin && (
        <div className="mb-3" style={{ maxWidth: 300 }}>
          <select className="form-select" value={memberId} onChange={(e) => handleMemberChange(e.target.value)}>
            <option value="">Choose member...</option>
            {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>
      )}

      {error && <div className="alert alert-danger alert-gym">{error}</div>}

      {showForm && (
        <div className="table-card p-3 mb-3">
          <h5 className="fw-bold mb-3">New BMI Record</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={form.recordDate} onChange={(e) => setForm({ ...form, recordDate: e.target.value })} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Height (cm)</label>
                <input type="number" step="0.1" className="form-control" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="e.g. 170" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Weight (kg)</label>
                <input type="number" step="0.1" className="form-control" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 65" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Calculated BMI</label>
                <input type="text" className="form-control" value={previewBMI || ''} readOnly placeholder="—" />
              </div>
            </div>
            <button type="submit" className="btn btn-gym-primary mt-3">Save Record</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <>
          {latest && cat ? (
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <div className="bmi-display">
                  <div className="bmi-number" style={{ color: cat.color }}>{latest.bmi}</div>
                  <div className="bmi-category fw-bold" style={{ color: cat.color }}>{cat.label}</div>
                  <div className="text-muted small mt-1">As of {formatDate(latest.recordDate)}</div>
                </div>
              </div>
              <div className="col-md-8">
                <div className="chart-card" style={{ height: '100%' }}>
                  <h5>BMI Trend</h5>
                  {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="bmi" stroke="#ff6b35" strokeWidth={3} dot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted mt-3">Add at least two records to see the BMI trend.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state mb-3">
              <Calculator />
              <p>No BMI records yet. Record height and weight to get started.</p>
            </div>
          )}

          {records.length > 0 && (
            <div className="table-card">
              <div className="card-header-custom"><h5><Calculator size={20} className="me-2" />BMI History ({records.length})</h5></div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead><tr><th>Date</th><th>Height (cm)</th><th>Weight (kg)</th><th>BMI</th><th>Category</th>{isAdmin ? null : <th className="text-end">Action</th>}</tr></thead>
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
                          {!isAdmin && (
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r._id)}><Trash2 size={16} /></button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
