import type { Donation, DonationCategory, ReservationHistoryItem } from '../types/food'
import { supabase } from './supabase'

type DonationProfile = {
  full_name: string | null
  organization_name: string | null
}

type DonationRecord = {
  id: string
  title: string
  description: string
  category: string
  quantity: number
  weight_kg: number | null
  unit: string
  servings: number
  pickup_location: string
  pickup_time: string
  picked_up_at: string | null
  image_url: string | null
  profiles: DonationProfile[] | null
}

type MyDonationRecord = DonationRecord & {
  status: string
  created_at: string | null
}

type ReservationRecord = {
  id: string
  donation_id: string
  receiver_id: string
  status: string
  reserved_at: string
}

type ReservationDonationRecord = {
  id: string
  donor_id: string
  title: string
  quantity: number
  unit: string
  pickup_location: string
  pickup_time: string
}

type ReservationCounterpartyRecord = {
  reservation_id: string
  profile_id: string | null
  full_name: string | null
  organization_name: string | null
}

const donationCategories: DonationCategory[] = [
  'bakery',
  'produce',
  'prepared',
  'dairy',
  'grocery',
  'other',
]

const donationStatuses: Donation['status'][] = [
  'available',
  'reserved',
  'collected',
  'expired',
]

function isDonationCategory(category: string): category is DonationCategory {
  return donationCategories.includes(category as DonationCategory)
}

function isDonationStatus(status: string): status is Donation['status'] {
  return donationStatuses.some((candidate) => candidate === status)
}

function mapDonation(
  record: DonationRecord,
  status: Donation['status'],
  createdAt?: string,
): Donation {
  if (!isDonationCategory(record.category)) {
    throw new Error(`Unsupported donation category: ${record.category}`)
  }

  const pickupDate = new Date(record.pickup_time)
  if (Number.isNaN(pickupDate.getTime())) {
    throw new Error(`Donation ${record.id} has an invalid pickup time.`)
  }

  const profile = record.profiles?.[0]
  const donorName =
    profile?.organization_name?.trim() || profile?.full_name?.trim() || 'Food donor'

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    category: record.category,
    quantity: record.quantity,
    unit: record.unit,
    servings: record.servings,
    weightKg: record.weight_kg,
    donorName,
    location: record.pickup_location,
    pickupWindow: new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(pickupDate),
    expiresAt: pickupDate.toISOString(),
    imageUrl: record.image_url ?? '',
    status,
    pickedUpAt: record.picked_up_at,
    ...(createdAt ? { createdAt } : {}),
  }
}

async function fetchReservationDetails(
  reservations: ReservationRecord[],
  knownDonations?: ReservationDonationRecord[],
): Promise<ReservationHistoryItem[]> {
  if (reservations.length === 0) return []

  const donationIds = [...new Set(reservations.map((reservation) => reservation.donation_id))]
  let donations = knownDonations
  if (!donations) {
    const { data, error } = await supabase
      .from('donations')
      .select('id, donor_id, title, quantity, unit, pickup_location, pickup_time')
      .in('id', donationIds)

    if (error) {
      console.error('[donations] Reservation donation details fetch failed.', {
        code: error.code,
        message: error.message,
        hint: error.hint,
      })
      throw error
    }
    donations = data as ReservationDonationRecord[]
  }

  const donationById = new Map(donations.map((donation) => [donation.id, donation]))

  return Promise.all(reservations.map(async (reservation) => {
    const donation = donationById.get(reservation.donation_id)
    const { data, error } = await supabase
      .rpc('get_reservation_counterparty', {
        p_reservation_id: reservation.id,
      })
      .maybeSingle()

    if (error) {
      console.error('[donations] Reservation counterparty RPC failed.', {
        code: error.code,
        message: error.message,
        hint: error.hint,
      })
      throw new Error(`Could not load reservation participant name: ${error.message}`)
    }

    const counterparty = data as ReservationCounterpartyRecord | null
    const otherPartyName =
      counterparty?.organization_name?.trim() ||
      counterparty?.full_name?.trim() ||
      null

    return {
      id: reservation.id,
      donationId: reservation.donation_id,
      donationTitle: donation?.title ?? 'Donation details unavailable',
      quantity: donation?.quantity ?? null,
      unit: donation?.unit ?? null,
      pickupLocation: donation?.pickup_location ?? null,
      pickupTime: donation?.pickup_time ?? null,
      status: reservation.status,
      reservedAt: reservation.reserved_at,
      otherPartyProfileId: counterparty?.profile_id ?? null,
      otherPartyName,
    }
  }))
}

export type CreateDonationInput = {
  donor_id: string
  title: string
  description: string
  category: DonationCategory
  quantity: number
  weight_kg: number | null
  unit: string
  servings: number
  pickup_location: string
  pickup_time: string
  image_url: string
  status: 'available'
}

export type CreatedDonation = CreateDonationInput & {
  id: string
  picked_up_at: string | null
}

