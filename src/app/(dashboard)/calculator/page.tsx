'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { INSTRUMENTS, ALL_INSTRUMENTS, RISK_LABELS, RISK_COLORS } from '@/lib/instruments'
import { calculateRisk, getAccountProfile } from '@/lib/calculator'

export default function CalculatorPage() {
  const supabase = createClient()

  const [balance, setBalance] = useState(200)
  const [riskPct, setRiskPct] = useState(1)
  const [family, setFamily] = useState('Volatility')
  const [instrumentId, setInstrumentId] = useState('V75')
  const [mode, setMode] = useState<'byRisk' | 'byLot'>('byRisk')
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY')
  const [entryPrice, setEntryPrice] = useState(1000)
  const [slPrice, setSlPrice] = useState(950)
  const [tpPrice, setTpPrice] = useState(1100)
  const [lotSize, setLotSize] = useState(0.001)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const instrument = ALL_INSTRUMENTS.find(i => i.id === instrumentId)!
  const profile = getAccountProfile(balance)

  // Derived point distances from price levels
  const stopLossPoints = Math.max(0, Math.round(Math.abs(entryPrice - slPrice)))
  const takeProfitPoints = Math.max(0, Math.round(Math.abs(tpPrice - entryPrice)))

  // Validate direction vs price levels
  const slError = direction === 'BUY' && slPrice >= entryPrice
    ? 'Stop loss must be below entry for a BUY'
    : direction === 'SELL' && slPrice <= entryPrice
    ? 'Stop loss must be above entry for a SELL'
    : ''

  const tpError = direction === 'BUY' && tpPrice <= entryPrice
    ? 'Take profit must be above entry for a BUY'
    : direction === 'SELL' && tpPrice >= entryPrice
    ? 'Take profit must be below entry for a SELL'
    : ''

  useEffect(() => {
    setLotSize(instrument.minLot)
  }, [instrumentId])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('account_balance').eq('id', user.id).single()
        .then(({ data }) => { if (data) setBalance(data.account_balance) })
    })
  }, [])

  // Raw result for optimal lot calculation
  const rawResult = calculateRisk(
    instrument, balance, riskPct,
    stopLossPoints, instrument.minLot,
    entryPrice, takeProfitPoints
  )

  const displayLot = mode === 'byRisk'
    ? Math.max(rawResult.optimalLot, instrument.minLot)
    : lotSize

  const result = calculateRisk(
    instrument, balance, riskPct,
    stopLossPoints, displayLot,
    entryPrice, takeProfitPoints
  )

  const riskColor = result.riskPctActual <= 1 ? 'text-green-400'
    : result.riskPctActual <= 2 ? 'text-amber-400' : 'text-red-400'

  const saveTrade = async () => {
    setSaving(true)
    setSaveError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('trades').insert({
      user_id: user.id,
      instrument_id: instrument.id,
      instrument_name: instrument.name,
      family: instrument.family,
      direction,
      lot_size: displayLot,
      entry_price: entryPrice,
      stop_loss_points: stopLossPoints,
      take_profit_points: takeProfitPoints,
      dollar_risk: result.dollarRisk,
      dollar_target: result.dollarTarget,
      risk_pct: result.riskPctActual,
      rr_ratio: result.rrRatio,
      account_balance_at_trade: balance,
      status: 'PLANNED',
    })

    if (error) {
      setSaveError('Failed to save. Try again.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const canSave = result.isValid && !slError && !tpError && stopLossPoints > 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Risk Calculator</h1>
        <p className="text-slate-400 text-sm mt-1">
          Enter your price levels — SynthGuard calculates everything else
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* LEFT — Inputs */}
        <div className="flex flex-col gap-4">

          {/* Account balance */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-slate-400 uppercase tracking-widest">
                Account Balance
              </label>
              <span className="text-xs font-bold" style={{ color: profile.color }}>
                {profile.label} Account
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-lg">$</span>
              <input
                type="number"
                value={balance}
                onChange={e => setBalance(Number(e.target.value))}
                className="bg-transparent text-white text-2xl font-bold font-mono outline-none w-full"
              />
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Max risk: {profile.maxRisk}% per trade · Daily limit: {profile.maxDaily}%
            </p>
          </div>

          {/* Risk % */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-slate-400 uppercase tracking-widest">
                Risk Per Trade
              </label>
              <span className={`text-lg font-bold font-mono ${
                riskPct <= 1 ? 'text-green-400' :
                riskPct <= 2 ? 'text-amber-400' : 'text-red-400'
              }`}>{riskPct}%</span>
            </div>
            <input
              type="range" min={0.1} max={5} step={0.1}
              value={riskPct}
              onChange={e => setRiskPct(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-700 mt-1">
              <span>0.1% Conservative</span>
              <span>5% Extreme</span>
            </div>
          </div>

          {/* Instrument */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
            <label className="text-xs text-slate-400 uppercase tracking-widest block mb-3">
              Instrument Family
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(INSTRUMENTS).map(f => (
                <button key={f}
                  onClick={() => { setFamily(f); setInstrumentId(INSTRUMENTS[f][0].id) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    family === f
                      ? 'bg-blue-950 border-blue-500/50 text-blue-300'
                      : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >{f}</button>
              ))}
            </div>
            <select
              value={instrumentId}
              onChange={e => setInstrumentId(e.target.value)}
              className="w-full bg-[#0a0f1a] border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm outline-none font-mono mb-3"
            >
              {INSTRUMENTS[family].map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-3 p-3 bg-[#0a0f1a] rounded-lg border border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: instrument.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold">{instrument.name}</p>
                <p className="text-slate-600 text-xs font-mono">
                  Min lot: {instrument.minLot} · Tick: {instrument.tickSpeed} · Point val: {instrument.pointValue}
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                style={{
                  color: RISK_COLORS[instrument.riskTier],
                  backgroundColor: `${RISK_COLORS[instrument.riskTier]}15`,
                  border: `1px solid ${RISK_COLORS[instrument.riskTier]}30`
                }}>
                {RISK_LABELS[instrument.riskTier]}
              </span>
            </div>
          </div>

          {/* Trade parameters */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
            <label className="text-xs text-slate-400 uppercase tracking-widest block mb-3">
              Trade Parameters
            </label>

            {/* Mode toggle */}
            <div className="flex bg-[#0a0f1a] rounded-lg overflow-hidden border border-slate-800 mb-4">
              {(['byRisk', 'byLot'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-xs font-semibold transition-all ${
                    mode === m ? 'bg-blue-950 text-blue-300' : 'text-slate-500 hover:text-slate-300'
                  }`}>
                  {m === 'byRisk' ? 'Calculate Lot for Me' : 'I\'ll Set My Lot'}
                </button>
              ))}
            </div>

            {/* Direction */}
            <div className="mb-3">
              <label className="text-xs text-slate-500 block mb-1.5">Direction</label>
              <div className="flex gap-2">
                {(['BUY', 'SELL'] as const).map(d => (
                  <button key={d} onClick={() => setDirection(d)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                      direction === d && d === 'BUY'
                        ? 'bg-green-950 border-green-500/50 text-green-400'
                        : direction === d && d === 'SELL'
                        ? 'bg-red-950 border-red-500/50 text-red-400'
                        : 'bg-transparent border-slate-800 text-slate-500'
                    }`}>{d}
                  </button>
                ))}
              </div>
            </div>

            {/* Price level inputs */}
            <div className="flex flex-col gap-3">

              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Entry Price</label>
                <input
                  type="number" value={entryPrice} step="any"
                  onChange={e => setEntryPrice(Number(e.target.value))}
                  className="w-full bg-[#0a0f1a] border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm font-mono outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1.5">
                  Stop Loss Price
                  <span className="text-slate-700 ml-2">
                    {stopLossPoints > 0 ? `(${stopLossPoints} points away)` : ''}
                  </span>
                </label>
                <input
                  type="number" value={slPrice} step="any"
                  onChange={e => setSlPrice(Number(e.target.value))}
                  className={`w-full bg-[#0a0f1a] border rounded-lg px-3 py-2.5 text-white text-sm font-mono outline-none transition-colors ${
                    slError ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'
                  }`}
                />
                {slError && (
                  <p className="text-red-400 text-xs mt-1">{slError}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1.5">
                  Take Profit Price
                  <span className="text-slate-700 ml-2">
                    {takeProfitPoints > 0 ? `(${takeProfitPoints} points away)` : ''}
                  </span>
                </label>
                <input
                  type="number" value={tpPrice} step="any"
                  onChange={e => setTpPrice(Number(e.target.value))}
                  className={`w-full bg-[#0a0f1a] border rounded-lg px-3 py-2.5 text-white text-sm font-mono outline-none transition-colors ${
                    tpError ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'
                  }`}
                />
                {tpError && (
                  <p className="text-red-400 text-xs mt-1">{tpError}</p>
                )}
              </div>

              {/* Point distance summary */}
              {stopLossPoints > 0 && takeProfitPoints > 0 && !slError && !tpError && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-[#0a0f1a] rounded-lg border border-slate-800">
                  <div>
                    <p className="text-xs text-slate-600">SL distance</p>
                    <p className="text-sm font-mono font-bold text-red-400">{stopLossPoints} pts</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">TP distance</p>
                    <p className="text-sm font-mono font-bold text-green-400">{takeProfitPoints} pts</p>
                  </div>
                </div>
              )}

              {/* Manual lot — only in byLot mode */}
              {mode === 'byLot' && (
                <div>
                  <label className="text-xs text-slate-500 block mb-1.5">
                    Lot Size <span className="text-slate-700">(min: {instrument.minLot})</span>
                  </label>
                  <input
                    type="number" value={lotSize}
                    step={instrument.minLot} min={instrument.minLot}
                    onChange={e => setLotSize(Number(e.target.value))}
                    className="w-full bg-[#0a0f1a] border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm font-mono outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT — Results */}
        <div className="flex flex-col gap-4">

          {/* Risk assessment */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300">Risk Assessment</h2>
              <span className={`text-2xl font-bold font-mono ${riskColor}`}>
                {result.riskPctActual.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
              <div className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(result.riskPctActual / 5 * 100, 100)}%`,
                  backgroundColor: result.riskPctActual <= 1 ? '#22c55e'
                    : result.riskPctActual <= 2 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0a0f1a] rounded-lg p-3 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Dollar Risk</p>
                <p className="text-xl font-bold font-mono text-red-400">
                  ${result.dollarRisk.toFixed(2)}
                </p>
              </div>
              <div className="bg-[#0a0f1a] rounded-lg p-3 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Dollar Target</p>
                <p className="text-xl font-bold font-mono text-green-400">
                  ${result.dollarTarget.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Lot Size', value: displayLot.toFixed(4), color: 'text-blue-400', sub: mode === 'byRisk' ? 'Auto-calculated' : 'Manual' },
              { label: 'Pip Value', value: `$${result.pipValue.toFixed(4)}`, color: 'text-cyan-400', sub: 'Per point move' },
              { label: 'Risk : Reward', value: result.rrRatio > 0 ? `1 : ${result.rrRatio.toFixed(2)}` : '—',
                color: result.rrRatio >= 2 ? 'text-green-400' : result.rrRatio >= 1 ? 'text-amber-400' : 'text-red-400',
                sub: result.rrRatio >= 2 ? 'Excellent' : result.rrRatio >= 1 ? 'Acceptable' : 'Poor' },
              { label: 'Est. Margin', value: `$${result.marginRequired.toFixed(2)}`, color: 'text-purple-400', sub: 'At 1:100 leverage' },
              { label: 'Max Trades Today', value: String(result.maxTradesToday), color: 'text-amber-400', sub: `Before ${profile.maxDaily}% daily cap` },
              { label: 'Daily Loss Limit', value: `$${result.dailyLossLimit.toFixed(2)}`, color: 'text-orange-400', sub: `${profile.maxDaily}% of balance` },
            ].map(s => (
              <div key={s.label} className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-600 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="bg-[#0a0f1a] border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
              Calculation Breakdown
            </p>
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">SL distance</span>
                <span className="text-slate-400">
                  |{entryPrice} − {slPrice}| =
                  <span className="text-red-400 ml-1">{stopLossPoints} pts</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">TP distance</span>
                <span className="text-slate-400">
                  |{tpPrice} − {entryPrice}| =
                  <span className="text-green-400 ml-1">{takeProfitPoints} pts</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pip value</span>
                <span className="text-slate-400">
                  {instrument.pointValue} × {displayLot.toFixed(4)} =
                  <span className="text-blue-400 ml-1">${result.pipValue.toFixed(4)}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dollar risk</span>
                <span className="text-slate-400">
                  {stopLossPoints} × ${result.pipValue.toFixed(4)} =
                  <span className="text-red-400 ml-1">${result.dollarRisk.toFixed(2)}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Risk %</span>
                <span className="text-slate-400">
                  ${result.dollarRisk.toFixed(2)} ÷ ${balance} =
                  <span className={`ml-1 ${riskColor}`}>{result.riskPctActual.toFixed(3)}%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {(result.warnings.length > 0 || slError || tpError) ? (
            <div className="flex flex-col gap-2">
              {[...result.warnings, slError, tpError].filter(Boolean).map((w, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-red-950/30 border border-red-900/40 rounded-lg">
                  <span className="text-red-400 text-sm flex-shrink-0">⚠</span>
                  <p className="text-red-300 text-xs leading-relaxed">{w}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 items-center p-3 bg-green-950/30 border border-green-900/40 rounded-lg">
              <span className="text-green-400 text-sm">✓</span>
              <p className="text-green-300 text-xs">All parameters within safe thresholds</p>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={saveTrade}
            disabled={saving || !canSave}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
              saved
                ? 'bg-green-950 border border-green-500/50 text-green-400'
                : canSave
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {saved ? '✓ Trade saved to journal' :
             saving ? 'Saving...' :
             !canSave ? 'Fix errors to save' :
             'Save Trade to Journal →'}
          </button>

          {saveError && (
            <p className="text-red-400 text-xs text-center">{saveError}</p>
          )}

        </div>
      </div>
    </div>
  )
}