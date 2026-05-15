'use client'

import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
    >
      Sign out →
    </button>
  )
}