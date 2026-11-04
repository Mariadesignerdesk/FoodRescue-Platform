import { Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type LogoProps = {
  inverted?: boolean
}

export function Logo({ inverted = false }: LogoProps) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span
        className={cn(
          'grid h-9 w-9 place-items-center rounded-full',
          inverted ? 'bg-cream text-forest' : 'bg-forest text-cream',
        )}
      >
        <Leaf className="h-4 w-4" aria-hidden="true" />
      </span>
      <span
        className={cn(
          'font-display text-xl tracking-tight',
          inverted ? 'text-cream' : 'text-forest',
        )}
      >
        FoodRescue
      </span>
    </Link>
  )
}
