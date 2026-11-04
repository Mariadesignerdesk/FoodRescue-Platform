import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="bg-forest-deep text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-6 text-cream/70">
            Good food deserves a second chance. FoodRescue connects kitchens with
            charities so surplus never becomes waste.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">
            Platform
          </p>
          <ul className="mt-3 space-y-2 text-sm text-cream/75">
            <li>Browse surplus</li>
            <li>List a donation</li>
            <li>Impact dashboard</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">
            Phase 1
          </p>
          <p className="mt-3 text-sm leading-6 text-cream/75">
            Frontend demonstration only. Persistent accounts, donations and
            reservations arrive with Supabase in Phase 2.
          </p>
        </div>
      </div>
    </footer>
  )
}
