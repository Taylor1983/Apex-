import { Asset, BrokerageGateway, RiskProfile, TradeOrder, BiometricSettings, BiometricLogEntry } from '../types';
import { CANADIAN_STOCKS } from './canadianMarketData';

export const INITIAL_ASSETS: Asset[] = [
  // --- CANADIAN EQUITIES (TSX / TSXV) ---
  ...CANADIAN_STOCKS,

  // --- EQUITIES ---
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    assetClass: 'equities',
    price: 228.45,
    change24h: 3.12,
    change24hPct: 1.38,
    high24h: 229.80,
    low24h: 225.10,
    volume24h: 48291000,
    marketCapOrAUM: 3480000000000,
    beta: 1.08,
    yieldPct: 0.44,
    description: 'Consumer hardware, silicon architecture, services, and software ecosystem.',
    defaultBrokerage: 'alpaca',
    sparkline: [221, 222, 220, 223, 225, 224, 226, 225, 227, 228.45],
    orderBook: {
      bids: [
        { price: 228.40, amount: 450, total: 450 },
        { price: 228.35, amount: 820, total: 1270 },
        { price: 228.30, amount: 1400, total: 2670 },
        { price: 228.25, amount: 2100, total: 4770 }
      ],
      asks: [
        { price: 228.50, amount: 510, total: 510 },
        { price: 228.55, amount: 940, total: 1450 },
        { price: 228.60, amount: 1650, total: 3100 },
        { price: 228.65, amount: 2400, total: 5500 }
      ]
    }
  },
  {
    id: 'nvda',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    assetClass: 'equities',
    price: 132.80,
    change24h: 4.60,
    change24hPct: 3.59,
    high24h: 134.20,
    low24h: 127.90,
    volume24h: 74200000,
    marketCapOrAUM: 3250000000000,
    beta: 1.68,
    yieldPct: 0.03,
    description: 'AI accelerated compute, datacenter GPUs, and high-performance computing infrastructure.',
    defaultBrokerage: 'alpaca',
    sparkline: [124, 126, 125, 128, 130, 129, 131, 130, 131, 132.80],
    orderBook: {
      bids: [
        { price: 132.75, amount: 1200, total: 1200 },
        { price: 132.70, amount: 2400, total: 3600 },
        { price: 132.65, amount: 3800, total: 7400 },
        { price: 132.60, amount: 5100, total: 12500 }
      ],
      asks: [
        { price: 132.85, amount: 1150, total: 1150 },
        { price: 132.90, amount: 2100, total: 3250 },
        { price: 132.95, amount: 3400, total: 6650 },
        { price: 133.00, amount: 6200, total: 12850 }
      ]
    }
  },
  {
    id: 'msft',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    assetClass: 'equities',
    price: 435.20,
    change24h: 1.80,
    change24hPct: 0.42,
    high24h: 437.50,
    low24h: 432.80,
    volume24h: 21300000,
    marketCapOrAUM: 3230000000000,
    beta: 0.95,
    yieldPct: 0.72,
    description: 'Enterprise cloud infrastructure (Azure), enterprise software, AI Copilots, and productivity suite.',
    defaultBrokerage: 'schwab',
    sparkline: [430, 432, 431, 433, 434, 433, 435, 434, 436, 435.20],
    orderBook: {
      bids: [
        { price: 435.15, amount: 320, total: 320 },
        { price: 435.10, amount: 640, total: 960 },
        { price: 435.05, amount: 980, total: 1940 },
        { price: 435.00, amount: 1500, total: 3440 }
      ],
      asks: [
        { price: 435.25, amount: 390, total: 390 },
        { price: 435.30, amount: 710, total: 1100 },
        { price: 435.35, amount: 1120, total: 2220 },
        { price: 435.40, amount: 1800, total: 4020 }
      ]
    }
  },
  {
    id: 'spy',
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    assetClass: 'equities',
    price: 574.60,
    change24h: 4.10,
    change24hPct: 0.72,
    high24h: 575.80,
    low24h: 570.20,
    volume24h: 62400000,
    marketCapOrAUM: 590000000000,
    beta: 1.00,
    yieldPct: 1.25,
    expenseRatio: 0.09,
    description: 'Benchmark US broad-market large-cap index tracking 500 dominant corporations.',
    defaultBrokerage: 'alpaca',
    sparkline: [568, 569, 568, 571, 572, 571, 573, 572, 574, 574.60],
    orderBook: {
      bids: [
        { price: 574.55, amount: 2100, total: 2100 },
        { price: 574.50, amount: 4500, total: 6600 },
        { price: 574.45, amount: 7200, total: 13800 },
        { price: 574.40, amount: 9800, total: 23600 }
      ],
      asks: [
        { price: 574.65, amount: 2400, total: 2400 },
        { price: 574.70, amount: 4800, total: 7200 },
        { price: 574.75, amount: 7500, total: 14700 },
        { price: 574.80, amount: 10200, total: 24900 }
      ]
    }
  },
  {
    id: 'qqq',
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust (Nasdaq-100)',
    assetClass: 'equities',
    price: 492.30,
    change24h: 5.80,
    change24hPct: 1.19,
    high24h: 494.10,
    low24h: 486.20,
    volume24h: 38900000,
    marketCapOrAUM: 285000000000,
    beta: 1.18,
    yieldPct: 0.58,
    expenseRatio: 0.20,
    description: 'High-growth technology, semiconductor, and software leaders tracked by Nasdaq-100 index.',
    defaultBrokerage: 'alpaca',
    sparkline: [484, 486, 485, 488, 489, 487, 490, 489, 491, 492.30],
    orderBook: {
      bids: [
        { price: 492.25, amount: 1400, total: 1400 },
        { price: 492.20, amount: 3100, total: 4500 },
        { price: 492.15, amount: 5200, total: 9700 },
        { price: 492.10, amount: 7800, total: 17500 }
      ],
      asks: [
        { price: 492.35, amount: 1550, total: 1550 },
        { price: 492.40, amount: 3400, total: 4950 },
        { price: 492.45, amount: 5600, total: 10550 },
        { price: 492.50, amount: 8200, total: 18750 }
      ]
    }
  },

  // --- CRYPTO ---
  {
    id: 'btc',
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    assetClass: 'crypto',
    price: 66420.00,
    change24h: 1840.00,
    change24hPct: 2.85,
    high24h: 66950.00,
    low24h: 64100.00,
    volume24h: 34100000000,
    marketCapOrAUM: 1310000000000,
    beta: 2.15,
    yieldPct: 0.0,
    description: 'Decentralized digital monetary store of value and cryptographic settlement layer.',
    defaultBrokerage: 'coinbase',
    sparkline: [63800, 64200, 63900, 64800, 65200, 65000, 65800, 66100, 66300, 66420],
    orderBook: {
      bids: [
        { price: 66415, amount: 4.85, total: 4.85 },
        { price: 66410, amount: 8.42, total: 13.27 },
        { price: 66400, amount: 14.90, total: 28.17 },
        { price: 66380, amount: 22.10, total: 50.27 }
      ],
      asks: [
        { price: 66425, amount: 5.12, total: 5.12 },
        { price: 66430, amount: 9.35, total: 14.47 },
        { price: 66440, amount: 16.20, total: 30.67 },
        { price: 66460, amount: 25.40, total: 56.07 }
      ]
    }
  },
  {
    id: 'eth',
    symbol: 'ETH-USD',
    name: 'Ethereum',
    assetClass: 'crypto',
    price: 2680.50,
    change24h: 62.40,
    change24hPct: 2.38,
    high24h: 2715.00,
    low24h: 2590.00,
    volume24h: 16400000000,
    marketCapOrAUM: 322000000000,
    beta: 2.35,
    yieldPct: 3.20, // staking yield
    description: 'Smart contract network powering decentralized finance, real-world asset tokenization, and Layer-2 rollups.',
    defaultBrokerage: 'coinbase',
    sparkline: [2570, 2590, 2580, 2620, 2640, 2630, 2660, 2670, 2675, 2680.5],
    orderBook: {
      bids: [
        { price: 2680.00, amount: 42.5, total: 42.5 },
        { price: 2679.50, amount: 85.0, total: 127.5 },
        { price: 2679.00, amount: 140.2, total: 267.7 },
        { price: 2678.00, amount: 210.8, total: 478.5 }
      ],
      asks: [
        { price: 2681.00, amount: 48.2, total: 48.2 },
        { price: 2681.50, amount: 92.4, total: 140.6 },
        { price: 2682.00, amount: 155.0, total: 295.6 },
        { price: 2683.00, amount: 245.0, total: 540.6 }
      ]
    }
  },
  {
    id: 'sol',
    symbol: 'SOL-USD',
    name: 'Solana',
    assetClass: 'crypto',
    price: 154.20,
    change24h: 7.80,
    change24hPct: 5.33,
    high24h: 156.40,
    low24h: 145.10,
    volume24h: 3950000000,
    marketCapOrAUM: 72000000000,
    beta: 2.80,
    yieldPct: 6.80,
    description: 'Ultra high-throughput, low-latency execution blockchain designed for financial exchanges and micro-payments.',
    defaultBrokerage: 'coinbase',
    sparkline: [142, 145, 144, 147, 149, 148, 151, 152, 153, 154.2],
    orderBook: {
      bids: [
        { price: 154.10, amount: 180, total: 180 },
        { price: 154.00, amount: 420, total: 600 },
        { price: 153.80, amount: 790, total: 1390 },
        { price: 153.50, amount: 1400, total: 2790 }
      ],
      asks: [
        { price: 154.30, amount: 210, total: 210 },
        { price: 154.40, amount: 460, total: 670 },
        { price: 154.60, amount: 840, total: 1510 },
        { price: 154.90, amount: 1520, total: 3030 }
      ]
    }
  },

  // --- FIXED INCOME ---
  {
    id: 'tlt',
    symbol: 'TLT',
    name: 'iShares 20+ Year Treasury Bond ETF',
    assetClass: 'fixed_income',
    price: 94.60,
    change24h: -0.45,
    change24hPct: -0.47,
    high24h: 95.30,
    low24h: 94.20,
    volume24h: 28500000,
    marketCapOrAUM: 56000000000,
    beta: 0.42,
    yieldPct: 4.45,
    expenseRatio: 0.15,
    description: 'Long-duration United States Treasury sovereign debt, offering crisis hedge and rate sensitivity.',
    defaultBrokerage: 'ibkr',
    sparkline: [96.0, 95.8, 95.5, 95.2, 95.4, 94.9, 94.8, 95.0, 94.7, 94.6],
    orderBook: {
      bids: [
        { price: 94.58, amount: 4200, total: 4200 },
        { price: 94.55, amount: 8900, total: 13100 },
        { price: 94.50, amount: 15200, total: 28300 },
        { price: 94.45, amount: 22000, total: 50300 }
      ],
      asks: [
        { price: 94.62, amount: 4500, total: 4500 },
        { price: 94.65, amount: 9200, total: 13700 },
        { price: 94.70, amount: 16100, total: 29800 },
        { price: 94.75, amount: 23500, total: 53300 }
      ]
    }
  },
  {
    id: 'bnd',
    symbol: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    assetClass: 'fixed_income',
    price: 72.85,
    change24h: -0.12,
    change24hPct: -0.16,
    high24h: 73.10,
    low24h: 72.75,
    volume24h: 12400000,
    marketCapOrAUM: 104000000000,
    beta: 0.18,
    yieldPct: 4.28,
    expenseRatio: 0.03,
    description: 'Broad investment-grade fixed income including Treasuries, government mortgage-backed, and corporate credit.',
    defaultBrokerage: 'ibkr',
    sparkline: [73.2, 73.1, 73.0, 72.95, 73.0, 72.9, 72.92, 72.88, 72.86, 72.85],
    orderBook: {
      bids: [
        { price: 72.84, amount: 3500, total: 3500 },
        { price: 72.82, amount: 7200, total: 10700 },
        { price: 72.80, amount: 14100, total: 24800 },
        { price: 72.78, amount: 21500, total: 46300 }
      ],
      asks: [
        { price: 72.86, amount: 3800, total: 3800 },
        { price: 72.88, amount: 7600, total: 11400 },
        { price: 72.90, amount: 14800, total: 26200 },
        { price: 72.92, amount: 22100, total: 48300 }
      ]
    }
  },
  {
    id: 'sgov',
    symbol: 'SGOV',
    name: 'iShares 0-3 Month Treasury Bond ETF',
    assetClass: 'fixed_income',
    price: 100.48,
    change24h: 0.02,
    change24hPct: 0.02,
    high24h: 100.50,
    low24h: 100.46,
    volume24h: 8900000,
    marketCapOrAUM: 26000000000,
    beta: 0.01,
    yieldPct: 5.18,
    expenseRatio: 0.07,
    description: 'Ultra short-term US Treasury bills; high liquidity, near-zero duration risk, high cash yield equivalent.',
    defaultBrokerage: 'schwab',
    sparkline: [100.42, 100.43, 100.44, 100.45, 100.45, 100.46, 100.47, 100.47, 100.48, 100.48],
    orderBook: {
      bids: [
        { price: 100.47, amount: 12000, total: 12000 },
        { price: 100.46, amount: 28000, total: 40000 },
        { price: 100.45, amount: 45000, total: 85000 },
        { price: 100.44, amount: 62000, total: 147000 }
      ],
      asks: [
        { price: 100.49, amount: 13500, total: 13500 },
        { price: 100.50, amount: 31000, total: 44500 },
        { price: 100.51, amount: 48000, total: 92500 },
        { price: 100.52, amount: 65000, total: 157500 }
      ]
    }
  },

  // --- COMMODITIES ---
  {
    id: 'gld',
    symbol: 'GLD',
    name: 'SPDR Gold Shares',
    assetClass: 'commodities',
    price: 244.15,
    change24h: 1.95,
    change24hPct: 0.81,
    high24h: 245.20,
    low24h: 241.80,
    volume24h: 11200000,
    marketCapOrAUM: 71000000000,
    beta: 0.12,
    expenseRatio: 0.40,
    description: 'Physically backed gold bullion trust; primary hedge against currency debasement and geopolitical stress.',
    defaultBrokerage: 'ibkr',
    sparkline: [239, 240, 241, 240.5, 242, 241.5, 243, 243.5, 244, 244.15],
    orderBook: {
      bids: [
        { price: 244.10, amount: 1100, total: 1100 },
        { price: 244.05, amount: 2300, total: 3400 },
        { price: 244.00, amount: 4100, total: 7500 },
        { price: 243.90, amount: 6800, total: 14300 }
      ],
      asks: [
        { price: 244.20, amount: 1250, total: 1250 },
        { price: 244.25, amount: 2500, total: 3750 },
        { price: 244.30, amount: 4400, total: 8150 },
        { price: 244.40, amount: 7100, total: 15250 }
      ]
    }
  },
  {
    id: 'uso',
    symbol: 'USO',
    name: 'United States Oil Fund',
    assetClass: 'commodities',
    price: 74.30,
    change24h: -1.10,
    change24hPct: -1.46,
    high24h: 76.10,
    low24h: 73.90,
    volume24h: 5800000,
    marketCapOrAUM: 1800000000,
    beta: 0.74,
    expenseRatio: 0.60,
    description: 'Tracks daily changes of spot price of light, sweet crude oil delivered to Cushing, Oklahoma.',
    defaultBrokerage: 'alpaca',
    sparkline: [77.0, 76.5, 76.0, 75.8, 75.2, 75.0, 74.8, 74.6, 74.4, 74.3],
    orderBook: {
      bids: [
        { price: 74.28, amount: 950, total: 950 },
        { price: 74.25, amount: 2100, total: 3050 },
        { price: 74.20, amount: 3800, total: 6850 },
        { price: 74.15, amount: 5600, total: 12450 }
      ],
      asks: [
        { price: 74.32, amount: 1050, total: 1050 },
        { price: 74.35, amount: 2300, total: 3350 },
        { price: 74.40, amount: 4100, total: 7450 },
        { price: 74.45, amount: 5900, total: 13350 }
      ]
    }
  }
];

