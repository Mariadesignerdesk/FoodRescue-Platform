import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import {
  createDonation,
  removeDonationImage,
  uploadDonationImage,
  type CreatedDonation,
  type UploadedDonationImage,
} from '../lib/donations'
import {
  CATEGORY_LABELS,
  type DonationCategory,
  type DonorType,
} from '../types/food'

type FormState = {
  title: string
  description: string
  category: DonationCategory | ''
  quantity: string
  weightKg: string
  unit: string
  servings: string
  donorType: DonorType | ''
  location: string
  pickupTime: string
  allergens: string
}

const emptyForm: FormState = {
  title: '',
  description: '',
  category: '',
  quantity: '',
  weightKg: '',
  unit: 'trays',
  servings: '',
  donorType: 'restaurant',
  location: '',
  pickupTime: '',
  allergens: '',
}

type FormErrors = Partial<Record<keyof FormState | 'image', string>>
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxImageSize = 5 * 1024 * 1024

function validate(form: FormState, image: File | null): FormErrors {
  const errors: FormErrors = {}
  if (form.title.trim().length < 3) errors.title = 'Add a title of at least 3 characters.'
  if (form.description.trim().length < 12) {
    errors.description = 'Describe the food in at least 12 characters.'
  }
  if (!form.category) errors.category = 'Choose a category.'
  if (!form.donorType) errors.donorType = 'Choose a donor type.'
  const quantity = Number(form.quantity)
  if (!Number.isFinite(quantity) || quantity <= 0) errors.quantity = 'Quantity must be greater than 0.'
  if (form.weightKg.trim()) {
    const weightKg = Number(form.weightKg)
    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      errors.weightKg = 'Weight must be greater than 0 kg.'
    }
  }
  if (!form.unit.trim()) errors.unit = 'Add a unit, such as trays or loaves.'
  const servings = Number(form.servings)
  if (!Number.isFinite(servings) || servings <= 0) errors.servings = 'Servings must be greater than 0.'
  if (form.location.trim().length < 5) errors.location = 'Add a pickup location.'
  const pickupTime = new Date(form.pickupTime)
  if (!form.pickupTime || Number.isNaN(pickupTime.getTime())) {
    errors.pickupTime = 'Choose a valid pickup availability date and time.'
  } else if (pickupTime.getTime() <= Date.now()) {
    errors.pickupTime = 'Pickup availability must end in the future.'
  }
  if (!image) {
    errors.image = 'Choose a JPEG, PNG, or WebP image to continue.'
  } else if (!allowedImageTypes.includes(image.type)) {
    errors.image = 'Choose a JPEG, PNG, or WebP image.'
  } else if (image.size > maxImageSize) {
    errors.image = 'The image must be 5 MB or smaller.'
  }
  return errors
}

