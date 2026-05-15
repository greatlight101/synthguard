export type RiskTier = 1 | 2 | 3 | 4

export interface Instrument {
  id: string
  name: string
  family: string
  minLot: number
  pointValue: number
  contractSize: number
  tickSpeed: string
  riskTier: RiskTier
  color: string
}

export const INSTRUMENTS: Record<string, Instrument[]> = {
  'Volatility': [
    { id:'V10',     name:'Volatility 10',        family:'Volatility', minLot:0.30,  pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:1, color:'#22c55e' },
    { id:'V10_1s',  name:'Volatility 10 (1s)',   family:'Volatility', minLot:0.50,  pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:1, color:'#22c55e' },
    { id:'V15_1s',  name:'Volatility 15 (1s)',   family:'Volatility', minLot:0.50,  pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:1, color:'#4ade80' },
    { id:'V25',     name:'Volatility 25',         family:'Volatility', minLot:0.50,  pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:1, color:'#4ade80' },
    { id:'V25_1s',  name:'Volatility 25 (1s)',   family:'Volatility', minLot:0.50,  pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:1, color:'#4ade80' },
    { id:'V30_1s',  name:'Volatility 30 (1s)',   family:'Volatility', minLot:0.50,  pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:2, color:'#facc15' },
    { id:'V50',     name:'Volatility 50',         family:'Volatility', minLot:3.00,  pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:2, color:'#f59e0b' },
    { id:'V50_1s',  name:'Volatility 50 (1s)',   family:'Volatility', minLot:0.005, pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:2, color:'#f59e0b' },
    { id:'V75',     name:'Volatility 75',         family:'Volatility', minLot:0.001, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:2, color:'#fb923c' },
    { id:'V75_1s',  name:'Volatility 75 (1s)',   family:'Volatility', minLot:0.005, pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:2, color:'#fb923c' },
    { id:'V90_1s',  name:'Volatility 90 (1s)',   family:'Volatility', minLot:0.10,  pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:3, color:'#f87171' },
    { id:'V100',    name:'Volatility 100',        family:'Volatility', minLot:0.20,  pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:3, color:'#ef4444' },
    { id:'V100_1s', name:'Volatility 100 (1s)',  family:'Volatility', minLot:0.10,  pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:3, color:'#ef4444' },
    { id:'V150_1s', name:'Volatility 150 (1s)',  family:'Volatility', minLot:0.50,  pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:3, color:'#dc2626' },
    { id:'V200_1s', name:'Volatility 200 (1s)',  family:'Volatility', minLot:0.02,  pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:4, color:'#b91c1c' },
    { id:'V250_1s', name:'Volatility 250 (1s)',  family:'Volatility', minLot:0.02,  pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:4, color:'#991b1b' },
    { id:'V300_1s', name:'Volatility 300 (1s)',  family:'Volatility', minLot:1.00,  pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:4, color:'#7f1d1d' },
  ],
  'Boom & Crash': [
    { id:'BOOM150',   name:'Boom 150',   family:'Boom & Crash', minLot:0.20, pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:4, color:'#a855f7' },
    { id:'CRASH150',  name:'Crash 150',  family:'Boom & Crash', minLot:0.20, pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:4, color:'#a855f7' },
    { id:'BOOM300',   name:'Boom 300',   family:'Boom & Crash', minLot:0.20, pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:3, color:'#c084fc' },
    { id:'CRASH300',  name:'Crash 300',  family:'Boom & Crash', minLot:0.20, pointValue:0.01, contractSize:1, tickSpeed:'1s', riskTier:3, color:'#c084fc' },
    { id:'BOOM500',   name:'Boom 500',   family:'Boom & Crash', minLot:0.20, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:2, color:'#d8b4fe' },
    { id:'CRASH500',  name:'Crash 500',  family:'Boom & Crash', minLot:0.20, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:2, color:'#d8b4fe' },
    { id:'BOOM1000',  name:'Boom 1000',  family:'Boom & Crash', minLot:0.20, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:1, color:'#e9d5ff' },
    { id:'CRASH1000', name:'Crash 1000', family:'Boom & Crash', minLot:0.20, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:1, color:'#e9d5ff' },
  ],
  'Jump': [
    { id:'J10',  name:'Jump 10',  family:'Jump', minLot:0.01, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:1, color:'#38bdf8' },
    { id:'J25',  name:'Jump 25',  family:'Jump', minLot:0.01, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:1, color:'#38bdf8' },
    { id:'J50',  name:'Jump 50',  family:'Jump', minLot:0.01, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:2, color:'#7dd3fc' },
    { id:'J75',  name:'Jump 75',  family:'Jump', minLot:0.01, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:2, color:'#7dd3fc' },
    { id:'J100', name:'Jump 100', family:'Jump', minLot:0.01, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:3, color:'#bae6fd' },
  ],
  'Step': [
    { id:'STEP',  name:'Step Index',     family:'Step', minLot:0.10, pointValue:0.10, contractSize:1, tickSpeed:'2s', riskTier:2, color:'#34d399' },
    { id:'STEP2', name:'Step Index 200', family:'Step', minLot:0.10, pointValue:0.10, contractSize:1, tickSpeed:'2s', riskTier:2, color:'#34d399' },
    { id:'STEP3', name:'Step Index 300', family:'Step', minLot:0.10, pointValue:0.10, contractSize:1, tickSpeed:'2s', riskTier:3, color:'#6ee7b7' },
  ],
  'Range Break': [
    { id:'RB75',  name:'Range Break 75',  family:'Range Break', minLot:0.01, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:2, color:'#f9a8d4' },
    { id:'RB100', name:'Range Break 100', family:'Range Break', minLot:0.01, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:2, color:'#f9a8d4' },
    { id:'RB200', name:'Range Break 200', family:'Range Break', minLot:0.01, pointValue:0.01, contractSize:1, tickSpeed:'2s', riskTier:3, color:'#fbcfe8' },
  ],
}

export const ALL_INSTRUMENTS = Object.values(INSTRUMENTS).flat()

export function getInstrumentById(id: string): Instrument | undefined {
  return ALL_INSTRUMENTS.find(i => i.id === id)
}

export const RISK_LABELS = ['', 'LOW', 'MEDIUM', 'HIGH', 'EXTREME']
export const RISK_COLORS = ['', '#22c55e', '#f59e0b', '#ef4444', '#7f1d1d']