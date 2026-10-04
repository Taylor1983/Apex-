import { Asset, CanadianAccountInfo, AccountType } from '../types';

export const CAD_USD_EXCHANGE_RATE = 1.3625; // 1 USD = 1.3625 CAD (or 1 CAD = 0.7339 USD)

export const CANADIAN_ACCOUNTS: Record<AccountType, CanadianAccountInfo> = {
  CA_MARGIN: {
    id: 'CA_MARGIN',
    accountNumber: 'CA-MRG-882109',
    name: 'Canadian Margin (CAD/USD Non-Registered)',
    category: 'CANADIAN_MARGIN',
    typeLabel: 'Non-Registered Margin',
    country: 'CA',
    currency: 'CAD',
    regulator: 'CIRO',
    investorProtection: 'CIPF Insured up to $1,000,000 CAD',
    taxTreatment: 'Taxable Non-Registered',
    optionsLevel: 4,
    optionsDescription: 'Level 4: Full Derivatives (Long Calls/Puts, Spreads, Straddles, Uncovered Naked Writing)',
    craOptionRules: [
      'Unrestricted option strategies permitted under CIRO IIROC rules',
      'Capital gains taxed at 50% inclusion rate (or 66.7% for gains over $250,000)',
      'Margin borrowing interest is tax-deductible when used to earn income',
      'Dual currency sub-accounts: Settled in both CAD and USD'
    ]
  },
  CA_TFSA: {
    id: 'CA_TFSA',
    accountNumber: 'CA-TFSA-551920',
    name: 'Tax-Free Savings Account (TFSA)',
    category: 'CANADIAN_TFSA',
    typeLabel: 'Tax-Free Savings Account',
    country: 'CA',
    currency: 'CAD',
    regulator: 'CIRO',
    investorProtection: 'CIPF Insured up to $1,000,000 CAD',
    taxTreatment: 'Tax-Free (TFSA)',
    craContributionLimitAnnual: 7000.00, // 2026 CRA annual limit
    craContributionRoomRemaining: 2400.00,
    craLifetimeCap: 95000.00, // Cumulative room since 2009 for eligible residents
    optionsLevel: 2,
    optionsDescription: 'Level 2: Long Calls, Long Puts, and Covered Calls (CRA Qualified)',
    craOptionRules: [
      'All capital gains, dividends, and interest are 100% tax-free',
      'CRA qualified investments only (TSX, TSXV, NYSE, NASDAQ, MX)',
      'Naked call writing, uncovered short puts, and borrowing on margin are PROHIBITED by CRA',
      'Withdrawals can be re-contributed starting January 1st of the following calendar year'
    ]
  },
  CA_RRSP: {
    id: 'CA_RRSP',
    accountNumber: 'CA-RRSP-334182',
    name: 'Registered Retirement Savings Plan (RRSP)',
    category: 'CANADIAN_RRSP',
    typeLabel: 'Registered Retirement (RRSP)',
    country: 'CA',
    currency: 'CAD',
    regulator: 'CIRO',
    investorProtection: 'CIPF Insured up to $1,000,000 CAD',
    taxTreatment: 'Tax-Deferred (RRSP)',
    craContributionLimitAnnual: 31560.00, // 2026 CRA maximum dollar limit
    craContributionRoomRemaining: 11800.00,
    craLifetimeCap: 280000.00,
    optionsLevel: 2,
    optionsDescription: 'Level 2: Long Calls, Long Puts, Covered Calls & Collars',
    craOptionRules: [
      'Contributions are tax-deductible against gross earned income',
      'US Dividends are EXEMPT from 15% US withholding tax under Article XXI of US-Canada Tax Treaty',
      'Investment growth is tax-deferred until withdrawal or conversion to RRIF at age 71',
      'Covered call writing permitted on underlying TSX/US holdings'
    ]
  },
  CA_RESP: {
    id: 'CA_RESP',
    accountNumber: 'CA-RESP-119284',
    name: 'Registered Education Savings Plan (RESP)',
    category: 'CANADIAN_RESP',
    typeLabel: 'Education Savings (Family RESP)',
    country: 'CA',
    currency: 'CAD',
    regulator: 'CIRO',
    investorProtection: 'CIPF Insured up to $1,000,000 CAD',
    taxTreatment: 'Tax-Sheltered Education (RESP)',
    craContributionLimitAnnual: 2500.00, // Ideal annual contribution for maximum CESG grant
    craContributionRoomRemaining: 500.00,
    craLifetimeCap: 50000.00, // $50,000 lifetime limit per beneficiary
    cesgGrantMatchingPct: 20, // 20% Canada Education Savings Grant
    cesgGrantReceivedYTD: 500.00, // Max annual federal grant of $500
    cesgGrantLifetimeReceived: 4500.00, // Lifetime max $7,200 per child
    optionsLevel: 1,
    optionsDescription: 'Level 1: Conservative Covered Call Writing Only',
    craOptionRules: [
      'Federal Government provides 20% CESG grant match up to $500/year ($7,200 lifetime max)',
      'Withdrawals for post-secondary education taxed in student hands at low/zero bracket',
      'Conservative capital growth focus to preserve college tuition capital',
      'Designated Beneficiary: Liam Taylor (Age 9, Post-Secondary Target: Fall 2035)'
    ]
  },
  US_MARGIN_PAPER: {
    id: 'US_MARGIN_PAPER',
    accountNumber: 'PM-7729104',
    name: 'paperMoney® Individual Margin (USD)',
    category: 'US_PAPER',
    typeLabel: 'US Simulated Margin',
    country: 'US',
    currency: 'USD',
    regulator: 'FINRA',
    investorProtection: 'SIPC Simulated Protection up to $500,000 USD',
    taxTreatment: 'Taxable Non-Registered',
    optionsLevel: 4,
    optionsDescription: 'Level 4: Full Multi-Leg Options (Spreads, Condors, Naked)',
    craOptionRules: [
      'Virtual sandbox environment with real-time institutional quote feed',
      'Full thinkorswim multi-leg derivatives access'
    ]
  },
  US_MARGIN_LIVE: {
    id: 'US_MARGIN_LIVE',
    accountNumber: 'U9812401-MAIN',
    name: 'US Live DMA Prime Brokerage (USD)',
    category: 'US_LIVE',
    typeLabel: 'US Live DMA Margin',
    country: 'US',
    currency: 'USD',
    regulator: 'FINRA',
    investorProtection: 'SIPC Insured up to $500,000 USD (Apex Clearing)',
    taxTreatment: 'Taxable Non-Registered',
    optionsLevel: 4,
    optionsDescription: 'Level 4: Institutional DMA & Smart Routing',
    craOptionRules: [
      'Direct Market Access with sub-15ms execution latency',
      'FINRA Rule 4210 Reg-T margin compliance'
    ]
  }
};

