import { useState } from 'react'
import { useAuth } from '../AuthContext'
import api from '../api'
import { formatDate } from '../helpers'
import { User } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    address: user?.address || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = (field, value) => setForm({ ...form, [field]: value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await api.put('/auth/me', { ...form, dob: form.dob ? new Date(form.dob) : undefined })
      updateUser(res.data.user)
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Update failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="page-title">My Profile</h2>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="stat-card text-center">
            <div className="member-avatar mx-auto mb-3" style={{ width: 72, height: 72, fontSize: '1.8rem' }}>
              {(user?.name || '?').charAt(0).toUpperCase()}
            </div>
            <h4 className="fw-bold mb-1">{user?.name || 'User'}</h4>
            <p className="text-muted mb-2">{user?.email}</p>
            <span className="badge bg-dark text-uppercase">{user?.role || 'member'}</span>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="table-card p-4">
            <h5 className="fw-bold mb-3"><User size={20} className="me-2" />Edit Profile</h5>
            {message && <div className={`alert alert-${message.type} alert-gym`}>{message.text}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email (cannot change)</label>
                  <input className="form-control" value={user?.email || ''} disabled />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows="2" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-gym-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
            <hr />
            <small className="text-muted">Account created: {formatDate(user?.createdAt)}</small>
          </div>
        </div>
      </div>
    </div>
  )
}
