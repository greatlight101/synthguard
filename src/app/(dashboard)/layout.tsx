import SessionAlert from '@/components/SessionAlert'
import SignOutButton from '@/components/SignOutButton'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard',  label: 'Overview',   icon: '▦' },
  { href: '/calculator', label: 'Calculator', icon: '⊕' },
  { href: '/journal',    label: 'Journal',    icon: '◉' },
  { href: '/settings',   label: 'Settings',   icon: '◎' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#020617] flex">

      {/* Sidebar */}
      <aside className="w-56 bg-[#0f172a] border-r border-slate-800 fixed top-0 left-0 bottom-0 flex flex-col z-40">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="text-white font-bold text-base tracking-tight">
              SynthGuard
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium"
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* User info + signout */}
        <div className="px-4 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 mb-1">Signed in as</p>
          <p className="text-xs text-slate-400 truncate mb-3">{user.email}</p>
          <SignOutButton />
        </div>

      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 min-h-screen">
        <SessionAlert userId={user.id} />
        <div className="p-8">
          {children}
        </div>
      </main>

    </div>
  )
}