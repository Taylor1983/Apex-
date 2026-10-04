import {
  OptionExpirationSeries,
  VolatilitySkewPoint,
  MacroYieldPoint,
  CentralBankRate,
  MacroIndicator,
  EconomicCalendarEvent
} from '../types';

export function generateOptionsChainForAsset(symbol: string, currentPrice: number): OptionExpirationSeries[] {
  const roundedPrice = Math.round(currentPrice);
  const strikeInterval = currentPrice > 500 ? 5 : currentPrice > 100 ? 2.5 : 1;

  // Generate full institutional range of expirations: Weekly, Front Monthly, Quarterly, and LEAPS
  const expirations = [
    { label: '02 OCT 26', dte: 2, ivBase: 41.2 },
    { label: '09 OCT 26', dte: 9, ivBase: 38.5 },
    { label: '16 OCT 26', dte: 16, ivBase: 36.8 },
    { label: '23 OCT 26', dte: 23, ivBase: 35.4 },
    { label: '06 NOV 26', dte: 37, ivBase: 34.2 },
    { label: '20 NOV 26', dte: 51, ivBase: 33.6 },
    { label: '18 DEC 26', dte: 79, ivBase: 32.8 },
    { label: '15 JAN 27', dte: 107, ivBase: 32.0 },
    { label: '19 MAR 27', dte: 170, ivBase: 31.4 },
    { label: '18 JUN 27', dte: 261, ivBase: 30.8 },
    { label: '17 SEP 27', dte: 352, ivBase: 30.2 },
    { label: '15 JAN 28', dte: 472, ivBase: 29.8 },
    { label: '19 JAN 29', dte: 841, ivBase: 29.2 }
  ].map(exp => {
    // Formulaic 1-Sigma Expected Move: Spot * IV * sqrt(DTE/365)
    const expectedMove = currentPrice * (exp.ivBase / 100) * Math.sqrt(exp.dte / 365);
    return { ...exp, move: expectedMove };
  });

  return expirations.map(exp => {
    // Generate strikes centered around current price (+- 5 strikes)
    const strikesCount = 9;
    const centerStrike = Math.round(roundedPrice / strikeInterval) * strikeInterval;
    const strikesList: number[] = [];

    for (let i = -Math.floor(strikesCount / 2); i <= Math.floor(strikesCount / 2); i++) {
      strikesList.push(Number((centerStrike + i * strikeInterval).toFixed(2)));
    }

    const strikeRows = strikesList.map(strike => {
      const moneyness = (currentPrice - strike) / currentPrice;
      const callItm = currentPrice > strike;
      const putItm = currentPrice < strike;

      // Delta approximations
      const normDist = (currentPrice - strike) / (currentPrice * 0.08);
      const callDelta = Math.min(0.99, Math.max(0.01, 0.5 + normDist * 0.35));
      const putDelta = Number((callDelta - 1).toFixed(2));

      // Option price estimations (Black-Scholes approximation)
      const intrinsicCall = Math.max(0, currentPrice - strike);
      const intrinsicPut = Math.max(0, strike - currentPrice);
      const timeValue = currentPrice * 0.035 * Math.sqrt(exp.dte / 30);

      const callMid = Number((intrinsicCall + timeValue * (1 - Math.abs(callDelta - 0.5))).toFixed(2));
      const putMid = Number((intrinsicPut + timeValue * (1 - Math.abs(putDelta + 0.5))).toFixed(2));

      const spread = 0.08;

      return {
        strike,
        call: {
          bid: Number(Math.max(0.05, callMid - spread / 2).toFixed(2)),
          ask: Number((callMid + spread / 2).toFixed(2)),
          last: callMid,
          volume: Math.floor(Math.random() * 4200) + 120,
          openInterest: Math.floor(Math.random() * 18400) + 850,
          iv: Number((exp.ivBase + (strike < currentPrice ? (currentPrice - strike) * 0.04 : (strike - currentPrice) * 0.02)).toFixed(1)),
          delta: Number(callDelta.toFixed(2)),
          gamma: Number((0.04 / (Math.sqrt(exp.dte) || 1)).toFixed(3)),
          theta: Number((-0.08 * (currentPrice / 150) / Math.sqrt(exp.dte)).toFixed(2)),
          vega: Number((0.18 * Math.sqrt(exp.dte / 30)).toFixed(2)),
          itm: callItm
        },
        put: {
          bid: Number(Math.max(0.05, putMid - spread / 2).toFixed(2)),
          ask: Number((putMid + spread / 2).toFixed(2)),
          last: putMid,
          volume: Math.floor(Math.random() * 3800) + 95,
          openInterest: Math.floor(Math.random() * 15200) + 620,
          iv: Number((exp.ivBase + (strike < currentPrice ? (currentPrice - strike) * 0.08 : -(strike - currentPrice) * 0.01)).toFixed(1)),
          delta: putDelta,
          gamma: Number((0.04 / (Math.sqrt(exp.dte) || 1)).toFixed(3)),
          theta: Number((-0.07 * (currentPrice / 150) / Math.sqrt(exp.dte)).toFixed(2)),
          vega: Number((0.18 * Math.sqrt(exp.dte / 30)).toFixed(2)),
          itm: putItm
        }
      };
    });

    return {
      expirationDate: exp.label,
      dte: exp.dte,
      ivMean: exp.ivBase,
      expectedMove: Number(exp.move.toFixed(2)),
      strikes: strikeRows
    };
  });
}

