import { ArrowRight, Leaf } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { AccountRole } from '../context/authContext'

type AuthMode = 'sign-in' | 'sign-up'
type FormErrors = Partial<Record<'email' | 'password' | 'fullName' | 'organizationName', string>>

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export function AuthPage() {
  const { signIn, signUp, loading, initializationError } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [role, setRole] = useState<AccountRole>('donor')
  const [errors, setErrors] = useState<FormErrors>({})
  const [requestError, setRequestError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setErrors({})
    setRequestError(null)
    setSuccess(null)
  }

  function validate() {
    const nextErrors: FormErrors = {}
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!password) {
      nextErrors.password = 'Enter your password.'
    } else if (mode === 'sign-up' && password.length < 8) {
      nextErrors.password = 'Use at least 8 characters for your password.'
    }
    if (mode === 'sign-up' && fullName.trim().length < 2) {
      nextErrors.fullName = 'Enter your full name.'
    }
    if (mode === 'sign-up' && role === 'donor' && organizationName.trim().length < 2) {
      nextErrors.organizationName = 'Enter your organization name.'
    }
    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setRequestError(null)
    setSuccess(null)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      if (mode === 'sign-up') {
        const hasSession = await signUp({
          email,
          password,
          fullName,
          organizationName,
          role,
        })
        if (hasSession) {
          navigate('/dashboard', { replace: true })
        } else {
          setSuccess('Account created. Check your email to confirm your address, then sign in.')
        }
      } else {
        await signIn(email, password)
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      setRequestError(errorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-cream px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-forest/10 bg-white shadow-[0_24px_70px_rgba(23,61,49,0.09)] lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-forest-deep p-10 text-cream lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(232,155,85,0.22),transparent_45%),radial-gradient(ellipse_at_90%_80%,rgba(61,107,88,0.55),transparent_50%)]" />
          <div className="relative">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-cream text-forest">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.24em] text-harvest">
              Good food deserves a second chance
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05]">
              Make a little more room at the table.
            </h1>
          </div>
          <p className="relative max-w-sm text-sm leading-7 text-cream/70">
            Join the community connecting surplus food with the people who need it.
          </p>
        </aside>

        <section className="p-6 sm:p-10 lg:p-12">
          <Link to="/" className="font-display text-xl text-forest">
            FoodRescue
          </Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-harvest-deep">
            {mode === 'sign-up' ? 'Join the network' : 'Welcome back'}
          </p>
          <h2 className="mt-2 font-display text-4xl text-forest">
            {mode === 'sign-up' ? 'Create your account' : 'Sign in'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-forest/65">
            {mode === 'sign-up'
              ? 'Tell us a little about you and your organization.'
              : 'Sign in to your FoodRescue account.'}
          </p>

          {initializationError ? (
            <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              We could not restore your sign-in session: {initializationError}
            </p>
          ) : null}
          {requestError ? (
            <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {requestError}
            </p>
          ) : null}
          {success ? (
            <p className="mt-5 rounded-2xl border border-forest/10 bg-sage px-4 py-3 text-sm text-forest" role="status">
              {success}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            {mode === 'sign-up' ? (
              <>
                <AuthField
                  label="Full name"
                  error={errors.fullName}
                  value={fullName}
                  onChange={setFullName}
                  autoComplete="name"
                />
                <AuthField
                  label={role === 'receiver' ? 'Organization name (optional)' : 'Organization name'}
                  error={errors.organizationName}
                  value={organizationName}
                  onChange={setOrganizationName}
                  autoComplete="organization"
                />
                <fieldset>
                  <legend className="text-sm font-semibold text-forest">I am joining as a</legend>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {([
                      ['donor', 'Donor', 'Share surplus food'],
                      ['receiver', 'Receiver', 'Find food for a community'],
                    ] as const).map(([value, label, description]) => (
                      <label
                        key={value}
                        className={`cursor-pointer rounded-2xl border p-3 transition ${
                          role === value
                            ? 'border-forest bg-sage'
                            : 'border-forest/15 bg-cream hover:border-forest/35'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={value}
                          checked={role === value}
                          onChange={() => setRole(value)}
                          className="sr-only"
                        />
                        <span className="block text-sm font-semibold text-forest">{label}</span>
                        <span className="mt-1 block text-xs leading-5 text-forest/65">
                          {description}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            ) : null}

            <AuthField
              label="Email address"
              type="email"
              error={errors.email}
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <AuthField
              label="Password"
              type="password"
              error={errors.password}
              value={password}
              onChange={setPassword}
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            />

            <button
              type="submit"
              disabled={submitting || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 font-semibold text-cream transition hover:bg-forest-deep disabled:cursor-wait disabled:border disabled:border-forest/20 disabled:bg-sage disabled:text-forest"
            >
              {submitting || loading
                ? 'Please wait…'
                : mode === 'sign-up'
                  ? 'Create account'
                  : 'Sign in'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-forest/65">
            {mode === 'sign-up' ? 'Already have an account?' : 'New to FoodRescue?'}{' '}
            <button
              type="button"
              onClick={() => changeMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}
              className="font-semibold text-forest underline underline-offset-4"
            >
              {mode === 'sign-up' ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </section>
      </div>
    </main>
  )
}

function AuthField({
  label,
  type = 'text',
  error,
  value,
  onChange,
  autoComplete,
}: {
  label: string
  type?: string
  error?: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
}) {
  const id = label.toLowerCase().replaceAll(' ', '-')
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-forest">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="mt-1 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-3 text-sm text-forest"
      />
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
