import { useEffect, useState } from 'react'
import api from '../api'
import { formatDate } from '../helpers'
import { CalendarCheck, Plus, Trash2, Search } from 'lucide-react'

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ memberId: '', date: new Date().toISOString().split('T')[0], status: 'present' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [attRes, memRes] = await Promise.all([api.get('/attendance'), api.get('/members')])
      setRecords(attRes.data)
      setMembers(memRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
     await api.post('/attendance', { member: form.memberId, date: new Date(form.date), status: form.status })
      setShowModal(false)
      setForm({ memberId: '', date: new Date().toISOString().split('T')[0], status: 'present' })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this attendance record?')) return
    try {
      await api.delete(`/attendance/${id}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const filtered = records.filter((r) =>
    r.member?.name?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="page-title mb-0">Attendance</h2>
        <button className="btn btn-gym-primary" onClick={() => setShowModal(true)}><Plus size={18} className="me-1" /> Mark Attendance</button>
      </div>

      <div className="table-card">
        <div className="card-header-custom">
          <h5><CalendarCheck size={20} className="me-2" />Attendance Records ({filtered.length})</h5>
          <div className="input-group" style={{ maxWidth: 300 }}>
            <span className="input-group-text"><Search size={16} /></span>
            <input className="form-control" placeholder="Search member..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {error && <div className="alert alert-danger alert-gym m-3">{error}</div>}
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><CalendarCheck /><p>No attendance records yet.</p></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead><tr><th>Member</th><th>Date</th><th>Status</th><th className="text-end">Action</th></tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id}>
                    <td className="fw-semibold">{r.member?.name || 'Unknown'}</td>
                    <td>{formatDate(r.date)}</td>
                    <td><span className={`badge badge-status-${r.status}`}>{r.status}</span></td>
                    <td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r._id)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Mark Attendance</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Member</label>
                  <select className="form-select" value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })} required>
                    <option value="">Select member...</option>
                    {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="mb-3"><label className="form-label">Date</label><input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gym-primary">Save</button>
              </div>
            </form>
          </div></div>
        </div>
      )}
    </div>
  )
}
