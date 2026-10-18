import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { getInitials } from '../helpers'
import {
  Dumbbell, LayoutDashboard, Users, UserCog, Trophy, CalendarCheck,
  Dumbbell as DumbbellIcon, Salad, CreditCard, Calculator, TrendingUp,
  Bell, User, LogOut, Menu, X,
} from 'lucide-react'

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/trainers', label: 'Trainers', icon: UserCog },
  { to: '/memberships', label: 'Membership Plans', icon: Trophy },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/workout', label: 'Workout Plans', icon: DumbbellIcon },
  { to: '/diet', label: 'Diet Plans', icon: Salad },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/profile', label: 'Profile', icon: User },
]

const memberLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bmi', label: 'BMI Calculator', icon: Calculator },
  { to: '/progress', label: 'Monthly Progress', icon: TrendingUp },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Layout() {
  const { user, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  const links = isAdmin ? adminLinks : memberLinks
  const initials = getInitials(user?.name || user?.email)

  return (
    <div className="app-layout">
      <div className={`overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Dumbbell size={28} />
          <div>
            FIT-TRACK
            <div className="subtitle">Gym Management </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}

          <div className="sidebar-section">Account</div>
          <a href="#" className="sidebar-link" onClick={(e) => { e.preventDefault(); handleSignOut() }}>
            <LogOut size={20} />
            Sign Out
          </a>
        </nav>

        <div className="sidebar-footer">
          <span>{user?.name || 'User'}</span>
          <span className="role-badge">{isAdmin ? 'Admin' : 'Member'}</span>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1>FIT-TRACK Gym Management</h1>
          <div className="topbar-avatar">{initials}</div>
        </header>

        <main className="content-area"><Outlet /></main>
      </div>
    </div>
  )
}
