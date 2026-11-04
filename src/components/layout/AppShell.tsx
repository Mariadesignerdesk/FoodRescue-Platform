import {
  LayoutDashboard,
  Menu,
  PlusCircle,
  Search,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { useAuth } from '../../context/useAuth'
import { DemoNotice } from './DemoNotice'
import { Logo } from './Logo'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/browse', label: 'Browse food', icon: Search },
  { to: '/donate', label: 'Donate food', icon: PlusCircle },
  { to: '/my-donations', label: 'My donations', icon: UtensilsCrossed },
]

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="grid gap-1" aria-label="Dashboard">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-sage text-forest'
                  : 'text-cream/80 hover:bg-white/10 hover:text-cream',
              )
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

export function AppShell() {
  const [open, setOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const { user, signOut } = useAuth()

  async function handleSignOut() {
    setAuthError(null)
    try {
      await signOut()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign out.')
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-forest-deep p-5 text-cream lg:flex">
        <Logo inverted />
        <p className="mt-6 font-display text-3xl leading-tight">
          Keep good food in circulation.
        </p>
        <div className="mt-8 flex-1">
          <SidebarLinks />
        </div>
        {user ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="truncate text-sm font-semibold text-cream">
              {user.user_metadata.full_name || user.email}
            </p>
            <p className="mt-0.5 text-xs capitalize text-cream/60">
              {user.user_metadata.role || 'Account'}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-3 text-xs font-semibold text-harvest hover:text-cream"
            >
              Sign out
            </button>
          </div>
        ) : (
          <NavLink to="/auth" className="text-xs font-semibold text-harvest hover:text-cream">
            Sign in or create an account
          </NavLink>
        )}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-forest-deep/50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-[min(20rem,86vw)] bg-forest-deep p-5 text-cream">
            <div className="mb-6 flex items-center justify-between">
              <Logo inverted />
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarLinks onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-forest/10 bg-cream/85 px-4 py-3 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-forest/15 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </button>
          <p className="hidden text-sm text-forest/70 sm:block">
            Manchester surplus network · demonstration view
          </p>
          <NavLink
            to="/donate"
            className="ml-auto inline-flex rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream"
          >
            New listing
          </NavLink>
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-right">
                <span className="block max-w-40 truncate text-xs font-semibold text-forest">
                  {user.user_metadata.full_name || user.email}
                </span>
                <span className="block text-[11px] capitalize text-forest/60">
                  {user.user_metadata.role || 'Account'}
                </span>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-forest/15 px-3 py-2 text-xs font-semibold text-forest hover:bg-sage"
              >
                Sign out
              </button>
            </div>
          ) : (
            <NavLink
              to="/auth"
              className="rounded-full border border-forest/15 px-3 py-2 text-sm font-semibold text-forest hover:bg-sage"
            >
              Sign in
            </NavLink>
          )}
        </header>
        {authError ? (
          <p className="px-4 pt-3 text-sm text-red-700 sm:px-6" role="alert">
            {authError}
          </p>
        ) : null}
        <div className="px-4 pt-4 sm:px-6">
          <DemoNotice />
        </div>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
