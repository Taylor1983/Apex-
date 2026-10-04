import React, { useState, useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Layers,
  Sliders,
  Info,
  Zap,
  BarChart3
} from 'lucide-react';
import { Asset, VolatilitySkewPoint, OrderSide } from '../types';
import { generateVolatilitySkew } from '../data/optionsAndMacroData';
import { TosVolatilitySurfaceView } from './TosVolatilitySurfaceView';

interface TosVolatilitySkewViewProps {
  asset: Asset;
  assets: Asset[];
  onSelectSymbol?: (symbol: string) => void;
  onPopulateOrder?: (symbol: string, side: OrderSide, price: number, optionDetails?: any) => void;
}

export const TosVolatilitySkewView: React.FC<TosVolatilitySkewViewProps> = ({
  asset,
  assets,
  onSelectSymbol,
  onPopulateOrder
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'SURFACE' | 'SKEW' | 'TERM_STRUCTURE' | 'PAYOFF_GRAPH'>('SURFACE');

  // Option Payoff Simulator State
  const [strategyType, setStrategyType] = useState<'LONG_CALL' | 'COVERED_CALL' | 'BULL_CALL_SPREAD' | 'IRON_CONDOR'>('BULL_CALL_SPREAD');
  const [simPriceChangePct, setSimPriceChangePct] = useState<number>(0);
  const [simDteRemaining, setSimDteRemaining] = useState<number>(18);

  const skewPoints: VolatilitySkewPoint[] = useMemo(() => {
    return generateVolatilitySkew(asset.price, asset.assetClass === 'crypto' ? 58.0 : asset.symbol === 'NVDA' ? 44.0 : 22.0);
  }, [asset.price, asset.assetClass, asset.symbol]);

  const minIV = Math.min(...skewPoints.map(p => p.backIV)) * 0.9;
  const maxIV = Math.max(...skewPoints.map(p => p.frontIV)) * 1.1;

  // Term Structure Data
  const termStructure = [
    { tenor: '30D', iv: 36.2 },
    { tenor: '60D', iv: 34.8 },
    { tenor: '90D', iv: 34.1 },
    { tenor: '120D', iv: 33.7 },
    { tenor: '180D', iv: 33.2 },
    { tenor: '360D', iv: 32.8 }
  ];

  // Payoff calculations
  const spotPrice = asset.price;
  const simUnderlyingPrice = spotPrice * (1 + simPriceChangePct / 100);

  // Payoff curves for Bull Call Spread (e.g. Buy ATM call, Sell OTM call)
  const payoffData = useMemo(() => {
    const points: { price: number; pnlAtExpiry: number; pnlToday: number }[] = [];
    const minRange = spotPrice * 0.85;
    const maxRange = spotPrice * 1.15;
    const steps = 30;

    const lowerStrike = spotPrice;
    const upperStrike = spotPrice * 1.05;
    const debitPaid = (upperStrike - lowerStrike) * 0.38;

    for (let i = 0; i <= steps; i++) {
      const price = minRange + (i / steps) * (maxRange - minRange);

      let pnlExpiry = 0;
      if (strategyType === 'BULL_CALL_SPREAD') {
        const longValue = Math.max(0, price - lowerStrike);
        const shortValue = Math.max(0, price - upperStrike);
        pnlExpiry = (longValue - shortValue - debitPaid) * 100;
      } else if (strategyType === 'LONG_CALL') {
        pnlExpiry = (Math.max(0, price - lowerStrike) - (spotPrice * 0.035)) * 100;
      } else if (strategyType === 'COVERED_CALL') {
        pnlExpiry = (price - spotPrice + (spotPrice * 0.025) - Math.max(0, price - upperStrike)) * 100;
      } else {
        // Iron Condor
        const condorWidth = spotPrice * 0.06;
        const maxGain = 280;
        const maxLoss = 720;
        if (price < spotPrice - condorWidth || price > spotPrice + condorWidth) {
          pnlExpiry = -maxLoss;
        } else {
          pnlExpiry = maxGain;
        }
      }

      // Smooth PnL today curve (accounting for time decay)
      const dteFactor = simDteRemaining / 30;
      const pnlToday = pnlExpiry * (1 - dteFactor * 0.45) - 35 * dteFactor;

      points.push({ price, pnlAtExpiry: pnlExpiry, pnlToday });
    }
    return points;
  }, [spotPrice, strategyType, simDteRemaining]);

  const minPnl = Math.min(...payoffData.map(p => Math.min(p.pnlAtExpiry, p.pnlToday)));
  const maxPnl = Math.max(...payoffData.map(p => Math.max(p.pnlAtExpiry, p.pnlToday)));

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. Header with Tab switcher */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white text-xs uppercase">Volatility Skew & Options Risk Analysis</span>
          <span className="text-slate-500 font-sans text-xs">· {asset.symbol}</span>
        </div>

        <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
          <button
            onClick={() => setSelectedSubTab('SURFACE')}
            className={`px-3 py-1 rounded font-bold flex items-center gap-1.5 ${
              selectedSubTab === 'SURFACE' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>3D Volatility Surface</span>
          </button>
          <button
            onClick={() => setSelectedSubTab('SKEW')}
            className={`px-3 py-1 rounded font-bold ${
              selectedSubTab === 'SKEW' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Volatility Skew Curve
          </button>
          <button
            onClick={() => setSelectedSubTab('TERM_STRUCTURE')}
            className={`px-3 py-1 rounded font-bold ${
              selectedSubTab === 'TERM_STRUCTURE' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Term Structure (IV)
          </button>
          <button
            onClick={() => setSelectedSubTab('PAYOFF_GRAPH')}
            className={`px-3 py-1 rounded font-bold ${
              selectedSubTab === 'PAYOFF_GRAPH' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Option Payoff Risk Graph
          </button>
        </div>
      </div>

      {/* 2. SUBTAB 0: 3D VOLATILITY SURFACE */}
      {selectedSubTab === 'SURFACE' && (
        <TosVolatilitySurfaceView
          asset={asset}
          assets={assets}
          onSelectSymbol={onSelectSymbol || (() => {})}
          onPopulateOrder={onPopulateOrder}
        />
      )}

      {/* 3. SUBTAB 1: VOLATILITY SKEW CURVE */}
      {selectedSubTab === 'SKEW' && (
        <div className="space-y-3">
          <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Implied Volatility Skew Smile ({asset.symbol})
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Plots IV% across strikes from OTM Puts (downside crash protection) to OTM Calls.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-0.5 bg-amber-400"></span> Front Month (30 DTE)
                </span>
                <span className="flex items-center gap-1.5 text-[#00c076]">
                  <span className="w-2.5 h-0.5 bg-[#00c076]"></span> Mid Month (60 DTE)
                </span>
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-2.5 h-0.5 bg-sky-400"></span> Back Month (120 DTE)
                </span>
              </div>
            </div>

            {/* Skew Chart */}
            <div className="h-60 w-full bg-[#090d11] rounded border border-[#1c2128] p-3 relative">
              <svg className="w-full h-full" viewBox="0 0 800 220" preserveAspectRatio="none">
                {/* Horizontal Grid */}
                {[0, 55, 110, 165, 220].map(y => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#1c2128" strokeDasharray="3 3" />
                ))}

                {/* ATM Center vertical marker */}
                <line x1="400" y1="0" x2="400" y2="220" stroke="#334155" strokeDasharray="2 2" />
                <text x="405" y="20" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  ATM Strike (${asset.price.toFixed(0)})
                </text>

                {/* Front Month Skew Curve (Amber) */}
                <path
                  d={skewPoints
                    .map((p, idx) => {
                      const x = (idx / (skewPoints.length - 1)) * 760 + 20;
                      const y = 200 - ((p.frontIV - minIV) / (maxIV - minIV || 1)) * 170;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                />

                {/* Mid Month Skew Curve (Green) */}
                <path
                  d={skewPoints
                    .map((p, idx) => {
                      const x = (idx / (skewPoints.length - 1)) * 760 + 20;
                      const y = 200 - ((p.midIV - minIV) / (maxIV - minIV || 1)) * 170;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#00c076"
                  strokeWidth="2"
                />

                {/* Back Month Skew Curve (Sky Blue) */}
                <path
                  d={skewPoints
                    .map((p, idx) => {
                      const x = (idx / (skewPoints.length - 1)) * 760 + 20;
                      const y = 200 - ((p.backIV - minIV) / (maxIV - minIV || 1)) * 170;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Points */}
                {skewPoints.map((p, idx) => {
                  const x = (idx / (skewPoints.length - 1)) * 760 + 20;
                  const y = 200 - ((p.frontIV - minIV) / (maxIV - minIV || 1)) * 170;
                  return (
                    <circle key={idx} cx={x} cy={y} r="3.5" fill="#f59e0b" stroke="#090d11" strokeWidth="1" />
                  );
                })}
              </svg>
            </div>

            {/* Skew Table Details */}
            <div className="overflow-x-auto mt-4 text-[11px]">
              <table className="w-full text-center">
                <thead className="bg-[#12161f] text-slate-400 uppercase text-[10px] border-b border-[#21262d]">
                  <tr>
                    <th className="py-1 px-2 text-left">Moneyness</th>
                    <th className="py-1 px-2">Strike ($)</th>
                    <th className="py-1 px-2 text-amber-400 font-bold">Front IV (30D)</th>
                    <th className="py-1 px-2 text-[#00c076] font-bold">Mid IV (60D)</th>
                    <th className="py-1 px-2 text-sky-400 font-bold">Back IV (120D)</th>
                    <th className="py-1 px-2">Put / Call Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161b22]">
                  {skewPoints.map(sp => (
                    <tr key={sp.strike} className="hover:bg-[#161b22]/40 text-slate-300">
                      <td className="py-1 px-2 text-left font-bold text-white">
                        {sp.pctMoneyness > 0 ? `+${sp.pctMoneyness}% Call` : sp.pctMoneyness < 0 ? `${sp.pctMoneyness}% Put` : 'ATM (0%)'}
                      </td>
                      <td className="py-1 px-2 font-bold text-white">${sp.strike.toFixed(2)}</td>
                      <td className="py-1 px-2 text-amber-400 font-semibold">{sp.frontIV}%</td>
                      <td className="py-1 px-2 text-[#00c076] font-semibold">{sp.midIV}%</td>
                      <td className="py-1 px-2 text-sky-400 font-semibold">{sp.backIV}%</td>
                      <td className="py-1 px-2 text-slate-400">
                        {sp.pctMoneyness <= 0 ? `${(0.5 + sp.pctMoneyness * 0.02).toFixed(2)} Put` : `${(0.5 - sp.pctMoneyness * 0.02).toFixed(2)} Call`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTAB 2: TERM STRUCTURE */}
      {selectedSubTab === 'TERM_STRUCTURE' && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow space-y-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Volatility Term Structure ({asset.symbol})
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Constant maturity at-the-money implied volatility curve across calendar tenors.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {termStructure.map(ts => (
              <div key={ts.tenor} className="bg-[#090d11] p-3 rounded border border-[#1c2128] text-center">
                <div className="text-slate-400 text-[10px] font-sans">{ts.tenor} Expiry</div>
                <div className="text-base font-bold text-amber-400 mt-1">{ts.iv}%</div>
                <div className="text-[10px] text-[#00c076] mt-0.5 font-sans">Contango</div>
              </div>
            ))}
          </div>

          {/* Cross-Asset IV Rank & Percentile Matrix */}
          <div className="pt-3 border-t border-[#21262d]">
            <h4 className="text-xs font-bold text-white uppercase mb-2">Cross-Asset Implied Volatility Rank (IVR)</h4>
            <div className="overflow-x-auto text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-[#12161f] text-slate-400 uppercase text-[10px] border-b border-[#21262d]">
                  <tr>
                    <th className="py-1.5 px-3">Symbol</th>
                    <th className="py-1.5 px-2">Asset Class</th>
                    <th className="py-1.5 px-2 text-right">Current IV</th>
                    <th className="py-1.5 px-2 text-right">52W Low IV</th>
                    <th className="py-1.5 px-2 text-right">52W High IV</th>
                    <th className="py-1.5 px-2 text-right">IV Rank (IVR)</th>
                    <th className="py-1.5 px-2 text-center">Vol Regime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161b22]">
                  {[
                    { sym: 'NVDA', class: 'Equities', iv: '44.2%', low: '28.1%', high: '72.4%', ivr: 68, regime: 'High IV' },
                    { sym: 'SPY', class: 'Index ETF', iv: '14.8%', low: '11.5%', high: '24.2%', ivr: 28, regime: 'Low IV' },
                    { sym: 'BTC-USD', class: 'Crypto', iv: '58.5%', low: '39.0%', high: '88.5%', ivr: 74, regime: 'Elevated' },
                    { sym: 'TLT', class: 'Fixed Income', iv: '18.4%', low: '12.8%', high: '26.4%', ivr: 42, regime: 'Normal' },
                    { sym: 'GLD', class: 'Commodities', iv: '15.2%', low: '11.0%', high: '21.5%', ivr: 38, regime: 'Normal' }
                  ].map(item => (
                    <tr key={item.sym} className="hover:bg-[#161b22]/50 text-slate-300">
                      <td className="py-1.5 px-3 font-bold text-white">{item.sym}</td>
                      <td className="py-1.5 px-2 text-slate-400">{item.class}</td>
                      <td className="py-1.5 px-2 text-right font-semibold text-white">{item.iv}</td>
                      <td className="py-1.5 px-2 text-right text-slate-500">{item.low}</td>
                      <td className="py-1.5 px-2 text-right text-slate-500">{item.high}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-amber-400">{item.ivr}%</td>
                      <td className="py-1.5 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.ivr > 60 ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-[#00c076]'
                        }`}>
                          {item.regime}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTAB 3: OPTION RISK PAYOFF DIAGRAM */}
      {selectedSubTab === 'PAYOFF_GRAPH' && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Interactive Risk Profile / Payoff Diagram
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Simulates P/L at expiration vs P/L today under price moves and time decay.
              </p>
            </div>

            {/* Strategy Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-sans text-xs">Strategy:</span>
              <select
                value={strategyType}
                onChange={e => setStrategyType(e.target.value as any)}
                className="bg-[#1c2128] border border-[#30363d] text-white rounded px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="BULL_CALL_SPREAD">Bull Call Debit Spread</option>
                <option value="LONG_CALL">Long Naked Call</option>
                <option value="COVERED_CALL">Covered Call</option>
                <option value="IRON_CONDOR">Iron Condor (Neutral)</option>
              </select>
            </div>
          </div>

          {/* Interactive Payoff SVG Graph */}
          <div className="h-56 w-full bg-[#090d11] rounded border border-[#1c2128] p-3 relative">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              {/* Zero P/L center line */}
              <line x1="0" y1="100" x2="800" y2="100" stroke="#475569" strokeDasharray="3 3" />
              <text x="10" y="95" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                $0 P/L Breakeven
              </text>

              {/* P/L at Expiry Line (Solid) */}
              <path
                d={payoffData
                  .map((p, idx) => {
                    const x = (idx / (payoffData.length - 1)) * 800;
                    const y = 100 - (p.pnlAtExpiry / (maxPnl - minPnl || 1)) * 90;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#00c076"
                strokeWidth="2.5"
              />

              {/* P/L Today Line (Dashed) */}
              <path
                d={payoffData
                  .map((p, idx) => {
                    const x = (idx / (payoffData.length - 1)) * 800;
                    const y = 100 - (p.pnlToday / (maxPnl - minPnl || 1)) * 90;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {/* Simulation Sliders (Underlying price & DTE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#21262d] text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Simulated Price Shock:</span>
                <span className={`font-bold ${simPriceChangePct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                  {simPriceChangePct >= 0 ? '+' : ''}{simPriceChangePct}% (${simUnderlyingPrice.toFixed(2)})
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                value={simPriceChangePct}
                onChange={e => setSimPriceChangePct(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Days to Expiration (DTE Decay):</span>
                <span className="font-bold text-sky-400">{simDteRemaining} Days Left</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={simDteRemaining}
                onChange={e => setSimDteRemaining(parseInt(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
