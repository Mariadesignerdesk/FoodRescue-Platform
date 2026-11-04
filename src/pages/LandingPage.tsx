import {
  ArrowRight,
  Building2,
  HeartHandshake,
  Leaf,
  Recycle,
  TimerReset,
  Utensils,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'
import { Navbar } from '../components/layout/Navbar'
import { DEMO_DONATIONS, DEMO_IMPACT_STATS } from '../data/demo'

const steps = [
  {
    title: 'Kitchens list surplus',
    copy: 'Restaurants, bakeries and grocers post what they cannot sell before close.',
    icon: Utensils,
  },
  {
    title: 'Charities reserve in minutes',
    copy: 'Nearby organisations claim trays, crates and bakery boxes while they are still beautiful.',
    icon: TimerReset,
  },
  {
    title: 'Meals reach people, not bins',
    copy: 'Collections happen the same evening. Impact is counted in meals, not landfill.',
    icon: Recycle,
  },
]

export function LandingPage() {
  const featured = DEMO_DONATIONS.filter((item) => item.status === 'available').slice(0, 3)

  return (
    <div className="bg-cream">
      <Navbar />
      <main>
        <section className="relative isolate min-h-[88vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80"
            alt="A candlelit restaurant table with plates of seasonal food"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/80 to-forest/20" />
          <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 py-16 sm:px-6 lg:justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-harvest">
              Good food deserves a second chance
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] text-cream sm:text-6xl lg:text-7xl">
              Surplus from the city’s best kitchens, rescued before nightfall.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-cream/80">
              FoodRescue is a quiet network between restaurants, bakeries, grocers
              and charities. Beautiful food stays in circulation. Waste never gets
              the last word.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/browse"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-harvest px-6 py-3 font-semibold text-forest-deep"
              >
                Browse available food
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/donate"
                className="inline-flex items-center justify-center rounded-full border border-cream/30 px-6 py-3 font-semibold text-cream"
              >
                List a donation
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-forest text-cream">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
            <Stat value={`${(DEMO_IMPACT_STATS.meals / 1000).toFixed(1)}k`} label="Meals redirected" />
            <Stat value={`${DEMO_IMPACT_STATS.kgDiverted.toLocaleString()}kg`} label="Food diverted" />
            <Stat value={`${DEMO_IMPACT_STATS.partners}`} label="Kitchen partners" />
            <Stat value={`${DEMO_IMPACT_STATS.charities}`} label="Charity kitchens" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-harvest-deep">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl text-forest sm:text-5xl">
            A graceful loop from close of service to community table.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <article
                  key={step.title}
                  className="rounded-[2rem] border border-forest/10 bg-white p-7 shadow-[0_20px_50px_rgba(23,61,49,0.05)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-sage text-forest">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-4xl text-forest/15">0{index + 1}</span>
                  </div>
                  <h3 className="mt-8 font-display text-2xl text-forest">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-forest/70">{step.copy}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="bg-sage/70 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-harvest-deep">
                  Tonight’s surplus
                </p>
                <h2 className="mt-3 font-display text-4xl text-forest">
                  Food still worth celebrating.
                </h2>
              </div>
              <Link to="/browse" className="text-sm font-semibold text-forest underline-offset-4 hover:underline">
                See the full table
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {featured.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-[2rem] bg-white">
                  <img src={item.imageUrl} alt="" className="h-56 w-full object-cover" />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-moss">{item.donorName}</p>
                    <h3 className="mt-2 font-display text-2xl text-forest">{item.title}</h3>
                    <p className="mt-2 text-sm text-forest/70">{item.pickupWindow}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-[2.2rem] bg-forest text-cream">
            <img
              src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1400&q=80"
              alt="Restaurant kitchen pass"
              className="h-64 w-full object-cover opacity-90"
            />
            <div className="p-8">
              <Building2 className="h-6 w-6 text-harvest" />
              <h2 className="mt-4 font-display text-3xl">For donors</h2>
              <p className="mt-3 text-sm leading-7 text-cream/75">
                Turn unsold trays, bakery boards and grocery crates into a last
                elegant service. List in minutes. Charities collect at your door.
              </p>
              <Link to="/donate" className="mt-6 inline-flex font-semibold text-harvest">
                Post surplus food
              </Link>
            </div>
          </article>
          <article className="overflow-hidden rounded-[2.2rem] border border-forest/10 bg-white">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=80"
              alt="Community meal being served"
              className="h-64 w-full object-cover"
            />
            <div className="p-8">
              <HeartHandshake className="h-6 w-6 text-harvest-deep" />
              <h2 className="mt-4 font-display text-3xl text-forest">For charities</h2>
              <p className="mt-3 text-sm leading-7 text-forest/70">
                Browse what kitchens cannot keep. Reserve with a tap. Feed more
                people without stretching a procurement budget.
              </p>
              <Link to="/browse" className="mt-6 inline-flex font-semibold text-forest">
                Browse listings
              </Link>
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="rounded-[2.2rem] bg-white p-8 sm:p-12">
            <Leaf className="h-6 w-6 text-harvest-deep" />
            <blockquote className="mt-6 max-w-3xl font-display text-3xl leading-snug text-forest sm:text-4xl">
              “We used to bin the evening bake. Now Hope Pantry collects it warm,
              and our waste ledger finally looks like our values.”
            </blockquote>
            <p className="mt-6 text-sm text-forest/60">Linden Bakery · Chapel Street · demonstration quote</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-cream/70">{label}</p>
    </div>
  )
}
