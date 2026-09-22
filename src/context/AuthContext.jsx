import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// 1) Create an empty "shared box" other components can read from
const AuthContext = createContext(null)

// const STORAGE_KEY = 'resolveai_user'

// Read saved user from browser storage (or null if none)
// function readStoredUser() {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY)
//     return raw ? JSON.parse(raw) : null
//   } catch {
//     return null
//   }
// }

/**
 * AuthProvider = the component that OWNS the user data
 * and shares it with every child underneath.
 *
 * Think: school ID office.
 * - login  = issue ID card + keep a copy in the drawer (localStorage)
 * - logout = take ID card back + empty the drawer
 * - user   = who is holding an ID right now
 */
export function AuthProvider({ children }) {
  // Start from whatever was saved last time (so refresh keeps you logged in)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, []) // empty dependency array means run once on mount)

  

  // function login(email) {
  //   const nextUser = { email: email.trim().toLowerCase() }
  //   localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser)) // save for refresh
  //   setUser(nextUser) // update React memory → UI re-renders
  // }

  // function logout() {
  //   localStorage.removeItem(STORAGE_KEY)
  //   setUser(null)
  // }

  async function login(email,password){
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw error
    }
    return data.user
  }
  async function logout(){
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    return null
  }
  // Everything inside Provider can call useAuth() to get this object
  const value = { user, login, logout,loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth = easy way for any page to open the shared box
 * Example: const { user, login, logout } = useAuth()
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}