export const RISK_PROFILES: Record<string, RiskProfile> = {
  conservative: {
    id: 'conservative',
    name: 'Capital Preservation (Conservative)',
    description: 'Prioritizes downside protection and steady coupon income over capital appreciation. Minimal equity and crypto exposure.',
    targetAllocation: {
      equities: 20,
      crypto: 0,
      fixed_income: 60,
      commodities: 10
    },
    targetCashPct: 10,
    maxDrawdownTolerance: 8,
    expectedReturnAnnual: 5.4,
    expectedVolatilityAnnual: 6.2,
    recommendedTimeHorizonYears: '1 - 3 Years'
  },
  moderately_conservative: {
    id: 'moderately_conservative',
    name: 'Income & Moderate Growth',
    description: 'Balanced risk appetite focused on defensive equities, high quality treasuries, and real assets.',
    targetAllocation: {
      equities: 35,
      crypto: 3,
      fixed_income: 47,
      commodities: 10
    },
    targetCashPct: 5,
    maxDrawdownTolerance: 12,
    expectedReturnAnnual: 7.2,
    expectedVolatilityAnnual: 8.9,
    recommendedTimeHorizonYears: '3 - 5 Years'
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced Multi-Asset (Standard)',
    description: 'Equilibrium strategy balancing secular growth assets (Tech/Equities/Crypto) with stable shock absorbers (Bonds/Gold).',
    targetAllocation: {
      equities: 50,
      crypto: 8,
      fixed_income: 30,
      commodities: 7
    },
    targetCashPct: 5,
    maxDrawdownTolerance: 18,
    expectedReturnAnnual: 9.8,
    expectedVolatilityAnnual: 12.5,
    recommendedTimeHorizonYears: '5 - 7 Years'
  },
  growth: {
    id: 'growth',
    name: 'Long-Term Growth',
    description: 'Targeted long-horizon equity expansion with strategic crypto allocation for asymmetric upside.',
    targetAllocation: {
      equities: 68,
      crypto: 12,
      fixed_income: 12,
      commodities: 5
    },
    targetCashPct: 3,
    maxDrawdownTolerance: 26,
    expectedReturnAnnual: 12.4,
    expectedVolatilityAnnual: 16.8,
    recommendedTimeHorizonYears: '7 - 10 Years'
  },
  aggressive_growth: {
    id: 'aggressive_growth',
    name: 'Maximum Alpha (Aggressive)',
    description: 'High-beta concentration in technology mega-caps and decentralized digital assets with minimal fixed income damping.',
    targetAllocation: {
      equities: 72,
      crypto: 20,
      fixed_income: 3,
      commodities: 3
    },
    targetCashPct: 2,
    maxDrawdownTolerance: 38,
    expectedReturnAnnual: 16.2,
    expectedVolatilityAnnual: 22.4,
    recommendedTimeHorizonYears: '10+ Years'
  }
};

