'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type TradeStatus = 'PLANNED' | 'OPEN' | 'WIN' | 'LOSS' | 'BREAKEVEN'

interface Trade {
  id: string
  instrument_name: string
  family: string
  direction: 'BUY' | 'SELL'
  lot_size: number
  entry_price: number
  stop_loss_points: number
  take_profit_points: number
  dollar_risk: number
  dollar_target: number
  risk_pct: number
  rr_ratio: number
  account_balance_at_trade: number
  status: TradeStatus
  actual_pnl: number | null
  notes: string | null
  opened_at: string
  created_at: string
}

const STATUS_STYLES: Record<TradeStatus, string> = {
  PLANNED:   'bg-slate-800 text-slate-400 border-slate-700',
  OPEN:      'bg-blue-950 text-blue-400 border-blue-800',
  WIN:       'bg-green-950 text-green-400 border-green-800',
  LOSS:      'bg-red-950 text-red-400 border-red-800',
  BREAKEVEN: 'bg-amber-950 text-amber-400 border-amber-800',
}

export default function JournalPage() {
  const supabase = createClient()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | TradeStatus>('ALL')
  const [selected, setSelected] = useState<Trade | null>(null)
  const [closing, setClosing] = useState(false)
  const [actualPnl, setActualPnl] = useState('')
  const [closeStatus, setCloseStatus] = useState<'WIN' | 'LOSS' | 'BREAKEVEN'>('WIN')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchTrades = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTrades(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchTrades() }, [])

  const filtered = filter === 'ALL'
    ? trades
    : trades.filter(t => t.status === filter)

  // Summary stats
  const closed = trades.filter(t => ['WIN','LOSS','BREAKEVEN'].includes(t.status))
  const wins = closed.filter(t => t.status === 'WIN')
  const totalPnl = closed.reduce((s, t) => s + (t.actual_pnl ?? 0), 0)
  const winRate = closed.length > 0 ? ((wins.length / closed.length) * 100).toFixed(1) : null
  const totalRisked = trades.reduce((s, t) => s + t.dollar_risk, 0)
  const avgRR = closed.filter(t => t.rr_ratio).length > 0
    ? (closed.reduce((s, t) => s + (t.rr_ratio ?? 0), 0) / closed.length).toFixed(2)
    : null

  const closeTrade = async () => {
    if (!selected) return
    setSaving(true)
    const pnl = parseFloat(actualPnl)

    const { error } = await supabase
      .from('trades')
      .update({
        status: closeStatus,
        actual_pnl: isNaN(pnl) ? null : pnl,
        notes: notes || null,
        closed_at: new Date().toISOString(),
      })
      .eq('id', selected.id)

    if (!error) {
      setClosing(false)
      setSelected(null)
      setActualPnl('')
      setNotes('')
      await fetchTrades()
    }
    setSaving(false)
  }

  const deleteTrade = async (id: string) => {
    if (!confirm('Delete this trade? This cannot be undone.')) return
    await supabase.from('trades').delete().eq('id', id)
    await fetchTrades()
  }

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Trade Journal</h1>
        <p className="text-slate-400 text-sm mt-1">
          Every trade logged, every loss pre-calculated
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Trades', value: trades.length, color: 'text-white' },
          { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Win Rate', value: winRate ? `${winRate}%` : '—', color: 'text-amber-400' },
          { label: 'Avg R:R', value: avgRR ? `1:${avgRR}` : '—', color: 'text-purple-400' },
          { label: 'Total Risked', value: `$${totalRisked.toFixed(2)}`, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['ALL', 'PLANNED', 'OPEN', 'WIN', 'LOSS', 'BREAKEVEN'] as const).map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filter === f
                ? 'bg-blue-950 border-blue-500/50 text-blue-300'
                : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {f}
            <span className="ml-1.5 text-slate-600">
              {f === 'ALL' ? trades.length : trades.filter(t => t.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Trades table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-600 text-sm">Loading trades...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-600 text-sm">No trades found.</p>
            <p className="text-slate-700 text-xs mt-1">
              {filter === 'ALL' ? 'Head to the Calculator to log your first trade.' : `No ${filter} trades yet.`}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800">
              <tr>
                {['Instrument','Dir','Lot','Entry','SL pts','TP pts','$ Risk','$ Target','R:R','Status','P&L','Date',''].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-wider py-3 px-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id}
                  className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors ${
                    i % 2 === 0 ? '' : 'bg-slate-900/20'
                  }`}
                >
                  <td className="py-3 px-3">
                    <p className="text-white font-semibold text-xs">{t.instrument_name}</p>
                    <p className="text-slate-600 text-xs">{t.family}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-bold ${t.direction === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.direction}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono text-xs">{t.lot_size}</td>
                  <td className="py-3 px-3 text-slate-300 font-mono text-xs">{t.entry_price ?? '—'}</td>
                  <td className="py-3 px-3 text-red-400 font-mono text-xs">{t.stop_loss_points}</td>
                  <td className="py-3 px-3 text-green-400 font-mono text-xs">{t.take_profit_points ?? '—'}</td>
                  <td className="py-3 px-3 text-red-400 font-mono text-xs font-bold">${t.dollar_risk.toFixed(2)}</td>
                  <td className="py-3 px-3 text-green-400 font-mono text-xs">${(t.dollar_target ?? 0).toFixed(2)}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-xs">
                    {t.rr_ratio ? `1:${t.rr_ratio.toFixed(1)}` : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${STATUS_STYLES[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs">
                    {t.actual_pnl != null
                      ? <span className={t.actual_pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {t.actual_pnl >= 0 ? '+' : ''}${t.actual_pnl.toFixed(2)}
                        </span>
                      : <span className="text-slate-600">—</span>
                    }
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-xs whitespace-nowrap">
                    {formatDate(t.created_at)}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      {['PLANNED','OPEN'].includes(t.status) && (
                        <button
                          onClick={() => { setSelected(t); setClosing(true) }}
                          className="text-xs text-blue-400 hover:text-blue-300 font-semibold whitespace-nowrap"
                        >
                          Close
                        </button>
                      )}
                      <button
                        onClick={() => deleteTrade(t.id)}
                        className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Close trade modal */}
      {closing && selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 w-full max-w-md">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Close Trade</h2>
              <button onClick={() => { setClosing(false); setSelected(null) }}
                className="text-slate-500 hover:text-white text-xl">✕</button>
            </div>

            {/* Trade summary */}
            <div className="bg-[#0a0f1a] rounded-xl p-4 mb-5 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">{selected.instrument_name}</span>
                <span className={`text-xs font-bold ${selected.direction === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                  {selected.direction}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-slate-600">Lot size</p>
                  <p className="text-white font-mono">{selected.lot_size}</p>
                </div>
                <div>
                  <p className="text-slate-600">Max risk</p>
                  <p className="text-red-400 font-mono">${selected.dollar_risk.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Target</p>
                  <p className="text-green-400 font-mono">${(selected.dollar_target ?? 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Outcome */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">
                Outcome
              </label>
              <div className="flex gap-2">
                {(['WIN', 'LOSS', 'BREAKEVEN'] as const).map(s => (
                  <button key={s}
                    onClick={() => setCloseStatus(s)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                      closeStatus === s && s === 'WIN'
                        ? 'bg-green-950 border-green-500/50 text-green-400'
                        : closeStatus === s && s === 'LOSS'
                        ? 'bg-red-950 border-red-500/50 text-red-400'
                        : closeStatus === s
                        ? 'bg-amber-950 border-amber-500/50 text-amber-400'
                        : 'bg-transparent border-slate-800 text-slate-500'
                    }`}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* Actual P&L */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">
                Actual P&L (USD)
              </label>
              <input
                type="number" value={actualPnl} step="any"
                onChange={e => setActualPnl(e.target.value)}
                placeholder={closeStatus === 'LOSS' ? 'e.g. -12.50' : 'e.g. 24.00'}
                className="w-full bg-[#0a0f1a] border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm font-mono outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What happened? What did you learn?"
                rows={2}
                className="w-full bg-[#0a0f1a] border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <button
              onClick={closeTrade}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Close Trade →'}
            </button>

          </div>
        </div>
      )}

    </div>
  )
}