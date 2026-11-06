import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { useAuth } from '../../context/useAuth'
import { Logo } from './Logo'

const links = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Browse food' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/my-donations', label: 'My donations' },
]

export function Navbar() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  async function handleSignOut() {
    setAuthError(null)
    try {
      await signOut()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign out.')
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-forest-deep/90 text-cream backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo inverted />
        <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'tracking-wide transition hover:text-harvest',
                  isActive && 'text-harvest',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="text-right">
                <p className="text-sm font-semibold text-cream">
                  {user.user_metadata.full_name || user.email}
                </p>
                <p className="text-xs capitalize text-cream/65">
                  {user.user_metadata.role || 'Account'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-cream/25 px-4 py-2 text-sm font-semibold text-cream transition hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/auth"
                className="rounded-full px-3 py-2 text-sm font-semibold text-cream transition hover:text-harvest"
              >
                Sign in
              </NavLink>
              <NavLink
                to="/donate"
                className="inline-flex rounded-full bg-harvest px-4 py-2 text-sm font-semibold text-forest-deep transition hover:bg-cream"
              >
                Donate food
              </NavLink>
            </>
          )}
        </div>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 text-cream md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle navigation</span>
        </button>
      </div>
      {open ? (
        <nav id="mobile-nav" className="grid gap-1 px-4 pb-4 md:hidden" aria-label="Mobile">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-sm hover:bg-white/10"
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/donate"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-full bg-harvest px-4 py-2 text-center text-sm font-semibold text-forest-deep"
          >
            Donate food
          </NavLink>
          {user ? (
            <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user.user_metadata.full_name || user.email}
                </p>
                <p className="text-xs capitalize text-cream/65">
                  {user.user_metadata.role || 'Account'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="shrink-0 rounded-full border border-cream/25 px-3 py-1.5 text-xs font-semibold text-cream"
              >
                Sign out
              </button>
            </div>
          ) : (
            <NavLink
              to="/auth"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Sign in / Create account
            </NavLink>
          )}
        </nav>
      ) : null}
      {authError ? (
        <p className="mx-auto max-w-6xl px-4 pb-2 text-sm text-red-200" role="alert">
          {authError}
        </p>
      ) : null}
    </header>
  )
}
