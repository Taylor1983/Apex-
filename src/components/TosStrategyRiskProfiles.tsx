import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Info,
  Zap,
  ArrowRight,
  Layers,
  Percent,
  DollarSign,
  Maximize2,
  Minimize2,
  Table,
  Target,
  Crosshair,
  RotateCcw,
  X,
  SlidersHorizontal,
  Palette,
  Eye,
  ZoomIn,
  ZoomOut,
  Sparkles
} from 'lucide-react';
import { Asset, OrderSide, OptionSpreadDetails, OptionSpreadLeg, TradeOrder } from '../types';

export type GraphThemeKey = 'TOS_NEON' | 'AMBER_PHOSPHOR' | 'CYBER_MATRIX' | 'SLATE_PRO';

export interface ThemeConfig {
  name: string;
  shortName: string;
  colorDot: string;
  bgHex: string;
  panelBorderHex: string;
  gridLineHex: string;
  gridSubLineHex: string;
  zeroAxisHex: string;
  zeroBadgeBg: string;
  zeroBadgeText: string;
  expiryLineHex: string;
  expiryGlowHex: string;
  todayLineHex: string;
  halfLineHex: string;
  bellCurveStrokeHex: string;
  bellCurveFillHex: string;
  spotLineHex: string;
  simLineHex: string;
  profitGradStart: string;
  lossGradStart: string;
  crosshairHex: string;
  hudBgHex: string;
  hudBorderHex: string;
  accentTextHex: string;
}

export const GRAPH_THEMES: Record<GraphThemeKey, ThemeConfig> = {
  TOS_NEON: {
    name: 'thinkorswim® Classic Obsidian',
    shortName: 'TOS Classic',
    colorDot: '#00e676',
    bgHex: '#070a0e',
    panelBorderHex: '#1b232e',
    gridLineHex: '#141c26',
    gridSubLineHex: '#0c1219',
    zeroAxisHex: '#475569',
    zeroBadgeBg: '#0f1722',
    zeroBadgeText: '#cbd5e1',
    expiryLineHex: '#00e676',
    expiryGlowHex: '#00e676',
    todayLineHex: '#00e5ff',
    halfLineHex: '#c084fc',
    bellCurveStrokeHex: '#6366f1',
    bellCurveFillHex: 'rgba(99, 102, 241, 0.14)',
    spotLineHex: '#f59e0b',
    simLineHex: '#38bdf8',
    profitGradStart: '#00e676',
    lossGradStart: '#ff1744',
    crosshairHex: '#fbbf24',
    hudBgHex: '#090e15',
    hudBorderHex: '#1f2b3b',
    accentTextHex: '#00e676'
  },
  AMBER_PHOSPHOR: {
    name: 'Bloomberg Terminal Phosphor',
    shortName: 'Phosphor Amber',
    colorDot: '#fbbf24',
    bgHex: '#090703',
    panelBorderHex: '#2a1e0f',
    gridLineHex: '#23180b',
    gridSubLineHex: '#140e06',
    zeroAxisHex: '#785b30',
    zeroBadgeBg: '#1c1308',
    zeroBadgeText: '#fde68a',
    expiryLineHex: '#fbbf24',
    expiryGlowHex: '#fbbf24',
    todayLineHex: '#34d399',
    halfLineHex: '#f97316',
    bellCurveStrokeHex: '#d97706',
    bellCurveFillHex: 'rgba(217, 119, 6, 0.15)',
    spotLineHex: '#f59e0b',
    simLineHex: '#67e8f9',
    profitGradStart: '#f59e0b',
    lossGradStart: '#ea580c',
    crosshairHex: '#fbbf24',
    hudBgHex: '#130d06',
    hudBorderHex: '#382512',
    accentTextHex: '#fbbf24'
  },
  CYBER_MATRIX: {
    name: 'Cyberpunk Synthwave Neon',
    shortName: 'Cyber Matrix',
    colorDot: '#f43f5e',
    bgHex: '#050713',
    panelBorderHex: '#1e1c3a',
    gridLineHex: '#171830',
    gridSubLineHex: '#0c0d1d',
    zeroAxisHex: '#4f547c',
    zeroBadgeBg: '#121226',
    zeroBadgeText: '#f472b6',
    expiryLineHex: '#f43f5e',
    expiryGlowHex: '#f43f5e',
    todayLineHex: '#06b6d4',
    halfLineHex: '#e879f9',
    bellCurveStrokeHex: '#8b5cf6',
    bellCurveFillHex: 'rgba(139, 92, 246, 0.16)',
    spotLineHex: '#fbbf24',
    simLineHex: '#22d3ee',
    profitGradStart: '#06b6d4',
    lossGradStart: '#f43f5e',
    crosshairHex: '#f43f5e',
    hudBgHex: '#0b0d21',
    hudBorderHex: '#2b2952',
    accentTextHex: '#f43f5e'
  },
  SLATE_PRO: {
    name: 'Institutional Titanium Slate',
    shortName: 'Titanium Pro',
    colorDot: '#10b981',
    bgHex: '#0b0f17',
    panelBorderHex: '#1e293b',
    gridLineHex: '#172030',
    gridSubLineHex: '#0e141f',
    zeroAxisHex: '#64748b',
    zeroBadgeBg: '#111827',
    zeroBadgeText: '#e2e8f0',
    expiryLineHex: '#10b981',
    expiryGlowHex: '#10b981',
    todayLineHex: '#38bdf8',
    halfLineHex: '#818cf8',
    bellCurveStrokeHex: '#94a3b8',
    bellCurveFillHex: 'rgba(148, 163, 184, 0.12)',
    spotLineHex: '#f1f5f9',
    simLineHex: '#7dd3fc',
    profitGradStart: '#10b981',
    lossGradStart: '#ef4444',
    crosshairHex: '#f8fafc',
    hudBgHex: '#101623',
    hudBorderHex: '#2d3b4e',
    accentTextHex: '#10b981'
  }
};

export type StrategyKey =
  | 'LONG_STOCK'
  | 'SHORT_STOCK'
  | 'LONG_CALL'
  | 'LONG_PUT'
  | 'CASH_SECURED_PUT'
  | 'NAKED_CALL'
  | 'BULL_CALL_SPREAD'
  | 'BEAR_CALL_SPREAD'
  | 'BULL_PUT_SPREAD'
  | 'BEAR_PUT_SPREAD'
  | 'COVERED_CALL'
  | 'PROTECTIVE_PUT'
  | 'COLLAR'
  | 'LONG_STRADDLE'
  | 'SHORT_STRADDLE'
  | 'LONG_STRANGLE'
  | 'SHORT_STRANGLE'
  | 'IRON_CONDOR'
  | 'IRON_BUTTERFLY'
  | 'LONG_CALL_BUTTERFLY'
  | 'CALENDAR_SPREAD';

interface StrategyDef {
  key: StrategyKey;
  name: string;
  category: 'Bullish' | 'Bearish' | 'Neutral/Income' | 'Volatility Expansion';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'High Vol' | 'Low Vol';
  description: string;
  legs: {
    side: 'BUY' | 'SELL';
    qty: number;
    type: 'STOCK' | 'CALL' | 'PUT';
    strikeOffsetPct: number; // e.g. 0 for ATM, +5 for OTM Call, -5 for OTM Put
    estimatedPricePct: number; // estimated leg price as % of stock price
  }[];
}

export const ALL_STRATEGIES: StrategyDef[] = [
  // 1. Single-Leg & Stocks
  {
    key: 'LONG_STOCK',
    name: 'Long Stock (100 Shares)',
    category: 'Bullish',
    sentiment: 'Bullish',
    description: 'Outright purchase of 100 shares. 100 Delta exposure with 1:1 dollar upside.',
    legs: [{ side: 'BUY', qty: 100, type: 'STOCK', strikeOffsetPct: 0, estimatedPricePct: 100 }]
  },
  {
    key: 'SHORT_STOCK',
    name: 'Short Stock (-100 Shares)',
    category: 'Bearish',
    sentiment: 'Bearish',
    description: 'Borrow and sell shares to profit from downward price moves. Negative 100 Delta.',
    legs: [{ side: 'SELL', qty: 100, type: 'STOCK', strikeOffsetPct: 0, estimatedPricePct: 100 }]
  },
  {
    key: 'LONG_CALL',
    name: 'Long Call',
    category: 'Bullish',
    sentiment: 'Bullish',
    description: 'Bullish directional strategy with uncapped upside and defined risk limited to premium paid.',
    legs: [{ side: 'BUY', qty: 1, type: 'CALL', strikeOffsetPct: 0, estimatedPricePct: 3.8 }]
  },
  {
    key: 'LONG_PUT',
    name: 'Long Put (Hedge / Short Spec)',
    category: 'Bearish',
    sentiment: 'Bearish',
    description: 'Bearish directional position or protective portfolio tail-risk hedge. Fixed risk.',
    legs: [{ side: 'BUY', qty: 1, type: 'PUT', strikeOffsetPct: 0, estimatedPricePct: 3.6 }]
  },
  {
    key: 'CASH_SECURED_PUT',
    name: 'Cash-Secured Put',
    category: 'Neutral/Income',
    sentiment: 'Bullish',
    description: 'Collect premium while agreeing to purchase stock at discount strike if assigned.',
    legs: [{ side: 'SELL', qty: 1, type: 'PUT', strikeOffsetPct: -5, estimatedPricePct: 2.2 }]
  },
  {
    key: 'NAKED_CALL',
    name: 'Naked Short Call',
    category: 'Bearish',
    sentiment: 'Bearish',
    description: 'Aggressive premium harvesting anticipating stock will remain below the strike.',
    legs: [{ side: 'SELL', qty: 1, type: 'CALL', strikeOffsetPct: 5, estimatedPricePct: 1.8 }]
  },

  // 2. Vertical Spreads
  {
    key: 'BULL_CALL_SPREAD',
    name: 'Bull Call Spread (Debit)',
    category: 'Bullish',
    sentiment: 'Bullish',
    description: 'Buy lower call, sell higher call. Defined risk and defined return with reduced net cost basis.',
    legs: [
      { side: 'BUY', qty: 1, type: 'CALL', strikeOffsetPct: 0, estimatedPricePct: 3.8 },
      { side: 'SELL', qty: 1, type: 'CALL', strikeOffsetPct: 5, estimatedPricePct: 1.8 }
    ]
  },
  {
    key: 'BEAR_CALL_SPREAD',
    name: 'Bear Call Spread (Credit)',
    category: 'Bearish',
    sentiment: 'Bearish',
    description: 'Sell lower call, buy higher call. Defined risk bearish income generation.',
    legs: [
      { side: 'SELL', qty: 1, type: 'CALL', strikeOffsetPct: 3, estimatedPricePct: 2.3 },
      { side: 'BUY', qty: 1, type: 'CALL', strikeOffsetPct: 7, estimatedPricePct: 1.1 }
    ]
  },
  {
    key: 'BULL_PUT_SPREAD',
    name: 'Bull Put Spread (Credit)',
    category: 'Bullish',
    sentiment: 'Bullish',
    description: 'Sell higher put, buy lower put. High-probability bullish income harvest.',
    legs: [
      { side: 'SELL', qty: 1, type: 'PUT', strikeOffsetPct: -2, estimatedPricePct: 2.6 },
      { side: 'BUY', qty: 1, type: 'PUT', strikeOffsetPct: -6, estimatedPricePct: 1.3 }
    ]
  },
  {
    key: 'BEAR_PUT_SPREAD',
    name: 'Bear Put Spread (Debit)',
    category: 'Bearish',
    sentiment: 'Bearish',
    description: 'Buy higher put, sell lower put. Cheaper downside hedge than outright long put.',
    legs: [
      { side: 'BUY', qty: 1, type: 'PUT', strikeOffsetPct: 0, estimatedPricePct: 3.6 },
      { side: 'SELL', qty: 1, type: 'PUT', strikeOffsetPct: -5, estimatedPricePct: 1.7 }
    ]
  },

  // 3. Synthetic & Hedging Combinations
  {
    key: 'COVERED_CALL',
    name: 'Covered Call',
    category: 'Neutral/Income',
    sentiment: 'Bullish',
    description: 'Own 100 shares + Sell 1 OTM Call. Generates yield against existing core holdings.',
    legs: [
      { side: 'BUY', qty: 100, type: 'STOCK', strikeOffsetPct: 0, estimatedPricePct: 100 },
      { side: 'SELL', qty: 1, type: 'CALL', strikeOffsetPct: 5, estimatedPricePct: 1.9 }
    ]
  },
  {
    key: 'PROTECTIVE_PUT',
    name: 'Protective Put (Married Put)',
    category: 'Bullish',
    sentiment: 'Bullish',
    description: 'Own 100 shares + Buy 1 Protective Put. Floors maximum downside while keeping full upside.',
    legs: [
      { side: 'BUY', qty: 100, type: 'STOCK', strikeOffsetPct: 0, estimatedPricePct: 100 },
      { side: 'BUY', qty: 1, type: 'PUT', strikeOffsetPct: -5, estimatedPricePct: 1.8 }
    ]
  },
  {
    key: 'COLLAR',
    name: 'Collar (Zero-Cost Hedge)',
    category: 'Neutral/Income',
    sentiment: 'Bullish',
    description: 'Own 100 shares + Buy Protective Put financed by Selling OTM Call.',
    legs: [
      { side: 'BUY', qty: 100, type: 'STOCK', strikeOffsetPct: 0, estimatedPricePct: 100 },
      { side: 'BUY', qty: 1, type: 'PUT', strikeOffsetPct: -5, estimatedPricePct: 1.9 },
      { side: 'SELL', qty: 1, type: 'CALL', strikeOffsetPct: 5, estimatedPricePct: 1.9 }
    ]
  },

  // 4. Volatility Regimes (Straddles & Strangles)
  {
    key: 'LONG_STRADDLE',
    name: 'Long Straddle',
    category: 'Volatility Expansion',
    sentiment: 'High Vol',
    description: 'Buy ATM Call + Buy ATM Put. Profits from violent moves in either direction.',
    legs: [
      { side: 'BUY', qty: 1, type: 'CALL', strikeOffsetPct: 0, estimatedPricePct: 3.8 },
      { side: 'BUY', qty: 1, type: 'PUT', strikeOffsetPct: 0, estimatedPricePct: 3.6 }
    ]
  },
  {
    key: 'SHORT_STRADDLE',
    name: 'Short Straddle',
    category: 'Neutral/Income',
    sentiment: 'Low Vol',
    description: 'Sell ATM Call + Sell ATM Put. Maximum Theta decay for quiet range-bound regimes.',
    legs: [
      { side: 'SELL', qty: 1, type: 'CALL', strikeOffsetPct: 0, estimatedPricePct: 3.8 },
      { side: 'SELL', qty: 1, type: 'PUT', strikeOffsetPct: 0, estimatedPricePct: 3.6 }
    ]
  },
  {
    key: 'LONG_STRANGLE',
    name: 'Long Strangle',
    category: 'Volatility Expansion',
    sentiment: 'High Vol',
    description: 'Buy OTM Call + Buy OTM Put. Lower debit than straddle, requires larger price breakout.',
    legs: [
      { side: 'BUY', qty: 1, type: 'CALL', strikeOffsetPct: 5, estimatedPricePct: 1.8 },
      { side: 'BUY', qty: 1, type: 'PUT', strikeOffsetPct: -5, estimatedPricePct: 1.7 }
    ]
  },
  {
    key: 'SHORT_STRANGLE',
    name: 'Short Strangle',
    category: 'Neutral/Income',
    sentiment: 'Low Vol',
    description: 'Sell OTM Call + Sell OTM Put. Wide breakeven window with high statistical probability.',
    legs: [
      { side: 'SELL', qty: 1, type: 'CALL', strikeOffsetPct: 6, estimatedPricePct: 1.5 },
      { side: 'SELL', qty: 1, type: 'PUT', strikeOffsetPct: -6, estimatedPricePct: 1.4 }
    ]
  },

  // 5. Advanced Wings
  {
    key: 'IRON_CONDOR',
    name: 'Iron Condor',
    category: 'Neutral/Income',
    sentiment: 'Neutral',
    description: 'Bull put spread + Bear call spread. Defined-risk range-bound market neutral harvest.',
    legs: [
      { side: 'BUY', qty: 1, type: 'PUT', strikeOffsetPct: -9, estimatedPricePct: 0.8 },
      { side: 'SELL', qty: 1, type: 'PUT', strikeOffsetPct: -4, estimatedPricePct: 2.1 },
      { side: 'SELL', qty: 1, type: 'CALL', strikeOffsetPct: 4, estimatedPricePct: 2.2 },
      { side: 'BUY', qty: 1, type: 'CALL', strikeOffsetPct: 9, estimatedPricePct: 0.9 }
    ]
  },
  {
    key: 'IRON_BUTTERFLY',
    name: 'Iron Butterfly',
    category: 'Neutral/Income',
    sentiment: 'Neutral',
    description: 'Sell ATM Straddle with protective OTM wings. High credit collected, tight peak profit.',
    legs: [
      { side: 'BUY', qty: 1, type: 'PUT', strikeOffsetPct: -6, estimatedPricePct: 1.4 },
      { side: 'SELL', qty: 1, type: 'PUT', strikeOffsetPct: 0, estimatedPricePct: 3.6 },
      { side: 'SELL', qty: 1, type: 'CALL', strikeOffsetPct: 0, estimatedPricePct: 3.8 },
      { side: 'BUY', qty: 1, type: 'CALL', strikeOffsetPct: 6, estimatedPricePct: 1.5 }
    ]
  },
  {
    key: 'LONG_CALL_BUTTERFLY',
    name: 'Long Call Butterfly',
    category: 'Neutral/Income',
    sentiment: 'Neutral',
    description: 'Buy lower call + 2x Short center calls + Buy upper call. Minimal capital outlay.',
    legs: [
      { side: 'BUY', qty: 1, type: 'CALL', strikeOffsetPct: -5, estimatedPricePct: 6.2 },
      { side: 'SELL', qty: 2, type: 'CALL', strikeOffsetPct: 0, estimatedPricePct: 3.8 },
      { side: 'BUY', qty: 1, type: 'CALL', strikeOffsetPct: 5, estimatedPricePct: 1.8 }
    ]
  },
  {
    key: 'CALENDAR_SPREAD',
    name: 'Calendar / Time Spread',
    category: 'Neutral/Income',
    sentiment: 'Neutral',
    description: 'Sell front-month short call, buy back-month long call. Exploits differential Theta decay.',
    legs: [
      { side: 'SELL', qty: 1, type: 'CALL', strikeOffsetPct: 0, estimatedPricePct: 2.4 },
      { side: 'BUY', qty: 1, type: 'CALL', strikeOffsetPct: 0, estimatedPricePct: 4.8 }
    ]
  }
];

