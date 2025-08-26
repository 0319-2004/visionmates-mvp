'use client'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function AuthButton() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  const signIn = async () => {
    // Magic link (email) sign in prompt
    const email = prompt('Email to sign-in (magic link)')
    if (!email) return
    await supabase.auth.signInWithOtp({ email })
    alert('Check your email for the magic link.')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/70">{user.email}</span>
        <button className="btn" onClick={signOut}>Sign out</button>
      </div>
    )
  }
  return <button className="btn" onClick={signIn}>Sign in</button>
}
