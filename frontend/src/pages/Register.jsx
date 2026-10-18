import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { Dumbbell } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    if (password !== confirmPass) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><Dumbbell size={32} /></div>
          <h2>Create Account</h2>
          <p>Join Power Gym as a member</p>
        </div>

        {error && <div className="alert alert-danger alert-gym">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
              placeholder="Re-enter password"
            />
          </div>

          <button type="submit" className="btn btn-gym-primary w-100 py-2" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="auth-toggle-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>

        <div className="alert alert-light alert-gym mt-3 mb-0" style={{ fontSize: '0.82rem' }}>
          New registrations are created as <strong>members</strong>. Admin access is assigned via the admin script.
        </div>
      </div>
    </div>
  )
}
