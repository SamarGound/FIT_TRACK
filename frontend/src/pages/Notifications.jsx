import { useEffect, useState } from 'react'
import api from '../api'
import { formatDate } from '../helpers'
import { Bell, Check, AlertTriangle, Info, ShieldAlert } from 'lucide-react'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [notifRes, alertRes] = await Promise.all([
        api.get('/notifications/mine'),
        api.get('/notifications/expiry-alerts'),
      ])
      setNotifications(notifRes.data)
      setAlerts(alertRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark all as read')
    }
  }

  const typeIcon = (type) => {
    if (type === 'warning') return <AlertTriangle size={20} color="#ffc107" />
    if (type === 'alert') return <ShieldAlert size={20} color="#dc3545" />
    return <Info size={20} color="#17a2b8" />
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="page-title mb-0">Notifications</h2>
        {notifications.some((n) => !n.isRead) && (
          <button className="btn btn-outline-primary btn-sm" onClick={markAllAsRead}>
            <Check size={16} className="me-1" /> Mark all as read
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger alert-gym">{error}</div>}

      {alerts.length > 0 && (
        <div className="alert alert-warning alert-gym d-flex align-items-start gap-2">
          <AlertTriangle size={20} className="flex-shrink-0 mt-1" />
          <div>
            <strong>Membership Expiry Alert!</strong>
            {alerts.map((a) => (
              <div key={a._id} className="small">
                Your <strong>{a.membership?.name || 'membership'}</strong> plan expires on{' '}
                <strong>{formatDate(a.endDate)}</strong>
                {new Date(a.endDate) < new Date() ? ' — already expired. Please renew!' : ' — renew soon to keep access.'}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Bell />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {notifications.map((n) => (
            <div key={n._id} className={`table-card p-3 notification-item type-${n.type} ${!n.isRead ? 'unread' : ''}`}>
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex gap-3 align-items-start">
                  <div className="mt-1">{typeIcon(n.type)}</div>
                  <div>
                    <p className="mb-1">{n.message}</p>
                    <small className="text-muted">{formatDate(n.createdAt)}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {!n.isRead && (
                    <>
                      <span className="badge" style={{ background: '#ff6b35' }}>New</span>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => markAsRead(n._id)}>
                        <Check size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