export const INITIAL_HOLDINGS_RAW = [
  { assetId: 'nvda', quantity: 380, avgBuyPrice: 94.50 }, // ~$50.4k
  { assetId: 'aapl', quantity: 180, avgBuyPrice: 198.20 }, // ~$41.1k
  { assetId: 'spy', quantity: 95, avgBuyPrice: 512.00 }, // ~$54.5k
  { assetId: 'btc', quantity: 0.68, avgBuyPrice: 58200.00 }, // ~$45.1k (Drifted high!)
  { assetId: 'eth', quantity: 5.5, avgBuyPrice: 2840.00 }, // ~$14.7k (Has tax-loss harvesting potential!)
  { assetId: 'sol', quantity: 65, avgBuyPrice: 132.00 }, // ~$10.0k
  { assetId: 'tlt', quantity: 260, avgBuyPrice: 104.20 }, // ~$24.5k (Underweight, loss harvestable)
  { assetId: 'bnd', quantity: 280, avgBuyPrice: 76.50 }, // ~$20.4k (Underweight)
  { assetId: 'sgov', quantity: 120, avgBuyPrice: 100.20 }, // ~$12.0k
  { assetId: 'gld', quantity: 60, avgBuyPrice: 218.40 }, // ~$14.6k
  { assetId: 'uso', quantity: 80, avgBuyPrice: 79.80 } // ~$5.9k
];

