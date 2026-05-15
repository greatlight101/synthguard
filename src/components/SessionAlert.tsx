'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SessionAlert({ userId }: { userId: string }) {
  const supabase = createClient()
  const [alert, setAlert] = useState<{
    type: 'warning' | 'danger'
    message: string
    pnl: number
    limit: number
  } | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      // Get today's closed trades
      const today = new Date().toISOString().split('T')[0]
      const { data: trades } = await supabase
        .from('trades')
        .select('actual_pnl, dollar_risk, status')
        .eq('user_id', userId)
        .gte('created_at', today)

      if (!trades || trades.length === 0) return

      // Get user profile for limits
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_balance, max_daily_loss_pct')
        .eq('id', userId)
        .single()

      if (!profile) return

      const dailyLimit = (profile.account_balance * profile.max_daily_loss_pct) / 100

      // Sum today's losses
      const todayLoss = trades.reduce((sum, t) => {
        if (t.actual_pnl && t.actual_pnl < 0) return sum + Math.abs(t.actual_pnl)
        return sum
      }, 0)

      const pct = (todayLoss / dailyLimit) * 100

      if (pct >= 100) {
        setAlert({
          type: 'danger',
          message: `Daily loss limit reached. Stop trading for today.`,
          pnl: todayLoss,
          limit: dailyLimit,
        })
      } else if (pct >= 50) {
        setAlert({
          type: 'warning',
          message: `You've used ${pct.toFixed(0)}% of your daily loss limit.`,
          pnl: todayLoss,
          limit: dailyLimit,
        })
      } else {
        setAlert(null)
      }
    }

    checkSession()
    const interval = setInterval(checkSession, 60000) // recheck every minute
    return () => clearInterval(interval)
  }, [userId])

  if (!alert) return null

  return (
    <div className={`px-8 py-3 flex items-center justify-between text-sm ${
      alert.type === 'danger'
        ? 'bg-red-950/80 border-b border-red-800'
        : 'bg-amber-950/80 border-b border-amber-800'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{alert.type === 'danger' ? '🛑' : '⚠️'}</span>
        <div>
          <span className={`font-bold ${alert.type === 'danger' ? 'text-red-300' : 'text-amber-300'}`}>
            {alert.type === 'danger' ? 'Session locked — ' : 'Risk warning — '}
          </span>
          <span className={alert.type === 'danger' ? 'text-red-400' : 'text-amber-400'}>
            {alert.message}
          </span>
        </div>
      </div>
      <div className={`font-mono text-xs font-bold ${alert.type === 'danger' ? 'text-red-400' : 'text-amber-400'}`}>
        ${alert.pnl.toFixed(2)} / ${alert.limit.toFixed(2)} lost today
      </div>
    </div>
  )
}