import { cn } from '../../lib/cn'
import { STATUS_LABELS, type DonationStatus } from '../../types/food'

const styles: Record<DonationStatus, string> = {
  available: 'bg-sage text-forest',
  reserved: 'bg-harvest/20 text-harvest-deep',
  collected: 'bg-forest/10 text-forest',
  expired: 'bg-stone-200 text-stone-600',
}

export function StatusBadge({ status }: { status: DonationStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide',
        styles[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
