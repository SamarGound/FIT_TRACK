import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { Dumbbell, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Incorrect email or password'
          : err.response?.data?.message || 'Something went wrong. Is the server running?',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><Dumbbell size={32} /></div>
          <h2>FIT-TRACK</h2>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-danger alert-gym">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            <div className="input-group">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-gym-primary w-100 py-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  )
}
