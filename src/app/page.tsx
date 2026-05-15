import Link from 'next/link'

const FEATURES = [
  { icon: '🎯', title: 'Precision Risk Calculator', desc: 'Every instrument. Every lot. Exact dollar risk before you click buy — grounded in the real Deriv MT5 spec.' },
  { icon: '📓', title: 'Trade Journal', desc: 'Log every trade with pre-calculated risk. Close it with actual P&L. The full picture, always.' },
  { icon: '📊', title: 'Risk Dashboard', desc: 'Win rate, average R:R, P&L curve, biggest loss — see your edge clearly.' },
  { icon: '🚨', title: 'Session Alerts', desc: 'Daily loss limit tracking. SynthGuard warns you at 50%, locks you out at 100%. No more blown sessions.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Nav */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-[#020617]/90 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-sm">
            S
          </div>
          <span className="font-bold text-lg tracking-tight">SynthGuard</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login"
            className="px-5 py-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Log in
          </Link>
          <Link href="/signup"
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-block px-4 py-1.5 bg-blue-950 border border-blue-500/30 rounded-full text-xs text-blue-300 font-semibold mb-8 tracking-widest uppercase">
          Synthetic Indices Risk Engine
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
          Trade Synthetic Indices.{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            No Surprises.
          </span>
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto mb-10">
          SynthGuard calculates your exact dollar risk before every trade, tracks your session in real time, and alerts you before you blow a limit. Built for Deriv MT5 synthetic indices.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/signup"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-bold text-base hover:opacity-90 transition-opacity">
            Create Free Account →
          </Link>
          <Link href="/login"
            className="px-8 py-4 border border-slate-800 rounded-xl text-slate-400 font-medium text-base hover:text-white transition-colors">
            Log in
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-lg mx-auto px-8 pb-20 flex justify-center gap-16">
        {[
          { value: '35+', label: 'Instruments' },
          { value: '5', label: 'Index families' },
          { value: '0', label: 'Surprise losses' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {s.value}
            </div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map(f => (
            <div key={f.title}
              className="bg-[#0f172a] border border-slate-800 rounded-2xl p-7 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-xl mx-auto px-8 pb-24 text-center">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-14">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">
            Ready to guard your account?
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Join traders who know their risk before every entry. Free to start.
          </p>
          <Link href="/signup"
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-bold text-base hover:opacity-90 transition-opacity inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-8 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} SynthGuard. Built for Deriv MT5 traders. Not affiliated with Deriv.
      </footer>

    </div>
  )
}