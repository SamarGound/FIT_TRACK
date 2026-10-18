import { useEffect, useState } from 'react'
import api from '../api'
import { UserCog, Plus, Pencil, Trash2 } from 'lucide-react'

const emptyForm = { name: '', specialization: '', phone: '', email: '', experience: 0 }

export default function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchTrainers() }, [])

  const fetchTrainers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/trainers')
      setTrainers(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trainers')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (t) => { setEditId(t._id); setForm({ ...t }); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) await api.put(`/trainers/${editId}`, form)
      else await api.post('/trainers', form)
      setShowModal(false)
      fetchTrainers()
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this trainer?')) return
    try {
      await api.delete(`/trainers/${id}`)
      fetchTrainers()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="page-title mb-0">Trainers</h2>
        <button className="btn btn-gym-primary" onClick={openAdd}><Plus size={18} className="me-1" /> Add Trainer</button>
      </div>

      <div className="table-card">
        <div className="card-header-custom"><h5><UserCog size={20} className="me-2" />All Trainers ({trainers.length})</h5></div>
        {error && <div className="alert alert-danger alert-gym m-3">{error}</div>}
        {loading ? (
          <div className="loading-spinner">Loading trainers...</div>
        ) : trainers.length === 0 ? (
          <div className="empty-state"><UserCog /><p>No trainers added yet.</p></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr><th>Name</th><th>Specialization</th><th>Phone</th><th>Email</th><th>Experience</th><th className="text-end">Actions</th></tr>
              </thead>
              <tbody>
                {trainers.map((t) => (
                  <tr key={t._id}>
                    <td className="fw-semibold">{t.name}</td>
                    <td>{t.specialization || '-'}</td>
                    <td>{t.phone || '-'}</td>
                    <td>{t.email || '-'}</td>
                    <td>{t.experience} yrs</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(t)}><Pencil size={16} /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t._id)}><Trash2 size={16} /></button>
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
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? 'Edit Trainer' : 'Add Trainer'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                  <div className="mb-3"><label className="form-label">Specialization</label><input className="form-control" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Strength Training" /></div>
                  <div className="mb-3"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="mb-3"><label className="form-label">Experience (years)</label><input type="number" className="form-control" value={form.experience} onChange={(e) => setForm({ ...form, experience: parseInt(e.target.value) || 0 })} min="0" /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-gym-primary">{editId ? 'Update' : 'Add'} Trainer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
