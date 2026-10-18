import { useEffect, useState } from 'react'
import api from '../api'
import { formatDate } from '../helpers'
import { Salad, Plus, Pencil, Trash2, Search } from 'lucide-react'

const emptyForm = { title: '', memberId: '', trainerId: '', description: '', meals: '', calories: 0 }

export default function Diet() {
  const [plans, setPlans] = useState([])
  const [members, setMembers] = useState([])
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [plansRes, membersRes, trainersRes] = await Promise.all([
        api.get('/diet-plans'),
        api.get('/members'),
        api.get('/trainers'),
      ])
      setPlans(plansRes.data)
      setMembers(membersRes.data)
      setTrainers(trainersRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load diet plans')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (p) => {
    setEditId(p._id)
    setForm({
      title: p.title,
      memberId: p.member?._id || '',
      trainerId: p.trainer?._id || '',
      description: p.description || '',
      meals: p.meals || '',
      calories: p.calories || 0,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, calories: parseInt(form.calories) || 0 }
      if (!payload.trainerId) delete payload.trainerId
      if (editId) await api.put(`/diets/${editId}`, payload)
      else await api.post('/diets', payload)
      setShowModal(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this diet plan?')) return
    try {
      await api.delete(`/diets/${id}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const filtered = plans.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.member?.name?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="page-title mb-0">Diet Plans</h2>
        <button className="btn btn-gym-primary" onClick={openAdd}><Plus size={18} className="me-1" /> Assign Diet</button>
      </div>

      <div className="table-card">
        <div className="card-header-custom">
          <h5><Salad size={20} className="me-2" />Diet Plans ({filtered.length})</h5>
          <div className="input-group" style={{ maxWidth: 300 }}>
            <span className="input-group-text"><Search size={16} /></span>
            <input className="form-control" placeholder="Search title or member..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {error && <div className="alert alert-danger alert-gym m-3">{error}</div>}
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Salad /><p>No diet plans assigned yet.</p></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead><tr><th>Title</th><th>Member</th><th>Trainer</th><th>Calories</th><th>Created</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td className="fw-semibold">{p.title}</td>
                    <td>{p.member?.name || '-'}</td>
                    <td>{p.trainer?.name || '-'}</td>
                    <td>{p.calories} cal</td>
                    <td>{formatDate(p.createdAt)}</td>
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
          <div className="modal-dialog modal-lg"><div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editId ? 'Edit Diet Plan' : 'Assign Diet Plan'}</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label">Title</label><input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Weight Loss Plan" /></div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Member</label>
                    <select className="form-select" value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })} required>
                      <option value="">Select member...</option>
                      {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Trainer</label>
                    <select className="form-select" value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}>
                      <option value="">None</option>
                      {trainers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3"><label className="form-label">Calories (per day)</label><input type="number" className="form-control" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} min="0" /></div>
                <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label">Meals</label><textarea className="form-control" rows="4" value={form.meals} onChange={(e) => setForm({ ...form, meals: e.target.value })} placeholder="e.g. Breakfast: Oats & eggs, Lunch: Chicken & rice, Dinner: Salad & fish" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gym-primary">{editId ? 'Update' : 'Assign'} Plan</button>
              </div>
            </form>
          </div></div>
        </div>
      )}
    </div>
  )
}
