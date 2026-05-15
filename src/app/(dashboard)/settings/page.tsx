'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAccountProfile } from '@/lib/calculator'

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    account_balance: 200,
    max_risk_pct: 1,
    max_daily_loss_pct: 3,
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) setForm({
            full_name: data.full_name ?? '',
            account_balance: data.account_balance,
            max_risk_pct: data.max_risk_pct,
            max_daily_loss_pct: data.max_daily_loss_pct,
          })
          setLoading(false)
        })
    })
  }, [])

  const profile = getAccountProfile(form.account_balance)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      ...form,
      updated_at: new Date().toISOString()
    }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return (
    <div className="text-slate-600 text-sm">Loading settings...</div>
  )

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Your risk parameters power the calculator and session alerts
        </p>
      </div>

      <form onSubmit={save} className="flex flex-col gap-5">

        {/* Profile */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Profile</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full bg-[#0a0f1a] border border-slate-800 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Account</h2>
            <span className="text-xs font-bold px-2 py-1 rounded-lg"
              style={{
                color: profile.color,
                backgroundColor: `${profile.color}15`,
                border: `1px solid ${profile.color}30`
              }}>
              {profile.label} Tier
            </span>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">
              Account Balance (USD)
            </label>
            <div className="flex items-center gap-2 bg-[#0a0f1a] border border-slate-800 rounded-lg px-4 py-3 focus-within:border-blue-500 transition-colors">
              <span className="text-slate-500">$</span>
              <input
                type="number"
                value={form.account_balance}
                min={10}
                step={10}
                onChange={e => setForm({ ...form, account_balance: Number(e.target.value) })}
                className="bg-transparent text-white text-sm font-mono outline-none w-full"
              />
            </div>
            <p className="text-xs text-slate-700 mt-1.5">
              This is used as the base for all risk calculations
            </p>
          </div>
        </div>

        {/* Risk limits */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-1">Risk Limits</h2>
          <p className="text-xs text-slate-600 mb-5">
            SynthGuard will warn you when you approach these thresholds
          </p>

          <div className="flex flex-col gap-5">

            {/* Max risk per trade */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-slate-400 uppercase tracking-widest">
                  Max Risk Per Trade
                </label>
                <span className={`text-sm font-bold font-mono ${
                  form.max_risk_pct <= 1 ? 'text-green-400' :
                  form.max_risk_pct <= 2 ? 'text-amber-400' : 'text-red-400'
                }`}>{form.max_risk_pct}%</span>
              </div>
              <input
                type="range" min={0.1} max={5} step={0.1}
                value={form.max_risk_pct}
                onChange={e => setForm({ ...form, max_risk_pct: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-700 mt-1">
                <span>0.1% Safe</span>
                <span>5% Extreme</span>
              </div>
            </div>

            {/* Daily loss limit */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-slate-400 uppercase tracking-widest">
                  Daily Loss Limit
                </label>
                <span className={`text-sm font-bold font-mono ${
                  form.max_daily_loss_pct <= 3 ? 'text-green-400' :
                  form.max_daily_loss_pct <= 5 ? 'text-amber-400' : 'text-red-400'
                }`}>{form.max_daily_loss_pct}%</span>
              </div>
              <input
                type="range" min={1} max={10} step={0.5}
                value={form.max_daily_loss_pct}
                onChange={e => setForm({ ...form, max_daily_loss_pct: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-700 mt-1">
                <span>1% Conservative</span>
                <span>10% Aggressive</span>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#0a0f1a] rounded-lg p-3 border border-slate-800">
                <p className="text-xs text-slate-600 mb-1">Max loss per trade</p>
                <p className="text-base font-bold font-mono text-red-400">
                  ${((form.account_balance * form.max_risk_pct) / 100).toFixed(2)}
                </p>
              </div>
              <div className="bg-[#0a0f1a] rounded-lg p-3 border border-slate-800">
                <p className="text-xs text-slate-600 mb-1">Daily stop-out at</p>
                <p className="text-base font-bold font-mono text-orange-400">
                  ${((form.account_balance * form.max_daily_loss_pct) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
            saved
              ? 'bg-green-950 border border-green-500/50 text-green-400'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90'
          }`}
        >
          {saving ? 'Saving...' : saved ? '✓ Settings saved' : 'Save Settings'}
        </button>

      </form>
    </div>
  )
}