// Canadian TSX / TSXV Equities with real pricing and market profiles
export const CANADIAN_STOCKS: Asset[] = [
  {
    id: 'shop_to',
    symbol: 'SHOP.TO',
    name: 'Shopify Inc.',
    assetClass: 'equities',
    price: 118.50,
    change24h: 3.80,
    change24hPct: 3.31,
    high24h: 120.20,
    low24h: 114.60,
    volume24h: 4210000,
    marketCapOrAUM: 152000000000,
    beta: 1.95,
    yieldPct: 0.0,
    description: 'Canadian multinational e-commerce platform powering over 2 million global merchant storefronts.',
    defaultBrokerage: 'ibkr',
    currency: 'CAD',
    exchange: 'TSX',
    sparkline: [111, 112, 114, 113, 115, 116, 115, 117, 116, 118.50],
    orderBook: {
      bids: [
        { price: 118.45, amount: 850, total: 850 },
        { price: 118.40, amount: 1600, total: 2450 },
        { price: 118.35, amount: 2800, total: 5250 },
        { price: 118.30, amount: 4200, total: 9450 }
      ],
      asks: [
        { price: 118.55, amount: 920, total: 920 },
        { price: 118.60, amount: 1850, total: 2770 },
        { price: 118.65, amount: 3100, total: 5870 },
        { price: 118.70, amount: 4900, total: 10770 }
      ]
    }
  },
  {
    id: 'ry_to',
    symbol: 'RY.TO',
    name: 'Royal Bank of Canada',
    assetClass: 'equities',
    price: 168.20,
    change24h: 1.40,
    change24hPct: 0.84,
    high24h: 169.10,
    low24h: 166.80,
    volume24h: 3150000,
    marketCapOrAUM: 238000000000,
    beta: 0.78,
    yieldPct: 3.85,
    description: 'Largest Canadian diversified financial services institution and global wealth manager.',
    defaultBrokerage: 'ibkr',
    currency: 'CAD',
    exchange: 'TSX',
    sparkline: [165, 166, 165.5, 167, 166.8, 167.5, 167.2, 168, 167.8, 168.20],
    orderBook: {
      bids: [
        { price: 168.15, amount: 1200, total: 1200 },
        { price: 168.10, amount: 2600, total: 3800 },
        { price: 168.05, amount: 4500, total: 8300 },
        { price: 168.00, amount: 7200, total: 15500 }
      ],
      asks: [
        { price: 168.25, amount: 1100, total: 1100 },
        { price: 168.30, amount: 2400, total: 3500 },
        { price: 168.35, amount: 4100, total: 7600 },
        { price: 168.40, amount: 6800, total: 14400 }
      ]
    }
  },
  {
    id: 'td_to',
    symbol: 'TD.TO',
    name: 'Toronto-Dominion Bank',
    assetClass: 'equities',
    price: 86.40,
    change24h: 0.95,
    change24hPct: 1.11,
    high24h: 87.00,
    low24h: 85.30,
    volume24h: 4600000,
    marketCapOrAUM: 151000000000,
    beta: 0.82,
    yieldPct: 4.70,
    description: 'Top-tier North American chartered retail and commercial bank with deep US footprint.',
    defaultBrokerage: 'ibkr',
    currency: 'CAD',
    exchange: 'TSX',
    sparkline: [84.5, 85, 84.8, 85.5, 85.8, 85.4, 86, 86.1, 85.9, 86.40],
    orderBook: {
      bids: [
        { price: 86.35, amount: 1400, total: 1400 },
        { price: 86.30, amount: 3200, total: 4600 },
        { price: 86.25, amount: 5600, total: 10200 },
        { price: 86.20, amount: 8900, total: 19100 }
      ],
      asks: [
        { price: 86.45, amount: 1300, total: 1300 },
        { price: 86.50, amount: 2900, total: 4200 },
        { price: 86.55, amount: 5100, total: 9300 },
        { price: 86.60, amount: 8200, total: 17500 }
      ]
    }
  },
  {
    id: 'enb_to',
    symbol: 'ENB.TO',
    name: 'Enbridge Inc.',
    assetClass: 'equities',
    price: 54.80,
    change24h: 0.45,
    change24hPct: 0.83,
    high24h: 55.10,
    low24h: 54.20,
    volume24h: 6800000,
    marketCapOrAUM: 116000000000,
    beta: 0.65,
    yieldPct: 6.75,
    description: 'Premier North American energy infrastructure giant operating the world’s longest crude oil and liquid pipeline system.',
    defaultBrokerage: 'ibkr',
    currency: 'CAD',
    exchange: 'TSX',
    sparkline: [53.5, 53.8, 54.0, 54.2, 54.1, 54.4, 54.5, 54.6, 54.7, 54.80],
    orderBook: {
      bids: [
        { price: 54.75, amount: 2500, total: 2500 },
        { price: 54.70, amount: 5400, total: 7900 },
        { price: 54.65, amount: 9200, total: 17100 },
        { price: 54.60, amount: 14500, total: 31600 }
      ],
      asks: [
        { price: 54.85, amount: 2200, total: 2200 },
        { price: 54.90, amount: 5100, total: 7300 },
        { price: 54.95, amount: 8900, total: 16200 },
        { price: 55.00, amount: 13800, total: 30000 }
      ]
    }
  },
  {
    id: 'cnq_to',
    symbol: 'CNQ.TO',
    name: 'Canadian Natural Resources Ltd.',
    assetClass: 'equities',
    price: 51.20,
    change24h: -0.65,
    change24hPct: -1.25,
    high24h: 52.30,
    low24h: 50.80,
    volume24h: 5100000,
    marketCapOrAUM: 108000000000,
    beta: 1.15,
    yieldPct: 4.20,
    description: 'World-class Canadian crude oil and natural gas exploration and production company with immense oil sands reserves.',
    defaultBrokerage: 'ibkr',
    currency: 'CAD',
    exchange: 'TSX',
    sparkline: [52.8, 52.4, 52.6, 52.1, 51.9, 52.0, 51.7, 51.5, 51.4, 51.20],
    orderBook: {
      bids: [
        { price: 51.15, amount: 1800, total: 1800 },
        { price: 51.10, amount: 4100, total: 5900 },
        { price: 51.05, amount: 7300, total: 13200 },
        { price: 51.00, amount: 11500, total: 24700 }
      ],
      asks: [
        { price: 51.25, amount: 1600, total: 1600 },
        { price: 51.30, amount: 3900, total: 5500 },
        { price: 51.35, amount: 6800, total: 12300 },
        { price: 51.40, amount: 10400, total: 22700 }
      ]
    }
  },
  {
    id: 'cnr_to',
    symbol: 'CNR.TO',
    name: 'Canadian National Railway',
    assetClass: 'equities',
    price: 158.00,
    change24h: 1.80,
    change24hPct: 1.15,
    high24h: 159.20,
    low24h: 156.40,
    volume24h: 1850000,
    marketCapOrAUM: 101000000000,
    beta: 0.72,
    yieldPct: 2.10,
    description: 'Transcontinental Class I railway network spanning Canada and Mid-America from Atlantic to Pacific to Gulf of Mexico.',
    defaultBrokerage: 'ibkr',
    currency: 'CAD',
    exchange: 'TSX',
    sparkline: [155, 156, 155.5, 157, 156.8, 157.2, 157, 158.1, 157.6, 158.00],
    orderBook: {
      bids: [
        { price: 157.90, amount: 750, total: 750 },
        { price: 157.80, amount: 1800, total: 2550 },
        { price: 157.70, amount: 3400, total: 5950 },
        { price: 157.60, amount: 5600, total: 11550 }
      ],
      asks: [
        { price: 158.10, amount: 820, total: 820 },
        { price: 158.20, amount: 1950, total: 2770 },
        { price: 158.30, amount: 3600, total: 6370 },
        { price: 158.40, amount: 5900, total: 12270 }
      ]
    }
  },
  {
    id: 'xiu_to',
    symbol: 'XIU.TO',
    name: 'iShares S&P/TSX 60 Index ETF',
    assetClass: 'equities',
    price: 37.60,
    change24h: 0.32,
    change24hPct: 0.86,
    high24h: 37.80,
    low24h: 37.20,
    volume24h: 7800000,
    marketCapOrAUM: 14500000000,
    beta: 1.00,
    yieldPct: 2.90,
    expenseRatio: 0.18,
    description: 'Canada’s flagship benchmark index ETF holding the 60 largest and most liquid TSX-listed Canadian blue-chip equities.',
    defaultBrokerage: 'ibkr',
    currency: 'CAD',
    exchange: 'TSX',
    sparkline: [36.8, 37.0, 36.9, 37.2, 37.1, 37.3, 37.4, 37.5, 37.55, 37.60],
    orderBook: {
      bids: [
        { price: 37.58, amount: 6200, total: 6200 },
        { price: 37.55, amount: 14500, total: 20700 },
        { price: 37.50, amount: 28000, total: 48700 },
        { price: 37.45, amount: 45000, total: 93700 }
      ],
      asks: [
        { price: 37.62, amount: 5800, total: 5800 },
        { price: 37.65, amount: 13900, total: 19700 },
        { price: 37.70, amount: 26500, total: 46200 },
        { price: 37.75, amount: 43000, total: 89200 }
      ]
    }
  }
];

