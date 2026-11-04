import { supabase } from './supabase'

export type DashboardActivityType =
  | 'listing_created'
  | 'reservation_made'
  | 'pickup_completed'

export type DashboardWeeklyImpact = {
  weekStart: string
  meals: number
  knownKilograms: number
  pickups: number
  pickupsMissingServings: number
  pickupsMissingWeight: number
}

export type DashboardActivity = {
  type: DashboardActivityType
  occurredAt: string
}

export type DashboardAggregate = {
  totals: {
    mealsRedirected: number
    knownKilogramsDiverted: number
    kitchenPartners: number
    charityKitchens: number
    availableFood: number
    pickedUpDonationsMissingServings: number
    pickedUpDonationsMissingWeight: number
    pickedUpDonationsMissingPickupTime: number
  }
  weeklyImpact: DashboardWeeklyImpact[]
  recentActivity: DashboardActivity[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readNonNegativeNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`Dashboard response contains an invalid ${field}.`)
  }
  return value
}

function readCount(value: unknown, field: string): number {
  const count = readNonNegativeNumber(value, field)
  if (!Number.isInteger(count)) {
    throw new Error(`Dashboard response contains a non-integer ${field}.`)
  }
  return count
}

function readTimestamp(value: unknown, field: string): string {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new Error(`Dashboard response contains an invalid ${field}.`)
  }
  return value
}

function readActivityType(value: unknown): DashboardActivityType {
  if (
    value === 'listing_created' ||
    value === 'reservation_made' ||
    value === 'pickup_completed'
  ) {
    return value
  }
  throw new Error('Dashboard response contains an unsupported activity type.')
}

function parseDashboardAggregate(value: unknown): DashboardAggregate {
  if (!isRecord(value) || !isRecord(value.totals)) {
    throw new Error('Dashboard response is missing its totals.')
  }

  const totals = value.totals
  const parsedTotals: DashboardAggregate['totals'] = {
    mealsRedirected: readNonNegativeNumber(totals.mealsRedirected, 'mealsRedirected'),
    knownKilogramsDiverted: readNonNegativeNumber(
      totals.knownKilogramsDiverted,
      'knownKilogramsDiverted',
    ),
    kitchenPartners: readCount(totals.kitchenPartners, 'kitchenPartners'),
    charityKitchens: readCount(totals.charityKitchens, 'charityKitchens'),
    availableFood: readCount(totals.availableFood, 'availableFood'),
    pickedUpDonationsMissingServings: readCount(
      totals.pickedUpDonationsMissingServings,
      'pickedUpDonationsMissingServings',
    ),
    pickedUpDonationsMissingWeight: readCount(
      totals.pickedUpDonationsMissingWeight,
      'pickedUpDonationsMissingWeight',
    ),
    pickedUpDonationsMissingPickupTime: readCount(
      totals.pickedUpDonationsMissingPickupTime,
      'pickedUpDonationsMissingPickupTime',
    ),
  }

  if (!Array.isArray(value.weeklyImpact) || value.weeklyImpact.length !== 8) {
    throw new Error('Dashboard response must contain exactly 8 weekly records.')
  }

  const weeklyImpact = value.weeklyImpact.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Dashboard response contains an invalid weekly record at index ${index}.`)
    }

    return {
      weekStart: readTimestamp(item.weekStart, `weeklyImpact[${index}].weekStart`),
      meals: readNonNegativeNumber(item.meals, `weeklyImpact[${index}].meals`),
      knownKilograms: readNonNegativeNumber(
        item.knownKilograms,
        `weeklyImpact[${index}].knownKilograms`,
      ),
      pickups: readCount(item.pickups, `weeklyImpact[${index}].pickups`),
      pickupsMissingServings: readCount(
        item.pickupsMissingServings,
        `weeklyImpact[${index}].pickupsMissingServings`,
      ),
      pickupsMissingWeight: readCount(
        item.pickupsMissingWeight,
        `weeklyImpact[${index}].pickupsMissingWeight`,
      ),
    }
  })

  if (!Array.isArray(value.recentActivity) || value.recentActivity.length > 10) {
    throw new Error('Dashboard response contains an invalid recent activity list.')
  }

  const recentActivity = value.recentActivity.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Dashboard response contains an invalid activity at index ${index}.`)
    }
    if (item.donationTitle !== null && typeof item.donationTitle !== 'string') {
      throw new Error(`Dashboard response contains an invalid activity title at index ${index}.`)
    }

    return {
      type: readActivityType(item.type),
      occurredAt: readTimestamp(item.occurredAt, `recentActivity[${index}].occurredAt`),
    }
  })

  return { totals: parsedTotals, weeklyImpact, recentActivity }
}

export async function getDashboardAggregate(): Promise<DashboardAggregate> {
  const { data, error } = await supabase.rpc('get_dashboard_aggregate')

  if (error) {
    console.error('[dashboard] Aggregate RPC failed.', {
      code: error.code,
      message: error.message,
      hint: error.hint,
    })
    throw new Error(`Could not load dashboard data: ${error.message}`)
  }

  return parseDashboardAggregate(data)
}
