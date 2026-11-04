import { createContext } from 'react'
import type { Donation } from '../types/food'

export type DemoSessionValue = {
  donations: Donation[]
  sessionDonationIds: string[]
  sessionReservedIds: string[]
  addSessionDonation: (donation: Donation) => void
  reserveForSession: (donationId: string) => void
}

export const DemoSessionContext = createContext<DemoSessionValue | null>(null)