export function DonatePage() {
  const {
    user,
    loading: authLoading,
    initializationError,
  } = useAuth()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<CreatedDonation | null>(null)
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'checking' | 'uploading' | 'saving'
  >('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const validationMessages = Object.values(errors).filter(
    (message): message is string => Boolean(message),
  )
  const minimumPickupTime = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }, [])

  const field = useMemo(
    () =>
      <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((current) => ({ ...current, [key]: value }))
        setErrors((current) => ({ ...current, [key]: undefined }))
        setSubmitError(null)
        setSubmissionStatus('idle')
      },
    [],
  )

  function handleImageChange(file: File | null) {
    if (!file) return

    setSubmitError(null)
    setSubmissionStatus('idle')
    if (!allowedImageTypes.includes(file.type)) {
      setSelectedImage(null)
      setPreviewUrl(null)
      setErrors((current) => ({ ...current, image: 'Choose a JPEG, PNG, or WebP image.' }))
      if (imageInputRef.current) imageInputRef.current.value = ''
      return
    }
    if (file.size > maxImageSize) {
      setSelectedImage(null)
      setPreviewUrl(null)
      setErrors((current) => ({ ...current, image: 'The image must be 5 MB or smaller.' }))
      if (imageInputRef.current) imageInputRef.current.value = ''
      return
    }

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setImagePreviewFailed(false)
    setErrors((current) => ({ ...current, image: undefined }))
  }

  function removeSelectedImage() {
    setSelectedImage(null)
    setPreviewUrl(null)
    setImagePreviewFailed(false)
    setErrors((current) => ({ ...current, image: undefined }))
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    setSubmitError(null)
    setSubmissionStatus('checking')
    console.info('[DonatePage] Submit handler entered', {
      authenticationLoading: authLoading,
      hasAuthenticatedUser: Boolean(user),
    })
    if (authLoading) {
      console.warn('[DonatePage] Submission stopped while restoring the auth session.')
      setSubmitError('Your sign-in session is still being restored. Please try again shortly.')
      setSubmissionStatus('idle')
      return
    }
    if (!user?.id) {
      console.warn('[DonatePage] Submission stopped because no authenticated user is available.')
      setSubmitError('Sign in before creating a donation.')
      setSubmissionStatus('idle')
      return
    }

    const nextErrors = validate(form, selectedImage)
    setErrors(nextErrors)
    const invalidFields = Object.keys(nextErrors)
    if (invalidFields.length > 0 || !form.category || !selectedImage) {
      console.warn('[DonatePage] Submission stopped by validation.', {
        fields: invalidFields,
      })
      setSubmissionStatus('idle')
      return
    }

    setSubmitting(true)
    setSubmissionStatus('uploading')
    let uploadedImage: UploadedDonationImage | null = null
    try {
      uploadedImage = await uploadDonationImage(selectedImage, user.id)
      setSubmissionStatus('saving')
      const pickupTime = new Date(form.pickupTime)
      const pickupTimeIso = pickupTime.toISOString()
      console.info('[DonatePage] Calling donation insert.', {
        authenticatedUserIdPresent: Boolean(user.id),
      })
      const donation = await createDonation({
        donor_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        quantity: Number(form.quantity),
        weight_kg: form.weightKg.trim() ? Number(form.weightKg) : null,
        unit: form.unit.trim(),
        servings: Number(form.servings),
        pickup_location: form.location.trim(),
        pickup_time: pickupTimeIso,
        image_url: uploadedImage.publicUrl,
        status: 'available',
      })
      setSubmitted(donation)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not save this donation. Please try again.'
      let finalMessage = message
      if (uploadedImage) {
        try {
          await removeDonationImage(uploadedImage.path)
        } catch (cleanupError) {
          const cleanupMessage =
            cleanupError instanceof Error
              ? cleanupError.message
              : 'The uploaded image could not be removed automatically.'
          console.error('[DonatePage] Uploaded image cleanup failed after donation error.', {
            message: cleanupMessage,
          })
          finalMessage = `${message} ${cleanupMessage}`
        }
      }
      console.error('[DonatePage] Donation submission failed.', { message })
      setSubmitError(finalMessage)
    } finally {
      setSubmitting(false)
      setSubmissionStatus('idle')
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-harvest-deep">
          Donation saved
        </p>
        <h1 className="mt-2 font-display text-4xl text-forest">Your donation is saved</h1>
        <p className="mt-3 text-forest/70">
          Supabase confirmed “{submitted.title}” for your account. You can view your
          saved listing in My Donations.
        </p>
        <img
          src={submitted.image_url}
          alt=""
          className="mt-8 h-64 w-full rounded-[2rem] object-cover"
        />
        <button
          type="button"
          className="mt-6 rounded-full bg-forest px-5 py-3 font-semibold text-cream transition hover:bg-forest-deep"
          onClick={() => {
            setSubmitted(null)
            setForm(emptyForm)
            setSelectedImage(null)
            setPreviewUrl(null)
            if (imageInputRef.current) imageInputRef.current.value = ''
            setErrors({})
            setSubmitError(null)
          }}
        >
          List another donation
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-harvest-deep">
        Give surplus a second sitting
      </p>
      <h1 className="mt-2 font-display text-4xl text-forest sm:text-5xl">Donate food</h1>
      <p className="mt-3 max-w-2xl text-forest/70">
        Describe what you can share. New donations are saved to your account after
        successful submission.
      </p>

      {authLoading ? (
        <p className="mt-5 rounded-2xl bg-sage px-4 py-3 text-sm text-forest" role="status">
          Checking your sign-in session…
        </p>
      ) : initializationError ? (
        <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          We could not restore your sign-in session: {initializationError}
        </p>
      ) : !user ? (
        <p className="mt-5 rounded-2xl bg-sage px-4 py-3 text-sm text-forest">
          Sign in to create a donation.{' '}
          <Link to="/auth" className="font-semibold underline underline-offset-4">
            Sign in or create an account
          </Link>
        </p>
      ) : null}
      {submitError ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {submitError}
        </p>
      ) : null}
      {submissionStatus !== 'idle' ? (
        <p className="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm text-forest" role="status" aria-live="polite">
          {submissionStatus === 'checking'
            ? 'Checking your donation details…'
            : submissionStatus === 'uploading'
              ? 'Uploading your image…'
              : 'Saving your donation to FoodRescue…'}
        </p>
      ) : null}
      {validationMessages.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          <p className="font-semibold">Please correct these fields before saving:</p>
          <ul className="mt-1 list-inside list-disc">
            {validationMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[1.8rem] border border-forest/8 bg-white p-5 sm:p-7"
        >
          <Field label="Title" error={errors.title}>
            <input
              value={form.title}
              onChange={(event) => field('title', event.target.value)}
              className={inputClass}
              placeholder="Herb-roasted vegetable trays"
            />
          </Field>
          <Field label="Description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(event) => field('description', event.target.value)}
              className={`${inputClass} min-h-28`}
              placeholder="What is it, how was it held, and who would it feed?"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors.category}>
              <select
                value={form.category}
                onChange={(event) => field('category', event.target.value as DonationCategory | '')}
                className={inputClass}
              >
                <option value="">Select category</option>
                {(Object.keys(CATEGORY_LABELS) as DonationCategory[]).map((key) => (
                  <option key={key} value={key}>
                    {CATEGORY_LABELS[key]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Donor type" error={errors.donorType}>
              <select
                value={form.donorType}
                onChange={(event) => field('donorType', event.target.value as DonorType | '')}
                className={inputClass}
              >
                <option value="restaurant">Restaurant</option>
                <option value="bakery">Bakery</option>
                <option value="grocery">Grocery</option>
                <option value="cafe">Café</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Quantity" error={errors.quantity}>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) => field('quantity', event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Unit" error={errors.unit}>
              <input
                value={form.unit}
                onChange={(event) => field('unit', event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Servings" error={errors.servings}>
              <input
                type="number"
                min="1"
                value={form.servings}
                onChange={(event) => field('servings', event.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Weight (kg, optional)" error={errors.weightKg}>
            <input
              type="number"
              min="0"
              step="any"
              value={form.weightKg}
              onChange={(event) => field('weightKg', event.target.value)}
              className={inputClass}
              placeholder="e.g. 2.5"
            />
          </Field>
          <Field label="Pickup location" error={errors.location}>
            <input
              value={form.location}
              onChange={(event) => field('location', event.target.value)}
              className={inputClass}
              placeholder="88 Deansgate, Manchester"
            />
          </Field>
          <Field label="Pickup available until" error={errors.pickupTime}>
            <input
              type="datetime-local"
              min={minimumPickupTime}
              value={form.pickupTime}
              onChange={(event) => field('pickupTime', event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Donation image (required)" error={errors.image}>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => handleImageChange(event.currentTarget.files?.[0] ?? null)}
              className={inputClass}
            />
          </Field>
          <p className="-mt-3 mb-4 text-xs text-forest/60">
            JPEG, PNG, or WebP · maximum 5 MB
          </p>
          {selectedImage ? (
            <div className="-mt-2 mb-4 flex items-center justify-between gap-3 text-sm text-forest">
              <span className="min-w-0 truncate">{selectedImage.name}</span>
              <button
                type="button"
                onClick={removeSelectedImage}
                disabled={submitting}
                className="shrink-0 font-semibold text-forest underline underline-offset-2 transition hover:text-forest-deep disabled:cursor-not-allowed disabled:text-forest"
              >
                Remove image
              </button>
            </div>
          ) : null}
          <Field label="Allergens (comma separated)">
            <input
              value={form.allergens}
              onChange={(event) => field('allergens', event.target.value)}
              className={inputClass}
              placeholder="gluten, milk"
            />
          </Field>
          <button
            type="submit"
            disabled={submitting || authLoading}
            className="mt-2 w-full rounded-full bg-forest py-3 font-semibold text-cream transition hover:bg-forest-deep disabled:cursor-not-allowed disabled:border disabled:border-forest/20 disabled:bg-sage disabled:text-forest"
          >
            {authLoading
              ? 'Checking sign-in…'
              : submitting
                ? submissionStatus === 'uploading'
                  ? 'Uploading image…'
                  : 'Saving donation…'
                : user
                  ? 'Save donation'
                  : 'Sign in to save donation'}
          </button>
        </form>

        <aside className="rounded-[1.8rem] bg-sage p-5 sm:p-7">
          <h2 className="font-display text-2xl text-forest">Image preview</h2>
          <p className="mt-2 text-sm text-forest/70">
            Preview the image selected for your listing.
          </p>
          <div className="mt-5 overflow-hidden rounded-[1.5rem] bg-white">
            {previewUrl && !imagePreviewFailed ? (
              <img
                src={previewUrl}
                alt="Donation preview"
                className="h-64 w-full object-cover"
                onError={() => setImagePreviewFailed(true)}
              />
            ) : (
              <div className="grid h-64 place-items-center px-6 text-center text-sm text-forest/55">
                {imagePreviewFailed
                  ? 'This file could not be previewed. Choose another image.'
                  : 'Your selected image preview will appear here.'}
              </div>
            )}
          </div>
          <p className="mt-5 text-xs leading-5 text-forest/60">
            This donation will be associated with your signed-in account. Donor type
            and allergen fields are not stored because the current donations table
            has no corresponding columns.
          </p>
        </aside>
      </div>
    </div>
  )
}

const inputClass =
  'mt-1 w-full rounded-2xl border border-forest/15 bg-cream px-4 py-2.5 text-sm text-forest'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="mb-4 block text-sm font-medium text-forest">
      {label}
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-normal text-red-700" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}
