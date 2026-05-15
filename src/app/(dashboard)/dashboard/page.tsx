import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const closed = trades?.filter(t =>
    ['WIN','LOSS','BREAKEVEN'].includes(t.status)
  ) ?? []

  const totalPnl = closed.reduce((s, t) => s + (t.actual_pnl || 0), 0)
  const wins = closed.filter(t => t.status === 'WIN').length
  const winRate = closed.length > 0
    ? ((wins / closed.length) * 100).toFixed(1)
    : null

  const STATS = [
    {
      label: 'Account Balance',
      value: `$${(profile?.account_balance || 0).toFixed(2)}`,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
      top: 'bg-blue-500',
    },
    {
      label: 'Total P&L',
      value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`,
      color: totalPnl >= 0 ? 'text-green-400' : 'text-red-400',
      border: totalPnl >= 0 ? 'border-green-500/20' : 'border-red-500/20',
      top: totalPnl >= 0 ? 'bg-green-500' : 'bg-red-500',
    },
    {
      label: 'Win Rate',
      value: winRate ? `${winRate}%` : '—',
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      top: 'bg-amber-500',
    },
    {
      label: 'Total Trades',
      value: closed.length,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
      top: 'bg-cyan-500',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Your trading risk overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <div
            key={s.label}
            className={`bg-[#0f172a] border ${s.border} rounded-xl p-5 relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${s.top}`} />
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
              {s.label}
            </p>
            <p className={`text-2xl font-bold font-mono ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent trades */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
        <h2 className="text-white font-bold text-base mb-4">Recent Trades</h2>

        {(trades?.length ?? 0) === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-sm">No trades logged yet.</p>
            <p className="text-slate-700 text-xs mt-1">
              Head to the Calculator to plan your first trade.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Instrument','Direction','Lot','$ Risk','Status','P&L'].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-wider pb-3 px-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades!.slice(0, 10).map(t => (
                <tr key={t.id} className="border-b border-slate-800/50">
                  <td className="py-3 px-2 text-white font-medium">{t.instrument_name}</td>
                  <td className={`py-3 px-2 font-mono text-xs font-bold ${t.direction === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.direction}
                  </td>
                  <td className="py-3 px-2 text-slate-400 font-mono">{t.lot_size}</td>
                  <td className="py-3 px-2 text-red-400 font-mono">${t.dollar_risk.toFixed(2)}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      t.status === 'WIN' ? 'bg-green-950 text-green-400' :
                      t.status === 'LOSS' ? 'bg-red-950 text-red-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className={`py-3 px-2 font-mono ${(t.actual_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {t.actual_pnl != null ? `${t.actual_pnl >= 0 ? '+' : ''}$${t.actual_pnl.toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}