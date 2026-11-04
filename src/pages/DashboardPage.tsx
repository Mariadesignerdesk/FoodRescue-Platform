import { useEffect, useState } from 'react'
import { Leaf, Scale, Store, Users } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getDashboardAggregate,
  type DashboardActivityType,
  type DashboardAggregate,
} from '../lib/dashboard'

type DashboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: DashboardAggregate }

const activityLabels: Record<DashboardActivityType, string> = {
  listing_created: 'Listing created',
  reservation_made: 'Reservation made',
  pickup_completed: 'Pickup completed',
}

const numberFormatter = new Intl.NumberFormat()
const kilogramFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
})
const activityTimeFormatter = new Intl.DateTimeFormat('en-PK', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Karachi',
})
const weekLabelFormatter = new Intl.DateTimeFormat('en-PK', {
  month: 'short',
  day: 'numeric',
  timeZone: 'Asia/Karachi',
})

export function DashboardPage() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<DashboardState>({ status: 'loading' })

  useEffect(() => {
    let active = true

    getDashboardAggregate()
      .then((data) => {
        if (active) setState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (!active) return
        const message =
          error instanceof Error ? error.message : 'An unexpected error occurred.'
        setState({ status: 'error', message })
      })

    return () => {
      active = false
    }
  }, [attempt])

  const aggregate = state.status === 'ready' ? state.data : null
  const cards = aggregate
    ? [
        {
          label: 'Meals redirected',
          value: numberFormatter.format(aggregate.totals.mealsRedirected),
          hint: `${numberFormatter.format(aggregate.totals.pickedUpDonationsMissingServings)} pickups missing servings`,
          icon: Users,
        },
        {
          label: 'Food diverted',
          value: `${kilogramFormatter.format(aggregate.totals.knownKilogramsDiverted)} kg`,
          hint: `${numberFormatter.format(aggregate.totals.pickedUpDonationsMissingWeight)} pickups missing weight`,
          icon: Scale,
        },
        {
          label: 'Kitchen partners',
          value: numberFormatter.format(aggregate.totals.kitchenPartners),
          hint: 'Named donor organisations with completed pickups',
          icon: Store,
        },
        {
          label: 'Charity kitchens',
          value: numberFormatter.format(aggregate.totals.charityKitchens),
          hint: 'Named receiver organisations with completed pickups',
          icon: Leaf,
        },
      ]
    : [
        { label: 'Meals redirected', value: '—', hint: 'Platform-wide total', icon: Users },
        { label: 'Food diverted', value: '—', hint: 'Recorded weight', icon: Scale },
        { label: 'Kitchen partners', value: '—', hint: 'Named donor organisations', icon: Store },
        { label: 'Charity kitchens', value: '—', hint: 'Named receiver organisations', icon: Leaf },
      ]

  const weeklyChartData =
    aggregate?.weeklyImpact.map((item) => ({
      week: weekLabelFormatter.format(new Date(item.weekStart)),
      meals: item.meals,
    })) ?? []
  const hasWeeklyPickups = aggregate?.weeklyImpact.some((item) => item.pickups > 0) ?? false

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-harvest-deep">
        Overview
      </p>
      <h1 className="mt-2 font-display text-4xl text-forest sm:text-5xl">Impact dashboard</h1>
      <p className="mt-3 max-w-2xl text-forest/70">
        A live, platform-wide view of food rescued through FoodRescue.
      </p>

      {state.status === 'loading' && (
        <p className="mt-5 text-sm text-forest/70" role="status" aria-live="polite">
          Loading platform-wide dashboard data…
        </p>
      )}
      {state.status === 'error' && (
        <div
          className="mt-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p>{state.message}</p>
          <button
            type="button"
            className="w-fit rounded-full bg-forest px-4 py-2 font-semibold text-cream transition hover:bg-forest/90"
            onClick={() => {
              setState({ status: 'loading' })
              setAttempt((current) => current + 1)
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article
              key={card.label}
              className="rounded-3xl border border-forest/8 bg-white p-5 shadow-[0_16px_40px_rgba(23,61,49,0.05)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-forest/60">{card.label}</p>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-sage">
                  <Icon className="h-4 w-4 text-forest" />
                </span>
              </div>
              <p className="mt-4 font-display text-3xl text-forest">{card.value}</p>
              <p className="mt-1 text-xs text-forest/55">
                {aggregate ? card.hint : state.status === 'loading' ? 'Loading live data' : 'Unavailable'}
              </p>
            </article>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-[1.8rem] border border-forest/8 bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-forest">Meals rescued by week</h2>
              <p className="text-sm text-forest/60">Last 8 weeks · timestamps in PKT</p>
            </div>
          </div>
          <div className="h-72">
            {state.status === 'loading' ? (
              <p className="grid h-full place-items-center text-sm text-forest/60" role="status">
                Loading weekly impact…
              </p>
            ) : aggregate && hasWeeklyPickups ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyChartData}>
                  <defs>
                    <linearGradient id="mealsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#173D31" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#173D31" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E9F0E6" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: '#3d6b58', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#3d6b58', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: '1px solid #E9F0E6',
                      background: '#FAF8F1',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="meals"
                    stroke="#173D31"
                    strokeWidth={2.5}
                    fill="url(#mealsFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : state.status === 'error' ? (
              <p className="grid h-full place-items-center text-center text-sm text-red-800">
                Weekly impact could not be loaded. Use Retry above to try again.
              </p>
            ) : (
              <p className="grid h-full place-items-center text-center text-sm text-forest/60">
                No pickups with recorded timestamps in the last eight weeks.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[1.8rem] bg-forest p-6 text-cream">
          <h2 className="font-display text-2xl">Platform snapshot</h2>
          <p className="mt-2 text-sm text-cream/70">Live platform-wide donation count.</p>
          <dl className="mt-8 space-y-5">
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-harvest">Available listings</dt>
              <dd className="mt-1 font-display text-4xl">
                {aggregate ? numberFormatter.format(aggregate.totals.availableFood) : '—'}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-[1.8rem] border border-forest/8 bg-white p-6">
        <h2 className="font-display text-2xl text-forest">Recent activity</h2>
        <ul className="mt-5 divide-y divide-sage">
          {state.status === 'loading' ? (
            <li className="py-4 text-sm text-forest/60" role="status">Loading recent activity…</li>
          ) : aggregate && aggregate.recentActivity.length > 0 ? (
            aggregate.recentActivity.map((item, index) => (
              <li
                key={`${item.type}-${item.occurredAt}-${index}`}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="font-medium text-forest">{activityLabels[item.type]}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-moss">
                  {activityTimeFormatter.format(new Date(item.occurredAt))}
                </p>
              </li>
            ))
          ) : state.status === 'error' ? (
            <li className="py-4 text-sm text-red-800">
              Recent activity could not be loaded. Use Retry above to try again.
            </li>
          ) : (
            <li className="py-4 text-sm text-forest/60">No recent activity to show.</li>
          )}
        </ul>
      </section>
    </div>
  )
}
