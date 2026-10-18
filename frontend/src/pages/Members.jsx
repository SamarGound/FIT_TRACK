import { useEffect, useState } from 'react'
import api from '../api'
import { formatDate, getInitials } from '../helpers'
import { Search, Users, Trash2, Eye } from 'lucide-react'

export default function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)

  useEffect(() => { fetchMembers() }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/members')
      setMembers(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const viewDetails = async (id) => {
    try {
      const res = await api.get(`/members/${id}`)
      setDetail(res.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load member details')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this member and all their data?')) return
    try {
      await api.delete(`/members/${id}`)
      fetchMembers()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const filtered = members.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    (m.phone || '').includes(search),
  )

  return (
    <div>
      <h2 className="page-title">Members</h2>

      <div className="table-card">
        <div className="card-header-custom">
          <h5><Users size={20} className="me-2" />All Members ({filtered.length})</h5>
          <div className="input-group" style={{ maxWidth: 300 }}>
            <span className="input-group-text"><Search size={16} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="alert alert-danger alert-gym m-3">{error}</div>}
        {loading ? (
          <div className="loading-spinner">Loading members...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Users /><p>No members found.</p></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Date of Birth</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="member-avatar" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                          {getInitials(m.name)}
                        </div>
                        {m.name}
                      </div>
                    </td>
                    <td>{m.phone || '-'}</td>
                    <td>{formatDate(m.dob)}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => viewDetails(m._id)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(m._id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Member Details — {detail.member?.name || detail.name}</h5>
                <button className="btn-close" onClick={() => setDetail(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-6"><strong>Phone:</strong> {detail.member?.phone || detail.phone || '-'}</div>
                  <div className="col-md-6"><strong>Date of Birth:</strong> {formatDate(detail.member?.dob || detail.dob)}</div>
                  <div className="col-md-6"><strong>Address:</strong> {detail.member?.address || detail.address || '-'}</div>
                  <div className="col-md-6"><strong>Email:</strong> {detail.member?.user?.email || '-'}</div>
                </div>

                <h6 className="fw-bold mt-4">Membership History</h6>
                {detail.memberships?.length > 0 ? (
                  <table className="table table-sm">
                    <thead><tr><th>Plan</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
                    <tbody>
                      {detail.memberships.map((mm) => (
                        <tr key={mm._id}>
                          <td>{mm.membership?.name || '-'}</td>
                          <td>{formatDate(mm.startDate)}</td>
                          <td>{formatDate(mm.endDate)}</td>
                          <td><span className={`badge badge-status-${mm.status}`}>{mm.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-muted">No memberships assigned.</p>}

                <h6 className="fw-bold mt-4">BMI Records</h6>
                {detail.bmi?.length > 0 ? (
                  <table className="table table-sm">
                    <thead><tr><th>Date</th><th>Height (cm)</th><th>Weight (kg)</th><th>BMI</th></tr></thead>
                    <tbody>
                      {detail.bmi.map((b) => (
                        <tr key={b._id}>
                          <td>{formatDate(b.recordDate)}</td>
                          <td>{b.height}</td>
                          <td>{b.weight}</td>
                          <td>{b.bmi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-muted">No BMI records.</p>}

                <h6 className="fw-bold mt-4">Payment History</h6>
                {detail.payments?.length > 0 ? (
                  <table className="table table-sm">
                    <thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      {detail.payments.map((p) => (
                        <tr key={p._id}>
                          <td>{formatDate(p.paymentDate)}</td>
                          <td>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                          <td><span className={`badge badge-status-${p.status}`}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-muted">No payments recorded.</p>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDetail(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
