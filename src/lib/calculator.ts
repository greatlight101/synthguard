import { Instrument } from './instruments'

export function getAccountProfile(balance: number) {
  if (balance < 100)  return { label: 'Micro',    maxRisk: 1.0, maxDaily: 3.0, color: '#f59e0b' }
  if (balance < 500)  return { label: 'Small',    maxRisk: 1.5, maxDaily: 4.0, color: '#fb923c' }
  if (balance < 2000) return { label: 'Standard', maxRisk: 2.0, maxDaily: 5.0, color: '#22c55e' }
  return                     { label: 'Advanced', maxRisk: 3.0, maxDaily: 6.0, color: '#38bdf8' }
}

export interface CalcResult {
  pipValue: number
  dollarRisk: number
  dollarTarget: number
  optimalLot: number
  riskPctActual: number
  rrRatio: number
  marginRequired: number
  maxTradesToday: number
  dailyLossLimit: number
  warnings: string[]
  isValid: boolean
}

export function calculateRisk(
  instrument: Instrument,
  accountBalance: number,
  riskPct: number,
  stopLossPoints: number,
  lotSize: number,
  entryPrice: number,
  tpPoints: number
): CalcResult {
  const { pointValue, contractSize, minLot } = instrument
  const profile = getAccountProfile(accountBalance)

  const pipValue     = pointValue * lotSize * contractSize
  const dollarRisk   = stopLossPoints * pipValue
  const dollarTarget = tpPoints * pipValue
  const riskPctActual = accountBalance > 0 ? (dollarRisk / accountBalance) * 100 : 0
  const rrRatio      = dollarRisk > 0 ? dollarTarget / dollarRisk : 0
  const marginRequired = (lotSize * contractSize * (entryPrice || 1000)) / 100
  const dailyLossLimit = (accountBalance * profile.maxDaily) / 100
  const riskBudget   = (accountBalance * riskPct) / 100
  const optimalLot   = stopLossPoints > 0
    ? riskBudget / (stopLossPoints * pointValue * contractSize)
    : 0
  const maxTradesToday = dollarRisk > 0
    ? Math.floor(dailyLossLimit / dollarRisk)
    : 0

  const warnings: string[] = []

  if (lotSize < minLot)
    warnings.push(`Lot size ${lotSize} is below the minimum ${minLot} for ${instrument.name}`)
  if (riskPctActual > 3)
    warnings.push('Risk exceeds 3% — dangerously high. Reduce lot size immediately')
  else if (riskPctActual > profile.maxRisk)
    warnings.push(`Risk ${riskPctActual.toFixed(2)}% exceeds your account tier limit of ${profile.maxRisk}%`)
  if (rrRatio > 0 && rrRatio < 1)
    warnings.push('Risk:Reward below 1:1 — unfavourable setup. Reconsider your TP')
  if (instrument.riskTier >= 3 && lotSize > minLot * 10)
    warnings.push('High-volatility instrument at elevated lot — extreme caution')
  if (optimalLot < minLot && stopLossPoints > 0)
    warnings.push(`Optimal lot (${optimalLot.toFixed(4)}) is below minimum (${minLot}). Widen stop or accept higher risk %`)

  return {
    pipValue, dollarRisk, dollarTarget, optimalLot,
    riskPctActual, rrRatio, marginRequired,
    maxTradesToday, dailyLossLimit,
    warnings,
    isValid: !warnings.some(w => w.includes('below the minimum')),
  }
}