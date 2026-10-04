import { CountryYieldCurve } from '../types';

export const ALL_COUNTRY_YIELD_CURVES: CountryYieldCurve[] = [
  // ==========================================
  // AMERICAS
  // ==========================================
  {
    countryCode: 'US',
    countryName: 'United States',
    bondName: 'US Treasuries',
    flag: '🇺🇸',
    currency: 'USD',
    centralBank: 'Federal Reserve (Fed)',
    policyRate: 4.875,
    creditRating: 'AA+',
    spread10Y2Y: 14, // bps
    curveStatus: 'NORMAL',
    color: '#38bdf8', // sky-400
    region: 'Americas',
    tenors: [
      { tenor: '1M', yield: 4.88, change1D: 0.01 },
      { tenor: '3M', yield: 4.62, change1D: -0.02 },
      { tenor: '6M', yield: 4.38, change1D: -0.03 },
      { tenor: '1Y', yield: 4.02, change1D: -0.04 },
      { tenor: '2Y', yield: 3.65, change1D: -0.03 },
      { tenor: '3Y', yield: 3.60, change1D: -0.02 },
      { tenor: '5Y', yield: 3.62, change1D: 0.01 },
      { tenor: '7Y', yield: 3.71, change1D: 0.02 },
      { tenor: '10Y', yield: 3.79, change1D: 0.03 },
      { tenor: '20Y', yield: 4.15, change1D: 0.02 },
      { tenor: '30Y', yield: 4.12, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'CA',
    countryName: 'Canada',
    bondName: 'Government of Canada (GoC)',
    flag: '🇨🇦',
    currency: 'CAD',
    centralBank: 'Bank of Canada (BoC)',
    policyRate: 4.25,
    creditRating: 'AAA',
    spread10Y2Y: 7, // bps
    curveStatus: 'NORMAL',
    color: '#f43f5e', // rose-500
    region: 'Americas',
    tenors: [
      { tenor: '1M', yield: 4.15, change1D: -0.01 },
      { tenor: '3M', yield: 3.95, change1D: -0.02 },
      { tenor: '6M', yield: 3.72, change1D: -0.03 },
      { tenor: '1Y', yield: 3.35, change1D: -0.04 },
      { tenor: '2Y', yield: 2.95, change1D: -0.02 },
      { tenor: '3Y', yield: 2.88, change1D: -0.01 },
      { tenor: '5Y', yield: 2.85, change1D: 0.01 },
      { tenor: '7Y', yield: 2.92, change1D: 0.02 },
      { tenor: '10Y', yield: 3.02, change1D: 0.03 },
      { tenor: '20Y', yield: 3.28, change1D: 0.02 },
      { tenor: '30Y', yield: 3.25, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'MX',
    countryName: 'Mexico',
    bondName: 'Bonos de Desarrollo (Mbonos)',
    flag: '🇲🇽',
    currency: 'MXN',
    centralBank: 'Banco de México (Banxico)',
    policyRate: 10.50,
    creditRating: 'BBB',
    spread10Y2Y: 7,
    curveStatus: 'NORMAL',
    color: '#059669', // emerald-600
    region: 'Americas',
    tenors: [
      { tenor: '1M', yield: 10.40, change1D: -0.02 },
      { tenor: '3M', yield: 10.25, change1D: -0.03 },
      { tenor: '6M', yield: 9.95, change1D: -0.04 },
      { tenor: '1Y', yield: 9.60, change1D: -0.03 },
      { tenor: '2Y', yield: 9.35, change1D: -0.02 },
      { tenor: '3Y', yield: 9.25, change1D: -0.01 },
      { tenor: '5Y', yield: 9.28, change1D: 0.01 },
      { tenor: '7Y', yield: 9.35, change1D: 0.02 },
      { tenor: '10Y', yield: 9.42, change1D: 0.02 },
      { tenor: '20Y', yield: 9.75, change1D: 0.03 },
      { tenor: '30Y', yield: 9.85, change1D: 0.02 }
    ]
  },
  {
    countryCode: 'BR',
    countryName: 'Brazil',
    bondName: 'Tesouro Nacional NTN-F / DI',
    flag: '🇧🇷',
    currency: 'BRL',
    centralBank: 'Banco Central do Brasil (BCB)',
    policyRate: 10.75,
    creditRating: 'BB',
    spread10Y2Y: 50,
    curveStatus: 'STEEP',
    color: '#84cc16', // lime-500
    region: 'Americas',
    tenors: [
      { tenor: '1M', yield: 10.45, change1D: 0.05 },
      { tenor: '3M', yield: 10.60, change1D: 0.04 },
      { tenor: '6M', yield: 10.85, change1D: 0.06 },
      { tenor: '1Y', yield: 11.20, change1D: 0.08 },
      { tenor: '2Y', yield: 11.75, change1D: 0.10 },
      { tenor: '3Y', yield: 11.95, change1D: 0.08 },
      { tenor: '5Y', yield: 12.15, change1D: 0.05 },
      { tenor: '10Y', yield: 12.25, change1D: 0.04 },
      { tenor: '20Y', yield: 12.45, change1D: 0.03 },
      { tenor: '30Y', yield: 12.50, change1D: 0.02 }
    ]
  },
  {
    countryCode: 'CL',
    countryName: 'Chile',
    bondName: 'Bonos de la Tesorería (BCP)',
    flag: '🇨🇱',
    currency: 'CLP',
    centralBank: 'Banco Central de Chile',
    policyRate: 5.50,
    creditRating: 'A',
    spread10Y2Y: 38,
    curveStatus: 'NORMAL',
    color: '#0284c7', // sky-600
    region: 'Americas',
    tenors: [
      { tenor: '3M', yield: 5.45, change1D: -0.02 },
      { tenor: '6M', yield: 5.25, change1D: -0.01 },
      { tenor: '1Y', yield: 5.05, change1D: -0.02 },
      { tenor: '2Y', yield: 4.88, change1D: -0.01 },
      { tenor: '5Y', yield: 5.12, change1D: 0.01 },
      { tenor: '10Y', yield: 5.26, change1D: 0.02 },
      { tenor: '20Y', yield: 5.45, change1D: 0.01 },
      { tenor: '30Y', yield: 5.55, change1D: 0.01 }
    ]
  },

  // ==========================================
  // EUROPE
  // ==========================================
  {
    countryCode: 'DE',
    countryName: 'Germany',
    bondName: 'German Bunds (Euro Benchmark)',
    flag: '🇩🇪',
    currency: 'EUR',
    centralBank: 'European Central Bank (ECB)',
    policyRate: 3.25,
    creditRating: 'AAA',
    spread10Y2Y: 10, // bps
    curveStatus: 'NORMAL',
    color: '#fbbf24', // amber-400
    region: 'Europe',
    tenors: [
      { tenor: '1M', yield: 3.35, change1D: -0.02 },
      { tenor: '3M', yield: 3.18, change1D: -0.01 },
      { tenor: '6M', yield: 2.85, change1D: -0.03 },
      { tenor: '1Y', yield: 2.50, change1D: -0.02 },
      { tenor: '2Y', yield: 2.12, change1D: -0.01 },
      { tenor: '3Y', yield: 2.05, change1D: -0.01 },
      { tenor: '5Y', yield: 2.08, change1D: 0.01 },
      { tenor: '7Y', yield: 2.15, change1D: 0.02 },
      { tenor: '10Y', yield: 2.22, change1D: 0.02 },
      { tenor: '20Y', yield: 2.45, change1D: 0.01 },
      { tenor: '30Y', yield: 2.48, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    bondName: 'UK Gilts',
    flag: '🇬🇧',
    currency: 'GBP',
    centralBank: 'Bank of England (BoE)',
    policyRate: 5.00,
    creditRating: 'AA',
    spread10Y2Y: 14,
    curveStatus: 'NORMAL',
    color: '#a855f7', // purple-500
    region: 'Europe',
    tenors: [
      { tenor: '1M', yield: 4.95, change1D: 0.01 },
      { tenor: '3M', yield: 4.80, change1D: -0.01 },
      { tenor: '6M', yield: 4.65, change1D: -0.02 },
      { tenor: '1Y', yield: 4.30, change1D: -0.03 },
      { tenor: '2Y', yield: 3.88, change1D: -0.02 },
      { tenor: '3Y', yield: 3.82, change1D: -0.01 },
      { tenor: '5Y', yield: 3.85, change1D: 0.02 },
      { tenor: '7Y', yield: 3.92, change1D: 0.03 },
      { tenor: '10Y', yield: 4.02, change1D: 0.04 },
      { tenor: '20Y', yield: 4.45, change1D: 0.03 },
      { tenor: '30Y', yield: 4.52, change1D: 0.02 }
    ]
  },
  {
    countryCode: 'FR',
    countryName: 'France',
    bondName: 'French OAT (Obligations)',
    flag: '🇫🇷',
    currency: 'EUR',
    centralBank: 'European Central Bank (ECB)',
    policyRate: 3.25,
    creditRating: 'AA-',
    spread10Y2Y: 53,
    curveStatus: 'NORMAL',
    color: '#3b82f6', // blue-500
    region: 'Europe',
    tenors: [
      { tenor: '3M', yield: 3.38, change1D: -0.01 },
      { tenor: '6M', yield: 3.05, change1D: -0.02 },
      { tenor: '1Y', yield: 2.72, change1D: -0.02 },
      { tenor: '2Y', yield: 2.45, change1D: 0.01 },
      { tenor: '3Y', yield: 2.48, change1D: 0.01 },
      { tenor: '5Y', yield: 2.62, change1D: 0.02 },
      { tenor: '7Y', yield: 2.78, change1D: 0.03 },
      { tenor: '10Y', yield: 2.98, change1D: 0.04 },
      { tenor: '20Y', yield: 3.42, change1D: 0.03 },
      { tenor: '30Y', yield: 3.55, change1D: 0.02 }
    ]
  },
  {
    countryCode: 'IT',
    countryName: 'Italy',
    bondName: 'Italian BTP (Buoni del Tesoro)',
    flag: '🇮🇹',
    currency: 'EUR',
    centralBank: 'European Central Bank (ECB)',
    policyRate: 3.25,
    creditRating: 'BBB',
    spread10Y2Y: 90,
    curveStatus: 'STEEP',
    color: '#14b8a6', // teal-500
    region: 'Europe',
    tenors: [
      { tenor: '3M', yield: 3.45, change1D: -0.01 },
      { tenor: '6M', yield: 3.15, change1D: -0.02 },
      { tenor: '1Y', yield: 2.85, change1D: -0.01 },
      { tenor: '2Y', yield: 2.65, change1D: 0.01 },
      { tenor: '3Y', yield: 2.75, change1D: 0.02 },
      { tenor: '5Y', yield: 3.02, change1D: 0.02 },
      { tenor: '7Y', yield: 3.28, change1D: 0.03 },
      { tenor: '10Y', yield: 3.55, change1D: 0.04 },
      { tenor: '20Y', yield: 4.05, change1D: 0.03 },
      { tenor: '30Y', yield: 4.18, change1D: 0.02 }
    ]
  },
  {
    countryCode: 'ES',
    countryName: 'Spain',
    bondName: 'Bonos del Estado',
    flag: '🇪🇸',
    currency: 'EUR',
    centralBank: 'European Central Bank (ECB)',
    policyRate: 3.25,
    creditRating: 'A',
    spread10Y2Y: 52,
    curveStatus: 'NORMAL',
    color: '#eab308', // yellow-500
    region: 'Europe',
    tenors: [
      { tenor: '3M', yield: 3.32, change1D: -0.01 },
      { tenor: '6M', yield: 3.02, change1D: -0.02 },
      { tenor: '1Y', yield: 2.68, change1D: -0.01 },
      { tenor: '2Y', yield: 2.48, change1D: 0.01 },
      { tenor: '3Y', yield: 2.52, change1D: 0.01 },
      { tenor: '5Y', yield: 2.70, change1D: 0.02 },
      { tenor: '7Y', yield: 2.86, change1D: 0.03 },
      { tenor: '10Y', yield: 3.00, change1D: 0.03 },
      { tenor: '20Y', yield: 3.48, change1D: 0.02 },
      { tenor: '30Y', yield: 3.65, change1D: 0.02 }
    ]
  },
  {
    countryCode: 'NL',
    countryName: 'Netherlands',
    bondName: 'Dutch State Loans (DSL)',
    flag: '🇳🇱',
    currency: 'EUR',
    centralBank: 'European Central Bank (ECB)',
    policyRate: 3.25,
    creditRating: 'AAA',
    spread10Y2Y: 26,
    curveStatus: 'NORMAL',
    color: '#f97316', // orange-500
    region: 'Europe',
    tenors: [
      { tenor: '3M', yield: 3.22, change1D: -0.02 },
      { tenor: '6M', yield: 2.92, change1D: -0.02 },
      { tenor: '1Y', yield: 2.55, change1D: -0.02 },
      { tenor: '2Y', yield: 2.22, change1D: -0.01 },
      { tenor: '3Y', yield: 2.18, change1D: 0.00 },
      { tenor: '5Y', yield: 2.25, change1D: 0.01 },
      { tenor: '7Y', yield: 2.36, change1D: 0.02 },
      { tenor: '10Y', yield: 2.48, change1D: 0.03 },
      { tenor: '20Y', yield: 2.68, change1D: 0.02 },
      { tenor: '30Y', yield: 2.72, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'CH',
    countryName: 'Switzerland',
    bondName: 'Swiss Eidgenossen',
    flag: '🇨🇭',
    currency: 'CHF',
    centralBank: 'Swiss National Bank (SNB)',
    policyRate: 1.00,
    creditRating: 'AAA',
    spread10Y2Y: -10, // Inverted
    curveStatus: 'INVERTED',
    color: '#e11d48', // rose-600
    region: 'Europe',
    tenors: [
      { tenor: '3M', yield: 1.02, change1D: -0.01 },
      { tenor: '6M', yield: 0.95, change1D: -0.02 },
      { tenor: '1Y', yield: 0.78, change1D: -0.02 },
      { tenor: '2Y', yield: 0.58, change1D: -0.01 },
      { tenor: '3Y', yield: 0.52, change1D: 0.00 },
      { tenor: '5Y', yield: 0.48, change1D: 0.01 },
      { tenor: '7Y', yield: 0.45, change1D: 0.01 },
      { tenor: '10Y', yield: 0.48, change1D: 0.02 },
      { tenor: '20Y', yield: 0.58, change1D: 0.01 },
      { tenor: '30Y', yield: 0.62, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'SE',
    countryName: 'Sweden',
    bondName: 'Swedish Sovereign (SGB)',
    flag: '🇸🇪',
    currency: 'SEK',
    centralBank: 'Sveriges Riksbank',
    policyRate: 3.25,
    creditRating: 'AAA',
    spread10Y2Y: 18,
    curveStatus: 'NORMAL',
    color: '#0ea5e9', // sky-500
    region: 'Europe',
    tenors: [
      { tenor: '3M', yield: 3.10, change1D: -0.02 },
      { tenor: '6M', yield: 2.75, change1D: -0.02 },
      { tenor: '1Y', yield: 2.38, change1D: -0.01 },
      { tenor: '2Y', yield: 1.98, change1D: -0.01 },
      { tenor: '5Y', yield: 1.95, change1D: 0.01 },
      { tenor: '7Y', yield: 2.05, change1D: 0.02 },
      { tenor: '10Y', yield: 2.16, change1D: 0.02 },
      { tenor: '20Y', yield: 2.35, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'NO',
    countryName: 'Norway',
    bondName: 'Norwegian Govt Bonds (NGB)',
    flag: '🇳🇴',
    currency: 'NOK',
    centralBank: 'Norges Bank',
    policyRate: 4.50,
    creditRating: 'AAA',
    spread10Y2Y: -28,
    curveStatus: 'INVERTED',
    color: '#dc2626', // red-600
    region: 'Europe',
    tenors: [
      { tenor: '3M', yield: 4.45, change1D: -0.01 },
      { tenor: '6M', yield: 4.25, change1D: -0.01 },
      { tenor: '1Y', yield: 4.05, change1D: -0.02 },
      { tenor: '2Y', yield: 3.75, change1D: -0.01 },
      { tenor: '5Y', yield: 3.52, change1D: 0.01 },
      { tenor: '10Y', yield: 3.47, change1D: 0.02 }
    ]
  },
  {
    countryCode: 'PL',
    countryName: 'Poland',
    bondName: 'Polish Treasury Bonds (POLGB)',
    flag: '🇵🇱',
    currency: 'PLN',
    centralBank: 'Narodowy Bank Polski (NBP)',
    policyRate: 5.75,
    creditRating: 'A-',
    spread10Y2Y: 42,
    curveStatus: 'NORMAL',
    color: '#ec4899', // pink-500
    region: 'Europe',
    tenors: [
      { tenor: '3M', yield: 5.65, change1D: -0.01 },
      { tenor: '6M', yield: 5.48, change1D: -0.02 },
      { tenor: '1Y', yield: 5.25, change1D: -0.01 },
      { tenor: '2Y', yield: 4.95, change1D: 0.01 },
      { tenor: '5Y', yield: 5.15, change1D: 0.02 },
      { tenor: '10Y', yield: 5.37, change1D: 0.03 }
    ]
  },
  {
    countryCode: 'TR',
    countryName: 'Turkey',
    bondName: 'Turkish Govt Bonds (DIBS)',
    flag: '🇹🇷',
    currency: 'TRY',
    centralBank: 'Central Bank of Republic of Turkey (CBRT)',
    policyRate: 50.00,
    creditRating: 'BB-',
    spread10Y2Y: -850,
    curveStatus: 'INVERTED',
    color: '#b91c1c', // red-700
    region: 'Europe',
    tenors: [
      { tenor: '3M', yield: 48.50, change1D: -0.20 },
      { tenor: '6M', yield: 46.20, change1D: -0.15 },
      { tenor: '1Y', yield: 42.80, change1D: -0.25 },
      { tenor: '2Y', yield: 38.50, change1D: -0.30 },
      { tenor: '5Y', yield: 34.20, change1D: -0.15 },
      { tenor: '10Y', yield: 30.00, change1D: -0.10 }
    ]
  },

  // ==========================================
  // ASIA-PACIFIC
  // ==========================================
  {
    countryCode: 'JP',
    countryName: 'Japan',
    bondName: 'Japanese Govt Bonds (JGB)',
    flag: '🇯🇵',
    currency: 'JPY',
    centralBank: 'Bank of Japan (BoJ)',
    policyRate: 0.25,
    creditRating: 'A+',
    spread10Y2Y: 53, // bps
    curveStatus: 'STEEP',
    color: '#06b6d4', // cyan-500
    region: 'Asia-Pacific',
    tenors: [
      { tenor: '1M', yield: 0.08, change1D: 0.01 },
      { tenor: '3M', yield: 0.12, change1D: 0.01 },
      { tenor: '6M', yield: 0.22, change1D: 0.01 },
      { tenor: '1Y', yield: 0.35, change1D: 0.02 },
      { tenor: '2Y', yield: 0.42, change1D: 0.02 },
      { tenor: '3Y', yield: 0.50, change1D: 0.02 },
      { tenor: '5Y', yield: 0.62, change1D: 0.03 },
      { tenor: '7Y', yield: 0.75, change1D: 0.03 },
      { tenor: '10Y', yield: 0.95, change1D: 0.04 },
      { tenor: '20Y', yield: 1.72, change1D: 0.03 },
      { tenor: '30Y', yield: 2.15, change1D: 0.02 }
    ]
  },
  {
    countryCode: 'CN',
    countryName: 'China',
    bondName: 'China Government Bonds (CGB)',
    flag: '🇨🇳',
    currency: 'CNY',
    centralBank: "People's Bank of China (PBoC)",
    policyRate: 3.10,
    creditRating: 'A+',
    spread10Y2Y: 64,
    curveStatus: 'STEEP',
    color: '#ef4444', // red-500
    region: 'Asia-Pacific',
    tenors: [
      { tenor: '1M', yield: 1.45, change1D: -0.01 },
      { tenor: '3M', yield: 1.48, change1D: -0.01 },
      { tenor: '6M', yield: 1.52, change1D: 0.00 },
      { tenor: '1Y', yield: 1.42, change1D: -0.02 },
      { tenor: '2Y', yield: 1.48, change1D: -0.01 },
      { tenor: '3Y', yield: 1.55, change1D: 0.01 },
      { tenor: '5Y', yield: 1.75, change1D: 0.02 },
      { tenor: '7Y', yield: 1.95, change1D: 0.02 },
      { tenor: '10Y', yield: 2.12, change1D: 0.03 },
      { tenor: '20Y', yield: 2.32, change1D: 0.02 },
      { tenor: '30Y', yield: 2.35, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'IN',
    countryName: 'India',
    bondName: 'India Govt Securities (G-Sec)',
    flag: '🇮🇳',
    currency: 'INR',
    centralBank: 'Reserve Bank of India (RBI)',
    policyRate: 6.50,
    creditRating: 'BBB-',
    spread10Y2Y: 13,
    curveStatus: 'NORMAL',
    color: '#f97316', // orange-500
    region: 'Asia-Pacific',
    tenors: [
      { tenor: '3M', yield: 6.65, change1D: -0.01 },
      { tenor: '6M', yield: 6.72, change1D: -0.01 },
      { tenor: '1Y', yield: 6.78, change1D: 0.00 },
      { tenor: '2Y', yield: 6.75, change1D: 0.01 },
      { tenor: '3Y', yield: 6.76, change1D: 0.01 },
      { tenor: '5Y', yield: 6.79, change1D: 0.02 },
      { tenor: '7Y', yield: 6.84, change1D: 0.02 },
      { tenor: '10Y', yield: 6.88, change1D: 0.03 },
      { tenor: '30Y', yield: 7.15, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'AU',
    countryName: 'Australia',
    bondName: 'Australian Commonwealth Govt (ACGB)',
    flag: '🇦🇺',
    currency: 'AUD',
    centralBank: 'Reserve Bank of Australia (RBA)',
    policyRate: 4.35,
    creditRating: 'AAA',
    spread10Y2Y: 40,
    curveStatus: 'STEEP',
    color: '#10b981', // emerald-500
    region: 'Asia-Pacific',
    tenors: [
      { tenor: '1M', yield: 4.32, change1D: 0.00 },
      { tenor: '3M', yield: 4.28, change1D: -0.01 },
      { tenor: '6M', yield: 4.15, change1D: -0.02 },
      { tenor: '1Y', yield: 3.95, change1D: -0.01 },
      { tenor: '2Y', yield: 3.65, change1D: 0.01 },
      { tenor: '3Y', yield: 3.68, change1D: 0.02 },
      { tenor: '5Y', yield: 3.75, change1D: 0.03 },
      { tenor: '7Y', yield: 3.88, change1D: 0.03 },
      { tenor: '10Y', yield: 4.05, change1D: 0.04 },
      { tenor: '20Y', yield: 4.35, change1D: 0.02 },
      { tenor: '30Y', yield: 4.40, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'KR',
    countryName: 'South Korea',
    bondName: 'Korea Treasury Bonds (KTB)',
    flag: '🇰🇷',
    currency: 'KRW',
    centralBank: 'Bank of Korea (BoK)',
    policyRate: 3.25,
    creditRating: 'AA',
    spread10Y2Y: 7,
    curveStatus: 'NORMAL',
    color: '#6366f1', // indigo-500
    region: 'Asia-Pacific',
    tenors: [
      { tenor: '1Y', yield: 3.25, change1D: -0.02 },
      { tenor: '2Y', yield: 2.95, change1D: -0.01 },
      { tenor: '3Y', yield: 2.88, change1D: -0.01 },
      { tenor: '5Y', yield: 2.92, change1D: 0.01 },
      { tenor: '10Y', yield: 3.02, change1D: 0.02 },
      { tenor: '20Y', yield: 2.98, change1D: 0.01 },
      { tenor: '30Y', yield: 2.92, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'SG',
    countryName: 'Singapore',
    bondName: 'Singapore Govt Securities (SGS)',
    flag: '🇸🇬',
    currency: 'SGD',
    centralBank: 'Monetary Authority of Singapore (MAS)',
    policyRate: 3.15,
    creditRating: 'AAA',
    spread10Y2Y: 15,
    curveStatus: 'NORMAL',
    color: '#f43f5e', // rose-500
    region: 'Asia-Pacific',
    tenors: [
      { tenor: '3M', yield: 3.12, change1D: -0.01 },
      { tenor: '6M', yield: 2.95, change1D: -0.02 },
      { tenor: '1Y', yield: 2.78, change1D: -0.01 },
      { tenor: '2Y', yield: 2.58, change1D: 0.00 },
      { tenor: '5Y', yield: 2.62, change1D: 0.01 },
      { tenor: '10Y', yield: 2.73, change1D: 0.02 },
      { tenor: '20Y', yield: 2.95, change1D: 0.02 },
      { tenor: '30Y', yield: 3.02, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'HK',
    countryName: 'Hong Kong',
    bondName: 'Exchange Fund Notes (EFBN)',
    flag: '🇭🇰',
    currency: 'HKD',
    centralBank: 'Hong Kong Monetary Authority (HKMA)',
    policyRate: 5.00,
    creditRating: 'AA+',
    spread10Y2Y: -22,
    curveStatus: 'INVERTED',
    color: '#8b5cf6', // violet-500
    region: 'Asia-Pacific',
    tenors: [
      { tenor: '3M', yield: 4.45, change1D: -0.02 },
      { tenor: '6M', yield: 4.25, change1D: -0.02 },
      { tenor: '1Y', yield: 3.85, change1D: -0.03 },
      { tenor: '2Y', yield: 3.42, change1D: -0.02 },
      { tenor: '5Y', yield: 3.25, change1D: 0.01 },
      { tenor: '10Y', yield: 3.20, change1D: 0.02 }
    ]
  },
  {
    countryCode: 'TW',
    countryName: 'Taiwan',
    bondName: 'Taiwan Government Bonds',
    flag: '🇹🇼',
    currency: 'TWD',
    centralBank: 'Central Bank of the Republic of China (CBC)',
    policyRate: 2.00,
    creditRating: 'AA+',
    spread10Y2Y: 35,
    curveStatus: 'NORMAL',
    color: '#14b8a6', // teal-500
    region: 'Asia-Pacific',
    tenors: [
      { tenor: '1Y', yield: 1.42, change1D: -0.01 },
      { tenor: '2Y', yield: 1.25, change1D: 0.00 },
      { tenor: '5Y', yield: 1.45, change1D: 0.01 },
      { tenor: '10Y', yield: 1.60, change1D: 0.02 },
      { tenor: '20Y', yield: 1.85, change1D: 0.01 },
      { tenor: '30Y', yield: 1.95, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'NZ',
    countryName: 'New Zealand',
    bondName: 'New Zealand Govt Bonds (NZGB)',
    flag: '🇳🇿',
    currency: 'NZD',
    centralBank: 'Reserve Bank of New Zealand (RBNZ)',
    policyRate: 4.75,
    creditRating: 'AAA',
    spread10Y2Y: 48,
    curveStatus: 'STEEP',
    color: '#3b82f6', // blue-500
    region: 'Asia-Pacific',
    tenors: [
      { tenor: '3M', yield: 4.60, change1D: -0.02 },
      { tenor: '1Y', yield: 4.10, change1D: -0.02 },
      { tenor: '2Y', yield: 3.82, change1D: 0.01 },
      { tenor: '5Y', yield: 4.05, change1D: 0.02 },
      { tenor: '10Y', yield: 4.30, change1D: 0.03 },
      { tenor: '20Y', yield: 4.65, change1D: 0.02 }
    ]
  },
  {
    countryCode: 'ID',
    countryName: 'Indonesia',
    bondName: 'Surat Berharga Negara (IndoGB)',
    flag: '🇮🇩',
    currency: 'IDR',
    centralBank: 'Bank Indonesia (BI)',
    policyRate: 6.00,
    creditRating: 'BBB',
    spread10Y2Y: 34,
    curveStatus: 'NORMAL',
    color: '#f43f5e', // rose-500
    region: 'Asia-Pacific',
    tenors: [
      { tenor: '3M', yield: 6.15, change1D: -0.01 },
      { tenor: '1Y', yield: 6.28, change1D: -0.01 },
      { tenor: '2Y', yield: 6.32, change1D: 0.01 },
      { tenor: '5Y', yield: 6.45, change1D: 0.02 },
      { tenor: '10Y', yield: 6.66, change1D: 0.03 },
      { tenor: '20Y', yield: 6.85, change1D: 0.02 }
    ]
  },

  // ==========================================
  // MIDDLE EAST & AFRICA
  // ==========================================
  {
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    bondName: 'Saudi Sovereign Sukuk / Eurobonds',
    flag: '🇸🇦',
    currency: 'SAR',
    centralBank: 'Saudi Central Bank (SAMA)',
    policyRate: 5.50,
    creditRating: 'A+',
    spread10Y2Y: 18,
    curveStatus: 'NORMAL',
    color: '#10b981', // emerald-500
    region: 'Middle East & Africa',
    tenors: [
      { tenor: '3M', yield: 5.38, change1D: -0.01 },
      { tenor: '6M', yield: 5.15, change1D: -0.02 },
      { tenor: '1Y', yield: 4.85, change1D: -0.01 },
      { tenor: '2Y', yield: 4.62, change1D: 0.01 },
      { tenor: '5Y', yield: 4.70, change1D: 0.02 },
      { tenor: '10Y', yield: 4.80, change1D: 0.02 },
      { tenor: '30Y', yield: 5.25, change1D: 0.01 }
    ]
  },
  {
    countryCode: 'ZA',
    countryName: 'South Africa',
    bondName: 'South African Govt Bonds (SAGB)',
    flag: '🇿🇦',
    currency: 'ZAR',
    centralBank: 'South African Reserve Bank (SARB)',
    policyRate: 8.00,
    creditRating: 'BB-',
    spread10Y2Y: 165,
    curveStatus: 'STEEP',
    color: '#eab308', // yellow-500
    region: 'Middle East & Africa',
    tenors: [
      { tenor: '3M', yield: 7.95, change1D: -0.02 },
      { tenor: '6M', yield: 7.82, change1D: -0.03 },
      { tenor: '1Y', yield: 7.65, change1D: -0.02 },
      { tenor: '2Y', yield: 7.55, change1D: -0.01 },
      { tenor: '5Y', yield: 8.25, change1D: 0.02 },
      { tenor: '10Y', yield: 9.20, change1D: 0.04 },
      { tenor: '20Y', yield: 10.45, change1D: 0.03 },
      { tenor: '30Y', yield: 10.75, change1D: 0.02 }
    ]
  }
];

export const STANDARD_TENORS = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y'] as const;
