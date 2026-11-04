import { Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FoodCard } from '../components/food/FoodCard'
import { useAuth } from '../context/useAuth'
import { fetchAvailableDonations, reserveDonation } from '../lib/donations'
import { CATEGORY_LABELS, type Donation, type DonationCategory } from '../types/food'

const categories: Array<DonationCategory | 'all'> = [
  'all',
  'bakery',
  'produce',
  'prepared',
  'dairy',
  'grocery',
  'other',
]

export function BrowsePage() {
  const { user, loading: authLoading } = useAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<DonationCategory | 'all'>('all')
  const [selected, setSelected] = useState<Donation | null>(null)
  const [reservedNotice, setReservedNotice] = useState<string | null>(null)
  const [reservationError, setReservationError] = useState<string | null>(null)
  const [reserving, setReserving] = useState(false)

  const loadDonations = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      setDonations(await fetchAvailableDonations())
    } catch (error) {
      setDonations([])
      setLoadError(
        error instanceof Error ? error.message : 'Unable to load available donations.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchAvailableDonations()
      .then((availableDonations) => {
        if (active) setDonations(availableDonations)
      })
      .catch((error: unknown) => {
        if (!active) return
        setDonations([])
        setLoadError(
          error instanceof Error ? error.message : 'Unable to load available donations.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return donations.filter((donation) => {
      const matchesCategory = category === 'all' || donation.category === category
      const haystack = `${donation.title} ${donation.donorName} ${donation.description} ${donation.location}`.toLowerCase()
      const matchesQuery = needle.length === 0 || haystack.includes(needle)
      return matchesCategory && matchesQuery
    })
  }, [donations, query, category])

  async function handleReservation() {
    if (!selected || reserving) return
    setReservationError(null)

    if (authLoading) {
      setReservationError('Your sign-in session is still being restored. Please try again shortly.')
      return
    }
    if (!user) {
      setReservationError('Sign in with a receiver account to reserve this donation.')
      return
    }
    if (user.user_metadata.role !== 'receiver') {
      setReservationError('Only receiver accounts can reserve donations.')
      return
    }

    setReserving(true)
    try {
      await reserveDonation(selected.id)
      setReservedNotice(`Reservation confirmed for “${selected.title}”.`)
      setSelected(null)
      await loadDonations()
    } catch (error) {
      setReservationError(
        error instanceof Error ? error.message : 'Unable to reserve this donation.',
      )
    } finally {
      setReserving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-harvest-deep">
        Marketplace
      </p>
      <h1 className="mt-2 font-display text-4xl text-forest sm:text-5xl">Browse food</h1>
      <p className="mt-3 max-w-2xl text-forest/70">
        Available listings from kitchens across the city. Search and filter in the
        browser. Confirmed reservations are saved to your account.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search donations</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by dish, kitchen or neighbourhood"
            className="w-full rounded-full border border-forest/15 bg-white py-3 pl-11 pr-4 text-sm outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={
              item === category
                ? 'rounded-full bg-forest px-4 py-2 text-sm font-semibold whitespace-nowrap text-cream'
                : 'rounded-full bg-white px-4 py-2 text-sm font-medium whitespace-nowrap text-forest ring-1 ring-forest/10'
            }
          >
            {item === 'all' ? 'All' : CATEGORY_LABELS[item]}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void loadDonations()}
        disabled={loading}
        className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-forest ring-1 ring-forest/10 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? 'Refreshing listings…' : 'Refresh listings'}
      </button>

      {reservedNotice ? (
        <p className="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm text-forest" role="status">
          {reservedNotice}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-10 rounded-[2rem] bg-white px-6 py-12 text-center text-sm text-forest/70" role="status">
          Loading available donations…
        </p>
      ) : loadError ? (
        <div className="mt-10 rounded-[2rem] border border-red-200 bg-red-50 px-6 py-12 text-center" role="alert">
          <h2 className="font-display text-2xl text-forest">Could not load donations</h2>
          <p className="mt-2 text-sm text-red-800">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadDonations()}
            className="mt-5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream"
          >
            Try again
          </button>
        </div>
      ) : donations.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-forest/20 bg-white px-6 py-16 text-center">
          <h2 className="font-display text-3xl text-forest">No available food yet</h2>
          <p className="mt-2 text-sm text-forest/65">
            Check back soon or refresh to see new listings.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-forest/20 bg-white px-6 py-16 text-center">
          <h2 className="font-display text-3xl text-forest">No listings match</h2>
          <p className="mt-2 text-sm text-forest/65">
            Try another category or clear the search.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((donation) => (
            <FoodCard
              key={donation.id}
              donation={donation}
              action={{
                label: donation.status === 'available' ? 'Reserve for pickup' : 'View details',
                onClick: () => {
                  setSelected(donation)
                  setReservationError(null)
                },
              }}
            />
          ))}
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-forest-deep/50 p-4 sm:place-items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reserve-title"
            className="w-full max-w-lg rounded-[1.8rem] bg-cream p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-moss">{selected.donorName}</p>
                <h2 id="reserve-title" className="mt-1 font-display text-3xl text-forest">
                  {selected.title}
                </h2>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full bg-white disabled:opacity-50"
                disabled={reserving}
                onClick={() => setSelected(null)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-forest/70">{selected.description}</p>
            <p className="mt-4 text-sm text-forest">Pickup: {selected.pickupWindow}</p>
            <p className="mt-1 text-sm text-forest/70">{selected.location}</p>
            {authLoading ? (
              <p className="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm text-forest" role="status">
                Checking your sign-in session…
              </p>
            ) : !user ? (
              <p className="mt-4 text-sm text-forest/70">
                <Link to="/auth" className="font-semibold text-forest underline">
                  Sign in
                </Link>{' '}
                with a receiver account to reserve this donation.
              </p>
            ) : user.user_metadata.role !== 'receiver' ? (
              <p className="mt-4 text-sm text-red-800" role="alert">
                Only receiver accounts can reserve donations.
              </p>
            ) : null}
            {reservationError ? (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {reservationError}
              </p>
            ) : null}
            {selected.status === 'available' ? (
              <button
                type="button"
                className="mt-6 w-full rounded-full bg-forest py-3 font-semibold text-cream disabled:cursor-not-allowed disabled:opacity-60"
                disabled={authLoading || !user || user.user_metadata.role !== 'receiver' || reserving}
                onClick={() => void handleReservation()}
              >
                {reserving ? 'Reserving…' : 'Confirm reservation'}
              </button>
            ) : (
              <p className="mt-6 rounded-2xl bg-sage px-4 py-3 text-sm text-forest">
                This listing is already {selected.status}.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
