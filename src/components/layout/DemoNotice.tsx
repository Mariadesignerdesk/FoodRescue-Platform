import { Info } from 'lucide-react'
import { DEMO_NOTICE } from '../../data/demo'

export function DemoNotice() {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-2xl border border-harvest/40 bg-harvest/10 px-3 py-2.5 text-sm text-forest"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-harvest-deep" aria-hidden="true" />
      <p>{DEMO_NOTICE}</p>
    </div>
  )
}
