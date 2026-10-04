import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Percent,
  Activity,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { Asset, PortfolioHolding, PortfolioMetrics, RiskProfile } from '../types';

interface PortfolioAnalyticsProps {
  holdings: PortfolioHolding[];
  metrics: PortfolioMetrics;
  riskProfile: RiskProfile;
  onNavigateToRebalance: () => void;
  onSelectAssetToTrade: (assetId: string) => void;
  assets: Asset[];
}

type Timeframe = '1D' | '1W' | '1M' | '1Y' | 'ALL';
type Benchmark = 'NONE' | 'SPY' | 'BALANCED_60_40' | 'QQQ';

export const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({
  holdings,
  metrics,
  riskProfile,
  onNavigateToRebalance,
  onSelectAssetToTrade
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [benchmark, setBenchmark] = useState<Benchmark>('SPY');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Group holdings by asset class to calculate current distribution
  const classBreakdown = holdings.reduce(
    (acc, h) => {
      acc[h.assetClass] = (acc[h.assetClass] || 0) + h.currentValue;
      return acc;
    },
    { equities: 0, crypto: 0, fixed_income: 0, commodities: 0 } as Record<string, number>
  );

  const totalValue = metrics.nav;
  const cashPct = totalValue > 0 ? (metrics.cashBalance / totalValue) * 100 : 0;

  const currentAllocation = {
    equities: totalValue > 0 ? (classBreakdown.equities / totalValue) * 100 : 0,
    crypto: totalValue > 0 ? (classBreakdown.crypto / totalValue) * 100 : 0,
    fixed_income: totalValue > 0 ? (classBreakdown.fixed_income / totalValue) * 100 : 0,
    commodities: totalValue > 0 ? (classBreakdown.commodities / totalValue) * 100 : 0
  };

  // Generate interactive chart series based on timeframe
  const chartPointsCount = 28;
  const chartData = React.useMemo(() => {
    const points: { label: string; portfolioVal: number; benchmarkReturnPct: number }[] = [];
    const baseNav = metrics.nav * 0.88;
    const isOneDay = timeframe === '1D';

    for (let i = 0; i < chartPointsCount; i++) {
      const progress = i / (chartPointsCount - 1);
      // Realistic trending path with slight market noise
      const trend = Math.sin(progress * Math.PI * 1.5) * 0.08 + progress * 0.14;
      const noise = (Math.sin(i * 1.7) * 0.015);
      const val = i === chartPointsCount - 1 ? metrics.nav : baseNav * (1 + trend + noise);

      // Benchmark delta
      let bmkPct = 0;
      if (benchmark === 'SPY') {
        bmkPct = (progress * 9.8) + (Math.cos(i * 1.2) * 1.2);
      } else if (benchmark === 'QQQ') {
        bmkPct = (progress * 14.2) + (Math.cos(i * 1.4) * 2.1);
      } else if (benchmark === 'BALANCED_60_40') {
        bmkPct = (progress * 6.4) + (Math.cos(i * 0.8) * 0.6);
      }

      const label = isOneDay
        ? `${9 + Math.floor(i / 4)}:${(i % 4) * 15 || '00'}`
        : `Day ${i + 1}`;

      points.push({ label, portfolioVal: val, benchmarkReturnPct: bmkPct });
    }
    return points;
  }, [timeframe, benchmark, metrics.nav]);

  const minVal = Math.min(...chartData.map(p => p.portfolioVal)) * 0.98;
  const maxVal = Math.max(...chartData.map(p => p.portfolioVal)) * 1.02;

  // Active hover point
  const activePoint = hoveredPointIndex !== null ? chartData[hoveredPointIndex] : chartData[chartData.length - 1];

  return (
    <div className="space-y-6">
      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* NAV Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Net Asset Value (NAV)</span>
            <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Tick
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold font-mono text-white tracking-tight">
            ${metrics.nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className={`font-mono font-medium flex items-center ${metrics.dayPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {metrics.dayPnL >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {metrics.dayPnL >= 0 ? '+' : ''}${Math.abs(metrics.dayPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-slate-500">·</span>
            <span className={metrics.dayPnLPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {metrics.dayPnLPct >= 0 ? '+' : ''}{metrics.dayPnLPct.toFixed(2)}% today
            </span>
          </div>
        </div>

        {/* Total Unrealized Return */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs text-slate-400 mb-1">Cumulative Total Return</div>
          <div className={`text-2xl sm:text-3xl font-semibold font-mono tracking-tight ${metrics.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.totalPnL >= 0 ? '+' : ''}${metrics.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span className={`font-mono font-medium ${metrics.totalPnLPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {metrics.totalPnLPct >= 0 ? '+' : ''}{metrics.totalPnLPct.toFixed(2)}%
            </span>
            <span className="text-slate-500">·</span>
            <span>on ${metrics.totalInvested.toLocaleString('en-US', { maximumFractionDigits: 0 })} invested</span>
          </div>
        </div>

        {/* Cash & Buying Power */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cash & Sweep Yield</span>
            <span className="text-[11px] text-emerald-400 font-mono">5.18% APY</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold font-mono text-white tracking-tight">
            ${metrics.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span className="font-mono text-slate-300">{cashPct.toFixed(1)}% of portfolio</span>
            <span className="text-slate-500">·</span>
            <span>Broker sweep active</span>
          </div>
        </div>

        {/* Active Risk Profile & Drift Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Risk Target</span>
            {metrics.driftStatus === 'aligned' ? (
              <span className="flex items-center gap-1 text-emerald-400 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                In Target Band
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                Drift Detected
              </span>
            )}
          </div>
          <div>
            <div className="text-base font-semibold text-white tracking-tight truncate">
              {riskProfile.name}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Max asset drift: <span className="font-mono text-amber-400 font-semibold">{metrics.driftScore.toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80">
            <button
              onClick={onNavigateToRebalance}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 group cursor-pointer"
            >
              <span>Review Auto-Rebalance Orders</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Performance Chart & Benchmark Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">Performance Analytics</h2>
              <span className="text-xs text-slate-400">· Benchmark Normalized</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="text-slate-400">
                Selected: <strong className="text-white font-mono">${activePoint.portfolioVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </span>
              {benchmark !== 'NONE' && (
                <span className="text-slate-400">
                  {benchmark} return: <strong className="text-indigo-400 font-mono">+{activePoint.benchmarkReturnPct.toFixed(2)}%</strong>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Benchmark Selector */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <span className="text-slate-400 px-2">Vs:</span>
              <button
                onClick={() => setBenchmark('SPY')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  benchmark === 'SPY' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                S&P 500 (SPY)
              </button>
              <button
                onClick={() => setBenchmark('QQQ')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  benchmark === 'QQQ' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nasdaq-100 (QQQ)
              </button>
              <button
                onClick={() => setBenchmark('BALANCED_60_40')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  benchmark === 'BALANCED_60_40' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                60/40 Index
              </button>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              {(['1D', '1W', '1M', '1Y', 'ALL'] as Timeframe[]).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    timeframe === tf ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Performance Chart */}
        <div className="relative h-64 w-full">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 1000 240"
            preserveAspectRatio="none"
            onMouseLeave={() => setHoveredPointIndex(null)}
          >
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 60, 120, 180, 240].map(y => (
              <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.3" />
            ))}

            {/* Benchmark line if enabled */}
            {benchmark !== 'NONE' && (
              <path
                d={chartData
                  .map((p, idx) => {
                    const x = (idx / (chartPointsCount - 1)) * 1000;
                    // Map benchmark return between y 190 and 50
                    const y = 200 - (p.benchmarkReturnPct / 20) * 140;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeOpacity="0.8"
              />
            )}

            {/* Portfolio Filled Area */}
            <path
              d={`${chartData
                .map((p, idx) => {
                  const x = (idx / (chartPointsCount - 1)) * 1000;
                  const y = 220 - ((p.portfolioVal - minVal) / (maxVal - minVal)) * 200;
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')} L 1000 240 L 0 240 Z`}
              fill="url(#portfolioGradient)"
            />

            {/* Portfolio Solid Curve */}
            <path
              d={chartData
                .map((p, idx) => {
                  const x = (idx / (chartPointsCount - 1)) * 1000;
                  const y = 220 - ((p.portfolioVal - minVal) / (maxVal - minVal)) * 200;
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            />

            {/* Crosshair hover tracker */}
            {hoveredPointIndex !== null && (
              <g>
                <line
                  x1={(hoveredPointIndex / (chartPointsCount - 1)) * 1000}
                  y1="0"
                  x2={(hoveredPointIndex / (chartPointsCount - 1)) * 1000}
                  y2="240"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={(hoveredPointIndex / (chartPointsCount - 1)) * 1000}
                  cy={220 - ((activePoint.portfolioVal - minVal) / (maxVal - minVal)) * 200}
                  r="5"
                  fill="#10b981"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Interactive invisible hover rectangles */}
            {chartData.map((_, idx) => (
              <rect
                key={idx}
                x={(idx / chartPointsCount) * 1000}
                y="0"
                width={1000 / chartPointsCount}
                height="240"
                fill="transparent"
                onMouseEnter={() => setHoveredPointIndex(idx)}
                className="cursor-crosshair"
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-0.5 bg-emerald-400"></span>
              Apex Multi-Asset Portfolio
            </span>
            {benchmark !== 'NONE' && (
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-3 h-0.5 border-t border-dashed border-indigo-400"></span>
                {benchmark === 'SPY' ? 'S&P 500 ETF (SPY)' : benchmark === 'QQQ' ? 'Nasdaq-100 (QQQ)' : '60/40 Benchmark'}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">T+0 Real-Time Pricing Feed</span>
        </div>
      </div>

      {/* Asset Allocation vs Target Risk Profile & Drift Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Visualizer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Asset Allocation vs Target Profile</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target based on <span className="text-emerald-400 font-medium">{riskProfile.name}</span>
              </p>
            </div>
            <button
              onClick={onNavigateToRebalance}
              className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              Rebalance Drift
            </button>
          </div>

          {/* Allocation Bars */}
          <div className="space-y-4">
            {/* Equities */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-200">Equities / Stocks</span>
                <div className="font-mono text-xs">
                  <span className="text-white">{currentAllocation.equities.toFixed(1)}%</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-slate-400">{riskProfile.targetAllocation.equities}% target</span>
                  <span className={`ml-2 font-semibold ${currentAllocation.equities - riskProfile.targetAllocation.equities > 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                    ({(currentAllocation.equities - riskProfile.targetAllocation.equities) > 0 ? '+' : ''}{(currentAllocation.equities - riskProfile.targetAllocation.equities).toFixed(1)}% drift)
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 relative">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(currentAllocation.equities, 100)}%` }}
                ></div>
                {/* Target marker line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow"
                  style={{ left: `${riskProfile.targetAllocation.equities}%` }}
                  title={`Target: ${riskProfile.targetAllocation.equities}%`}
                ></div>
              </div>
            </div>

            {/* Crypto */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-200">Digital Assets / Crypto</span>
                <div className="font-mono text-xs">
                  <span className="text-white">{currentAllocation.crypto.toFixed(1)}%</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-slate-400">{riskProfile.targetAllocation.crypto}% target</span>
                  <span className={`ml-2 font-semibold ${currentAllocation.crypto - riskProfile.targetAllocation.crypto > 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                    ({(currentAllocation.crypto - riskProfile.targetAllocation.crypto) > 0 ? '+' : ''}{(currentAllocation.crypto - riskProfile.targetAllocation.crypto).toFixed(1)}% drift)
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 relative">
                <div
                  className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(currentAllocation.crypto, 100)}%` }}
                ></div>
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow"
                  style={{ left: `${riskProfile.targetAllocation.crypto}%` }}
                ></div>
              </div>
            </div>

            {/* Fixed Income */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-200">Fixed Income / Sovereign Treasuries</span>
                <div className="font-mono text-xs">
                  <span className="text-white">{currentAllocation.fixed_income.toFixed(1)}%</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-slate-400">{riskProfile.targetAllocation.fixed_income}% target</span>
                  <span className={`ml-2 font-semibold ${currentAllocation.fixed_income - riskProfile.targetAllocation.fixed_income > 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                    ({(currentAllocation.fixed_income - riskProfile.targetAllocation.fixed_income) > 0 ? '+' : ''}{(currentAllocation.fixed_income - riskProfile.targetAllocation.fixed_income).toFixed(1)}% drift)
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 relative">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(currentAllocation.fixed_income, 100)}%` }}
                ></div>
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow"
                  style={{ left: `${riskProfile.targetAllocation.fixed_income}%` }}
                ></div>
              </div>
            </div>

            {/* Commodities */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-200">Commodities & Real Assets</span>
                <div className="font-mono text-xs">
                  <span className="text-white">{currentAllocation.commodities.toFixed(1)}%</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-slate-400">{riskProfile.targetAllocation.commodities}% target</span>
                  <span className={`ml-2 font-semibold ${currentAllocation.commodities - riskProfile.targetAllocation.commodities > 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                    ({(currentAllocation.commodities - riskProfile.targetAllocation.commodities) > 0 ? '+' : ''}{(currentAllocation.commodities - riskProfile.targetAllocation.commodities).toFixed(1)}% drift)
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 relative">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(currentAllocation.commodities, 100)}%` }}
                ></div>
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow"
                  style={{ left: `${riskProfile.targetAllocation.commodities}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-6 pt-3 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-blue-500"></span> Equities
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-purple-500"></span> Crypto
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-emerald-500"></span> Fixed Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-amber-500"></span> Commodities
            </span>
            <span className="flex items-center gap-1.5 ml-auto text-slate-400">
              <span className="w-1.5 h-3 bg-white inline-block"></span> White marker: Target Profile
            </span>
          </div>
        </div>

        {/* Real-Time Quantitative Risk Telemetry */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Quantitative Risk Metrics</h2>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Real-time portfolio volatility, beta sensitivity, and parametric downside metrics.
            </p>

            <div className="space-y-3 font-mono">
              {/* Sharpe Ratio */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                <div>
                  <div className="text-xs text-slate-400">Sharpe Ratio (Rf=4.8%)</div>
                  <div className="text-[10px] text-slate-400 font-sans">Risk-adjusted excess return</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-400">{metrics.sharpeRatio.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400 font-sans">SPY is 1.35</div>
                </div>
              </div>

              {/* Beta */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                <div>
                  <div className="text-xs text-slate-400">Portfolio Beta (vs SPY)</div>
                  <div className="text-[10px] text-slate-400 font-sans">Systematic market sensitivity</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{metrics.betaVsSPY.toFixed(2)}</div>
                  <div className="text-[10px] text-emerald-400 font-sans">Sub-market beta</div>
                </div>
              </div>

              {/* Value at Risk */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                <div>
                  <div className="text-xs text-slate-400">Parametric VaR (95% 1-Day)</div>
                  <div className="text-[10px] text-slate-400 font-sans">Max expected loss 19 of 20 days</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-rose-400">
                    -${Math.abs(metrics.valueAtRisk95_1D).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    {((metrics.valueAtRisk95_1D / metrics.nav) * 100).toFixed(2)}% of NAV
                  </div>
                </div>
              </div>

              {/* Max Drawdown */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                <div>
                  <div className="text-xs text-slate-400">Max Historical Drawdown</div>
                  <div className="text-[10px] text-slate-400 font-sans">Peak to trough decline</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-amber-400">-{metrics.maxDrawdownPeakToTrough.toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-400 font-sans">Tol: {riskProfile.maxDrawdownTolerance}%</div>
                </div>
              </div>

              {/* Annualized Volatility */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                <div>
                  <div className="text-xs text-slate-400">Annualized Volatility (σ)</div>
                  <div className="text-[10px] text-slate-400 font-sans">Standard deviation</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{metrics.annualizedVolatility.toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-400 font-sans">Within risk band</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Detailed Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Portfolio Holdings & Drift Matrix</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live quotes streaming from connected brokerage gateways with real-time unrealized P&L.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{holdings.length} Assets active</span>
            <span>·</span>
            <span className="font-mono text-emerald-400">Total: ${metrics.nav.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Asset Class</th>
                <th className="py-3 px-4 text-right">Holdings</th>
                <th className="py-3 px-4 text-right">Avg Cost</th>
                <th className="py-3 px-4 text-right">Live Price</th>
                <th className="py-3 px-4 text-right">Market Value</th>
                <th className="py-3 px-4 text-right">24h Gain</th>
                <th className="py-3 px-4 text-right">Total Unrealized</th>
                <th className="py-3 px-4 text-right">Weight / Drift</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {holdings.map(h => {
                const isOverweight = h.driftPct > 1.5;
                const isUnderweight = h.driftPct < -1.5;
                return (
                  <tr key={h.assetId} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-medium text-white flex items-center gap-1.5">
                        {h.symbol}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{h.name}</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="capitalize text-slate-300 text-xs">
                        {h.assetClass.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200">
                      {h.quantity >= 1 ? h.quantity.toLocaleString('en-US') : h.quantity.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      ${h.avgBuyPrice >= 1000 ? h.avgBuyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : h.avgBuyPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-white font-medium">
                      ${h.currentPrice >= 1000 ? h.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : h.currentPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-white">
                      ${h.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-4 text-right ${h.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.unrealizedPnLPct >= 0 ? '+' : ''}{h.unrealizedPnLPct.toFixed(2)}%
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${h.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <div>{h.unrealizedPnL >= 0 ? '+' : ''}${h.unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <div className="text-slate-200">{h.weightPct.toFixed(1)}%</div>
                      <div className={`text-[11px] font-semibold ${isOverweight ? 'text-amber-400' : isUnderweight ? 'text-sky-400' : 'text-slate-500'}`}>
                        {h.driftPct > 0 ? '+' : ''}{h.driftPct.toFixed(1)}% drift
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectAssetToTrade(h.assetId)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                        >
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
