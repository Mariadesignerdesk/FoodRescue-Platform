import { Clock3, MapPin, Users } from 'lucide-react'
import type { Donation } from '../../types/food'
import { CATEGORY_LABELS } from '../../types/food'
import { formatQuantity } from '../../lib/format'
import { StatusBadge } from './StatusBadge'

type FoodCardProps = {
  donation: Donation
  sessionTag?: boolean
  action?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
}

export function FoodCard({ donation, sessionTag = false, action }: FoodCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-forest/8 bg-white shadow-[0_18px_50px_rgba(23,61,49,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,61,49,0.12)]">
      <div className="relative aspect-[5/3] overflow-hidden">
        <img
          src={donation.imageUrl}
          alt=""
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-cream/90 px-2.5 py-1 text-xs font-semibold text-forest">
            {CATEGORY_LABELS[donation.category]}
          </span>
          {sessionTag ? (
            <span className="rounded-full bg-harvest px-2.5 py-1 text-xs font-semibold text-forest-deep">
              This session
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={donation.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
            {donation.donorName}
          </p>
          <h3 className="mt-1 font-display text-2xl leading-tight text-forest">
            {donation.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-forest/70">{donation.description}</p>
        </div>

        <dl className="mt-auto grid gap-2 text-sm text-forest/80">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-harvest-deep" aria-hidden="true" />
            <span>
              {formatQuantity(donation.quantity, donation.unit)} · {donation.servings} servings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-harvest-deep" aria-hidden="true" />
            <span>{donation.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-harvest-deep" aria-hidden="true" />
            <span>{donation.pickupWindow}</span>
          </div>
        </dl>

        {donation.allergens && donation.allergens.length > 0 ? (
          <p className="text-xs text-forest/60">Contains {donation.allergens.join(', ')}</p>
        ) : donation.allergens ? (
          <p className="text-xs text-forest/60">No listed allergens</p>
        ) : null}

        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className="mt-1 inline-flex items-center justify-center rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest-deep disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </article>
  )
}
