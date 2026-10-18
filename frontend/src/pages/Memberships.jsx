import { useEffect, useState } from 'react'
import api from '../api'
import { formatDate } from '../helpers'
import { Trophy, Plus, Pencil, Trash2, UserPlus } from 'lucide-react'

const emptyPlan = { name: '', durationMonths: 1, price: 0, description: '' }

export default function Memberships() {
  const [tab, setTab] = useState('plans')
  const [plans, setPlans] = useState([])
  const [assigned, setAssigned] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyPlan)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignForm, setAssignForm] = useState({ memberId: '', membershipId: '', startDate: '' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [plansRes, assignedRes, membersRes] = await Promise.all([
        api.get('/memberships'),
        api.get('/memberships/assigned'),
        api.get('/members'),
      ])
      setPlans(plansRes.data)
      setAssigned(assignedRes.data)
      setMembers(membersRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load memberships')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setEditId(null); setForm(emptyPlan); setShowPlanModal(true) }
  const openEdit = (p) => { setEditId(p._id); setForm({ ...p }); setShowPlanModal(true) }

  const handlePlanSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) await api.put(`/memberships/${editId}`, form)
      else await api.post('/memberships', form)
      setShowPlanModal(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    }
  }

  const handleDeletePlan = async (id) => {
    if (!confirm('Delete this membership plan?')) return
    try {
      await api.delete(`/memberships/${id}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const openAssign = () => {
    setAssignForm({ memberId: '', membershipId: '', startDate: new Date().toISOString().split('T')[0] })
    setShowAssignModal(true)
  }

  const selectedPlan = plans.find((p) => p._id === assignForm.membershipId)
  const computedEndDate = () => {
    if (!selectedPlan || !assignForm.startDate) return ''
    const d = new Date(assignForm.startDate)
    d.setMonth(d.getMonth() + selectedPlan.durationMonths)
    return d.toISOString().split('T')[0]
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    try {
      await api.post('/memberships/assign', { ...assignForm, endDate: computedEndDate() })
      setShowAssignModal(false)
      setTab('assigned')
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Assign failed')
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this membership?')) return
    try {
      await api.put(`/memberships/member-memberships/${id}/cancel`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="page-title mb-0">Membership Plans</h2>
        {tab === 'plans'
          ? <button className="btn btn-gym-primary" onClick={openAdd}><Plus size={18} className="me-1" /> Add Plan</button>
          : <button className="btn btn-gym-primary" onClick={openAssign}><UserPlus size={18} className="me-1" /> Assign Membership</button>}
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === 'plans' ? 'active' : ''}`} onClick={() => setTab('plans')}>Plans</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'assigned' ? 'active' : ''}`} onClick={() => setTab('assigned')}>Assigned Memberships</button></li>
      </ul>

      {error && <div className="alert alert-danger alert-gym">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : tab === 'plans' ? (
        <div className="row g-3">
          {plans.length === 0 && <div className="empty-state w-100"><Trophy /><p>No membership plans yet.</p></div>}
          {plans.map((p) => (
            <div className="col-md-6 col-lg-4" key={p._id}>
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Trophy size={32} color="#ff6b35" />
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePlan(p._id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <h4 className="fw-bold mb-1">{p.name}</h4>
                <div className="stat-value mb-2">₹{Number(p.price).toLocaleString('en-IN')}</div>
                <p className="text-muted mb-1">{p.durationMonths} month{p.durationMonths > 1 ? 's' : ''}</p>
                <p className="text-muted small mb-0">{p.description || 'No description'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-card">
          <div className="card-header-custom"><h5>Assigned Memberships ({assigned.length})</h5></div>
          {assigned.length === 0 ? (
            <div className="empty-state"><Trophy /><p>No memberships assigned yet.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead><tr><th>Member</th><th>Plan</th><th>Start</th><th>End</th><th>Status</th><th className="text-end">Action</th></tr></thead>
                <tbody>
                  {assigned.map((mm) => (
                    <tr key={mm._id}>
                      <td className="fw-semibold">{mm.member?.name || 'Unknown'}</td>
                      <td>{mm.membership?.name || '-'}</td>
                      <td>{formatDate(mm.startDate)}</td>
                      <td>{formatDate(mm.endDate)}</td>
                      <td><span className={`badge badge-status-${mm.status}`}>{mm.status}</span></td>
                      <td className="text-end">
                        {mm.status === 'active' && (
                          <button className="btn btn-sm btn-outline-warning" onClick={() => handleCancel(mm._id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showPlanModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editId ? 'Edit Plan' : 'Add Plan'}</h5>
              <button type="button" className="btn-close" onClick={() => setShowPlanModal(false)}></button>
            </div>
            <form onSubmit={handlePlanSubmit}>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label">Plan Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="mb-3"><label className="form-label">Duration (months)</label><input type="number" className="form-control" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: parseInt(e.target.value) || 1 })} min="1" required /></div>
                <div className="mb-3"><label className="form-label">Price (₹)</label><input type="number" step="0.01" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} min="0" required /></div>
                <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPlanModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gym-primary">{editId ? 'Update' : 'Add'} Plan</button>
              </div>
            </form>
          </div></div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Assign Membership</h5>
              <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Member</label>
                  <select className="form-select" value={assignForm.memberId} onChange={(e) => setAssignForm({ ...assignForm, memberId: e.target.value })} required>
                    <option value="">Select member...</option>
                    {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Membership Plan</label>
                  <select className="form-select" value={assignForm.membershipId} onChange={(e) => setAssignForm({ ...assignForm, membershipId: e.target.value })} required>
                    <option value="">Select plan...</option>
                    {plans.map((p) => <option key={p._id} value={p._id}>{p.name} — ₹{p.price} ({p.durationMonths} mo)</option>)}
                  </select>
                </div>
                <div className="mb-3"><label className="form-label">Start Date</label><input type="date" className="form-control" value={assignForm.startDate} onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })} required /></div>
                <div className="mb-3"><label className="form-label">End Date</label><input type="date" className="form-control" value={computedEndDate()} readOnly /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gym-primary">Assign &amp; Record Payment</button>
              </div>
            </form>
          </div></div>
        </div>
      )}
    </div>
  )
}