export const INITIAL_CASH_BALANCE = 18500.00;

export const INITIAL_BROKERAGES: BrokerageGateway[] = [
  {
    id: 'alpaca',
    name: 'Alpaca Securities',
    displayName: 'Alpaca Markets (Broker API v2)',
    category: 'Equities & ETFs',
    status: 'connected',
    isLive: false,
    latencyMs: 14,
    supportedClasses: ['equities'],
    accountNumber: 'ALP-89240-DEV',
    buyingPower: 124500.00,
    apiKeyMasked: 'PKAL****************3F91',
    apiSecretMasked: 'sk_live_*******************92aa',
    autoRoutingPriority: 1,
    ordersRoutedToday: 14
  },
  {
    id: 'coinbase',
    name: 'Coinbase Prime / Advanced',
    displayName: 'Coinbase Advanced Trade API',
    category: 'Crypto Advanced',
    status: 'connected',
    isLive: false,
    latencyMs: 22,
    supportedClasses: ['crypto'],
    accountNumber: 'CB-PRIME-00918',
    buyingPower: 86400.00,
    apiKeyMasked: 'organizations/***18a/apiKeys/92',
    apiSecretMasked: 'ecdsa_secp256k1_*************',
    autoRoutingPriority: 1,
    ordersRoutedToday: 9
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    displayName: 'IBKR Client Portal Gateway',
    category: 'Global Multi-Asset & Bonds',
    status: 'connected',
    isLive: false,
    latencyMs: 38,
    supportedClasses: ['fixed_income', 'commodities', 'equities'],
    accountNumber: 'U9812401-MAIN',
    buyingPower: 340000.00,
    apiKeyMasked: 'gw_auth_token_**************',
    apiSecretMasked: 'ibkr_rsa_pkcs8_*************',
    autoRoutingPriority: 1,
    ordersRoutedToday: 6
  },
  {
    id: 'schwab',
    name: 'Charles Schwab',
    displayName: 'Schwab Trader API (OAuth 2.0)',
    category: 'Wealth & Equities',
    status: 'connected',
    isLive: false,
    latencyMs: 46,
    supportedClasses: ['equities', 'fixed_income'],
    accountNumber: 'SCH-7741-2900',
    buyingPower: 198000.00,
    apiKeyMasked: 'schwab_client_id_*********',
    apiSecretMasked: 'schwab_secret_key_********',
    autoRoutingPriority: 2,
    ordersRoutedToday: 3
  },
  {
    id: 'robinhood',
    name: 'Robinhood Connect',
    displayName: 'Robinhood Open Platform',
    category: 'Retail Multi-Asset',
    status: 'disconnected',
    isLive: false,
    latencyMs: 58,
    supportedClasses: ['equities', 'crypto'],
    accountNumber: 'RH-RETAIL-4410',
    buyingPower: 25000.00,
    apiKeyMasked: 'rh_app_key_***************',
    apiSecretMasked: 'rh_secret_*****************',
    autoRoutingPriority: 3,
    ordersRoutedToday: 0
  }
];

