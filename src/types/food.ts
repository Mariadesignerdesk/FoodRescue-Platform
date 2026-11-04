export type DonationCategory =
  | 'bakery'
  | 'produce'
  | 'prepared'
  | 'dairy'
  | 'grocery'
  | 'other'

export type DonationStatus = 'available' | 'reserved' | 'collected' | 'expired'

export type DonorType = 'restaurant' | 'bakery' | 'grocery' | 'cafe'

export type Donation = {
  id: string
  title: string
  description: string
  category: DonationCategory
  quantity: number
  weightKg?: number | null
  unit: string
  servings: number
  donorName: string
  donorType?: DonorType
  location: string
  pickupWindow: string
  expiresAt: string
  imageUrl: string
  status: DonationStatus
  pickedUpAt?: string | null
  allergens?: string[]
  createdAt?: string
  reservedBy?: string
}

export type Reservation = {
  id: string
  donationId: string
  charityName: string
  status: 'pending' | 'confirmed' | 'collected' | 'cancelled'
  reservedAt: string
  pickupNote: string
}

export type ReservationHistoryItem = {
  id: string
  donationId: string
  donationTitle: string
  quantity: number | null
  unit: string | null
  pickupLocation: string | null
  pickupTime: string | null
  status: string
  reservedAt: string
  otherPartyProfileId: string | null
  otherPartyName: string | null
}

export type ActivityItem = {
  id: string
  label: string
  detail: string
  time: string
  tone: 'rescue' | 'reserve' | 'collect'
}

export type WeeklyImpact = {
  week: string
  meals: number
  kg: number
}

export const CATEGORY_LABELS: Record<DonationCategory, string> = {
  bakery: 'Bakery',
  produce: 'Produce',
  prepared: 'Prepared meals',
  dairy: 'Dairy',
  grocery: 'Grocery',
  other: 'Other',
}

export const STATUS_LABELS: Record<DonationStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  collected: 'Collected',
  expired: 'Expired',
}
