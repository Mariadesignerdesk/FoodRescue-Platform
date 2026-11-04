import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import {
  AuthContext,
  type AuthContextValue,
  type SignUpDetails,
} from './authContext'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to restore your session.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializationError, setInitializationError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let receivedAuthEvent = false

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      receivedAuthEvent = true
      setSession(nextSession)
      setInitializationError(null)
      setLoading(false)
    })

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setInitializationError(error.message)
          setSession(null)
        } else if (!receivedAuthEvent) {
          setSession(data.session)
          setInitializationError(null)
        }
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (!active) return
        setInitializationError(getErrorMessage(error))
        setSession(null)
        setLoading(false)
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      initializationError,
      signUp: async (details: SignUpDetails) => {
        const { data, error } = await supabase.auth.signUp({
          email: details.email.trim(),
          password: details.password,
          options: {
            data: {
              full_name: details.fullName.trim(),
              organization_name: details.organizationName.trim(),
              role: details.role,
            },
          },
        })
        if (error) throw error
        return data.session !== null
      },
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      },
    }),
    [session, loading, initializationError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