export const INITIAL_ORDERS: TradeOrder[] = [
  {
    id: 'ord-81920',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    assetClass: 'equities',
    side: 'BUY',
    type: 'MARKET',
    quantity: 30,
    price: 132.80,
    totalAmount: 3984.00,
    brokerageId: 'alpaca',
    status: 'FILLED',
    timestamp: Date.now() - 3600000 * 2,
    fillPrice: 132.78,
    fillTimestamp: Date.now() - 3600000 * 2 + 180,
    executionLatencyMs: 14,
    biometricConfirmed: true
  },
  {
    id: 'ord-81919',
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    assetClass: 'crypto',
    side: 'BUY',
    type: 'LIMIT',
    quantity: 0.15,
    price: 66000.00,
    limitPrice: 66000.00,
    totalAmount: 9900.00,
    brokerageId: 'coinbase',
    status: 'FILLED',
    timestamp: Date.now() - 3600000 * 6,
    fillPrice: 65980.00,
    fillTimestamp: Date.now() - 3600000 * 6 + 420,
    executionLatencyMs: 28,
    biometricConfirmed: true
  },
  {
    id: 'ord-81918',
    symbol: 'TLT',
    name: 'iShares 20+ Year Treasury Bond ETF',
    assetClass: 'fixed_income',
    side: 'BUY',
    type: 'MARKET',
    quantity: 50,
    price: 94.60,
    totalAmount: 4730.00,
    brokerageId: 'ibkr',
    status: 'FILLED',
    timestamp: Date.now() - 3600000 * 18,
    fillPrice: 94.62,
    fillTimestamp: Date.now() - 3600000 * 18 + 95,
    executionLatencyMs: 36,
    biometricConfirmed: false
  }
];

