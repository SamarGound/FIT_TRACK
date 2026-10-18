import { useEffect, useState } from 'react'
import api from '../api'
import { formatDate } from '../helpers'
import { CreditCard, Plus, Pencil, Trash2, Search } from 'lucide-react'

const emptyForm = { memberId: '', membershipId: '', amount: 0, status: 'paid', paymentDate: new Date().toISOString().split('T')[0] }

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [members, setMembers] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [payRes, memRes, planRes] = await Promise.all([
        api.get('/payments'),
        api.get('/members'),
        api.get('/memberships'),
      ])
      setPayments(payRes.data)
      setMembers(memRes.data)
      setPlans(planRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (p) => {
    setEditId(p._id)
    setForm({
      memberId: p.member?._id || '',
      membershipId: p.membership?._id || '',
      amount: p.amount,
      status: p.status,
      paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, amount: parseFloat(form.amount) || 0, paymentDate: new Date(form.paymentDate) }
      if (!payload.membershipId) delete payload.membershipId
      if (editId) await api.put(`/payments/${editId}`, payload)
      else await api.post('/payments', payload)
      setShowModal(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this payment record?')) return
    try {
      await api.delete(`/payments/${id}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const filtered = payments.filter((p) => {
    const matchSearch = p.member?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)
  const pendingAmount = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="page-title mb-0">Payments</h2>
        <button className="btn btn-gym-primary" onClick={openAdd}><Plus size={18} className="me-1" /> Record Payment</button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6"><div className="stat-card"><div className="stat-value" style={{ color: '#28a745' }}>₹{totalRevenue.toLocaleString('en-IN')}</div><div className="stat-label">Total Revenue (Paid)</div></div></div>
        <div className="col-6"><div className="stat-card"><div className="stat-value" style={{ color: '#ffc107' }}>₹{pendingAmount.toLocaleString('en-IN')}</div><div className="stat-label">Pending Amount</div></div></div>
      </div>

      <div className="table-card">
        <div className="card-header-custom">
          <h5><CreditCard size={20} className="me-2" />Payment Records ({filtered.length})</h5>
          <div className="d-flex gap-2">
            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <div className="input-group input-group-sm" style={{ maxWidth: 250 }}>
              <span className="input-group-text"><Search size={16} /></span>
              <input className="form-control" placeholder="Search member..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger alert-gym m-3">{error}</div>}
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><CreditCard /><p>No payment records found.</p></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead><tr><th>Member</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td className="fw-semibold">{p.member?.name || '-'}</td>
                    <td>{p.membership?.name || '-'}</td>
                    <td>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge-status-${p.status}`}>{p.status}</span></td>
                    <td>{formatDate(p.paymentDate)}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(p)}><Pencil size={16} /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p._id)}><Trash2 size={16} /></button>
                    </td>
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
              <h5 className="modal-title">{editId ? 'Edit Payment' : 'Record Payment'}</h5>
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
                <div className="mb-3">
                  <label className="form-label">Membership Plan (optional)</label>
                  <select className="form-select" value={form.membershipId} onChange={(e) => setForm({ ...form, membershipId: e.target.value })}>
                    <option value="">None</option>
                    {plans.map((p) => <option key={p._id} value={p._id}>{p.name} — ₹{p.price}</option>)}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3"><label className="form-label">Amount (₹)</label><input type="number" step="0.01" className="form-control" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} min="0" required /></div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3"><label className="form-label">Payment Date</label><input type="date" className="form-control" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} required /></div>
                <div className="alert alert-light alert-gym mb-0"><small>We do not store card details. Only payment amount and status are recorded.</small></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gym-primary">{editId ? 'Update' : 'Record'} Payment</button>
              </div>
            </form>
          </div></div>
        </div>
      )}
    </div>
  )
}
