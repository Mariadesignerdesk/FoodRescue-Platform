import { useCallback, useEffect, useState } from 'react'
import { FoodCard } from '../components/food/FoodCard'
import { useAuth } from '../context/useAuth'
import {
  cancelReservation,
  completePickup,
  fetchDonorReservations,
  fetchMyDonations,
  fetchReceiverReservations,
} from '../lib/donations'
import type { Donation, ReservationHistoryItem } from '../types/food'

export function MyDonationsPage() {
  const { user, loading: authLoading } = useAuth()
  const role = user?.user_metadata.role
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reservations, setReservations] = useState<ReservationHistoryItem[]>([])
  const [reservationsLoading, setReservationsLoading] = useState(true)
  const [reservationsError, setReservationsError] = useState<string | null>(null)
  const [cancellingReservationId, setCancellingReservationId] = useState<string | null>(null)
  const [cancellationFeedback, setCancellationFeedback] = useState<{
    reservationId: string
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [completingPickupId, setCompletingPickupId] = useState<string | null>(null)
  const [pickupFeedback, setPickupFeedback] = useState<{
    reservationId: string
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const active = donations.filter((item) => item.status === 'available' || item.status === 'reserved')
  const history = donations.filter((item) => item.status === 'collected' || item.status === 'expired')

  const retryLoadDonations = useCallback(async () => {
    if (!user || role !== 'donor') return
    setLoading(true)
    setLoadError(null)
    try {
      setDonations(await fetchMyDonations(user.id))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load your donations.')
    } finally {
      setLoading(false)
    }
  }, [user, role])

  const retryLoadReservations = useCallback(async () => {
    if (!user || (role !== 'donor' && role !== 'receiver')) return
    setReservationsLoading(true)
    setReservationsError(null)
    try {
      const records =
        role === 'donor'
          ? await fetchDonorReservations(user.id)
          : await fetchReceiverReservations(user.id)
      setReservations(records)
    } catch (error) {
      setReservationsError(
        error instanceof Error ? error.message : 'Unable to load reservation history.',
      )
    } finally {
      setReservationsLoading(false)
    }
  }, [user, role])

  async function handleCancelReservation(reservation: ReservationHistoryItem) {
    if (role !== 'receiver' || reservation.status !== 'reserved' || cancellingReservationId) {
      return
    }

    const confirmed = window.confirm(
      `Cancel your reservation for "${reservation.donationTitle}"?`,
    )
    if (!confirmed) return

    setCancellingReservationId(reservation.id)
    setCancellationFeedback(null)
    try {
      await cancelReservation(reservation.id)
      setCancellationFeedback({
        reservationId: reservation.id,
        type: 'success',
        message: 'Reservation cancelled. The food is available again.',
      })
      await retryLoadReservations()
    } catch (error) {
      setCancellationFeedback({
        reservationId: reservation.id,
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to cancel this reservation.',
      })
    } finally {
      setCancellingReservationId(null)
    }
  }

  async function handleCompletePickup(reservation: ReservationHistoryItem) {
    if (role !== 'donor' || reservation.status !== 'reserved' || completingPickupId) {
      return
    }

    const confirmed = window.confirm(
      `Confirm pickup for "${reservation.donationTitle}"?`,
    )
    if (!confirmed) return

    setCompletingPickupId(reservation.id)
    setPickupFeedback(null)
    try {
      await completePickup(reservation.id)
      setPickupFeedback({
        reservationId: reservation.id,
        type: 'success',
        message: 'Pickup completed. The donation has moved to history.',
      })
      await Promise.all([retryLoadReservations(), retryLoadDonations()])
    } catch (error) {
      setPickupFeedback({
        reservationId: reservation.id,
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to complete this pickup.',
      })
    } finally {
      setCompletingPickupId(null)
    }
  }

  useEffect(() => {
    if (authLoading || !user || role !== 'donor') return

    let activeRequest = true
    fetchMyDonations(user.id)
      .then((records) => {
        if (activeRequest) {
          setDonations(records)
          setLoadError(null)
        }
      })
      .catch((error: unknown) => {
        if (!activeRequest) return
        setLoadError(error instanceof Error ? error.message : 'Unable to load your donations.')
      })
      .finally(() => {
        if (activeRequest) setLoading(false)
      })

    return () => {
      activeRequest = false
    }
  }, [authLoading, user, role])

  useEffect(() => {
    if (authLoading || !user || (role !== 'donor' && role !== 'receiver')) return

    let activeRequest = true
    const fetchReservations =
      role === 'donor' ? fetchDonorReservations : fetchReceiverReservations

    fetchReservations(user.id)
      .then((records) => {
        if (activeRequest) {
          setReservations(records)
          setReservationsError(null)
        }
      })
      .catch((error: unknown) => {
        if (!activeRequest) return
        setReservationsError(
          error instanceof Error ? error.message : 'Unable to load reservation history.',
        )
      })
      .finally(() => {
        if (activeRequest) setReservationsLoading(false)
      })

    return () => {
      activeRequest = false
    }
  }, [authLoading, user, role])

  const donorLabel =
    user?.user_metadata.organization_name ||
    user?.user_metadata.full_name ||
    user?.email ||
    'My account'
  const reservationPartyLabel = role === 'donor' ? 'Receiver' : 'Donor'

  function formatDate(value: string | null) {
    if (!value) return 'Not provided'
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? 'Not provided'
      : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-harvest-deep">
        {donorLabel}
      </p>
      <h1 className="mt-2 font-display text-4xl text-forest sm:text-5xl">My donations</h1>
      <p className="mt-3 max-w-2xl text-forest/70">
        {role === 'receiver'
          ? 'Food you have reserved through FoodRescue.'
          : 'Your active listings and past collections from FoodRescue.'}
      </p>

      {authLoading ? (
        <p className="mt-6 rounded-2xl bg-sage px-4 py-3 text-sm text-forest" role="status">
          Checking your sign-in session…
        </p>
      ) : !user ? (
        <p className="mt-6 rounded-2xl bg-sage px-4 py-3 text-sm text-forest" role="status">
          Sign in to view your donations.
        </p>
      ) : role !== 'donor' && role !== 'receiver' ? (
        <p className="mt-6 rounded-2xl bg-sage px-4 py-3 text-sm text-forest" role="status">
          This account does not have a recognized FoodRescue role.
        </p>
      ) : role === 'donor' && loadError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800" role="alert">
          <p>Could not load your donations: {loadError}</p>
          <button
            type="button"
            onClick={() => void retryLoadDonations()}
            className="mt-3 rounded-full bg-forest px-4 py-2 font-semibold text-cream"
          >
            Try again
          </button>
        </div>
      ) : role === 'donor' && loading ? (
        <p className="mt-6 rounded-2xl bg-sage px-4 py-3 text-sm text-forest" role="status">
          Loading your donations…
        </p>
      ) : null}

      {role === 'donor' ? (
      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl text-forest">Active listings</h2>
          <p className="text-sm text-forest/60">{active.length} open</p>
        </div>
        {!loading && !loadError && active.length === 0 ? (
          <EmptyState copy="You have no active listings." />
        ) : (
          !loading && !loadError ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {active.map((donation) => (
                <FoodCard key={donation.id} donation={donation} />
              ))}
            </div>
          ) : null
        )}
      </section>
      ) : null}

      {!authLoading && user && (role === 'donor' || role === 'receiver') ? (
      <section className="mt-14">
        <h2 className="font-display text-3xl text-forest">Reservations</h2>
        <p className="mt-2 text-sm text-forest/65">
          {role === 'donor'
            ? 'Receivers who have reserved your food.'
            : 'Food you have reserved.'}
        </p>
        {reservationsError ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800" role="alert">
            <p>Could not load reservation history: {reservationsError}</p>
            <button
              type="button"
              onClick={() => void retryLoadReservations()}
              className="mt-3 rounded-full bg-forest px-4 py-2 font-semibold text-cream"
            >
              Try again
            </button>
          </div>
        ) : reservationsLoading ? (
          <p className="mt-5 rounded-2xl bg-sage px-4 py-3 text-sm text-forest" role="status">
            Loading reservation history…
          </p>
        ) : reservations.length === 0 ? (
          <EmptyState copy="No reservations to show yet." />
        ) : (
          <div className="mt-5 grid gap-4">
            {reservations.map((reservation) => (
              <article
                key={reservation.id}
                className="flex flex-col gap-4 rounded-[1.6rem] border border-forest/8 bg-white p-5 sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.16em] text-moss">
                    {reservationPartyLabel}: {reservation.otherPartyName ?? 'Name unavailable'}
                  </p>
                  <h3 className="mt-1 font-display text-2xl text-forest">
                    {reservation.donationTitle}
                  </h3>
                  <p className="mt-1 text-sm text-forest/65">
                    {reservation.quantity !== null && reservation.unit
                      ? `${reservation.quantity} ${reservation.unit} · `
                      : ''}
                    Pickup: {reservation.pickupLocation ?? 'Location unavailable'} ·{' '}
                    {formatDate(reservation.pickupTime)}
                  </p>
                  <p className="mt-1 text-xs text-forest/55">
                    Reserved {formatDate(reservation.reservedAt)}
                  </p>
                </div>
                <span className="self-start rounded-full bg-sage px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest sm:self-center">
                  {reservation.status}
                </span>
                {role === 'receiver' && reservation.status === 'reserved' ? (
                  <div className="sm:ml-2">
                    <button
                      type="button"
                      onClick={() => void handleCancelReservation(reservation)}
                      disabled={cancellingReservationId !== null}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-wait disabled:bg-sage disabled:text-red-800 disabled:border-red-200"
                    >
                      {cancellingReservationId === reservation.id
                        ? 'Cancelling…'
                        : 'Cancel reservation'}
                    </button>
                    {cancellationFeedback?.reservationId === reservation.id ? (
                      <p
                        className={`mt-2 text-sm ${
                          cancellationFeedback.type === 'error'
                            ? 'text-red-800'
                            : 'text-forest'
                        }`}
                        role={cancellationFeedback.type === 'error' ? 'alert' : 'status'}
                      >
                        {cancellationFeedback.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {role === 'donor' && reservation.status === 'reserved' ? (
                  <div className="sm:ml-2">
                    <button
                      type="button"
                      onClick={() => void handleCompletePickup(reservation)}
                      disabled={completingPickupId !== null}
                      className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream transition hover:bg-forest-deep disabled:cursor-wait disabled:border disabled:border-forest/20 disabled:bg-sage disabled:text-forest"
                    >
                      {completingPickupId === reservation.id
                        ? 'Completing…'
                        : 'Complete pickup'}
                    </button>
                    {pickupFeedback?.reservationId === reservation.id ? (
                      <p
                        className={`mt-2 text-sm ${
                          pickupFeedback.type === 'error' ? 'text-red-800' : 'text-forest'
                        }`}
                        role={pickupFeedback.type === 'error' ? 'alert' : 'status'}
                      >
                        {pickupFeedback.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
      ) : null}

      {role === 'donor' ? (
      <section className="mt-14">
        <h2 className="font-display text-3xl text-forest">History</h2>
        {!loading && !loadError && history.length === 0 ? (
          <EmptyState copy="No collected or expired listings yet." />
        ) : (
          !loading && !loadError ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {history.map((donation) => (
                <FoodCard key={donation.id} donation={donation} />
              ))}
            </div>
          ) : null
        )}
      </section>
      ) : null}
    </div>
  )
}

function EmptyState({ copy }: { copy: string }) {
  return (
    <div className="mt-5 rounded-[1.6rem] border border-dashed border-forest/20 bg-white px-6 py-12 text-center text-sm text-forest/65">
      {copy}
    </div>
  )
}