export const INITIAL_BIOMETRIC_SETTINGS: BiometricSettings = {
  isEnabled: true,
  hasHardwareBiometrics: true,
  registeredCredentialId: 'webauthn-cred-secp256r1-9921',
  requireForRebalance: true,
  requireForTradesOver: 5000,
  requireForApiKeys: true,
  autoLockMinutes: 15,
  isLocked: false,
  fallbackPin: '4829'
};

export const INITIAL_BIOMETRIC_LOGS: BiometricLogEntry[] = [
  {
    id: 'bio-log-1',
    timestamp: Date.now() - 1000 * 60 * 14,
    action: 'Session Unlock / Device Auth',
    method: 'WebAuthn FaceID',
    success: true,
    device: 'Apple Secure Enclave (MacBook Pro / iPhone)',
    ipMasked: '192.168.1.***'
  },
  {
    id: 'bio-log-2',
    timestamp: Date.now() - 1000 * 60 * 125,
    action: 'Trade Authorization (BTC-USD $9,900)',
    method: 'WebAuthn TouchID',
    success: true,
    device: 'Hardware FIDO2 Authenticator',
    ipMasked: '192.168.1.***'
  },
  {
    id: 'bio-log-3',
    timestamp: Date.now() - 1000 * 60 * 420,
    action: 'API Key Secret Reveal (Alpaca v2)',
    method: 'WebAuthn FaceID',
    success: true,
    device: 'Apple Secure Enclave',
    ipMasked: '192.168.1.***'
  }
];
