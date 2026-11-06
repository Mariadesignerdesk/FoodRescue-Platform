import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="bg-forest-deep text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-6 text-cream/70">
            FoodRescue is a food donation and waste reduction platform connecting
            kitchens with charities and communities.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">
            Platform
          </p>
          <ul className="mt-3 space-y-2 text-sm text-cream/75">
            <li>
              <Link className="transition hover:text-harvest" to="/browse">Browse surplus</Link>
            </li>
            <li>
              <Link className="transition hover:text-harvest" to="/donate">List a donation</Link>
            </li>
            <li>
              <Link className="transition hover:text-harvest" to="/dashboard">Impact dashboard</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">
            Live platform
          </p>
          <p className="mt-3 text-sm leading-6 text-cream/75">
            Share surplus food, coordinate pickups, and track the impact of rescued meals.
          </p>
        </div>
      </div>
    </footer>
  )
}