// Tailored starting portfolios per account type
export const ACCOUNT_PORTFOLIOS: Record<AccountType, {
  cashBalance: number;
  holdings: { assetId: string; quantity: number; avgBuyPrice: number }[];
}> = {
  CA_MARGIN: {
    cashBalance: 42500.00,
    holdings: [
      { assetId: 'shop_to', quantity: 250, avgBuyPrice: 98.40 }, // C$29.6k
      { assetId: 'ry_to', quantity: 180, avgBuyPrice: 152.00 }, // C$30.3k
      { assetId: 'enb_to', quantity: 450, avgBuyPrice: 48.20 }, // C$24.7k
      { assetId: 'cnr_to', quantity: 120, avgBuyPrice: 144.50 }, // C$19.0k
      { assetId: 'nvda', quantity: 100, avgBuyPrice: 110.00 }, // US$13.3k (~C$18.1k)
      { assetId: 'xiu_to', quantity: 600, avgBuyPrice: 34.80 } // C$22.6k
    ]
  },
  CA_TFSA: {
    cashBalance: 18400.00,
    holdings: [
      { assetId: 'shop_to', quantity: 220, avgBuyPrice: 94.20 }, // C$26.1k (Tax-Free Growth!)
      { assetId: 'nvda', quantity: 90, avgBuyPrice: 105.00 }, // US$11.9k (~C$16.2k)
      { assetId: 'xiu_to', quantity: 800, avgBuyPrice: 35.10 }, // C$30.1k
      { assetId: 'btc', quantity: 0.25, avgBuyPrice: 59000.00 } // US$16.6k (~C$22.6k)
    ]
  },
  CA_RRSP: {
    cashBalance: 28600.00,
    holdings: [
      { assetId: 'ry_to', quantity: 240, avgBuyPrice: 148.50 }, // C$40.4k
      { assetId: 'td_to', quantity: 350, avgBuyPrice: 79.20 }, // C$30.2k
      { assetId: 'enb_to', quantity: 500, avgBuyPrice: 49.10 }, // C$27.4k
      { assetId: 'msft', quantity: 70, avgBuyPrice: 395.00 }, // US$30.5k (US treaty exempt dividend!)
      { assetId: 'spy', quantity: 60, avgBuyPrice: 498.00 }, // US$34.5k
      { assetId: 'tlt', quantity: 180, avgBuyPrice: 98.40 } // US$17.0k
    ]
  },
  CA_RESP: {
    cashBalance: 14200.00,
    holdings: [
      { assetId: 'xiu_to', quantity: 650, avgBuyPrice: 34.50 }, // C$24.4k
      { assetId: 'cnr_to', quantity: 90, avgBuyPrice: 146.00 }, // C$14.2k
      { assetId: 'bnd', quantity: 240, avgBuyPrice: 75.20 }, // US$17.4k (~C$23.7k)
      { assetId: 'sgov', quantity: 150, avgBuyPrice: 100.10 } // US$15.0k (~C$20.4k)
    ]
  },
  US_MARGIN_PAPER: {
    cashBalance: 18500.00,
    holdings: [
      { assetId: 'nvda', quantity: 380, avgBuyPrice: 94.50 },
      { assetId: 'aapl', quantity: 180, avgBuyPrice: 198.20 },
      { assetId: 'spy', quantity: 95, avgBuyPrice: 512.00 },
      { assetId: 'btc', quantity: 0.68, avgBuyPrice: 58200.00 },
      { assetId: 'eth', quantity: 5.5, avgBuyPrice: 2840.00 },
      { assetId: 'sol', quantity: 65, avgBuyPrice: 132.00 },
      { assetId: 'tlt', quantity: 260, avgBuyPrice: 104.20 },
      { assetId: 'bnd', quantity: 280, avgBuyPrice: 76.50 },
      { assetId: 'sgov', quantity: 120, avgBuyPrice: 100.20 },
      { assetId: 'gld', quantity: 60, avgBuyPrice: 218.40 },
      { assetId: 'uso', quantity: 80, avgBuyPrice: 79.80 }
    ]
  },
  US_MARGIN_LIVE: {
    cashBalance: 125000.00,
    holdings: [
      { assetId: 'nvda', quantity: 500, avgBuyPrice: 98.20 },
      { assetId: 'msft', quantity: 150, avgBuyPrice: 412.00 },
      { assetId: 'aapl', quantity: 200, avgBuyPrice: 215.00 },
      { assetId: 'spy', quantity: 120, avgBuyPrice: 535.00 }
    ]
  }
};

