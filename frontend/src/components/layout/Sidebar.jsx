import { useEffect, useState } from 'react'
import {
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Map,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { calculateProfileCompletion, initials } from '../../utils/profile'
import { cx } from '../../utils/cx'
import Logo from '../ui/Logo'
import ProgressBar from '../ui/ProgressBar'

const studentGroups = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/profile', label: 'My profile', icon: UserRound },
    ],
  },
  {
    label: 'Career tools',
    items: [
      { to: '/recommendations', label: 'Recommendations', icon: Sparkles, soon: true },
      { to: '/skill-gap', label: 'Skill gap analysis', icon: Target, soon: true },
      { to: '/roadmap', label: 'Learning roadmap', icon: Map, soon: true },
    ],
  },
  {
    label: 'Assessment',
    items: [
      { to: '/resume-analyzer', label: 'Resume analyzer', icon: FileSearch, soon: true },
      { to: '/skill-assessment', label: 'Skill assessment', icon: ClipboardCheck, soon: true },
    ],
  },
]

const adminGroups = [
  {
    label: 'Administration',
    items: [{ to: '/admin', label: 'Overview', icon: LayoutDashboard }],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Students', icon: Users, soon: true },
      { label: 'Career catalogue', icon: BriefcaseBusiness, soon: true },
      { label: 'Learning resources', icon: BookOpen, soon: true },
      { label: 'Access control', icon: ShieldCheck, soon: true },
    ],
  },
]

export default function Sidebar({ open, onClose, role = 'student' }) {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const groups = role === 'admin' ? adminGroups : studentGroups
  const completion = calculateProfileCompletion(profile)

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    setLoggingOut(false)
    navigate('/login', { replace: true })
  }

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation overlay"
        className={cx(
          'fixed inset-0 z-40 bg-navy-950/55 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-navy-950 text-white transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Dashboard navigation"
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Logo theme="dark" to={role === 'admin' ? '/admin' : '/dashboard'} />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-navy-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <span className="rounded-lg bg-brand-500/15 p-1.5 text-brand-300">
              {role === 'admin' ? (
                <ShieldCheck className="size-4" aria-hidden="true" />
              ) : (
                <GraduationCap className="size-4" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-400">
                {role === 'admin' ? 'Admin workspace' : 'Student workspace'}
              </p>
              <p className="truncate text-xs text-navy-200">
                {role === 'admin' ? 'Platform overview' : 'Your career journey'}
              </p>
            </div>
          </div>

          <nav className="space-y-6" aria-label="Sidebar navigation">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-500">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    if (!item.to) {
                      return (
                        <li key={item.label}>
                          <span
                            className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-navy-500"
                            aria-disabled="true"
                          >
                            <Icon className="size-[18px]" aria-hidden="true" />
                            <span>{item.label}</span>
                            <span className="ml-auto rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-navy-400">
                              Soon
                            </span>
                          </span>
                        </li>
                      )
                    }

                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          onClick={onClose}
                          className={({ isActive }) =>
                            cx(
                              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                              isActive
                                ? 'bg-white/10 text-white shadow-inner shadow-white/5'
                                : 'text-navy-200 hover:bg-white/5 hover:text-white',
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon
                                className={cx(
                                  'size-[18px] transition',
                                  isActive ? 'text-brand-300' : 'text-navy-400 group-hover:text-navy-200',
                                )}
                                aria-hidden="true"
                              />
                              <span className="truncate">{item.label}</span>
                              {item.soon ? (
                                <span className="ml-auto rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-navy-400">
                                  Soon
                                </span>
                              ) : (
                                <ChevronRight
                                  className={cx(
                                    'ml-auto size-3.5 transition',
                                    isActive ? 'text-brand-300' : 'text-transparent group-hover:text-navy-400',
                                  )}
                                  aria-hidden="true"
                                />
                              )}
                            </>
                          )}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {role === 'student' ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-white">Profile strength</p>
                <span className="text-sm font-bold text-brand-300">{completion}%</span>
              </div>
              <ProgressBar
                value={completion}
                size="sm"
                className="mt-3"
                color="brand"
                aria-label="Profile completion"
              />
              <p className="mt-2.5 text-[11px] leading-5 text-navy-300">
                Complete your profile to get better career insights.
              </p>
              <Link
                to="/profile"
                onClick={onClose}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-300 transition hover:text-white"
              >
                Improve profile
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-bold text-white">
              {initials(user?.full_name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.full_name || 'CareerCompass user'}
              </p>
              <p className="truncate text-[11px] capitalize text-navy-400">
                {user?.role || 'student'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg p-2 text-navy-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className={cx('size-4', loggingOut && 'animate-pulse')} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
