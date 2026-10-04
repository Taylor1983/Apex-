export type AssetClass = 'equities' | 'crypto' | 'fixed_income' | 'commodities';

export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  change24h: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCapOrAUM: number;
  beta: number;
  yieldPct?: number; // Dividend or staking or bond yield
  expenseRatio?: number;
  sparkline: number[];
  orderBook: OrderBook;
  description: string;
  defaultBrokerage: 'alpaca' | 'coinbase' | 'ibkr' | 'schwab';
  currency?: 'USD' | 'CAD';
  exchange?: 'NYSE' | 'NASDAQ' | 'TSX' | 'TSXV' | 'MX' | 'CRYPTO';
}

export type AccountType =
  | 'CA_MARGIN'
  | 'CA_TFSA'
  | 'CA_RRSP'
  | 'CA_RESP'
  | 'US_MARGIN_PAPER'
  | 'US_MARGIN_LIVE';

export interface CanadianAccountInfo {
  id: AccountType;
  accountNumber: string;
  name: string;
  category: 'CANADIAN_MARGIN' | 'CANADIAN_RRSP' | 'CANADIAN_RESP' | 'CANADIAN_TFSA' | 'US_PAPER' | 'US_LIVE';
  typeLabel: string;
  country: 'CA' | 'US';
  currency: 'CAD' | 'USD';
  regulator: 'CIRO' | 'FINRA';
  investorProtection: string;
  taxTreatment: 'Taxable Non-Registered' | 'Tax-Free (TFSA)' | 'Tax-Deferred (RRSP)' | 'Tax-Sheltered Education (RESP)';
  craContributionLimitAnnual?: number;
  craContributionRoomRemaining?: number;
  craLifetimeCap?: number;
  cesgGrantMatchingPct?: number;
  cesgGrantReceivedYTD?: number;
  cesgGrantLifetimeReceived?: number;
  optionsLevel: 1 | 2 | 3 | 4;
  optionsDescription: string;
  craOptionRules: string[];
}

export interface PortfolioHolding {
  assetId: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  weightPct: number;
  targetWeightPct: number;
  driftPct: number; // positive = overweight, negative = underweight
}

export type RiskProfileType = 'conservative' | 'moderately_conservative' | 'balanced' | 'growth' | 'aggressive_growth' | 'custom';

export interface RiskProfile {
  id: RiskProfileType;
  name: string;
  description: string;
  targetAllocation: Record<AssetClass, number>; // percentages summing to 100 - targetCashPct
  targetCashPct: number;
  maxDrawdownTolerance: number;
  expectedReturnAnnual: number;
  expectedVolatilityAnnual: number;
  recommendedTimeHorizonYears: string;
}

export interface PortfolioMetrics {
  nav: number;
  cashBalance: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPct: number;
  dayPnL: number;
  dayPnLPct: number;
  sharpeRatio: number;
  betaVsSPY: number;
  valueAtRisk95_1D: number; // in $
  maxDrawdownPeakToTrough: number;
  annualizedVolatility: number;
  driftScore: number; // max absolute drift
  driftStatus: 'aligned' | 'moderate_drift' | 'critical_drift';
}

export interface RebalanceTrade {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  action: 'BUY' | 'SELL';
  currentWeight: number;
  targetWeight: number;
  currentValue: number;
  targetValue: number;
  quantity: number;
  price: number;
  totalAmount: number;
  brokerageId: 'alpaca' | 'coinbase' | 'ibkr' | 'schwab';
  isTaxLossHarvesting: boolean;
  unrealizedLossOffset?: number;
}

export interface RebalanceProposal {
  id: string;
  timestamp: number;
  riskProfileId: RiskProfileType;
  trades: RebalanceTrade[];
  totalBuyAmount: number;
  totalSellAmount: number;
  netCashFlow: number;
  estimatedSlippage: number;
  estimatedBrokerageFees: number;
  estimatedTaxSavings: number;
  maxDriftBefore: number;
  projectedDriftAfter: number;
}

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'QUEUED' | 'ROUTING' | 'TRANSMITTED' | 'WORKING' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED';

export interface OptionLegData {
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  iv: number; // e.g. 32.5%
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  itm: boolean;
}

export interface OptionStrikeRow {
  strike: number;
  call: OptionLegData;
  put: OptionLegData;
}

export interface OptionExpirationSeries {
  expirationDate: string; // e.g. "17 OCT 26"
  dte: number; // Days to expiration
  ivMean: number; // e.g. 34.2%
  expectedMove: number; // e.g. +/- $7.40
  strikes: OptionStrikeRow[];
}

export interface VolatilitySkewPoint {
  strike: number;
  pctMoneyness: number; // -15%, -10%, ATM, +10%, etc.
  frontIV: number; // Front month (30 DTE)
  midIV: number; // Mid month (60 DTE)
  backIV: number; // Back month (120 DTE)
}

export interface MacroYieldPoint {
  tenor: string; // 1M, 3M, 6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y, 20Y, 30Y, 50Y
  yield: number;
  change1D: number;
}

