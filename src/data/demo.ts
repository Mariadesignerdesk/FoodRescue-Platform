/**
 * PHASE 1 DEMONSTRATION DATA
 *
 * These records exist only so the interface can be designed and reviewed.
 * They are not loaded from Supabase and are not persisted anywhere.
 * Phase 2 will replace this module with live database queries.
 */

import type {
  ActivityItem,
  Donation,
  Reservation,
  WeeklyImpact,
} from '../types/food'

export const DEMO_NOTICE =
  'Donation submissions and Browse listings use Supabase. Reservations, dashboard metrics, and other sections remain demonstration data.'

export const DEMO_CURRENT_DONOR = 'Harvest Table'

export const DEMO_DONATIONS: Donation[] = [
  {
    id: 'don-101',
    title: 'Sourdough loaves & morning rolls',
    description:
      'Same-day bakery surplus from the dawn bake. Soft inside, deep crust, packed while still fragrant.',
    category: 'bakery',
    quantity: 18,
    unit: 'loaves',
    servings: 54,
    donorName: 'Linden Bakery',
    donorType: 'bakery',
    location: '14 Chapel Street, Manchester',
    pickupWindow: 'Today, 6:00–7:30pm',
    expiresAt: '2026-10-31T21:00:00',
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=80',
    status: 'available',
    allergens: ['gluten'],
    createdAt: '2026-10-31T08:10:00',
  },
  {
    id: 'don-102',
    title: 'Crate of seasonal vegetables',
    description:
      'Heirloom tomatoes, chard and carrots that missed the evening service but are still kitchen-ready.',
    category: 'produce',
    quantity: 12,
    unit: 'kg',
    servings: 30,
    donorName: 'Harvest Table',
    donorType: 'restaurant',
    location: '88 Deansgate, Manchester',
    pickupWindow: 'Today, 8:30–9:30pm',
    expiresAt: '2026-11-02T12:00:00',
    imageUrl:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
    status: 'available',
    allergens: [],
    createdAt: '2026-10-31T14:20:00',
  },
  {
    id: 'don-103',
    title: 'Herb-roasted vegetable trays',
    description:
      'Family-style trays of roasted roots, herbs and olive oil from tonight’s cancelled private dining.',
    category: 'prepared',
    quantity: 6,
    unit: 'trays',
    servings: 48,
    donorName: 'Oak & Ember',
    donorType: 'restaurant',
    location: '2 Northern Quarter, Manchester',
    pickupWindow: 'Today, 9:00–10:00pm',
    expiresAt: '2026-11-01T12:00:00',
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=80',
    status: 'reserved',
    reservedBy: 'Riverside Kitchen',
    allergens: [],
    createdAt: '2026-10-31T16:05:00',
  },
  {
    id: 'don-104',
    title: 'Yoghurt pots nearing best-before',
    description:
      'Chilled dairy still well within safe use. Ideal for breakfast programmes and family parcels.',
    category: 'dairy',
    quantity: 40,
    unit: 'pots',
    servings: 40,
    donorName: 'Sunrise Market',
    donorType: 'grocery',
    location: '21 Oxford Road, Manchester',
    pickupWindow: 'Tomorrow, 8:00–10:00am',
    expiresAt: '2026-11-04T09:00:00',
    imageUrl:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1400&q=80',
    status: 'available',
    allergens: ['milk'],
    createdAt: '2026-10-31T11:40:00',
  },
  {
    id: 'don-105',
    title: 'Pastry assortment from the afternoon bake',
    description:
      'Croissants, fruit danishes and almond twists boxed for same-evening collection.',
    category: 'bakery',
    quantity: 36,
    unit: 'pastries',
    servings: 36,
    donorName: 'Linden Bakery',
    donorType: 'bakery',
    location: '14 Chapel Street, Manchester',
    pickupWindow: 'Today, 5:30–6:45pm',
    expiresAt: '2026-10-31T20:00:00',
    imageUrl:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1400&q=80',
    status: 'available',
    allergens: ['gluten', 'milk', 'eggs'],
    createdAt: '2026-10-31T13:15:00',
  },
  {
    id: 'don-106',
    title: 'Grocery surplus: rice, pasta & tins',
    description:
      'Outer packaging scuffed, contents perfect. A ready pantry lift for community kitchens.',
    category: 'grocery',
    quantity: 22,
    unit: 'items',
    servings: 80,
    donorName: 'Green Grocer',
    donorType: 'grocery',
    location: '5 Ancoats Works, Manchester',
    pickupWindow: 'Tomorrow, 11:00am–1:00pm',
    expiresAt: '2026-12-01T00:00:00',
    imageUrl:
      'https://images.unsplash.com/photo-1534723452862-4c83385c8e8c?auto=format&fit=crop&w=1400&q=80',
    status: 'available',
    allergens: ['gluten'],
    createdAt: '2026-10-30T17:00:00',
  },
  {
    id: 'don-107',
    title: 'Citrus & orchard fruit boxes',
    description:
      'Slightly uneven sizing that never made the display table. Bright, ripe and ready to share.',
    category: 'produce',
    quantity: 8,
    unit: 'boxes',
    servings: 64,
    donorName: 'Sunrise Market',
    donorType: 'grocery',
    location: '21 Oxford Road, Manchester',
    pickupWindow: 'Tomorrow, 7:30–9:00am',
    expiresAt: '2026-11-05T18:00:00',
    imageUrl:
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1400&q=80',
    status: 'collected',
    reservedBy: 'Hope Pantry',
    allergens: [],
    createdAt: '2026-10-29T09:00:00',
  },
  {
    id: 'don-108',
    title: 'House broth & barley soup',
    description:
      'Slow-simmered broth sealed in trays. Warm, filling meals for an evening service.',
    category: 'prepared',
    quantity: 10,
    unit: 'litres',
    servings: 28,
    donorName: 'Harvest Table',
    donorType: 'restaurant',
    location: '88 Deansgate, Manchester',
    pickupWindow: 'Yesterday, 9:00pm',
    expiresAt: '2026-10-30T22:00:00',
    imageUrl:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1400&q=80',
    status: 'expired',
    allergens: ['gluten'],
    createdAt: '2026-10-30T18:30:00',
  },
  {
    id: 'don-109',
    title: 'Leafy salad mixes',
    description:
      'Peppery rocket and mixed leaves packed on ice. Best collected before close of business.',
    category: 'produce',
    quantity: 9,
    unit: 'bags',
    servings: 27,
    donorName: 'Green Grocer',
    donorType: 'grocery',
    location: '5 Ancoats Works, Manchester',
    pickupWindow: 'Today, 4:00–5:30pm',
    expiresAt: '2026-11-01T10:00:00',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80',
    status: 'reserved',
    reservedBy: 'Hope Pantry',
    allergens: [],
    createdAt: '2026-10-31T10:05:00',
  },
  {
    id: 'don-110',
    title: 'Flat whites’ leftover oat milk',
    description:
      'Unopened oat and dairy cartons from the café close. Chilled and labelled.',
    category: 'dairy',
    quantity: 14,
    unit: 'cartons',
    servings: 56,
    donorName: 'Oak & Ember',
    donorType: 'cafe',
    location: '2 Northern Quarter, Manchester',
    pickupWindow: 'Today, 7:00–8:00pm',
    expiresAt: '2026-11-06T08:00:00',
    imageUrl:
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1400&q=80',
    status: 'available',
    allergens: ['milk'],
    createdAt: '2026-10-31T15:50:00',
  },
]