interface TosStrategyRiskProfilesProps {
  asset: Asset;
  onPopulateStrategyOrder?: (symbol: string, side: OrderSide, price: number) => void;
  onPopulateSpreadOrder?: (order: {
    symbol: string;
    side: OrderSide;
    price: number;
    optionSpreadDetails: OptionSpreadDetails;
    isSimulated?: boolean;
  }) => void;
  onExecuteTrade?: (order: TradeOrder) => void;
}

export const TosStrategyRiskProfiles: React.FC<TosStrategyRiskProfilesProps> = ({
  asset,
  onPopulateStrategyOrder,
  onPopulateSpreadOrder,
  onExecuteTrade
}) => {
  const [selectedStrategyKey, setSelectedStrategyKey] = useState<StrategyKey>('BULL_CALL_SPREAD');
  const [simTradeSuccessNotice, setSimTradeSuccessNotice] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'Bullish' | 'Bearish' | 'Neutral/Income' | 'Volatility Expansion'>('ALL');

  // View Mode: 'STANDARD' (8:4 split) vs 'LARGER_VIEW' (full 12-col expanded cinema view)
  const [viewMode, setViewMode] = useState<'STANDARD' | 'LARGER_VIEW'>('LARGER_VIEW');
  const [isTheaterModalOpen, setIsTheaterModalOpen] = useState<boolean>(false);
  const [showPriceSlicesTable, setShowPriceSlicesTable] = useState<boolean>(true);

  // Simulator Sliders
  const [simPriceOffsetPct, setSimPriceOffsetPct] = useState<number>(0);
  const [simDte, setSimDte] = useState<number>(21);
  const [simIvShockPct, setSimIvShockPct] = useState<number>(0);
  const [riskFreeRate, setRiskFreeRate] = useState<number>(4.25); // Benchmark US 3-Month Treasury Bill / SOFR (4.25%)
  const [showProbabilityCone, setShowProbabilityCone] = useState<boolean>(true);
  const [showAllExpirationsCone, setShowAllExpirationsCone] = useState<boolean>(false);
  const [strategyVariation, setStrategyVariation] = useState<'STANDARD' | 'WIDE_WINGS' | 'NARROW_WINGS' | 'ASYMMETRIC'>('STANDARD');

  // Risk-Free Benchmark Presets
  const RISK_FREE_PRESETS = [
    { label: 'US 3M', rate: 4.35, title: 'US 3-Month Treasury Bill (4.35%)' },
    { label: 'SOFR', rate: 4.30, title: 'Secured Overnight Financing Rate (4.30%)' },
    { label: 'US 10Y', rate: 4.20, title: 'US 10-Year Benchmark Treasury (4.20%)' },
    { label: 'BoC', rate: 3.25, title: 'Bank of Canada Overnight Rate (3.25%)' },
    { label: 'Zero', rate: 0.0, title: 'Zero Rate Benchmark (0.00%)' }
  ];

  // Risk Graph Customization & Look Controls
  const [graphTheme, setGraphTheme] = useState<GraphThemeKey>('TOS_NEON');
  const [showAreaFill, setShowAreaFill] = useState<boolean>(true);
  const [showBellCurve, setShowBellCurve] = useState<boolean>(true);
  const [showIntermediateTPlus, setShowIntermediateTPlus] = useState<boolean>(true);
  const [showBreakevenBadges, setShowBreakevenBadges] = useState<boolean>(true);
  const [showStrikePins, setShowStrikePins] = useState<boolean>(true);
  const [showDualAxisROC, setShowDualAxisROC] = useState<boolean>(true);
  const [zoomRangePct, setZoomRangePct] = useState<number>(25); // 15%, 25%, 40% zoom

  // Mouse crosshair hover state
  const [hoverX, setHoverX] = useState<number | null>(null);

  const activeStrategy = useMemo(() => {
    return ALL_STRATEGIES.find(s => s.key === selectedStrategyKey) || ALL_STRATEGIES[0];
  }, [selectedStrategyKey]);

  const spotPrice = asset.price;
  const simStockPrice = spotPrice * (1 + simPriceOffsetPct / 100);

  // Probability Cone at Expiration (simDte)
  const baseIv = asset.assetClass === 'crypto' ? 58.0 : asset.symbol === 'NVDA' ? 44.0 : 28.0;
  const effectiveIv = Math.max(5, baseIv + simIvShockPct) / 100;
  const move1Sigma = spotPrice * effectiveIv * Math.sqrt(Math.max(1, simDte) / 365);
  const move2Sigma = move1Sigma * 2.0;

  // All Expirations Multi-Horizon Cones (for multi-cone fan display on risk profile)
  const allExpirationsCones = useMemo(() => {
    const dtes = [
      { label: '7D', dte: 7, color: '#38bdf8' },
      { label: '21D', dte: 21, color: '#00c076' },
      { label: '45D', dte: 45, color: '#a855f7' },
      { label: '90D', dte: 90, color: '#f59e0b' },
      { label: '180D', dte: 180, color: '#ec4899' },
      { label: '1Y', dte: 365, color: '#6366f1' }
    ];
    return dtes.map(item => {
      const m1 = spotPrice * effectiveIv * Math.sqrt(item.dte / 365);
      const m2 = m1 * 2.0;
      return {
        ...item,
        move1: m1,
        move2: m2,
        upper1: spotPrice + m1,
        lower1: Math.max(0.1, spotPrice - m1),
        upper2: spotPrice + m2,
        lower2: Math.max(0.1, spotPrice - m2)
      };
    });
  }, [spotPrice, effectiveIv]);

  // Single-point PnL calculator function
  const calculatePnLAtPrice = useMemo(() => {
    return (targetPrice: number) => {
      let pnlExpiry = 0;
      const variationMultiplier = strategyVariation === 'WIDE_WINGS' ? 1.5 : strategyVariation === 'NARROW_WINGS' ? 0.6 : 1.0;
      const asymmetricShift = strategyVariation === 'ASYMMETRIC' ? 2.5 : 0;

      activeStrategy.legs.forEach(leg => {
        const effectiveOffset = leg.strikeOffsetPct * variationMultiplier + (leg.type === 'CALL' ? asymmetricShift : -asymmetricShift);
        const legStrike = spotPrice * (1 + effectiveOffset / 100);
        const legCost = spotPrice * (leg.estimatedPricePct / 100) * (strategyVariation === 'NARROW_WINGS' ? 0.78 : strategyVariation === 'WIDE_WINGS' ? 1.25 : 1.0);

        if (leg.type === 'STOCK') {
          const deltaMove = targetPrice - legStrike;
          pnlExpiry += leg.side === 'BUY' ? deltaMove * leg.qty : -deltaMove * leg.qty;
        } else if (leg.type === 'CALL') {
          const intrinsic = Math.max(0, targetPrice - legStrike);
          const legValue = leg.side === 'BUY' ? (intrinsic - legCost) * 100 : (legCost - intrinsic) * 100;
          pnlExpiry += legValue * leg.qty;
        } else if (leg.type === 'PUT') {
          const intrinsic = Math.max(0, legStrike - targetPrice);
          const legValue = leg.side === 'BUY' ? (intrinsic - legCost) * 100 : (legCost - intrinsic) * 100;
          pnlExpiry += legValue * leg.qty;
        }
      });

      const dteFactor = Math.sqrt(Math.max(0.001, simDte) / 30);
      const ivAdjustment = 1 + simIvShockPct / 100;
      const thetaVal = (activeStrategy.legs.length >= 2 ? 3.5 : 1.8);
      // Interest carry effect from risk-free rate (r_f) over holding period
      const interestTimeFactor = (30 - simDte) / 365;
      const interestDrag = (spotPrice * 100 * (riskFreeRate / 100) * interestTimeFactor * 0.12);

      const pnlToday = pnlExpiry * (1 - dteFactor * 0.45 * ivAdjustment) - (thetaVal * (30 - simDte) * 0.4) - interestDrag;

      const halfDte = simDte * 0.5;
      const halfDteFactor = Math.sqrt(Math.max(0.001, halfDte) / 30);
      const halfInterestDrag = (spotPrice * 100 * (riskFreeRate / 100) * ((30 - halfDte) / 365) * 0.12);
      const pnlHalf = pnlExpiry * (1 - halfDteFactor * 0.45 * ivAdjustment) - (thetaVal * (30 - halfDte) * 0.4) - halfInterestDrag;

      return { pnlExpiry, pnlToday, pnlHalf };
    };
  }, [activeStrategy, spotPrice, simDte, simIvShockPct, strategyVariation, riskFreeRate]);

  // Compute calculated metrics for active strategy
  const metrics = useMemo(() => {
    const isDebit = ['LONG_CALL', 'LONG_PUT', 'BULL_CALL_SPREAD', 'BEAR_PUT_SPREAD', 'LONG_STRADDLE', 'LONG_STRANGLE', 'LONG_CALL_BUTTERFLY', 'CALENDAR_SPREAD'].includes(activeStrategy.key);
    const isCredit = ['CASH_SECURED_PUT', 'NAKED_CALL', 'BEAR_CALL_SPREAD', 'BULL_PUT_SPREAD', 'SHORT_STRADDLE', 'SHORT_STRANGLE', 'IRON_CONDOR', 'IRON_BUTTERFLY'].includes(activeStrategy.key);

    let maxProfit = 0;
    let maxLoss = 0;
    let be1 = spotPrice;
    let be2: number | null = null;
    let pop = 50;
    let delta = 0;
    let gamma = 0;
    let theta = 0;
    let vega = 0;

    if (activeStrategy.key === 'LONG_STOCK') {
      maxProfit = Infinity;
      maxLoss = spotPrice * 100;
      be1 = spotPrice;
      pop = 52.0;
      delta = 100;
    } else if (activeStrategy.key === 'SHORT_STOCK') {
      maxProfit = spotPrice * 100;
      maxLoss = Infinity;
      be1 = spotPrice;
      pop = 48.0;
      delta = -100;
    } else if (activeStrategy.key === 'BULL_CALL_SPREAD') {
      const spreadWidth = spotPrice * 0.05;
      const netDebit = spreadWidth * 0.40;
      maxProfit = Number(((spreadWidth - netDebit) * 100).toFixed(0));
      maxLoss = Number((netDebit * 100).toFixed(0));
      be1 = Number((spotPrice + netDebit).toFixed(2));
      pop = 58.4;
      delta = 28;
      gamma = 0.02;
      theta = 1.80;
      vega = -3.20;
    } else if (activeStrategy.key === 'IRON_CONDOR') {
      const wingWidth = spotPrice * 0.05;
      const netCredit = wingWidth * 0.32;
      maxProfit = Number((netCredit * 100).toFixed(0));
      maxLoss = Number(((wingWidth - netCredit) * 100).toFixed(0));
      be1 = Number((spotPrice * 0.96 - netCredit).toFixed(2));
      be2 = Number((spotPrice * 1.04 + netCredit).toFixed(2));
      pop = 68.2;
      delta = 2;
      gamma = -0.04;
      theta = 5.40;
      vega = -18.50;
    } else if (activeStrategy.key === 'COVERED_CALL') {
      const premium = spotPrice * 0.019;
      const otmCap = spotPrice * 0.05;
      maxProfit = Number(((otmCap + premium) * 100).toFixed(0));
      maxLoss = Number(((spotPrice - premium) * 100).toFixed(0));
      be1 = Number((spotPrice - premium).toFixed(2));
      pop = 71.5;
      delta = 64;
      theta = 3.80;
    } else if (activeStrategy.key === 'BULL_PUT_SPREAD') {
      const spreadWidth = spotPrice * 0.05;
      const netCredit = spreadWidth * 0.30;
      maxProfit = Number((netCredit * 100).toFixed(0));
      maxLoss = Number(((spreadWidth - netCredit) * 100).toFixed(0));
      be1 = Number((spotPrice * 0.98 - netCredit).toFixed(2));
      pop = 72.8;
      delta = 18;
      theta = 4.20;
    } else if (activeStrategy.key === 'LONG_STRADDLE') {
      const totalCost = spotPrice * 0.074;
      maxProfit = Infinity;
      maxLoss = Number((totalCost * 100).toFixed(0));
      be1 = Number((spotPrice - totalCost).toFixed(2));
      be2 = Number((spotPrice + totalCost).toFixed(2));
      pop = 38.6;
      delta = 0;
      gamma = 0.08;
      theta = -8.20;
      vega = 24.50;
    } else {
      maxProfit = Number((spotPrice * 3.4).toFixed(0));
      maxLoss = Number((spotPrice * 2.1).toFixed(0));
      be1 = Number((spotPrice * 1.02).toFixed(2));
      pop = 54.0;
      delta = 32;
      theta = 2.10;
      vega = 5.40;
    }

    // Calculate Option Greek Rho (dollar sensitivity per 1.00% / 100 bps shift in Risk-Free Rate)
    const T = Math.max(1, simDte) / 365;
    let netRho = 0;
    activeStrategy.legs.forEach(leg => {
      const strike = spotPrice * (1 + leg.strikeOffsetPct / 100);
      const sign = leg.side === 'BUY' ? 1 : -1;
      if (leg.type === 'CALL') {
        netRho += sign * leg.qty * (strike * T * 0.015);
      } else if (leg.type === 'PUT') {
        netRho -= sign * leg.qty * (strike * T * 0.012);
      }
    });
    const rho = Number(netRho.toFixed(2));
    const capitalAtRisk = maxLoss !== Infinity ? maxLoss : spotPrice * 100;
    const financingDrag = Number((capitalAtRisk * (riskFreeRate / 100) * T).toFixed(2));
    const hurdleRatePct = Number((riskFreeRate * T).toFixed(2));

    return { maxProfit, maxLoss, be1, be2, pop, delta, gamma, theta, vega, rho, financingDrag, hurdleRatePct, isDebit, isCredit, riskFreeRate };
  }, [activeStrategy, spotPrice, simDte, riskFreeRate]);

  // Construct multi-leg option spread details
  const spreadDetails: OptionSpreadDetails = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    const legs: OptionSpreadLeg[] = activeStrategy.legs.map((leg, idx) => {
      const strike = Number((spotPrice * (1 + leg.strikeOffsetPct / 100)).toFixed(2));
      const estPrice = Number(((spotPrice * leg.estimatedPricePct) / 100).toFixed(2));
      if (leg.side === 'BUY') {
        totalDebit += estPrice * leg.qty;
      } else {
        totalCredit += estPrice * leg.qty;
      }
      return {
        id: `leg-${idx + 1}`,
        side: leg.side,
        quantity: leg.qty,
        strike,
        expiration: '23 OCT 26',
        optionType: (leg.type === 'STOCK' ? 'CALL' : leg.type) as 'CALL' | 'PUT',
        bid: Number((estPrice * 0.98).toFixed(2)),
        ask: Number((estPrice * 1.02).toFixed(2)),
        mid: estPrice
      };
    });

    const netVal = totalDebit - totalCredit;
    const netDebitOrCredit = netVal > 0.01 ? 'DEBIT' : netVal < -0.01 ? 'CREDIT' : 'EVEN';
    const netPrice = Number(Math.max(0.1, Math.abs(netVal)).toFixed(2));

    const stratType =
      activeStrategy.key.includes('CONDOR') ? 'IRON_CONDOR' :
      activeStrategy.key.includes('BUTTERFLY') ? 'IRON_BUTTERFLY' :
      activeStrategy.key.includes('STRADDLE') ? 'STRADDLE' :
      activeStrategy.key.includes('STRANGLE') ? 'STRANGLE' :
      activeStrategy.key.includes('CALENDAR') ? 'CALENDAR' :
      activeStrategy.key.includes('COLLAR') ? 'COLLAR' :
      activeStrategy.key.includes('COVERED') ? 'COVERED_CALL' : 'VERTICAL';

    return {
      strategyName: activeStrategy.name,
      strategyType: stratType,
      netDebitOrCredit,
      netPrice,
      legs,
      maxProfit: metrics.maxProfit,
      maxLoss: metrics.maxLoss,
      breakeven: [metrics.be1, metrics.be2].filter(Boolean) as number[]
    };
  }, [activeStrategy, spotPrice, metrics]);

  // Stage option spread in bottom bar
  const handleStageSpreadOrder = () => {
    if (onPopulateSpreadOrder) {
      onPopulateSpreadOrder({
        symbol: asset.symbol,
        side: spreadDetails.netDebitOrCredit === 'CREDIT' ? 'SELL' : 'BUY',
        price: spreadDetails.netPrice,
        optionSpreadDetails: spreadDetails,
        isSimulated: false
      });
    } else if (onPopulateStrategyOrder) {
      onPopulateStrategyOrder(asset.symbol, 'BUY', spotPrice);
    }
  };

  // Immediate 1-click execution for simulated paperMoney trade
  const handleExecuteSimulatedSpreadTrade = () => {
    const simOrder: TradeOrder = {
      id: `sim-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      symbol: `${asset.symbol} ${activeStrategy.name.toUpperCase()}`,
      name: `${asset.name} · ${activeStrategy.name}`,
      assetClass: 'options',
      side: spreadDetails.netDebitOrCredit === 'CREDIT' ? 'SELL' : 'BUY',
      type: 'LIMIT',
      quantity: 1,
      price: spreadDetails.netPrice,
      totalAmount: spreadDetails.netPrice * 100,
      brokerageId: 'schwab',
      status: 'FILLED',
      timestamp: Date.now(),
      fillPrice: spreadDetails.netPrice,
      fillTimestamp: Date.now(),
      executionLatencyMs: 5,
      biometricConfirmed: true,
      isSimulated: true,
      optionSpreadDetails: spreadDetails
    };

    if (onExecuteTrade) {
      onExecuteTrade(simOrder);
      setSimTradeSuccessNotice(`Simulated ${activeStrategy.name} trade executed (+1 spread @ $${spreadDetails.netPrice.toFixed(2)})`);
      setTimeout(() => setSimTradeSuccessNotice(null), 4000);
    } else if (onPopulateSpreadOrder) {
      onPopulateSpreadOrder({
        symbol: asset.symbol,
        side: spreadDetails.netDebitOrCredit === 'CREDIT' ? 'SELL' : 'BUY',
        price: spreadDetails.netPrice,
        optionSpreadDetails: spreadDetails,
        isSimulated: true
      });
    }
  };

  // Dynamic Greeks computation at arbitrary underlying price
  const calculateGreeksAtPrice = (targetPrice: number) => {
    const diff = (targetPrice - spotPrice) / spotPrice;
    const dynamicDelta = Number((metrics.delta + (metrics.gamma !== 0 ? metrics.gamma : 0.03) * (targetPrice - spotPrice) * 10).toFixed(1));
    const dynamicGamma = Number((metrics.gamma * Math.exp(-Math.pow(diff / 0.1, 2))).toFixed(3));
    const dynamicTheta = Number((metrics.theta * (1 + 0.4 * Math.exp(-Math.pow(diff / 0.08, 2)))).toFixed(2));
    const dynamicVega = Number((metrics.vega * Math.exp(-Math.pow(diff / 0.15, 2))).toFixed(2));
    const dynamicRho = Number((metrics.rho * (1 + 0.1 * diff)).toFixed(2));
    return { delta: dynamicDelta, gamma: dynamicGamma, theta: dynamicTheta, vega: dynamicVega, rho: dynamicRho };
  };

  // Strategy Option Leg Strikes for Marker Pins
  const strategyLegStrikes = useMemo(() => {
    const variationMultiplier = strategyVariation === 'WIDE_WINGS' ? 1.5 : strategyVariation === 'NARROW_WINGS' ? 0.6 : 1.0;
    const asymmetricShift = strategyVariation === 'ASYMMETRIC' ? 2.5 : 0;

    return activeStrategy.legs.map((leg, idx) => {
      const effectiveOffset = leg.strikeOffsetPct * variationMultiplier + (leg.type === 'CALL' ? asymmetricShift : -asymmetricShift);
      const strike = spotPrice * (1 + effectiveOffset / 100);
      return {
        ...leg,
        strike,
        label: `${leg.side} ${strike.toFixed(1)} ${leg.type}`
      };
    });
  }, [activeStrategy, spotPrice, strategyVariation]);

  // Compute 120-point Ultra-Smooth Payoff & Probability Density Curves
  const payoffData = useMemo(() => {
    const points: { price: number; pnlAtExpiry: number; pnlToday: number; pnlHalf: number; probDensity: number }[] = [];
    const minRange = spotPrice * (1 - zoomRangePct / 100);
    const maxRange = spotPrice * (1 + zoomRangePct / 100);
    const steps = 120;

    for (let i = 0; i <= steps; i++) {
      const price = minRange + (i / steps) * (maxRange - minRange);
      const { pnlExpiry, pnlToday, pnlHalf } = calculatePnLAtPrice(price);

      // Normal distribution bell curve (normalized 0 to 1 at peak)
      const z = (price - spotPrice) / Math.max(0.01, move1Sigma);
      const probDensity = Math.exp(-0.5 * z * z);

      points.push({ price, pnlAtExpiry: pnlExpiry, pnlToday, pnlHalf, probDensity });
    }
    return points;
  }, [spotPrice, calculatePnLAtPrice, zoomRangePct, move1Sigma]);

  const minPnl = Math.min(...payoffData.map(p => Math.min(p.pnlAtExpiry, p.pnlToday, p.pnlHalf)));
  const maxPnl = Math.max(...payoffData.map(p => Math.max(p.pnlAtExpiry, p.pnlToday, p.pnlHalf)));
  const pnlSpan = Math.max(1, maxPnl - minPnl);

  // Thinkorswim Analytical Price Slices Matrix
  const priceSlices = useMemo(() => {
    const minBound = spotPrice * (1 - zoomRangePct / 100);
    const maxBound = spotPrice * (1 + zoomRangePct / 100);

    const list = [
      { label: '-15.0% Down', price: spotPrice * 0.85 },
      { label: '-2σ Limit (95.4%)', price: Math.max(minBound, spotPrice - move2Sigma) },
      { label: '-10.0% Down', price: spotPrice * 0.90 },
      { label: '-1σ Move (68.3%)', price: Math.max(minBound, spotPrice - move1Sigma) },
      { label: '-5.0% Down', price: spotPrice * 0.95 },
      { label: 'Spot Price (Current)', price: spotPrice },
      { label: '+5.0% Up', price: spotPrice * 1.05 },
      { label: '+1σ Move (68.3%)', price: Math.min(maxBound, spotPrice + move1Sigma) },
      { label: '+10.0% Up', price: spotPrice * 1.10 },
      { label: '+2σ Limit (95.4%)', price: Math.min(maxBound, spotPrice + move2Sigma) },
      { label: '+15.0% Rally', price: spotPrice * 1.15 }
    ];

    if (metrics.be1 && metrics.be1 >= minBound && metrics.be1 <= maxBound) {
      list.push({ label: 'Breakeven 1', price: metrics.be1 });
    }
    if (metrics.be2 && metrics.be2 >= minBound && metrics.be2 <= maxBound) {
      list.push({ label: 'Breakeven 2', price: metrics.be2 });
    }

    return list
      .sort((a, b) => a.price - b.price)
      .map(slice => {
        const { pnlExpiry, pnlToday } = calculatePnLAtPrice(slice.price);
        const deltaPct = ((slice.price - spotPrice) / spotPrice) * 100;
        return {
          ...slice,
          deltaPct,
          pnlExpiry,
          pnlToday
        };
      });
  }, [spotPrice, move1Sigma, move2Sigma, metrics, calculatePnLAtPrice, zoomRangePct]);

  const filteredStrategies = ALL_STRATEGIES.filter(s => {
    if (filterCategory === 'ALL') return true;
    return s.category === filterCategory;
  });

  // Crosshair calculations for hover state
  const hoveredData = useMemo(() => {
    if (hoverX === null) return null;
    const minRange = spotPrice * (1 - zoomRangePct / 100);
    const maxRange = spotPrice * (1 + zoomRangePct / 100);
    const plotX = 65;
    const plotWidth = 790;
    const clampedRelX = Math.max(0, Math.min(plotWidth, hoverX - plotX));
    const price = minRange + (clampedRelX / plotWidth) * (maxRange - minRange);
    const { pnlExpiry, pnlToday, pnlHalf } = calculatePnLAtPrice(price);
    const pctMove = ((price - spotPrice) / spotPrice) * 100;
    const greeks = calculateGreeksAtPrice(price);
    return { price, pnlExpiry, pnlToday, pnlHalf, pctMove, greeks, relX: clampedRelX, cursorX: hoverX };
  }, [hoverX, spotPrice, zoomRangePct, calculatePnLAtPrice, metrics]);

  // Renders the SVG Payoff Graph (shared between standard view, cinema view, and theater modal)
  const renderPayoffSvg = (heightClass: string) => {
    const isCAD = asset.currency === 'CAD' || asset.symbol.endsWith('.TO');
    const currSym = isCAD ? 'C$' : '$';
    const theme = GRAPH_THEMES[graphTheme] || GRAPH_THEMES.TOS_NEON;

    const minRange = spotPrice * (1 - zoomRangePct / 100);
    const maxRange = spotPrice * (1 + zoomRangePct / 100);

    const plotX = 65;
    const plotY = 32;
    const plotWidth = 790;
    const plotHeight = 226;

    const priceToX = (price: number) => {
      return plotX + ((price - minRange) / (maxRange - minRange)) * plotWidth;
    };

    const pnlToY = (pnl: number) => {
      return plotY + plotHeight - ((pnl - minPnl) / pnlSpan) * plotHeight;
    };

    const zeroY = pnlToY(0);
    const clampedZeroY = Math.max(plotY + 8, Math.min(plotY + plotHeight - 8, zeroY));
    const spotX = priceToX(spotPrice);
    const simX = priceToX(simStockPrice);

    // Expiry points
    const expiryPoints = payoffData.map(p => ({
      x: priceToX(p.price),
      y: pnlToY(p.pnlAtExpiry),
      pnl: p.pnlAtExpiry
    }));
    const expiryPathD = expiryPoints
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(' ');
    const expiryAreaD = `${expiryPathD} L ${(plotX + plotWidth).toFixed(1)} ${clampedZeroY.toFixed(1)} L ${plotX.toFixed(1)} ${clampedZeroY.toFixed(1)} Z`;

    // Today points
    const todayPoints = payoffData.map(p => ({
      x: priceToX(p.price),
      y: pnlToY(p.pnlToday)
    }));
    const todayPathD = todayPoints
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(' ');

    // Half DTE points (Intermediate step)
    const halfPoints = payoffData.map(p => ({
      x: priceToX(p.price),
      y: pnlToY(p.pnlHalf)
    }));
    const halfPathD = halfPoints
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(' ');

    // Bell curve probability points (bottom 38% of plotHeight)
    const bellPoints = payoffData.map(p => ({
      x: priceToX(p.price),
      y: (plotY + plotHeight) - (p.probDensity * (plotHeight * 0.38))
    }));
    const bellPathD = bellPoints
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(' ');
    const bellAreaD = `${bellPathD} L ${(plotX + plotWidth).toFixed(1)} ${(plotY + plotHeight).toFixed(1)} L ${plotX.toFixed(1)} ${(plotY + plotHeight).toFixed(1)} Z`;

    // Y-Axis Ticks (5 levels)
    const yTicks = [
      { pnl: maxPnl, label: `+${currSym}${Math.round(maxPnl).toLocaleString()}` },
      { pnl: maxPnl * 0.5, label: `+${currSym}${Math.round(maxPnl * 0.5).toLocaleString()}` },
      { pnl: 0, label: `${currSym}0` },
      { pnl: minPnl * 0.5, label: `-${currSym}${Math.round(Math.abs(minPnl * 0.5)).toLocaleString()}` },
      { pnl: minPnl, label: `-${currSym}${Math.round(Math.abs(minPnl)).toLocaleString()}` }
    ];
    const capitalRisk = Math.max(100, metrics.maxLoss !== Infinity ? metrics.maxLoss : spotPrice * 100);

    // X-Axis Price Ticks (7 evenly spaced price levels)
    const xTicks = [0, 0.166, 0.333, 0.5, 0.666, 0.833, 1.0].map(ratio => {
      const price = minRange + ratio * (maxRange - minRange);
      const x = plotX + ratio * plotWidth;
      const pct = ((price - spotPrice) / spotPrice) * 100;
      return { price, x, pct };
    });

    return (
      <div
        className={`${heightClass} w-full rounded-xl border p-3.5 relative flex flex-col justify-between overflow-hidden shadow-2xl transition-colors duration-200`}
        style={{
          backgroundColor: theme.bgHex,
          borderColor: theme.panelBorderHex
        }}
      >
        {/* 1. In-Graph Controls & Theme Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b z-10" style={{ borderColor: theme.panelBorderHex }}>
          {/* Brand & Strategy */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase">
              <span className="font-black text-slate-400">thinkorswim®</span>
              <span className="text-slate-600">/</span>
              <span className="font-bold text-white">Risk Profile</span>
              <span className="text-slate-600">·</span>
              <span style={{ color: theme.accentTextHex }} className="font-bold">
                {asset.symbol} {activeStrategy.name}
              </span>
              {isCAD && (
                <span className="text-[9px] text-red-300 bg-red-950/40 px-1 py-0.2 rounded border border-red-500/30 font-bold">
                  TSX CAD
                </span>
              )}
            </div>

            {/* Quick Themes */}
            <div className="flex items-center bg-[#080d14] border border-[#212b38] rounded-md p-0.5 text-[10px] ml-1">
              {(['TOS_NEON', 'AMBER_PHOSPHOR', 'CYBER_MATRIX', 'SLATE_PRO'] as GraphThemeKey[]).map(tKey => {
                const th = GRAPH_THEMES[tKey];
                const isActive = graphTheme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => setGraphTheme(tKey)}
                    className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isActive ? 'bg-[#1c2633] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`Switch Risk Graph theme to ${th.name}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: th.colorDot }} />
                    <span>{th.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display & Zoom Controls */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            {/* Zoom Range */}
            <div className="flex items-center bg-[#080d14] border border-[#212b38] rounded-md p-0.5">
              <span className="text-slate-500 px-1.5 text-[9px] uppercase font-bold">Zoom:</span>
              {[
                { pct: 15, label: '±15%' },
                { pct: 25, label: '±25%' },
                { pct: 40, label: '±40%' }
              ].map(z => (
                <button
                  key={z.pct}
                  onClick={() => setZoomRangePct(z.pct)}
                  className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    zoomRangePct === z.pct ? 'bg-amber-400 text-black shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>

            {/* Feature Toggles */}
            <div className="flex items-center bg-[#080d14] border border-[#212b38] rounded-md p-0.5 gap-0.5">
              <button
                onClick={() => setShowAreaFill(!showAreaFill)}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  showAreaFill ? 'bg-[#1c2633] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Profit/Loss Gradient Area Fill"
              >
                Fill
              </button>
              <button
                onClick={() => setShowBellCurve(!showBellCurve)}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  showBellCurve ? 'bg-[#1c2633] text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Probability Density Bell Curve (Implied Volatility PDF)"
              >
                Bell (PDF)
              </button>
              <button
                onClick={() => setShowIntermediateTPlus(!showIntermediateTPlus)}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  showIntermediateTPlus ? 'bg-[#1c2633] text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Intermediate Decay Step (T+½ DTE curve)"
              >
                T+½
              </button>
              <button
                onClick={() => setShowStrikePins(!showStrikePins)}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  showStrikePins ? 'bg-[#1c2633] text-amber-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Strategy Strike Markers"
              >
                Pins
              </button>
              <button
                onClick={() => setShowBreakevenBadges(!showBreakevenBadges)}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  showBreakevenBadges ? 'bg-[#1c2633] text-sky-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Breakeven Pins"
              >
                B/E
              </button>
              <button
                onClick={() => setShowProbabilityCone(!showProbabilityCone)}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  showProbabilityCone ? 'bg-[#1c2633] text-emerald-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle 1σ / 2σ Expected Move Bands"
              >
                1/2σ
              </button>
              <button
                onClick={() => setShowDualAxisROC(!showDualAxisROC)}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  showDualAxisROC ? 'bg-[#1c2633] text-cyan-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Right Y-Axis (Return on Risk %)"
              >
                ROC%
              </button>
            </div>
          </div>
        </div>

        {/* 2. Top-Bar Legend & Live Readout */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono py-1 px-2 my-1 rounded bg-[#070b10]/80 border border-[#17202c] z-10">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold" style={{ color: theme.expiryLineHex }}>
              <span className="w-3.5 h-0.5" style={{ backgroundColor: theme.expiryLineHex, boxShadow: `0 0 6px ${theme.expiryGlowHex}` }}></span>
              <span>EXPIRATION</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold" style={{ color: theme.todayLineHex }}>
              <span className="w-3.5 h-0.5 border-t-2 border-dashed" style={{ borderColor: theme.todayLineHex }}></span>
              <span>TODAY (T+0)</span>
            </span>
            {showIntermediateTPlus && (
              <span className="flex items-center gap-1.5 font-bold" style={{ color: theme.halfLineHex }}>
                <span className="w-3.5 h-0.5 border-t border-dotted" style={{ borderColor: theme.halfLineHex }}></span>
                <span>T+{Math.round(simDte / 2)}D (HALF)</span>
              </span>
            )}
            {showBellCurve && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-1.5 rounded-t-full border-t border-x" style={{ borderColor: theme.bellCurveStrokeHex, backgroundColor: theme.bellCurveFillHex }}></span>
                <span>PDF (IV {Math.round(effectiveIv * 100)}%)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>SPOT ${spotPrice.toFixed(2)}</span>
            </span>
            {Math.abs(simStockPrice - spotPrice) > 0.05 && (
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span>SIM ${simStockPrice.toFixed(2)} ({simPriceOffsetPct >= 0 ? '+' : ''}{simPriceOffsetPct}%)</span>
              </span>
            )}
            <span className="text-slate-500 font-sans hidden md:inline">
              Move cursor across graph to inspect telemetry
            </span>
          </div>
        </div>

        {/* 3. SVG High-Resolution Payoff Surface */}
        <div className="flex-1 w-full relative min-h-[180px]">
          <svg
            className="w-full h-full overflow-visible cursor-crosshair select-none"
            viewBox="0 0 920 300"
            preserveAspectRatio="none"
            onMouseMove={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = ((e.clientX - rect.left) / rect.width) * 920;
              setHoverX(Math.max(plotX, Math.min(plotX + plotWidth, relX)));
            }}
            onMouseLeave={() => setHoverX(null)}
          >
            <defs>
              {/* Theme Linear Gradients */}
              <linearGradient id="themeProfitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.profitGradStart} stopOpacity="0.32" />
                <stop offset="100%" stopColor={theme.profitGradStart} stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="themeLossGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.lossGradStart} stopOpacity="0.02" />
                <stop offset="100%" stopColor={theme.lossGradStart} stopOpacity="0.30" />
              </linearGradient>
              <linearGradient id="bellCurveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.bellCurveStrokeHex} stopOpacity="0.25" />
                <stop offset="100%" stopColor={theme.bellCurveStrokeHex} stopOpacity="0.01" />
              </linearGradient>

              {/* Clip Paths */}
              <clipPath id="plotAreaClip">
                <rect x={plotX} y={plotY} width={plotWidth} height={plotHeight} />
              </clipPath>
              <clipPath id="aboveZeroClip">
                <rect x={plotX} y={plotY} width={plotWidth} height={Math.max(0, clampedZeroY - plotY)} />
              </clipPath>
              <clipPath id="belowZeroClip">
                <rect x={plotX} y={clampedZeroY} width={plotWidth} height={Math.max(0, (plotY + plotHeight) - clampedZeroY)} />
              </clipPath>

              {/* Glow Filter */}
              <filter id="tosGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid Lines (Horizontal P/L levels) */}
            {yTicks.map((tick, idx) => {
              const y = pnlToY(tick.pnl);
              return (
                <g key={`ygrid-${idx}`}>
                  <line
                    x1={plotX}
                    y1={y}
                    x2={plotX + plotWidth}
                    y2={y}
                    stroke={theme.gridLineHex}
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  {/* Left Y-Axis Label ($ P/L) */}
                  <text
                    x={plotX - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill={tick.pnl > 0 ? theme.profitGradStart : tick.pnl < 0 ? theme.lossGradStart : '#94a3b8'}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {tick.label}
                  </text>
                  {/* Right Y-Axis Label (ROC %) */}
                  {showDualAxisROC && (
                    <text
                      x={plotX + plotWidth + 6}
                      y={y + 3}
                      textAnchor="start"
                      fill={tick.pnl > 0 ? theme.profitGradStart : tick.pnl < 0 ? theme.lossGradStart : '#64748b'}
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      {tick.pnl > 0 ? '+' : ''}{((tick.pnl / capitalRisk) * 100).toFixed(0)}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* Grid Lines (Vertical Price levels) */}
            {xTicks.map((tick, idx) => (
              <g key={`xgrid-${idx}`}>
                <line
                  x1={tick.x}
                  y1={plotY}
                  x2={tick.x}
                  y2={plotY + plotHeight}
                  stroke={theme.gridSubLineHex}
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
                {/* Bottom X-Axis Tick Label */}
                <line
                  x1={tick.x}
                  y1={plotY + plotHeight}
                  x2={tick.x}
                  y2={plotY + plotHeight + 4}
                  stroke={theme.zeroAxisHex}
                  strokeWidth="1"
                />
                <text
                  x={tick.x}
                  y={plotY + plotHeight + 14}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {currSym}{tick.price.toFixed(1)}
                </text>
                <text
                  x={tick.x}
                  y={plotY + plotHeight + 24}
                  textAnchor="middle"
                  fill={tick.pct >= 0 ? '#10b981' : '#f43f5e'}
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  {tick.pct >= 0 ? '+' : ''}{tick.pct.toFixed(1)}%
                </text>
              </g>
            ))}

            {/* 1. Normal Distribution Bell Curve (Implied Volatility PDF) */}
            {showBellCurve && (
              <g clipPath="url(#plotAreaClip)">
                <path d={bellAreaD} fill="url(#bellCurveGrad)" />
                <path
                  d={bellPathD}
                  fill="none"
                  stroke={theme.bellCurveStrokeHex}
                  strokeWidth="1.6"
                  strokeDasharray="4 2"
                  opacity="0.85"
                />
                <text
                  x={plotX + 10}
                  y={plotY + plotHeight - 8}
                  fill={theme.bellCurveStrokeHex}
                  fontSize="8"
                  fontFamily="monospace"
                  opacity="0.75"
                >
                  Probability Density (Normal PDF · IV={Math.round(effectiveIv * 100)}%)
                </text>
              </g>
            )}

            {/* 2. Expected Move Bands (1σ and 2σ at Expiration) */}
            {showProbabilityCone && (() => {
              const left2Sigma = Math.max(plotX, priceToX(spotPrice - move2Sigma));
              const right2Sigma = Math.min(plotX + plotWidth, priceToX(spotPrice + move2Sigma));
              const left1Sigma = Math.max(plotX, priceToX(spotPrice - move1Sigma));
              const right1Sigma = Math.min(plotX + plotWidth, priceToX(spotPrice + move1Sigma));

              return (
                <g>
                  {/* 2-Sigma Range (95.4% Probability) */}
                  <rect
                    x={left2Sigma}
                    y={plotY}
                    width={Math.max(1, right2Sigma - left2Sigma)}
                    height={plotHeight}
                    fill="rgba(168, 85, 247, 0.05)"
                  />
                  <line x1={left2Sigma} y1={plotY} x2={left2Sigma} y2={plotY + plotHeight} stroke="#c084fc" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
                  <line x1={right2Sigma} y1={plotY} x2={right2Sigma} y2={plotY + plotHeight} stroke="#c084fc" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />

                  {/* 1-Sigma Range (68.3% Probability) */}
                  <rect
                    x={left1Sigma}
                    y={plotY}
                    width={Math.max(1, right1Sigma - left1Sigma)}
                    height={plotHeight}
                    fill="rgba(0, 230, 118, 0.06)"
                  />
                  <line x1={left1Sigma} y1={plotY} x2={left1Sigma} y2={plotY + plotHeight} stroke="#00e676" strokeDasharray="4 2" strokeWidth="1.2" opacity="0.7" />
                  <line x1={right1Sigma} y1={plotY} x2={right1Sigma} y2={plotY + plotHeight} stroke="#00e676" strokeDasharray="4 2" strokeWidth="1.2" opacity="0.7" />

                  {/* Cone Labels */}
                  <text x={left1Sigma + 4} y={plotY + 12} fill="#00e676" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    -1σ ({currSym}{(spotPrice - move1Sigma).toFixed(1)})
                  </text>
                  <text x={right1Sigma - 84} y={plotY + 12} fill="#00e676" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    +1σ ({currSym}{(spotPrice + move1Sigma).toFixed(1)})
                  </text>
                  <text x={left2Sigma + 4} y={plotY + 24} fill="#c084fc" fontSize="8" fontFamily="monospace">
                    -2σ (95.4%)
                  </text>
                  <text x={right2Sigma - 64} y={plotY + 24} fill="#c084fc" fontSize="8" fontFamily="monospace">
                    +2σ (95.4%)
                  </text>
                </g>
              );
            })()}

            {/* 3. Multi-Horizon Expirations Cone Fan */}
            {showAllExpirationsCone && (
              <g>
                {allExpirationsCones.map(cone => {
                  const xLeft1 = Math.max(plotX, priceToX(cone.lower1));
                  const xRight1 = Math.min(plotX + plotWidth, priceToX(cone.upper1));
                  return (
                    <g key={cone.label}>
                      <line x1={xLeft1} y1={plotY} x2={xLeft1} y2={plotY + plotHeight} stroke={cone.color} strokeDasharray="3 3" strokeWidth="1" opacity="0.5" />
                      <line x1={xRight1} y1={plotY} x2={xRight1} y2={plotY + plotHeight} stroke={cone.color} strokeDasharray="3 3" strokeWidth="1" opacity="0.5" />
                      <text x={xRight1 - 24} y={plotY + 36} fill={cone.color} fontSize="8" fontFamily="monospace" fontWeight="bold">
                        {cone.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* 4. Shaded Profit and Loss Fills */}
            {showAreaFill && (
              <g clipPath="url(#plotAreaClip)">
                <g clipPath="url(#aboveZeroClip)">
                  <path d={expiryAreaD} fill="url(#themeProfitGrad)" />
                </g>
                <g clipPath="url(#belowZeroClip)">
                  <path d={expiryAreaD} fill="url(#themeLossGrad)" />
                </g>
              </g>
            )}

            {/* 5. Breakeven Zero Axis ($0 P/L Line) */}
            <g>
              <line
                x1={plotX}
                y1={clampedZeroY}
                x2={plotX + plotWidth}
                y2={clampedZeroY}
                stroke={theme.zeroAxisHex}
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <rect
                x={plotX + 4}
                y={clampedZeroY - 12}
                width="84"
                height="12"
                fill={theme.zeroBadgeBg}
                rx="2"
                stroke={theme.zeroAxisHex}
                strokeWidth="0.8"
              />
              <text
                x={plotX + 7}
                y={clampedZeroY - 3}
                fill={theme.zeroBadgeText}
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {currSym}0 BREAKEVEN
              </text>
            </g>

            {/* 6. Breakeven Price Markers */}
            {showBreakevenBadges && (
              <g>
                {metrics.be1 && metrics.be1 >= minRange && metrics.be1 <= maxRange && (() => {
                  const beX = priceToX(metrics.be1);
                  return (
                    <g key="be1">
                      <line x1={beX} y1={plotY} x2={beX} y2={plotY + plotHeight} stroke="#38bdf8" strokeDasharray="3 2" strokeWidth="1.2" opacity="0.85" />
                      {/* Diamond marker on zero axis */}
                      <polygon
                        points={`${beX},${clampedZeroY - 5} ${beX + 5},${clampedZeroY} ${beX},${clampedZeroY + 5} ${beX - 5},${clampedZeroY}`}
                        fill="#38bdf8"
                      />
                      <rect x={beX - 26} y={clampedZeroY + 7} width="52" height="13" fill="#0c1724" rx="2" stroke="#38bdf8" strokeWidth="0.8" />
                      <text x={beX} y={clampedZeroY + 16} textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                        BE {currSym}{metrics.be1.toFixed(1)}
                      </text>
                    </g>
                  );
                })()}

                {metrics.be2 && metrics.be2 >= minRange && metrics.be2 <= maxRange && (() => {
                  const be2X = priceToX(metrics.be2);
                  return (
                    <g key="be2">
                      <line x1={be2X} y1={plotY} x2={be2X} y2={plotY + plotHeight} stroke="#38bdf8" strokeDasharray="3 2" strokeWidth="1.2" opacity="0.85" />
                      <polygon
                        points={`${be2X},${clampedZeroY - 5} ${be2X + 5},${clampedZeroY} ${be2X},${clampedZeroY + 5} ${be2X - 5},${clampedZeroY}`}
                        fill="#38bdf8"
                      />
                      <rect x={be2X - 26} y={clampedZeroY + 7} width="52" height="13" fill="#0c1724" rx="2" stroke="#38bdf8" strokeWidth="0.8" />
                      <text x={be2X} y={clampedZeroY + 16} textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                        BE2 {currSym}{metrics.be2.toFixed(1)}
                      </text>
                    </g>
                  );
                })()}
              </g>
            )}

            {/* 7. Strategy Option Leg Strike Line Pins */}
            {showStrikePins && (
              <g>
                {strategyLegStrikes.map((leg, idx) => {
                  if (leg.strike < minRange || leg.strike > maxRange) return null;
                  const legX = priceToX(leg.strike);
                  const isBuy = leg.side === 'BUY';
                  const pinColor = isBuy ? '#10b981' : '#f43f5e';
                  const yTag = plotY + 4 + (idx % 2) * 13;

                  return (
                    <g key={`leg-${idx}`}>
                      <line
                        x1={legX}
                        y1={plotY}
                        x2={legX}
                        y2={plotY + plotHeight}
                        stroke={pinColor}
                        strokeWidth="1"
                        strokeDasharray="2 3"
                        opacity="0.65"
                      />
                      <rect
                        x={Math.max(plotX + 2, Math.min(plotX + plotWidth - 62, legX - 30))}
                        y={yTag}
                        width="60"
                        height="12"
                        fill="#0c1017"
                        rx="2"
                        stroke={pinColor}
                        strokeWidth="0.8"
                      />
                      <text
                        x={Math.max(plotX + 32, Math.min(plotX + plotWidth - 32, legX))}
                        y={yTag + 9}
                        textAnchor="middle"
                        fill={pinColor}
                        fontSize="7.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {leg.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* 8. Spot Price Vertical Tracker */}
            <g>
              <line
                x1={spotX}
                y1={plotY}
                x2={spotX}
                y2={plotY + plotHeight}
                stroke={theme.spotLineHex}
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <circle cx={spotX} cy={clampedZeroY} r="3.5" fill={theme.spotLineHex} />
              <rect
                x={Math.min(plotX + plotWidth - 80, spotX + 4)}
                y={plotY + 36}
                width="74"
                height="14"
                fill="#161b24"
                rx="2"
                stroke={theme.spotLineHex}
                strokeWidth="0.8"
              />
              <text
                x={Math.min(plotX + plotWidth - 80, spotX + 4) + 5}
                y={plotY + 46}
                fill={theme.spotLineHex}
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                SPOT {currSym}{spotPrice.toFixed(2)}
              </text>
            </g>

            {/* 9. Simulated Underlying Price Tracker */}
            {Math.abs(simStockPrice - spotPrice) > 0.05 && (
              <g>
                <line
                  x1={simX}
                  y1={plotY}
                  x2={simX}
                  y2={plotY + plotHeight}
                  stroke={theme.simLineHex}
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <circle cx={simX} cy={clampedZeroY} r="4" fill={theme.simLineHex} />
                <rect
                  x={Math.min(plotX + plotWidth - 80, simX + 4)}
                  y={plotY + 54}
                  width="74"
                  height="14"
                  fill="#0c1724"
                  rx="2"
                  stroke={theme.simLineHex}
                  strokeWidth="0.8"
                />
                <text
                  x={Math.min(plotX + plotWidth - 80, simX + 4) + 5}
                  y={plotY + 64}
                  fill={theme.simLineHex}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  SIM {currSym}{simStockPrice.toFixed(2)}
                </text>
              </g>
            )}

            {/* 10. Intermediate T+Half DTE Curve */}
            {showIntermediateTPlus && (
              <path
                d={halfPathD}
                fill="none"
                stroke={theme.halfLineHex}
                strokeWidth="1.6"
                strokeDasharray="3 3"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.85"
              />
            )}

            {/* 11. P/L Today (T+0) Dashed Curve */}
            <path
              d={todayPathD}
              fill="none"
              stroke={theme.todayLineHex}
              strokeWidth="2.2"
              strokeDasharray="5 3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* 12. P/L at Expiry Solid Vibrant Glow Curve */}
            <path
              d={expiryPathD}
              fill="none"
              stroke={theme.expiryLineHex}
              strokeWidth="2.8"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#tosGlow)"
            />

            {/* 13. Interactive Hover Crosshair & Telemetry HUD Card */}
            {hoverX !== null && hoveredData && (() => {
              const yExpiry = pnlToY(hoveredData.pnlExpiry);
              const yToday = pnlToY(hoveredData.pnlToday);
              const yHalf = pnlToY(hoveredData.pnlHalf);

              const tooltipX = Math.min(plotX + plotWidth - 170, Math.max(plotX + 10, hoverX + 14));
              const tooltipY = Math.min(plotY + plotHeight - 80, Math.max(plotY + 10, Math.min(yExpiry, yToday) - 75));

              return (
                <g>
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={hoverX}
                    y1={plotY}
                    x2={hoverX}
                    y2={plotY + plotHeight}
                    stroke={theme.crosshairHex}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.85"
                  />

                  {/* Horizontal projection lines */}
                  <line x1={plotX} y1={yExpiry} x2={hoverX} y2={yExpiry} stroke={theme.expiryLineHex} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.6" />
                  <line x1={plotX} y1={yToday} x2={hoverX} y2={yToday} stroke={theme.todayLineHex} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.6" />

                  {/* Cursor price badge on X-axis */}
                  <rect
                    x={Math.max(plotX + 2, Math.min(plotX + plotWidth - 70, hoverX - 35))}
                    y={plotY + plotHeight + 2}
                    width="70"
                    height="13"
                    fill={theme.hudBgHex}
                    rx="2"
                    stroke={theme.crosshairHex}
                    strokeWidth="1"
                  />
                  <text
                    x={Math.max(plotX + 37, Math.min(plotX + plotWidth - 35, hoverX))}
                    y={plotY + plotHeight + 11}
                    textAnchor="middle"
                    fill={theme.crosshairHex}
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {currSym}{hoveredData.price.toFixed(2)}
                  </text>

                  {/* Intersection Dots */}
                  <circle cx={hoverX} cy={yExpiry} r="5" fill={theme.expiryLineHex} stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx={hoverX} cy={yToday} r="4" fill={theme.todayLineHex} stroke="#ffffff" strokeWidth="1.5" />
                  {showIntermediateTPlus && (
                    <circle cx={hoverX} cy={yHalf} r="3" fill={theme.halfLineHex} stroke="#ffffff" strokeWidth="1" />
                  )}

                  {/* High-Tech Telemetry Tooltip HUD Card */}
                  <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                    <rect
                      width="170"
                      height="86"
                      fill={theme.hudBgHex}
                      rx="6"
                      stroke={theme.hudBorderHex}
                      strokeWidth="1.2"
                      className="shadow-2xl"
                    />
                    {/* Header: Price & % Move */}
                    <text x="8" y="14" fill={theme.crosshairHex} fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                      {currSym}{hoveredData.price.toFixed(2)} ({hoveredData.pctMove >= 0 ? '+' : ''}{hoveredData.pctMove.toFixed(1)}%)
                    </text>

                    {/* Expiration P/L */}
                    <text x="8" y="28" fill={theme.expiryLineHex} fontSize="9" fontFamily="monospace" fontWeight="bold">
                      EXP: {hoveredData.pnlExpiry >= 0 ? '+' : ''}{currSym}{hoveredData.pnlExpiry.toFixed(0)}
                    </text>

                    {/* Today T+0 P/L */}
                    <text x="8" y="41" fill={theme.todayLineHex} fontSize="9" fontFamily="monospace" fontWeight="bold">
                      T+0: {hoveredData.pnlToday >= 0 ? '+' : ''}{currSym}{hoveredData.pnlToday.toFixed(0)}
                    </text>

                    {/* Intermediate T+Half DTE P/L */}
                    {showIntermediateTPlus && (
                      <text x="8" y="54" fill={theme.halfLineHex} fontSize="8.5" fontFamily="monospace">
                        T+{Math.round(simDte / 2)}D: {hoveredData.pnlHalf >= 0 ? '+' : ''}{currSym}{hoveredData.pnlHalf.toFixed(0)}
                      </text>
                    )}

                    {/* Estimated Greeks */}
                    <text x="8" y="67" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                      Δ {hoveredData.greeks.delta} · Γ {hoveredData.greeks.gamma} · Θ +${hoveredData.greeks.theta}/d
                    </text>
                    <text x="8" y="79" fill="#38bdf8" fontSize="7.5" fontFamily="monospace">
                      ν ${hoveredData.greeks.vega} · ρ {hoveredData.greeks.rho >= 0 ? '+' : ''}{hoveredData.greeks.rho} · r_f {riskFreeRate.toFixed(2)}%
                    </text>
                  </g>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      {/* Simulated Trade Execution Toast Banner */}
      {simTradeSuccessNotice && (
        <div className="bg-[#10251b] border border-[#00c076]/60 text-[#00c076] px-3.5 py-2 rounded-lg flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold">{simTradeSuccessNotice}</span>
            <span className="text-[10px] text-slate-400 font-sans">· Instant fill logged to Blotter & Activity Log</span>
          </div>
          <button
            onClick={() => setSimTradeSuccessNotice(null)}
            className="text-slate-400 hover:text-white p-0.5 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header Toolbar with Larger View Switcher */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 shadow">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-sans font-bold text-white">
            <span className="w-4 h-4 rounded bg-amber-400 text-black font-black text-[10px] flex items-center justify-center font-mono">
              1
            </span>
            <span className="text-base tracking-tight">{asset.symbol} Options & Stock Risk Profiles</span>
          </div>

          <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
            {ALL_STRATEGIES.length} STRATEGIES
          </span>
        </div>

        {/* View Mode Controls (Standard vs Larger View & Full Theater Modal) */}
        <div className="flex items-center gap-2">
          {/* Layout Mode Switcher */}
          <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
            <button
              onClick={() => setViewMode('STANDARD')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                viewMode === 'STANDARD' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard (Split)
            </button>
            <button
              onClick={() => setViewMode('LARGER_VIEW')}
              className={`px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
                viewMode === 'LARGER_VIEW' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>Larger Payoff View</span>
            </button>
          </div>

          {/* Fullscreen Theater Modal Trigger */}
          <button
            onClick={() => setIsTheaterModalOpen(true)}
            className="px-2.5 py-1 rounded bg-[#1c2128] hover:bg-[#272e38] text-white border border-[#30363d] font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
            title="Open Fullscreen Theater Payoff View"
          >
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span>Theater Screen</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Category Tabs & Strategy Selectors */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
            {(['ALL', 'Bullish', 'Bearish', 'Neutral/Income', 'Volatility Expansion'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  filterCategory === cat ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 font-sans">
            Showing <strong className="text-white">{filteredStrategies.length}</strong> matching strategy models
          </div>
        </div>

        {/* Strategy Buttons Pill Strip */}
        <div className="overflow-x-auto no-scrollbar pt-1">
          <div className="flex items-center gap-1.5 min-w-max">
            {filteredStrategies.map(strat => {
              const isSelected = strat.key === selectedStrategyKey;
              return (
                <button
                  key={strat.key}
                  onClick={() => setSelectedStrategyKey(strat.key)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#1c2128] text-amber-400 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-[#12161f] text-slate-300 border-[#21262d] hover:border-slate-600 hover:text-white'
                  }`}
                >
                  <span>{strat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE VIEW */}
      {viewMode === 'LARGER_VIEW' ? (
        /* ================= LARGER EXPANDED CINEMA VIEW (Full Width) ================= */
        <div className="space-y-3">
          {/* Top Payoff Header with Live Stats & Legend */}
          <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#21262d]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white tracking-tight">{activeStrategy.name}</span>
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-bold uppercase">
                    {activeStrategy.sentiment}
                  </span>
                  <span className="text-slate-400 text-xs font-sans">· Spot: ${spotPrice.toFixed(2)}</span>
                </div>
                <p className="text-slate-400 font-sans text-xs mt-1">{activeStrategy.description}</p>
              </div>

              {/* Controls & Quick Metrics */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <button
                  onClick={() => setShowProbabilityCone(!showProbabilityCone)}
                  className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showProbabilityCone
                      ? 'bg-[#1c2128] text-amber-400 border-amber-400/50 shadow-sm'
                      : 'text-slate-400 border-[#21262d] hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Probability Bands (1σ / 2σ)</span>
                </button>

                <button
                  onClick={() => setShowAllExpirationsCone(!showAllExpirationsCone)}
                  className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showAllExpirationsCone
                      ? 'bg-[#1c2128] text-sky-400 border-sky-400/50 shadow-sm'
                      : 'text-slate-400 border-[#21262d] hover:text-white'
                  }`}
                  title="Overlay All Expirations Probability Cones Fan (7D to 1Y)"
                >
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>All Expirations Cone Fan</span>
                </button>

                {/* Strategy Variations Selector */}
                <div className="flex items-center gap-1 bg-[#161b22] border border-[#21262d] p-0.5 rounded text-[10px]">
                  <span className="text-slate-400 font-bold px-1.5 uppercase">Variation:</span>
                  {[
                    { id: 'STANDARD', label: 'Standard' },
                    { id: 'WIDE_WINGS', label: 'Wide' },
                    { id: 'NARROW_WINGS', label: 'Narrow' },
                    { id: 'ASYMMETRIC', label: 'Skewed' }
                  ].map(v => (
                    <button
                      key={v.id}
                      onClick={() => setStrategyVariation(v.id as any)}
                      className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                        strategyVariation === v.id
                          ? 'bg-amber-400 text-black shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 text-[#00c076]">
                    <span className="w-3.5 h-0.5 bg-[#00c076]"></span> P/L at Expiry
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <span className="w-3.5 h-0.5 border-t border-dashed border-sky-400"></span> P/L Today (T+0)
                  </span>
                </div>
              </div>
            </div>

            {/* Live Crosshair Real-Time HUD */}
            <div className="bg-[#12161f] border border-[#1c2128] px-3 py-2 rounded-lg flex flex-wrap items-center justify-between text-xs font-mono">
              <div className="flex flex-wrap items-center gap-5">
                <span className="text-slate-400 font-sans">
                  Underlying Price:{' '}
                  <strong className="text-amber-400 font-mono">
                    ${(hoveredData ? hoveredData.price : simStockPrice).toFixed(2)}
                  </strong>
                  <span className="text-slate-500 ml-1">
                    ({(hoveredData ? hoveredData.pctMove : simPriceOffsetPct) >= 0 ? '+' : ''}
                    {(hoveredData ? hoveredData.pctMove : simPriceOffsetPct).toFixed(1)}%)
                  </span>
                </span>

                <span>
                  P/L at Expiry:{' '}
                  <strong
                    className={(hoveredData ? hoveredData.pnlExpiry : calculatePnLAtPrice(simStockPrice).pnlExpiry) >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}
                  >
                    {(hoveredData ? hoveredData.pnlExpiry : calculatePnLAtPrice(simStockPrice).pnlExpiry) >= 0 ? '+' : ''}$
                    {(hoveredData ? hoveredData.pnlExpiry : calculatePnLAtPrice(simStockPrice).pnlExpiry).toFixed(0)}
                  </strong>
                </span>

                <span>
                  P/L Today (T+0):{' '}
                  <strong
                    className={(hoveredData ? hoveredData.pnlToday : calculatePnLAtPrice(simStockPrice).pnlToday) >= 0 ? 'text-sky-400' : 'text-[#ff3b57]'}
                  >
                    {(hoveredData ? hoveredData.pnlToday : calculatePnLAtPrice(simStockPrice).pnlToday) >= 0 ? '+' : ''}$
                    {(hoveredData ? hoveredData.pnlToday : calculatePnLAtPrice(simStockPrice).pnlToday).toFixed(0)}
                  </strong>
                </span>

                <span>
                  POP:{' '}
                  <strong className="text-amber-400">{metrics.pop}%</strong>
                </span>

                <span className="text-slate-400">
                  PCR:{' '}
                  <strong className="text-[#00c076] font-mono">
                    {asset.symbol === 'NVDA' ? '0.74' : asset.symbol.endsWith('.TO') ? '0.68' : '0.82'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span className={hoveredData ? 'text-white font-bold' : ''}>Δ {hoveredData ? hoveredData.greeks.delta : metrics.delta}</span>
                <span className={hoveredData ? 'text-white font-bold' : ''}>Γ {hoveredData ? hoveredData.greeks.gamma : metrics.gamma}</span>
                <span className="text-[#00c076] font-bold">Θ +${hoveredData ? hoveredData.greeks.theta : metrics.theta}/d</span>
                <span className="text-sky-400 font-bold">ν ${hoveredData ? hoveredData.greeks.vega : metrics.vega}</span>
                <span className="text-amber-400 font-bold">ρ {hoveredData ? (hoveredData.greeks.rho >= 0 ? '+' : '') + hoveredData.greeks.rho : (metrics.rho >= 0 ? '+' : '') + metrics.rho}</span>
                <span className="text-slate-400 border-l border-slate-700 pl-2">r_f: <strong className="text-white">{riskFreeRate.toFixed(2)}%</strong></span>
              </div>
            </div>

            {/* LARGER VIEW SVG CANVAS (Expanded Height h-[440px]) */}
            {renderPayoffSvg('h-[440px]')}

            {/* Simulation Controls Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#21262d]">
              {/* Underlying Shock */}
              <div className="space-y-1.5 bg-[#090d11] p-2.5 rounded border border-[#1c2128]">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-sans">Underlying Price Shock:</span>
                  <span className={`font-bold ${simPriceOffsetPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {simPriceOffsetPct >= 0 ? '+' : ''}{simPriceOffsetPct}% (${simStockPrice.toFixed(2)})
                  </span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  value={simPriceOffsetPct}
                  onChange={e => setSimPriceOffsetPct(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* DTE Decay */}
              <div className="space-y-1.5 bg-[#090d11] p-2.5 rounded border border-[#1c2128]">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-sans">Time Horizon (DTE):</span>
                  <span className="font-bold text-sky-400">{simDte} Days to Expiry</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={simDte}
                  onChange={e => setSimDte(parseInt(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              {/* IV Volatility Shock */}
              <div className="space-y-1.5 bg-[#090d11] p-2.5 rounded border border-[#1c2128]">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-sans">Implied Vol Shock:</span>
                  <span className={`font-bold ${simIvShockPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {simIvShockPct >= 0 ? '+' : ''}{simIvShockPct}% IV ({Math.round(effectiveIv * 100)}% Total)
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={simIvShockPct}
                  onChange={e => setSimIvShockPct(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Risk-Free Rate Control Card */}
              <div className="space-y-1.5 bg-[#090d11] p-2.5 rounded border border-[#1c2128]">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-sans">Risk-Free Rate (r_f):</span>
                  <span className="font-bold text-amber-400">
                    {riskFreeRate.toFixed(2)}% ({metrics.hurdleRatePct}% Hurdle)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.05"
                  value={riskFreeRate}
                  onChange={e => setRiskFreeRate(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {RISK_FREE_PRESETS.map(p => (
                      <button
                        key={p.label}
                        onClick={() => setRiskFreeRate(p.rate)}
                        title={p.title}
                        className={`px-1.5 py-0.5 text-[9px] rounded font-bold transition-all ${
                          Math.abs(riskFreeRate - p.rate) < 0.04
                            ? 'bg-amber-400 text-black'
                            : 'bg-[#161b22] text-slate-400 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Carry: ${metrics.financingDrag}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytical Price Slices Table (thinkorswim Price Slices Tool) */}
          <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 shadow space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  thinkorswim Price Slices Analysis Matrix
                </span>
                <span className="text-slate-500 font-sans text-xs hidden sm:inline">
                  · P/L projections across standard deviations and shock scenarios
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSimPriceOffsetPct(0);
                    setSimDte(21);
                    setSimIvShockPct(0);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-white border border-[#21262d] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Model</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-center">
                <thead className="bg-[#12161f] text-slate-400 uppercase text-[10px] font-semibold border-b border-[#21262d]">
                  <tr>
                    <th className="py-2 px-3 text-left">Scenario / Slice</th>
                    <th className="py-2 px-3">Underlying ($)</th>
                    <th className="py-2 px-3">% Offset</th>
                    <th className="py-2 px-3">P/L Expiry ($)</th>
                    <th className="py-2 px-3">P/L Today ($)</th>
                    <th className="py-2 px-3">Delta Exposure</th>
                    <th className="py-2 px-3 text-right">Risk Regime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2128]">
                  {priceSlices.map((slice, i) => {
                    const isSpot = slice.label.includes('Spot');
                    const isBreakeven = slice.label.includes('Breakeven');
                    const isSigma = slice.label.includes('σ');

                    return (
                      <tr
                        key={i}
                        className={`hover:bg-[#161b22] transition-colors ${
                          isSpot ? 'bg-[#1c2128]/50 font-bold text-amber-400' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-left flex items-center gap-1.5">
                          {isSpot && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                          {isBreakeven && <span className="w-2 h-2 rounded-full bg-sky-400"></span>}
                          {isSigma && <span className="w-2 h-2 rounded-full bg-purple-400"></span>}
                          <span className={isSpot ? 'text-amber-400 font-bold' : isBreakeven ? 'text-sky-300 font-semibold' : 'text-slate-300'}>
                            {slice.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-white">${slice.price.toFixed(2)}</td>
                        <td className={`py-2 px-3 font-mono ${slice.deltaPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                          {slice.deltaPct >= 0 ? '+' : ''}{slice.deltaPct.toFixed(1)}%
                        </td>
                        <td className={`py-2 px-3 font-mono font-bold ${slice.pnlExpiry >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                          {slice.pnlExpiry >= 0 ? '+' : ''}${slice.pnlExpiry.toFixed(0)}
                        </td>
                        <td className={`py-2 px-3 font-mono ${slice.pnlToday >= 0 ? 'text-sky-400' : 'text-[#ff3b57]'}`}>
                          {slice.pnlToday >= 0 ? '+' : ''}${slice.pnlToday.toFixed(0)}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-300">
                          {slice.price > spotPrice ? (metrics.delta * 0.8).toFixed(1) : (metrics.delta * 1.2).toFixed(1)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              slice.pnlExpiry > 0
                                ? 'bg-[#00c076]/15 text-[#00c076]'
                                : slice.pnlExpiry < 0
                                ? 'bg-[#ff3b57]/15 text-[#ff3b57]'
                                : 'bg-slate-700/30 text-slate-300'
                            }`}
                          >
                            {slice.pnlExpiry > 0 ? 'IN PROFIT' : slice.pnlExpiry < 0 ? 'MAX LOSS REGION' : 'AT BREAKEVEN'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Risk-Free Rate Benchmark & Financing Carry Analytics Footer */}
            <div className="bg-[#12161f] border border-[#1c2128] rounded-md p-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-slate-400 font-sans">
                  Risk-Free Rate Benchmark (r_f):
                </span>
                <span className="text-amber-400 font-bold">
                  {riskFreeRate.toFixed(2)}%
                </span>
                <span className="text-slate-500 font-sans">
                  (US 3M T-Bill / SOFR Equivalent)
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-sans">
                  Holding Period Hurdle ({simDte}D):
                </span>
                <span className="text-white font-bold">
                  +{metrics.hurdleRatePct}%
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-slate-400 font-sans">
                  {metrics.isCredit ? 'Cash Collateral Interest Earned:' : 'Capital Financing Carry Drag:'}
                </span>
                <span className={`font-bold ${metrics.isCredit ? 'text-[#00c076]' : 'text-slate-300'}`}>
                  {metrics.isCredit ? '+' : '-'}${metrics.financingDrag}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-sans">Option Rho (ρ):</span>
                <span className="text-amber-400 font-bold">
                  {metrics.rho >= 0 ? '+' : ''}${metrics.rho} / +100 bps
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= STANDARD SPLIT VIEW (8 Cols Graph : 4 Cols Parameters) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left: Payoff Graph Canvas (8 Cols) */}
          <div className="lg:col-span-8 bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow flex flex-col justify-between">
            <div>
              {/* Header info */}
              <div className="flex items-start justify-between pb-3 border-b border-[#21262d]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm tracking-tight">{activeStrategy.name}</span>
                    <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-bold uppercase">
                      {activeStrategy.sentiment}
                    </span>
                  </div>
                  <p className="text-slate-400 font-sans text-xs mt-1">{activeStrategy.description}</p>
                </div>

                {/* Legend & Probability Cone Controls */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono shrink-0">
                  <button
                    onClick={() => setShowProbabilityCone(!showProbabilityCone)}
                    className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      showProbabilityCone
                        ? 'bg-[#1c2128] text-amber-400 border-amber-400/50 shadow-sm'
                        : 'text-slate-400 border-[#21262d] hover:text-white'
                    }`}
                    title="Overlay Expected Move 1σ and 2σ Cones at Expiration"
                  >
                    <Activity className="w-3 h-3" />
                    <span>Probability Bands</span>
                  </button>

                  <button
                    onClick={() => setShowAllExpirationsCone(!showAllExpirationsCone)}
                    className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      showAllExpirationsCone
                        ? 'bg-[#1c2128] text-sky-400 border-sky-400/50 shadow-sm'
                        : 'text-slate-400 border-[#21262d] hover:text-white'
                    }`}
                    title="Overlay All Expirations Probability Cones Fan (7D to 1Y)"
                  >
                    <Activity className="w-3 h-3 text-sky-400" />
                    <span>All Expirations Fan</span>
                  </button>

                  {/* Variation pills */}
                  <div className="flex items-center gap-1 bg-[#161b22] border border-[#21262d] p-0.5 rounded text-[10px]">
                    <span className="text-slate-400 font-bold px-1 uppercase">Var:</span>
                    {[
                      { id: 'STANDARD', label: 'Std' },
                      { id: 'WIDE_WINGS', label: 'Wide' },
                      { id: 'NARROW_WINGS', label: 'Narrow' },
                      { id: 'ASYMMETRIC', label: 'Skew' }
                    ].map(v => (
                      <button
                        key={v.id}
                        onClick={() => setStrategyVariation(v.id as any)}
                        className={`px-1.5 py-0.2 rounded font-bold transition-all ${
                          strategyVariation === v.id
                            ? 'bg-amber-400 text-black shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>

                  <span className="flex items-center gap-1 text-[#00c076]">
                    <span className="w-3 h-0.5 bg-[#00c076]"></span> P/L at Expiry
                  </span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <span className="w-3 h-0.5 border-t border-dashed border-sky-400"></span> P/L Today (T+0)
                  </span>
                </div>
              </div>

              {/* Standard Payoff Graph SVG */}
              {renderPayoffSvg('h-64 mt-3')}
            </div>

            {/* Interactive Simulation Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-[#21262d] mt-3">
              {/* Price Shock */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-sans">Underlying Shock:</span>
                  <span className={`font-bold ${simPriceOffsetPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {simPriceOffsetPct >= 0 ? '+' : ''}{simPriceOffsetPct}% (${simStockPrice.toFixed(2)})
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={simPriceOffsetPct}
                  onChange={e => setSimPriceOffsetPct(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* DTE Remaining */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-sans">DTE Decay:</span>
                  <span className="font-bold text-sky-400">{simDte} Days to Expiry</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={simDte}
                  onChange={e => setSimDte(parseInt(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              {/* IV Shock */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-sans">IV Vol Shock:</span>
                  <span className={`font-bold ${simIvShockPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {simIvShockPct >= 0 ? '+' : ''}{simIvShockPct}% IV
                  </span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  value={simIvShockPct}
                  onChange={e => setSimIvShockPct(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Risk-Free Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-sans">Risk-Free Rate:</span>
                  <span className="font-bold text-amber-400">{riskFreeRate.toFixed(2)}% r_f</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.05"
                  value={riskFreeRate}
                  onChange={e => setRiskFreeRate(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span className="font-mono">Carry: ${metrics.financingDrag}</span>
                  <button
                    onClick={() => setRiskFreeRate(4.35)}
                    className="hover:text-amber-400 underline font-mono"
                  >
                    US 3M: 4.35%
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Strategy Legs & Key Risk Metrics (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            {/* Key Probability & Risk Return Numbers */}
            <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 shadow space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Quantitative Risk Profile
                </h3>
                <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                  r_f: {riskFreeRate.toFixed(2)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#090d11] p-2 rounded border border-[#1c2128]">
                  <div className="text-slate-400 text-[10px] font-sans">Max Profit</div>
                  <div className="text-base font-bold text-[#00c076] mt-0.5">
                    {metrics.maxProfit === Infinity ? 'Unlimited' : `+$${metrics.maxProfit.toLocaleString()}`}
                  </div>
                </div>

                <div className="bg-[#090d11] p-2 rounded border border-[#1c2128]">
                  <div className="text-slate-400 text-[10px] font-sans">Max Loss</div>
                  <div className="text-base font-bold text-[#ff3b57] mt-0.5">
                    {metrics.maxLoss === Infinity ? 'Undefined' : `-$${metrics.maxLoss.toLocaleString()}`}
                  </div>
                </div>

                <div className="bg-[#090d11] p-2 rounded border border-[#1c2128]">
                  <div className="text-slate-400 text-[10px] font-sans">Breakeven</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    ${metrics.be1} {metrics.be2 ? `& $${metrics.be2}` : ''}
                  </div>
                </div>

                <div className="bg-[#090d11] p-2 rounded border border-[#1c2128]">
                  <div className="text-slate-400 text-[10px] font-sans">POP (Profit Prob)</div>
                  <div className="text-xs font-bold text-amber-400 mt-0.5">{metrics.pop}%</div>
                </div>

                {/* Risk-Free Rate & Carry Drag Telemetry */}
                <div className="bg-[#090d11] p-2 rounded border border-[#1c2128]">
                  <div className="text-slate-400 text-[10px] font-sans flex items-center justify-between">
                    <span>Risk-Free Rate (r_f)</span>
                  </div>
                  <div className="text-xs font-bold text-amber-400 mt-0.5">
                    {riskFreeRate.toFixed(2)}% <span className="text-[9px] text-slate-500 font-sans">(US 3M/SOFR)</span>
                  </div>
                </div>

                <div className="bg-[#090d11] p-2 rounded border border-[#1c2128]">
                  <div className="text-slate-400 text-[10px] font-sans">Interest Carry / Drag</div>
                  <div className={`text-xs font-bold mt-0.5 ${metrics.isCredit ? 'text-[#00c076]' : 'text-slate-300'}`}>
                    {metrics.isCredit ? '+' : '-'}${metrics.financingDrag} <span className="text-[9px] text-slate-500 font-sans">({metrics.hurdleRatePct}%)</span>
                  </div>
                </div>
              </div>

              {/* Aggregated Greeks (5-Greeks Institutional Suite with Rho) */}
              <div className="pt-2 border-t border-[#21262d]">
                <div className="text-[11px] text-slate-400 font-sans mb-1.5 flex items-center justify-between">
                  <span>Net Position Greeks:</span>
                  <span className="text-[9px] text-slate-500 font-mono">Sensitivities</span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-center font-mono text-[11px]">
                  <div className="bg-[#12161f] p-1 rounded">
                    <div className="text-slate-500 font-sans text-[8.5px]">Delta (Δ)</div>
                    <div className="font-bold text-white text-[10px]">{metrics.delta}</div>
                  </div>
                  <div className="bg-[#12161f] p-1 rounded">
                    <div className="text-slate-500 font-sans text-[8.5px]">Gamma (Γ)</div>
                    <div className="font-bold text-white text-[10px]">{metrics.gamma}</div>
                  </div>
                  <div className="bg-[#12161f] p-1 rounded">
                    <div className="text-slate-500 font-sans text-[8.5px]">Theta (Θ)</div>
                    <div className="font-bold text-[#00c076] text-[10px]">+${metrics.theta}</div>
                  </div>
                  <div className="bg-[#12161f] p-1 rounded">
                    <div className="text-slate-500 font-sans text-[8.5px]">Vega (ν)</div>
                    <div className="font-bold text-sky-400 text-[10px]">${metrics.vega}</div>
                  </div>
                  <div className="bg-[#12161f] p-1 rounded border border-amber-400/20">
                    <div className="text-amber-400/80 font-sans text-[8.5px]">Rho (ρ)</div>
                    <div className="font-bold text-amber-400 text-[10px]">
                      {metrics.rho >= 0 ? '+' : ''}${metrics.rho}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy Legs Table */}
            <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 shadow space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-1.5 border-b border-[#21262d]">
                Structure Legs ({activeStrategy.legs.length} Leg{activeStrategy.legs.length > 1 ? 's' : ''})
              </h3>

              <div className="space-y-1.5">
                {activeStrategy.legs.map((leg, i) => {
                  const strike = (spotPrice * (1 + leg.strikeOffsetPct / 100)).toFixed(2);
                  const estPrice = (spotPrice * (leg.estimatedPricePct / 100)).toFixed(2);

                  return (
                    <div
                      key={i}
                      className="p-2 rounded bg-[#090d11] border border-[#1c2128] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            leg.side === 'BUY' ? 'bg-[#00c076]/20 text-[#00c076]' : 'bg-[#ff3b57]/20 text-[#ff3b57]'
                          }`}
                        >
                          {leg.side}
                        </span>
                        <span className="font-bold text-white">
                          {leg.qty}x {leg.type === 'STOCK' ? 'Shares' : `${strike} ${leg.type}`}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-white font-bold">${estPrice}</div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {leg.type === 'STOCK' ? 'Spot' : `${leg.strikeOffsetPct >= 0 ? '+' : ''}${leg.strikeOffsetPct}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Send to Order Entry Tools Bar */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleStageSpreadOrder}
                  className="w-full py-2 bg-[#00c076] hover:bg-[#00d885] text-black font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Stage Option Spread Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleExecuteSimulatedSpreadTrade}
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Trade (paperMoney)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULLSCREEN THEATER MODAL VIEW ================= */}
      {isTheaterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-[#090d11] border border-[#30363d] rounded-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto p-4 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-black font-black text-sm flex items-center justify-center font-mono">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{asset.symbol} — {activeStrategy.name}</span>
                    <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-bold uppercase">
                      {activeStrategy.sentiment}
                    </span>
                  </h2>
                  <p className="text-slate-400 font-sans text-xs">
                    Institutional Thinkorswim Risk Profile Theater · Spot: ${spotPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowProbabilityCone(!showProbabilityCone)}
                  className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer ${
                    showProbabilityCone
                      ? 'bg-[#1c2128] text-amber-400 border-amber-400/50 shadow-sm'
                      : 'text-slate-400 border-[#21262d] hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Probability Cone Bands (1σ / 2σ)</span>
                </button>

                <button
                  onClick={() => setIsTheaterModalOpen(false)}
                  className="p-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] text-slate-300 hover:text-white border border-[#30363d] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Interactive HUD */}
            <div className="bg-[#12161f] border border-[#1c2128] p-3 rounded-lg flex flex-wrap items-center justify-between text-xs font-mono">
              <div className="flex flex-wrap items-center gap-6">
                <span>
                  Cursor Underlying:{' '}
                  <strong className="text-amber-400 text-sm">
                    ${(hoveredData ? hoveredData.price : simStockPrice).toFixed(2)}
                  </strong>
                  <span className="text-slate-400 ml-1.5">
                    ({(hoveredData ? hoveredData.pctMove : simPriceOffsetPct) >= 0 ? '+' : ''}
                    {(hoveredData ? hoveredData.pctMove : simPriceOffsetPct).toFixed(1)}%)
                  </span>
                </span>

                <span>
                  P/L at Expiry:{' '}
                  <strong
                    className={`text-sm ${
                      (hoveredData ? hoveredData.pnlExpiry : calculatePnLAtPrice(simStockPrice).pnlExpiry) >= 0
                        ? 'text-[#00c076]'
                        : 'text-[#ff3b57]'
                    }`}
                  >
                    {(hoveredData ? hoveredData.pnlExpiry : calculatePnLAtPrice(simStockPrice).pnlExpiry) >= 0 ? '+' : ''}$
                    {(hoveredData ? hoveredData.pnlExpiry : calculatePnLAtPrice(simStockPrice).pnlExpiry).toFixed(0)}
                  </strong>
                </span>

                <span>
                  P/L Today (T+0):{' '}
                  <strong
                    className={`text-sm ${
                      (hoveredData ? hoveredData.pnlToday : calculatePnLAtPrice(simStockPrice).pnlToday) >= 0
                        ? 'text-sky-400'
                        : 'text-[#ff3b57]'
                    }`}
                  >
                    {(hoveredData ? hoveredData.pnlToday : calculatePnLAtPrice(simStockPrice).pnlToday) >= 0 ? '+' : ''}$
                    {(hoveredData ? hoveredData.pnlToday : calculatePnLAtPrice(simStockPrice).pnlToday).toFixed(0)}
                  </strong>
                </span>

                <span>
                  Max Profit:{' '}
                  <strong className="text-[#00c076]">
                    {metrics.maxProfit === Infinity ? 'Unlimited' : `+$${metrics.maxProfit.toLocaleString()}`}
                  </strong>
                </span>

                <span>
                  Max Loss:{' '}
                  <strong className="text-[#ff3b57]">
                    {metrics.maxLoss === Infinity ? 'Undefined' : `-$${metrics.maxLoss.toLocaleString()}`}
                  </strong>
                </span>

                <span className="text-slate-400">
                  PCR:{' '}
                  <strong className="text-[#00c076] font-bold">
                    {asset.symbol === 'NVDA' ? '0.74' : asset.symbol.endsWith('.TO') ? '0.68' : '0.82'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                <span className={hoveredData ? 'text-white font-bold' : ''}>Δ {hoveredData ? hoveredData.greeks.delta : metrics.delta}</span>
                <span className={hoveredData ? 'text-white font-bold' : ''}>Γ {hoveredData ? hoveredData.greeks.gamma : metrics.gamma}</span>
                <span className="text-[#00c076] font-bold">Θ +${hoveredData ? hoveredData.greeks.theta : metrics.theta}/d</span>
                <span className="text-sky-400 font-bold">ν ${hoveredData ? hoveredData.greeks.vega : metrics.vega}</span>
                <span className="text-amber-400 font-bold">ρ {hoveredData ? (hoveredData.greeks.rho >= 0 ? '+' : '') + hoveredData.greeks.rho : (metrics.rho >= 0 ? '+' : '') + metrics.rho}</span>
                <span className="text-slate-400 border-l border-slate-700 pl-2">r_f: <strong className="text-white">{riskFreeRate.toFixed(2)}%</strong></span>
              </div>
            </div>

            {/* FULL THEATER SVG CANVAS (h-[480px]) */}
            {renderPayoffSvg('h-[480px]')}

            {/* Modal Simulation Sliders Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#12161f] p-3 rounded border border-[#1c2128] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-sans">Underlying Price Shock:</span>
                  <span className={`font-bold ${simPriceOffsetPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {simPriceOffsetPct >= 0 ? '+' : ''}{simPriceOffsetPct}% (${simStockPrice.toFixed(2)})
                  </span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  value={simPriceOffsetPct}
                  onChange={e => setSimPriceOffsetPct(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="bg-[#12161f] p-3 rounded border border-[#1c2128] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-sans">Time Horizon (DTE Decay):</span>
                  <span className="font-bold text-sky-400">{simDte} Days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={simDte}
                  onChange={e => setSimDte(parseInt(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div className="bg-[#12161f] p-3 rounded border border-[#1c2128] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-sans">IV Volatility Shock:</span>
                  <span className={`font-bold ${simIvShockPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {simIvShockPct >= 0 ? '+' : ''}{simIvShockPct}% IV
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={simIvShockPct}
                  onChange={e => setSimIvShockPct(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Risk-Free Rate Modal Control */}
              <div className="bg-[#12161f] p-3 rounded border border-[#1c2128] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-sans">Risk-Free Rate (r_f):</span>
                  <span className="font-bold text-amber-400">
                    {riskFreeRate.toFixed(2)}% <span className="text-[10px] text-slate-400">({metrics.hurdleRatePct}%)</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.05"
                  value={riskFreeRate}
                  onChange={e => setRiskFreeRate(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span className="font-mono">Financing Carry: ${metrics.financingDrag}</span>
                  <button
                    onClick={() => setRiskFreeRate(4.35)}
                    className="hover:text-amber-400 underline font-mono"
                  >
                    Reset: 4.35%
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#21262d]">
              <div className="text-xs text-slate-400 font-sans">
                Move cursor over chart to inspect exact P/L and probability cones at every price level.
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsTheaterModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#161b22] hover:bg-[#1c2128] text-slate-300 font-bold text-xs"
                >
                  Close Theater
                </button>
                <button
                  onClick={() => {
                    handleExecuteSimulatedSpreadTrade();
                  }}
                  className="px-4 py-2 rounded bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md font-sans"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Trade (paperMoney)</span>
                </button>
                <button
                  onClick={() => {
                    setIsTheaterModalOpen(false);
                    handleStageSpreadOrder();
                  }}
                  className="px-5 py-2 rounded bg-[#00c076] hover:bg-[#00d885] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#00c076]/20"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Stage Option Spread Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