export interface CountryYieldCurve {
  countryCode: string; // e.g. "US", "CA", "DE", "GB", "JP", etc.
  countryName: string; // e.g. "United States", "Canada"
  bondName: string; // e.g. "US Treasuries", "GoC Bonds", "German Bunds"
  flag: string; // Flag emoji
  currency: string;
  centralBank: string;
  policyRate: number;
  creditRating: string;
  spread10Y2Y: number; // in bps
  curveStatus: 'NORMAL' | 'INVERTED' | 'FLAT' | 'STEEP';
  color: string;
  region?: 'Americas' | 'Europe' | 'Asia-Pacific' | 'Middle East & Africa';
  tenors: MacroYieldPoint[];
}

export interface OptionSpreadLeg {
  id: string;
  side: OrderSide; // BUY or SELL
  quantity: number; // e.g. 1
  strike: number;
  expiration: string;
  optionType: 'CALL' | 'PUT';
  bid: number;
  ask: number;
  mid: number;
  delta?: number;
}

export interface OptionSpreadDetails {
  strategyName: string; // e.g. "Bull Call Spread", "Iron Condor", "Calendar Spread"
  strategyType: 'VERTICAL' | 'CALENDAR' | 'STRADDLE' | 'STRANGLE' | 'IRON_CONDOR' | 'IRON_BUTTERFLY' | 'COLLAR' | 'COVERED_CALL' | 'CUSTOM_SPREAD';
  netDebitOrCredit: 'DEBIT' | 'CREDIT' | 'EVEN';
  netPrice: number; // Net premium per share (x100 for contract consideration)
  legs: OptionSpreadLeg[];
  spreadWidth?: number;
  maxProfit?: number | 'Unlimited';
  maxLoss?: number | 'Undefined';
  breakeven?: number[];
}

export interface CentralBankRate {
  bank: string;
  currency: string;
  rate: number;
  stance: 'Hawkish' | 'Neutral' | 'Dovish';
  nextMeeting: string;
}

export interface MacroIndicator {
  name: string;
  category: 'Inflation' | 'Labor' | 'Growth' | 'Liquidity' | 'Sentiment';
  current: string;
  prior: string;
  consensus: string;
  frequency: string;
  trend: 'UP' | 'DOWN' | 'FLAT';
  signal: 'Positive' | 'Neutral' | 'Caution';
}

export interface EconomicCalendarEvent {
  id: string;
  time: string;
  date: string;
  country: string;
  event: string;
  impact: 'HIGH' | 'MED' | 'LOW';
  actual?: string;
  consensus: string;
  previous: string;
}

export interface TradeOrder {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass | 'options';
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price: number;
  limitPrice?: number;
  totalAmount: number;
  brokerageId: 'alpaca' | 'coinbase' | 'ibkr' | 'schwab' | 'robinhood';
  status: OrderStatus;
  timestamp: number;
  fillPrice?: number;
  fillTimestamp?: number;
  executionLatencyMs?: number;
  biometricConfirmed: boolean;
  optionDetails?: {
    strike: number;
    expiration: string;
    optionType: 'CALL' | 'PUT';
    contractMultiplier: number;
    greeks?: { delta: number; theta: number; gamma: number; vega: number };
  };
  optionSpreadDetails?: OptionSpreadDetails;
  isSimulated?: boolean;
}

export interface BrokerageGateway {
  id: 'alpaca' | 'coinbase' | 'ibkr' | 'schwab' | 'robinhood';
  name: string;
  displayName: string;
  category: 'Equities & ETFs' | 'Crypto Advanced' | 'Global Multi-Asset & Bonds' | 'Wealth & Equities' | 'Retail Multi-Asset';
  status: 'connected' | 'connecting' | 'disconnected';
  isLive: boolean; // false = Paper/Sandbox, true = Live
  latencyMs: number;
  supportedClasses: AssetClass[];
  accountNumber: string;
  buyingPower: number;
  apiKeyMasked: string;
  apiSecretMasked: string;
  autoRoutingPriority: number;
  ordersRoutedToday: number;
}

export interface BiometricLogEntry {
  id: string;
  timestamp: number;
  action: string;
  method: 'WebAuthn FaceID' | 'WebAuthn TouchID' | 'PIN Fallback' | 'Hardware Security Key';
  success: boolean;
  device: string;
  ipMasked: string;
}

export interface BiometricSettings {
  isEnabled: boolean;
  hasHardwareBiometrics: boolean;
  registeredCredentialId: string | null;
  requireForRebalance: boolean;
  requireForTradesOver: number; // e.g. 5000
  requireForApiKeys: boolean;
  autoLockMinutes: number; // 0 for off, or 5, 15, 30
  isLocked: boolean;
  fallbackPin: string;
}

export type PlatformLayoutVariation =
  | 'CLASSIC_DOCK'      // Standard thinkorswim: Left Gadgets + Tab View + Bottom Order Bar
  | 'SPLIT_DUAL'        // Side-by-Side Dual-Pane Workspace (e.g. Chart + Options / Vol Surface)
  | 'QUAD_GRID'         // Institutional 4-Pane Multi-Grid (Chart + Options + Vol Surface + Level 2/Trade)
  | 'TRIPLE_COMMAND'    // Command Center 3-Split (Main Chart 60% Left, Vol Surface Top Right, Options Bottom Right)
  | 'CINEMA_FOCUS';     // Max Canvas Edge-to-Edge Focus (Docks Auto-Collapsed)