export function generateVolatilitySkew(currentPrice: number, baseIV: number = 34.0): VolatilitySkewPoint[] {
  const deltas = [-20, -15, -10, -5, 0, 5, 10, 15, 20];

  return deltas.map(pct => {
    const strike = Number((currentPrice * (1 + pct / 100)).toFixed(2));
    // Put skew (downside strikes have higher IV due to crash/downside protection demand)
    const skewFactor = pct < 0 ? Math.pow(Math.abs(pct), 1.25) * 0.48 : pct * 0.18;

    return {
      strike,
      pctMoneyness: pct,
      frontIV: Number((baseIV * 1.08 + skewFactor * 1.15).toFixed(2)),
      midIV: Number((baseIV + skewFactor * 0.95).toFixed(2)),
      backIV: Number((baseIV * 0.94 + skewFactor * 0.75).toFixed(2))
    };
  });
}

// Global Macro Economic Yield Curve
export const MACRO_YIELD_CURVE: MacroYieldPoint[] = [
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
];

export const CENTRAL_BANK_RATES: CentralBankRate[] = [
  { bank: 'Federal Reserve (Fed)', currency: 'USD', rate: 4.875, stance: 'Neutral', nextMeeting: 'Nov 06' },
  { bank: 'European Central Bank (ECB)', currency: 'EUR', rate: 3.250, stance: 'Dovish', nextMeeting: 'Oct 23' },
  { bank: 'Bank of Japan (BOJ)', currency: 'JPY', rate: 0.250, stance: 'Hawkish', nextMeeting: 'Oct 31' },
  { bank: 'Bank of England (BOE)', currency: 'GBP', rate: 5.000, stance: 'Neutral', nextMeeting: 'Nov 07' },
  { bank: 'Swiss National Bank (SNB)', currency: 'CHF', rate: 1.000, stance: 'Dovish', nextMeeting: 'Dec 11' },
  { bank: 'Reserve Bank of Australia (RBA)', currency: 'AUD', rate: 4.350, stance: 'Neutral', nextMeeting: 'Nov 05' }
];

export const MACRO_INDICATORS: MacroIndicator[] = [
  { name: 'US CPI Headline YoY', category: 'Inflation', current: '2.5%', prior: '2.9%', consensus: '2.6%', frequency: 'Monthly', trend: 'DOWN', signal: 'Positive' },
  { name: 'Core PCE Price Index', category: 'Inflation', current: '2.6%', prior: '2.6%', consensus: '2.7%', frequency: 'Monthly', trend: 'FLAT', signal: 'Positive' },
  { name: 'US Non-Farm Payrolls', category: 'Labor', current: '+142K', prior: '+114K', consensus: '+160K', frequency: 'Monthly', trend: 'UP', signal: 'Neutral' },
  { name: 'US Unemployment Rate', category: 'Labor', current: '4.2%', prior: '4.3%', consensus: '4.2%', frequency: 'Monthly', trend: 'DOWN', signal: 'Positive' },
  { name: 'US Real GDP Growth (Q2 Final)', category: 'Growth', current: '+3.0%', prior: '+1.6%', consensus: '+2.8%', frequency: 'Quarterly', trend: 'UP', signal: 'Positive' },
  { name: 'ISM Manufacturing PMI', category: 'Growth', current: '47.2', prior: '46.8', consensus: '47.5', frequency: 'Monthly', trend: 'UP', signal: 'Caution' },
  { name: 'Fed Balance Sheet Assets', category: 'Liquidity', current: '$7.11T', prior: '$7.14T', consensus: 'QT Ongoing', frequency: 'Weekly', trend: 'DOWN', signal: 'Neutral' },
  { name: 'Global Liquidity M2 (Fed/ECB/BOJ/PBOC)', category: 'Liquidity', current: '$104.2T', prior: '$103.6T', consensus: 'Expanding', frequency: 'Monthly', trend: 'UP', signal: 'Positive' }
];

export const MACRO_VOLATILITY_REGIME = {
  vix: 15.42,
  vixChange: -0.65,
  vvix: 92.40,
  moveIndex: 98.60,
  putCallRatio: 0.82,
  dxyDollarIndex: 101.18,
  dxyChange: -0.24,
  yieldSpread10Y2Y: 0.14 // +14 bps (Normal, curve un-inverted)
};

export const UPCOMING_ECONOMIC_CALENDAR: EconomicCalendarEvent[] = [
  { id: 'cal-1', date: 'Tomorrow', time: '08:30 EDT', country: 'US', event: 'Initial Jobless Claims', impact: 'HIGH', consensus: '218K', previous: '219K' },
  { id: 'cal-2', date: 'Tomorrow', time: '10:00 EDT', country: 'US', event: 'ISM Services PMI', impact: 'HIGH', consensus: '51.5', previous: '51.4' },
  { id: 'cal-3', date: 'Friday', time: '08:30 EDT', country: 'US', event: 'Non-Farm Employment Change', impact: 'HIGH', consensus: '+140K', previous: '+142K' },
  { id: 'cal-4', date: 'Friday', time: '08:30 EDT', country: 'US', event: 'Unemployment Rate', impact: 'HIGH', consensus: '4.2%', previous: '4.2%' },
  { id: 'cal-5', date: 'Next Wed', time: '08:30 EDT', country: 'US', event: 'Consumer Price Index (CPI YoY)', impact: 'HIGH', consensus: '2.3%', previous: '2.5%' }
];

export { ALL_COUNTRY_YIELD_CURVES, STANDARD_TENORS } from './sovereignYieldCurves';

