import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AccountRole = 'donor' | 'receiver'

export type SignUpDetails = {
  email: string
  password: string
  fullName: string
  organizationName: string
  role: AccountRole
}

export type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  initializationError: string | null
  signUp: (details: SignUpDetails) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
