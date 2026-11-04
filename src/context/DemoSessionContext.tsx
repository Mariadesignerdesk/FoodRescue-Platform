import { useMemo, useState, type ReactNode } from 'react'
import { DEMO_DONATIONS } from '../data/demo'
import type { Donation } from '../types/food'
import { DemoSessionContext, type DemoSessionValue } from './sessionContext'

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [sessionDonations, setSessionDonations] = useState<Donation[]>([])
  const [sessionReservedIds, setSessionReservedIds] = useState<string[]>([])

  const value = useMemo<DemoSessionValue>(() => {
    const reserved = new Set(sessionReservedIds)
    const donations = [...sessionDonations, ...DEMO_DONATIONS].map((donation) => {
      if (!reserved.has(donation.id) || donation.status !== 'available') {
        return donation
      }
      return {
        ...donation,
        status: 'reserved' as const,
        reservedBy: 'Riverside Kitchen (session demo)',
      }
    })

    return {
      donations,
      sessionDonationIds: sessionDonations.map((item) => item.id),
      sessionReservedIds,
      addSessionDonation: (donation) => {
        setSessionDonations((current) => [donation, ...current])
      },
      reserveForSession: (donationId) => {
        setSessionReservedIds((current) =>
          current.includes(donationId) ? current : [...current, donationId],
        )
      },
    }
  }, [sessionDonations, sessionReservedIds])

  return (
    <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>
  )
}