// Canadian Exchange Venues & Connectivity Status
export interface CanadianExchangeVenue {
  id: 'TSX' | 'TSXV' | 'MX' | 'ALPHA' | 'CHIX';
  name: string;
  shortName: string;
  mic: string; // Market Identifier Code
  status: 'OPEN' | 'CROSS' | 'AUCTION' | 'HALTED';
  latencyMs: number;
  engine: string;
  feedType: 'L1_BBO' | 'L2_FULL_DEPTH' | 'DERIVATIVES_TAPE' | 'SMART_ROUTED';
  marketSharePct: number;
}

export const CANADIAN_EXCHANGES: CanadianExchangeVenue[] = [
  {
    id: 'TSX',
    name: 'Toronto Stock Exchange',
    shortName: 'TMX TSX',
    mic: 'XTSE',
    status: 'OPEN',
    latencyMs: 8.2,
    engine: 'TMX Quantum XA (High Throughput)',
    feedType: 'L2_FULL_DEPTH',
    marketSharePct: 56.4
  },
  {
    id: 'MX',
    name: 'Bourse de Montréal (Derivatives)',
    shortName: 'Bourse MX',
    mic: 'XMOD',
    status: 'OPEN',
    latencyMs: 7.4,
    engine: 'SOLA® Canadian Derivatives Engine',
    feedType: 'DERIVATIVES_TAPE',
    marketSharePct: 98.2
  },
  {
    id: 'ALPHA',
    name: 'TSX Alpha ATS',
    shortName: 'Alpha ATS',
    mic: 'XALF',
    status: 'OPEN',
    latencyMs: 6.8,
    engine: 'Alpha Lit/Dark Matching System',
    feedType: 'SMART_ROUTED',
    marketSharePct: 18.5
  },
  {
    id: 'CHIX',
    name: 'Cboe Canada / Chi-X Canada',
    shortName: 'Cboe Chi-X',
    mic: 'CHIC',
    status: 'OPEN',
    latencyMs: 6.5,
    engine: 'Cboe Velocity Dual-Book Matching',
    feedType: 'L1_BBO',
    marketSharePct: 15.1
  },
  {
    id: 'TSXV',
    name: 'TSX Venture Exchange',
    shortName: 'TMX TSXV',
    mic: 'XTSX',
    status: 'OPEN',
    latencyMs: 9.1,
    engine: 'TMX Venture Matching Engine',
    feedType: 'L2_FULL_DEPTH',
    marketSharePct: 10.0
  }
];