export async function reserveDonation(donationId: string): Promise<string> {
  const { data, error } = await supabase.rpc('reserve_food', {
    p_donation_id: donationId,
  })

  if (error) {
    console.error('[donations] Reservation RPC failed.', {
      code: error.code,
      message: error.message,
      hint: error.hint,
    })
    throw error
  }

  if (typeof data !== 'string' || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(data)) {
    throw new Error('The reservation request returned an invalid reservation ID.')
  }

  return data
}

export async function cancelReservation(reservationId: string): Promise<void> {
  const { data, error } = await supabase.rpc('cancel_reservation', {
    p_reservation_id: reservationId,
  })

  if (error) {
    console.error('[donations] Reservation cancellation RPC failed.', {
      code: error.code,
      message: error.message,
      hint: error.hint,
    })
    throw error
  }

  if (data !== true) {
    throw new Error('This reservation could not be cancelled. It may no longer be reserved.')
  }
}

export async function completePickup(reservationId: string): Promise<void> {
  const { data, error } = await supabase.rpc('complete_pickup', {
    p_reservation_id: reservationId,
  })

  if (error) {
    console.error('[donations] Pickup completion RPC failed.', {
      code: error.code,
      message: error.message,
      hint: error.hint,
    })
    throw error
  }

  if (data !== true) {
    throw new Error('This pickup could not be completed. It may no longer be reserved.')
  }
}

export async function createDonation(
  donation: CreateDonationInput,
): Promise<CreatedDonation> {
  console.info('[donations] Attempting donation insert.', {
    donorIdPresent: Boolean(donation.donor_id),
  })
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select(
      'id, donor_id, title, description, category, quantity, weight_kg, unit, servings, pickup_location, pickup_time, picked_up_at, image_url, status',
    )
    .single()

  if (error) {
    console.error('[donations] Supabase insert failed.', {
      code: error.code,
      message: error.message,
      hint: error.hint,
    })
    throw error
  }
  if (!data) throw new Error('The donation was created but no saved record was returned.')

  return data
}

export async function fetchAvailableDonations(): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select(
      'id, title, description, category, quantity, weight_kg, unit, servings, pickup_location, pickup_time, picked_up_at, image_url, profiles(full_name, organization_name)',
    )
    .eq('status', 'available')
    .order('pickup_time', { ascending: true })

  if (error) {
    console.error('[donations] Supabase listing fetch failed.', {
      code: error.code,
      message: error.message,
      hint: error.hint,
    })
    throw error
  }

  return (data as DonationRecord[]).map((record) => mapDonation(record, 'available'))
}

export async function fetchMyDonations(donorId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select(
      'id, title, description, category, quantity, weight_kg, unit, servings, pickup_location, pickup_time, picked_up_at, image_url, status, created_at, profiles(full_name, organization_name)',
    )
    .eq('donor_id', donorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[donations] Donor listings fetch failed.', {
      code: error.code,
      message: error.message,
      hint: error.hint,
    })
    throw error
  }

  return (data as MyDonationRecord[]).map((record) => {
    const status = record.status === 'picked_up' ? 'collected' : record.status
    if (!isDonationStatus(status)) {
      throw new Error(`Donation ${record.id} has an unsupported status.`)
    }

    return mapDonation(record, status, record.created_at ?? undefined)
  })
}

export async function fetchReceiverReservations(
  receiverId: string,
): Promise<ReservationHistoryItem[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('id, donation_id, receiver_id, status, reserved_at')
    .eq('receiver_id', receiverId)
    .order('reserved_at', { ascending: false })

  if (error) {
    console.error('[donations] Receiver reservations fetch failed.', {
      code: error.code,
      message: error.message,
      hint: error.hint,
    })
    throw error
  }

  return fetchReservationDetails(data as ReservationRecord[])
}

export async function fetchDonorReservations(
  donorId: string,
): Promise<ReservationHistoryItem[]> {
  const { data: donationData, error: donationError } = await supabase
    .from('donations')
    .select('id, donor_id, title, quantity, unit, pickup_location, pickup_time')
    .eq('donor_id', donorId)

  if (donationError) {
    console.error('[donations] Donor reservation donation IDs fetch failed.', {
      code: donationError.code,
      message: donationError.message,
      hint: donationError.hint,
    })
    throw donationError
  }

  const donations = donationData as ReservationDonationRecord[]
  if (donations.length === 0) return []

  const donationIds = donations.map((donation) => donation.id)
  const { data, error } = await supabase
    .from('reservations')
    .select('id, donation_id, receiver_id, status, reserved_at')
    .in('donation_id', donationIds)
    .order('reserved_at', { ascending: false })

  if (error) {
    console.error('[donations] Donor reservations fetch failed.', {
      code: error.code,
      message: error.message,
      hint: error.hint,
    })
    throw error
  }

  return fetchReservationDetails(data as ReservationRecord[], donations)
}
