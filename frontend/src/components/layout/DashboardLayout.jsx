import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { initials } from '../../utils/profile'
import { cx } from '../../utils/cx'
import Footer from './Footer'
import Sidebar from './Sidebar'

const pageTitles = {
  '/dashboard': 'Student dashboard',
  '/profile': 'My profile',
  '/resume-analyzer': 'Resume analyzer',
  '/skill-assessment': 'Skill assessment',
  '/recommendations': 'Career recommendations',
  '/skill-gap': 'Skill gap analysis',
  '/roadmap': 'Learning roadmap',
  '/admin': 'Admin dashboard',
}

function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const home = user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-xl border border-transparent p-1 pr-2 transition hover:border-slate-200 hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-bold text-white">
          {initials(user?.full_name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-36 truncate text-sm font-semibold text-navy-900">
            {user?.full_name}
          </span>
          <span className="block text-[11px] capitalize text-slate-400">
            {user?.role}
          </span>
        </span>
        <ChevronDown
          className={cx('size-4 text-slate-400 transition', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lifted"
        >
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-navy-900">{user?.full_name}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <Link
            to={home}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-navy-900"
          >
            <UserRound className="size-4" aria-hidden="true" />
            {user?.role === 'admin' ? 'Admin overview' : 'My dashboard'}
          </Link>
          {user?.role === 'student' ? (
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-navy-900"
            >
              <UserRound className="size-4" aria-hidden="true" />
              Edit profile
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function DashboardLayout({ role = 'student' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const title = pageTitles[pathname] || 'Workspace'

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-navy-800 transition hover:bg-slate-100 lg:hidden"
                aria-label="Open navigation"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">
                  {role === 'admin' ? 'Administration' : 'Student workspace'}
                </p>
                <p className="text-sm font-semibold text-navy-900">{title}</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        <Footer variant="dashboard" />
      </div>
    </div>
  )
}