export const DEMO_RESERVATIONS: Reservation[] = [
  {
    id: 'res-201',
    donationId: 'don-103',
    charityName: 'Riverside Kitchen',
    status: 'confirmed',
    reservedAt: '2026-10-31T16:40:00',
    pickupNote: 'Van arriving at the kitchen door on Spear Street.',
  },
  {
    id: 'res-202',
    donationId: 'don-109',
    charityName: 'Hope Pantry',
    status: 'pending',
    reservedAt: '2026-10-31T11:12:00',
    pickupNote: 'Please keep bags on ice until 5pm.',
  },
  {
    id: 'res-203',
    donationId: 'don-107',
    charityName: 'Hope Pantry',
    status: 'collected',
    reservedAt: '2026-10-29T12:00:00',
    pickupNote: 'Collected by morning shift.',
  },
]

export const DEMO_WEEKLY_IMPACT: WeeklyImpact[] = [
  { week: 'Sep 28', meals: 86, kg: 34 },
  { week: 'Oct 5', meals: 112, kg: 41 },
  { week: 'Oct 12', meals: 98, kg: 37 },
  { week: 'Oct 19', meals: 141, kg: 52 },
  { week: 'Oct 26', meals: 168, kg: 61 },
]

export const DEMO_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    label: 'Linden Bakery listed surplus bread',
    detail: '18 loaves · Chapel Street',
    time: '2 hours ago',
    tone: 'rescue',
  },
  {
    id: 'act-2',
    label: 'Riverside Kitchen reserved roasted trays',
    detail: 'Oak & Ember · 48 servings',
    time: '3 hours ago',
    tone: 'reserve',
  },
  {
    id: 'act-3',
    label: 'Hope Pantry collected orchard fruit',
    detail: 'Sunrise Market · 8 boxes',
    time: 'Yesterday',
    tone: 'collect',
  },
  {
    id: 'act-4',
    label: 'Harvest Table posted vegetable crates',
    detail: '12 kg · Deansgate',
    time: 'Yesterday',
    tone: 'rescue',
  },
]

export const DEMO_IMPACT_STATS = {
  meals: 12840,
  kgDiverted: 4120,
  partners: 64,
  charities: 19,
}