// Live Canadian Tape Trade Print
export interface CanadianTapePrint {
  id: string;
  time: string;
  symbol: string;
  venue: 'TSX' | 'TSXV' | 'MX' | 'ALPHA' | 'CHIX';
  price: number;
  size: number;
  isUptick: boolean;
  condition: 'REGULAR' | 'ODD_LOT' | 'CROSS' | 'CONTINGENT' | 'OPTION_BLOCK';
}

export const INITIAL_CANADIAN_TAPE: CanadianTapePrint[] = [
  { id: 'ca-t-1', time: '15:43:22', symbol: 'SHOP.TO', venue: 'TSX', price: 118.55, size: 500, isUptick: true, condition: 'REGULAR' },
  { id: 'ca-t-2', time: '15:43:18', symbol: 'RY.TO', venue: 'ALPHA', price: 168.20, size: 200, isUptick: true, condition: 'REGULAR' },
  { id: 'ca-t-3', time: '15:43:14', symbol: 'SHOP 120C', venue: 'MX', price: 4.85, size: 10, isUptick: true, condition: 'OPTION_BLOCK' },
  { id: 'ca-t-4', time: '15:43:08', symbol: 'TD.TO', venue: 'CHIX', price: 86.40, size: 300, isUptick: false, condition: 'REGULAR' },
  { id: 'ca-t-5', time: '15:43:02', symbol: 'ENB.TO', venue: 'TSX', price: 54.80, size: 850, isUptick: true, condition: 'CROSS' },
  { id: 'ca-t-6', time: '15:42:55', symbol: 'XIU.TO', venue: 'TSX', price: 37.60, size: 1200, isUptick: true, condition: 'REGULAR' },
  { id: 'ca-t-7', time: '15:42:49', symbol: 'CNQ.TO', venue: 'ALPHA', price: 51.20, size: 400, isUptick: false, condition: 'ODD_LOT' },
  { id: 'ca-t-8', time: '15:42:42', symbol: 'CNR.TO', venue: 'TSX', price: 158.05, size: 150, isUptick: true, condition: 'REGULAR' }
];

