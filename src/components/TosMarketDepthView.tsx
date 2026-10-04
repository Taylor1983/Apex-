import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Maximize2,
  Sliders,
  BarChart2,
  ChevronDown,
  Filter,
  Check,
  Radio,
  Clock,
  RefreshCw,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Asset, OrderSide, TradeOrder } from '../types';

export interface TosMarketDepthViewProps {
  asset: Asset;
  assets: Asset[];
  onSelectSymbol: (symbol: string) => void;
  onPopulateOrder: (symbol: string, side: OrderSide, price: number) => void;
  cashBalance: number;
  compact?: boolean;
}

interface TapePrint {
  id: string;
  time: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL' | 'CROSS';
  venue: string;
  isBlock: boolean;
}

export const TosMarketDepthView: React.FC<TosMarketDepthViewProps> = ({
  asset,
  assets,
  onSelectSymbol,
  onPopulateOrder,
  cashBalance,
  compact = false
}) => {
  const [depthAggregation, setDepthAggregation] = useState<number>(0.05); // price step grouping
  const [ladderOrderQty, setLadderOrderQty] = useState<number>(100);
  const [selectedVenue, setSelectedVenue] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'VISUAL_DEPTH' | 'DOM_LADDER' | 'TIME_AND_SALES'>('VISUAL_DEPTH');
  const [autoSend, setAutoSend] = useState<boolean>(true);
  const [useOcoBrackets, setUseOcoBrackets] = useState<boolean>(false);
  const [stopLossTicks, setStopLossTicks] = useState<number>(10);
  const [profitTargetTicks, setProfitTargetTicks] = useState<number>(20);
  const [tickCounter, setTickCounter] = useState<number>(0);
  const [tapeFilter, setTapeFilter] = useState<'ALL' | 'LARGE' | 'BLOCK'>('ALL');
  const [lastExecutedAlert, setLastExecutedAlert] = useState<string | null>(null);

  const isCanadian = asset.currency === 'CAD' || asset.symbol.endsWith('.TO');
  const currSym = isCanadian ? 'C$' : '$';
  const spotPrice = asset.price;

  // Streaming real-time tick fluctuation simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTickCounter(prev => prev + 1);
    }, 900);
    return () => clearInterval(timer);
  }, []);

  // Streaming Time & Sales tape state
  const [tape, setTape] = useState<TapePrint[]>(() => {
    const venues = isCanadian ? ['TSX', 'ALPHA', 'CHIX', 'MX'] : ['NSDQ', 'ARCA', 'BATS', 'EDGX', 'IEX'];
    const initialPrints: TapePrint[] = [];
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      const pOffset = (Math.random() - 0.48) * 0.15;
      const printPrice = Number((spotPrice + pOffset).toFixed(2));
      const printSide: 'BUY' | 'SELL' | 'CROSS' = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const sizeOptions = [100, 200, 300, 500, 1000, 1500, 2500];
      const printSize = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];
      const d = new Date(now - (20 - i) * 1200);
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(Math.floor(Math.random() * 900 + 100))}`;
      initialPrints.push({
        id: `tape-${i}-${now}`,
        time: timeStr,
        price: printPrice,
        size: printSize,
        side: printSide,
        venue: venues[Math.floor(Math.random() * venues.length)],
        isBlock: printSize >= 1000
      });
    }
    return initialPrints;
  });

  // Inject a new print periodically into Time & Sales tape
  useEffect(() => {
    const venues = isCanadian ? ['TSX', 'ALPHA', 'CHIX', 'MX'] : ['NSDQ', 'ARCA', 'BATS', 'EDGX', 'IEX'];
    const interval = setInterval(() => {
      const d = new Date();
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(Math.floor(Math.random() * 900 + 100))}`;
      const isUp = Math.random() > 0.47;
      const pOffset = isUp ? depthAggregation * (Math.random() > 0.8 ? 2 : 1) : -depthAggregation * (Math.random() > 0.8 ? 2 : 1);
      const printPrice = Number((spotPrice + pOffset * 0.5).toFixed(2));
      const sizes = [100, 100, 200, 300, 500, 800, 1200, 3000];
      const chosenSize = sizes[Math.floor(Math.random() * sizes.length)];
      const newPrint: TapePrint = {
        id: `tape-${Date.now()}`,
        time: timeStr,
        price: printPrice,
        size: chosenSize,
        side: isUp ? 'BUY' : 'SELL',
        venue: venues[Math.floor(Math.random() * venues.length)],
        isBlock: chosenSize >= 1000
      };

      setTape(prev => [newPrint, ...prev.slice(0, 49)]);
    }, 1200);

    return () => clearInterval(interval);
  }, [spotPrice, depthAggregation, isCanadian]);

  // Generate 14 realistic bid and ask tiers with venue routing attribution & live size fluctuations
  const depthData = useMemo(() => {
    const venues = isCanadian ? ['TSX', 'ALPHA', 'CHIX', 'MX'] : ['ARCA', 'NSDQ', 'BATS', 'EDGX', 'IEX'];
    const bids: { price: number; size: number; total: number; venue: string; ordersCount: number; changed?: boolean }[] = [];
    const asks: { price: number; size: number; total: number; venue: string; ordersCount: number; changed?: boolean }[] = [];

    let cumBidSize = 0;
    let cumAskSize = 0;

    for (let i = 1; i <= 14; i++) {
      const bidPrice = Number((spotPrice - i * depthAggregation).toFixed(2));
      const askPrice = Number((spotPrice + i * depthAggregation).toFixed(2));

      // Realistic pseudo-random size with tickCounter wave variation
      const wave = Math.sin(tickCounter * 0.4 + i) * 60;
      const baseBidSize = Math.max(100, Math.floor(250 + i * 90 + wave + ((i * 37 + tickCounter * 13) % 180)));
      const baseAskSize = Math.max(100, Math.floor(240 + i * 85 - wave + ((i * 41 + tickCounter * 17) % 190)));

      cumBidSize += baseBidSize;
      cumAskSize += baseAskSize;

      bids.push({
        price: bidPrice,
        size: baseBidSize,
        total: cumBidSize,
        venue: venues[(i + tickCounter) % venues.length],
        ordersCount: Math.max(2, Math.floor(i * 1.5 + (tickCounter % 5))),
        changed: i <= 2 && tickCounter % 2 === 0
      });

      asks.push({
        price: askPrice,
        size: baseAskSize,
        total: cumAskSize,
        venue: venues[(i + 1 + tickCounter) % venues.length],
        ordersCount: Math.max(2, Math.floor(i * 1.4 + ((tickCounter + 2) % 5))),
        changed: i <= 2 && tickCounter % 2 === 1
      });
    }

    const maxCumulative = Math.max(cumBidSize, cumAskSize);

    return { bids, asks, maxCumulative, totalBidLiquidity: cumBidSize, totalAskLiquidity: cumAskSize };
  }, [spotPrice, depthAggregation, isCanadian, tickCounter]);

  const spread = Number((depthData.asks[0].price - depthData.bids[0].price).toFixed(2));
  const spreadBps = Number(((spread / spotPrice) * 10000).toFixed(1));
  const orderImbalancePct = Number(
    (
      ((depthData.totalBidLiquidity - depthData.totalAskLiquidity) /
        (depthData.totalBidLiquidity + depthData.totalAskLiquidity)) *
      100
    ).toFixed(1)
  );

  // Micro-price / Theoretical Fair Value calculation
  const topBid = depthData.bids[0];
  const topAsk = depthData.asks[0];
  const microPrice = Number(
    (
      (topBid.price * topAsk.size + topAsk.price * topBid.size) /
      (topBid.size + topAsk.size)
    ).toFixed(2)
  );

  const handleQuickOrder = (side: OrderSide, price: number, note?: string) => {
    onPopulateOrder(asset.symbol, side, price);
    const alertMsg = `${side} ${ladderOrderQty} ${asset.symbol} @ ${currSym}${price.toFixed(2)}${
      useOcoBrackets
        ? ` [OCO Stop: ${currSym}${(price - stopLossTicks * depthAggregation).toFixed(2)} | Target: ${currSym}${(price + profitTargetTicks * depthAggregation).toFixed(2)}]`
        : ''
    } - Transmitted via ${isCanadian ? 'TSX Quantum XA' : 'NASDAQ TotalView'}`;
    setLastExecutedAlert(alertMsg);
    setTimeout(() => setLastExecutedAlert(null), 4000);
  };

  // Visual SVG Depth Chart Calculations
  const svgWidth = 840;
  const svgHeight = 220;

  // Build SVG path for cumulative bids (left green wave)
  const bidPoints = depthData.bids
    .slice()
    .reverse()
    .map((b, idx, arr) => {
      const x = (idx / (arr.length - 1)) * (svgWidth / 2 - 15);
      const y = svgHeight - (b.total / depthData.maxCumulative) * (svgHeight - 40) - 10;
      return { x, y, price: b.price, total: b.total, size: b.size };
    });

  const bidPathD =
    bidPoints.length > 0
      ? `M 0 ${svgHeight} ` +
        bidPoints.map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${svgWidth / 2 - 15} ${svgHeight} Z`
      : '';

  // Build SVG path for cumulative asks (right red wave)
  const askPoints = depthData.asks.map((a, idx, arr) => {
    const x = svgWidth / 2 + 15 + (idx / (arr.length - 1)) * (svgWidth / 2 - 15);
    const y = svgHeight - (a.total / depthData.maxCumulative) * (svgHeight - 40) - 10;
    return { x, y, price: a.price, total: a.total, size: a.size };
  });

  const askPathD =
    askPoints.length > 0
      ? `M ${svgWidth / 2 + 15} ${svgHeight} ` +
        askPoints.map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${svgWidth} ${svgHeight} Z`
      : '';

  // Filtered Tape Prints
  const filteredTape = useMemo(() => {
    if (tapeFilter === 'BLOCK') return tape.filter(t => t.size >= 1000);
    if (tapeFilter === 'LARGE') return tape.filter(t => t.size >= 500);
    return tape;
  }, [tape, tapeFilter]);

  return (
    <div className={`space-y-3 font-mono text-xs select-none ${compact ? 'p-1' : ''}`}>
      {/* Execution Alert Toast */}
      {lastExecutedAlert && (
        <div className="bg-[#102018] border border-[#00c076] text-[#00c076] p-2.5 rounded-lg flex items-center justify-between text-xs font-mono shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00c076] animate-ping"></span>
            <strong>ACTIVE TRADER ORDER TRANSMITTED:</strong>
            <span>{lastExecutedAlert}</span>
          </div>
          <button
            onClick={() => setLastExecutedAlert(null)}
            className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. thinkorswim Market Depth Top Control Bar */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow">
        <div className="flex flex-wrap items-center gap-3">
          {/* Symbol Box [1] Tag */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-amber-400 text-black font-black text-[10px] flex items-center justify-center font-mono">
              1
            </span>
            <div className="font-sans flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">{asset.symbol}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">{asset.name}</span>
              {isCanadian ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/15 text-red-300 border border-red-500/30 font-bold font-mono flex items-center gap-1">
                  <span>🇨🇦</span>
                  <span>TSX L2 DEPTH</span>
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold font-mono flex items-center gap-1">
                  <span>🇺🇸</span>
                  <span>TOTALVIEW L2</span>
                </span>
              )}
            </div>
          </div>

          <span className="text-slate-600 hidden md:inline">|</span>

          {/* Real-time NBBO Spread Pill */}
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="text-slate-400 font-sans">
              Bid: <strong className="text-[#00c076]">{currSym}{depthData.bids[0].price.toFixed(2)}</strong> ({depthData.bids[0].size.toLocaleString()})
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-sans">
              Ask: <strong className="text-[#ff3b57]">{currSym}{depthData.asks[0].price.toFixed(2)}</strong> ({depthData.asks[0].size.toLocaleString()})
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-sans">
              Spread: <strong className="text-white">{currSym}{spread.toFixed(2)}</strong> ({spreadBps} bps)
            </span>
            <span className="text-slate-600 hidden lg:inline">·</span>
            <span className="text-slate-400 font-sans hidden lg:inline">
              Micro-Price: <strong className="text-amber-400">{currSym}{microPrice.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* Right Controls: Aggregation Step, Order Quantity, and View Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Step Size Selector */}
          <div className="flex items-center gap-1 bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
            <span className="text-slate-400 px-1 font-sans">Step:</span>
            {[0.01, 0.05, 0.1, 0.25, 0.5].map(step => (
              <button
                key={step}
                onClick={() => setDepthAggregation(step)}
                className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                  depthAggregation === step ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                ${step.toFixed(2)}
              </button>
            ))}
          </div>

          {/* Quick Ladder Size */}
          <div className="flex items-center gap-1 bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
            <span className="text-slate-400 px-1 font-sans">Qty:</span>
            {[50, 100, 250, 500, 1000].map(q => (
              <button
                key={q}
                onClick={() => setLadderOrderQty(q)}
                className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                  ladderOrderQty === q ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Sub-view switcher */}
          <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
            <button
              onClick={() => setActiveTab('VISUAL_DEPTH')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                activeTab === 'VISUAL_DEPTH' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Visual Chart & DOM
            </button>
            <button
              onClick={() => setActiveTab('DOM_LADDER')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                activeTab === 'DOM_LADDER' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active DOM Ladder Only
            </button>
            <button
              onClick={() => setActiveTab('TIME_AND_SALES')}
              className={`px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
                activeTab === 'TIME_AND_SALES' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Time & Sales</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Market Depth Visual Cumulative Wave Chart */}
      {activeTab === 'VISUAL_DEPTH' && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 space-y-3 shadow">
          {/* Chart Header & Liquidity Imbalance Gauge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#21262d]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Full Cumulative Market Depth Surface ({isCanadian ? 'TSX Quantum XA / Alpha' : 'NASDAQ TotalView / Arca'})
              </span>
              <span className="w-2 h-2 rounded-full bg-[#00c076] animate-pulse"></span>
            </div>

            {/* Imbalance Meter */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-sans">Liquidity Imbalance:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#00c076] font-bold">
                  Bids {((depthData.totalBidLiquidity / (depthData.totalBidLiquidity + depthData.totalAskLiquidity)) * 100).toFixed(0)}%
                </span>
                <div className="w-28 h-2 bg-[#1c2128] rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#00c076] h-full transition-all duration-500"
                    style={{
                      width: `${(depthData.totalBidLiquidity / (depthData.totalBidLiquidity + depthData.totalAskLiquidity)) * 100}%`
                    }}
                  ></div>
                  <div
                    className="bg-[#ff3b57] h-full transition-all duration-500"
                    style={{
                      width: `${(depthData.totalAskLiquidity / (depthData.totalBidLiquidity + depthData.totalAskLiquidity)) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="text-[#ff3b57] font-bold">
                  Asks {((depthData.totalAskLiquidity / (depthData.totalBidLiquidity + depthData.totalAskLiquidity)) * 100).toFixed(0)}%
                </span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  orderImbalancePct > 0
                    ? 'bg-[#00c076]/15 text-[#00c076] border border-[#00c076]/30'
                    : 'bg-[#ff3b57]/15 text-[#ff3b57] border border-[#ff3b57]/30'
                }`}
              >
                {orderImbalancePct > 0 ? `+${orderImbalancePct}% BUY SKEW` : `${orderImbalancePct}% SELL SKEW`}
              </span>
            </div>
          </div>

          {/* SVG Visual Depth Waves Canvas */}
          <div className="h-56 w-full bg-[#090d11] rounded border border-[#1c2128] p-2 relative overflow-hidden">
            <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="depthBidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00c076" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#00c076" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="depthAskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff3b57" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#ff3b57" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[40, 85, 130, 175].map(y => (
                <line key={y} x1="0" y1={y} x2={svgWidth} y2={y} stroke="#161b22" strokeDasharray="3 3" />
              ))}

              {/* Center Mid-Price Line */}
              <line
                x1={svgWidth / 2}
                y1="0"
                x2={svgWidth / 2}
                y2={svgHeight}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <rect
                x={svgWidth / 2 - 42}
                y="8"
                width="84"
                height="16"
                fill="#181d26"
                rx="3"
                stroke="#f59e0b"
                strokeWidth="0.8"
              />
              <text
                x={svgWidth / 2}
                y="20"
                fill="#f59e0b"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                MID {currSym}{spotPrice.toFixed(2)}
              </text>

              {/* Bid Area Fill & Stroke */}
              <path d={bidPathD} fill="url(#depthBidGrad)" />
              <path
                d={bidPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#00c076"
                strokeWidth="2.5"
              />

              {/* Ask Area Fill & Stroke */}
              <path d={askPathD} fill="url(#depthAskGrad)" />
              <path
                d={askPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#ff3b57"
                strokeWidth="2.5"
              />

              {/* Price Markers along bottom */}
              <text x="15" y={svgHeight - 6} fill="#00c076" fontSize="9" fontFamily="monospace">
                {currSym}{depthData.bids[depthData.bids.length - 1].price.toFixed(2)} (-
                {(depthData.bids.length * depthAggregation).toFixed(2)})
              </text>
              <text x={svgWidth / 2 - 25} y={svgHeight - 6} fill="#00c076" fontSize="9" fontFamily="monospace" textAnchor="end">
                {currSym}{depthData.bids[0].price.toFixed(2)}
              </text>
              <text x={svgWidth / 2 + 25} y={svgHeight - 6} fill="#ff3b57" fontSize="9" fontFamily="monospace">
                {currSym}{depthData.asks[0].price.toFixed(2)}
              </text>
              <text x={svgWidth - 15} y={svgHeight - 6} fill="#ff3b57" fontSize="9" fontFamily="monospace" textAnchor="end">
                {currSym}{depthData.asks[depthData.asks.length - 1].price.toFixed(2)} (+
                {(depthData.asks.length * depthAggregation).toFixed(2)})
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* 3. thinkorswim Level 2 Depth Matrix & Active Trader DOM Ladder / Time & Sales */}
      {activeTab !== 'TIME_AND_SALES' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left: Level 2 Multi-Venue Order Book Depth (6 Cols) */}
          <div className="lg:col-span-6 bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Level 2 Multi-Venue Depth ({isCanadian ? 'TSX / Alpha / Chi-X / MX' : 'NASDAQ / Arca / BATS / IEX'})
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>
                  Total Bid: <strong className="text-[#00c076] font-mono">{depthData.totalBidLiquidity.toLocaleString()}</strong>
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  Total Ask: <strong className="text-[#ff3b57] font-mono">{depthData.totalAskLiquidity.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Level 2 Dual-Side Table */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Bid Side Table */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase border-b border-[#21262d] pb-1 flex justify-between">
                  <span>VENUE / ORDS</span>
                  <span className="text-right">BID SIZE</span>
                  <span className="text-right text-[#00c076]">BID PRICE</span>
                </div>
                <div className="space-y-0.5">
                  {depthData.bids.map((b, idx) => {
                    const depthPct = (b.total / depthData.maxCumulative) * 100;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleQuickOrder('BUY', b.price)}
                        className={`flex items-center justify-between px-2 py-1 rounded bg-[#090d11] hover:bg-[#102018] transition-colors relative overflow-hidden cursor-pointer group ${
                          b.changed ? 'ring-1 ring-[#00c076]/40' : ''
                        }`}
                      >
                        {/* Depth Bar Background */}
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-[#00c076]/15 group-hover:bg-[#00c076]/25 pointer-events-none transition-all duration-300"
                          style={{ width: `${depthPct}%` }}
                        ></div>

                        <div className="flex items-center gap-1.5 z-10">
                          <span className="text-[9px] px-1 py-0.1 rounded bg-[#1c2128] text-slate-300 font-bold">
                            {b.venue}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans">({b.ordersCount})</span>
                        </div>

                        <div className="font-bold text-slate-200 z-10">{b.size.toLocaleString()}</div>
                        <div className="font-bold text-[#00c076] z-10">{currSym}{b.price.toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ask Side Table */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase border-b border-[#21262d] pb-1 flex justify-between">
                  <span className="text-[#ff3b57]">ASK PRICE</span>
                  <span>ASK SIZE</span>
                  <span className="text-right">VENUE / ORDS</span>
                </div>
                <div className="space-y-0.5">
                  {depthData.asks.map((a, idx) => {
                    const depthPct = (a.total / depthData.maxCumulative) * 100;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleQuickOrder('SELL', a.price)}
                        className={`flex items-center justify-between px-2 py-1 rounded bg-[#090d11] hover:bg-[#1f1518] transition-colors relative overflow-hidden cursor-pointer group ${
                          a.changed ? 'ring-1 ring-[#ff3b57]/40' : ''
                        }`}
                      >
                        {/* Depth Bar Background */}
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-[#ff3b57]/15 group-hover:bg-[#ff3b57]/25 pointer-events-none transition-all duration-300"
                          style={{ width: `${depthPct}%` }}
                        ></div>

                        <div className="font-bold text-[#ff3b57] z-10">{currSym}{a.price.toFixed(2)}</div>
                        <div className="font-bold text-slate-200 z-10">{a.size.toLocaleString()}</div>

                        <div className="flex items-center gap-1.5 z-10">
                          <span className="text-[10px] text-slate-500 font-sans">({a.ordersCount})</span>
                          <span className="text-[9px] px-1 py-0.1 rounded bg-[#1c2128] text-slate-300 font-bold">
                            {a.venue}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Active Trader DOM Trading Ladder (6 Cols) */}
          <div className="lg:col-span-6 bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    thinkorswim Active Trader DOM Ladder
                  </span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                    ONE-CLICK TRADING
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSend}
                      onChange={e => setAutoSend(e.target.checked)}
                      className="rounded bg-[#161b22] border-[#30363d] text-amber-400"
                    />
                    <span>Auto-Send</span>
                  </label>
                </div>
              </div>

              {/* Bracket Order Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#12161f] border border-[#21262d] rounded my-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-slate-300 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={useOcoBrackets}
                      onChange={e => setUseOcoBrackets(e.target.checked)}
                      className="rounded bg-[#161b22] border-[#30363d] text-amber-400"
                    />
                    <span>OCO Brackets:</span>
                  </label>
                  {useOcoBrackets && (
                    <div className="flex items-center gap-3">
                      <span className="text-rose-400 flex items-center gap-1">
                        Stop: -{stopLossTicks} ticks ({currSym}{(stopLossTicks * depthAggregation).toFixed(2)})
                      </span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        Target: +{profitTargetTicks} ticks ({currSym}{(profitTargetTicks * depthAggregation).toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Cancel All / Flatten / Reverse buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setLastExecutedAlert(`FLATTEN: Market sell all open positions in ${asset.symbol}`);
                    }}
                    className="px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 font-bold text-[10px] cursor-pointer"
                  >
                    FLATTEN
                  </button>
                  <button
                    onClick={() => {
                      setLastExecutedAlert(`REVERSE: Flipped position on ${asset.symbol}`);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 font-bold text-[10px] cursor-pointer"
                  >
                    REVERSE
                  </button>
                  <button
                    onClick={() => {
                      setLastExecutedAlert(`CANCEL ALL: Removed working limit orders on ${asset.symbol}`);
                    }}
                    className="px-2 py-0.5 rounded bg-[#1c2128] hover:bg-[#252b36] text-slate-300 border border-[#30363d] font-bold text-[10px] cursor-pointer"
                  >
                    CANCEL ALL
                  </button>
                </div>
              </div>

              {/* Top Quick Execution Bar */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                <button
                  onClick={() => handleQuickOrder('BUY', depthData.asks[0].price)}
                  className="py-1.5 px-2 rounded bg-[#00c076]/20 hover:bg-[#00c076] hover:text-black text-[#00c076] font-bold text-xs transition-colors cursor-pointer border border-[#00c076]/40 uppercase"
                >
                  BUY MKT ({ladderOrderQty})
                </button>
                <button
                  onClick={() => handleQuickOrder('BUY', depthData.bids[0].price)}
                  className="py-1.5 px-2 rounded bg-[#161b22] hover:bg-[#1c2128] text-white font-bold text-xs transition-colors cursor-pointer border border-[#30363d] uppercase"
                >
                  JOIN BID
                </button>
                <button
                  onClick={() => handleQuickOrder('SELL', depthData.asks[0].price)}
                  className="py-1.5 px-2 rounded bg-[#161b22] hover:bg-[#1c2128] text-white font-bold text-xs transition-colors cursor-pointer border border-[#30363d] uppercase"
                >
                  JOIN ASK
                </button>
                <button
                  onClick={() => handleQuickOrder('SELL', depthData.bids[0].price)}
                  className="py-1.5 px-2 rounded bg-[#ff3b57]/20 hover:bg-[#ff3b57] hover:text-white text-[#ff3b57] font-bold text-xs transition-colors cursor-pointer border border-[#ff3b57]/40 uppercase"
                >
                  SELL MKT ({ladderOrderQty})
                </button>
              </div>

              {/* Continuous DOM Ladder Table */}
              <div className="mt-3 overflow-y-auto max-h-[380px] border border-[#21262d] rounded bg-[#090d11] font-mono text-xs">
                <table className="w-full text-center">
                  <thead className="bg-[#12161f] text-[10px] text-slate-400 uppercase font-semibold border-b border-[#21262d] sticky top-0 z-10">
                    <tr>
                      <th className="py-1.5 px-2 text-left text-[#00c076]">BUY (BID SIZE)</th>
                      <th className="py-1.5 px-2 text-center text-white bg-[#18202c]">PRICE ({currSym})</th>
                      <th className="py-1.5 px-2 text-right text-[#ff3b57]">SELL (ASK SIZE)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161b22]">
                    {/* Asks (Descended from top) */}
                    {depthData.asks.slice().reverse().map((a, i) => (
                      <tr key={`ask-ladder-${i}`} className="hover:bg-[#1a1215] transition-colors group">
                        <td className="py-1 px-2 text-left text-slate-600 font-sans text-[10px]">-</td>
                        <td className="py-1 px-2 font-bold text-[#ff3b57] bg-[#111620]">
                          {currSym}{a.price.toFixed(2)}
                        </td>
                        <td
                          onClick={() => handleQuickOrder('SELL', a.price)}
                          className="py-1 px-2 text-right font-bold text-white bg-[#ff3b57]/10 hover:bg-[#ff3b57]/30 cursor-pointer"
                        >
                          {a.size.toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {/* NBBO SPREAD ROW */}
                    <tr className="bg-[#1c2128] text-amber-400 text-[10px] font-bold">
                      <td colSpan={3} className="py-1 text-center tracking-wider">
                        --- SPREAD {currSym}{spread.toFixed(2)} ({spreadBps} BPS) · SPOT {currSym}{spotPrice.toFixed(2)} ---
                      </td>
                    </tr>

                    {/* Bids */}
                    {depthData.bids.map((b, i) => (
                      <tr key={`bid-ladder-${i}`} className="hover:bg-[#101f18] transition-colors group">
                        <td
                          onClick={() => handleQuickOrder('BUY', b.price)}
                          className="py-1 px-2 text-left font-bold text-white bg-[#00c076]/10 hover:bg-[#00c076]/30 cursor-pointer"
                        >
                          {b.size.toLocaleString()}
                        </td>
                        <td className="py-1 px-2 font-bold text-[#00c076] bg-[#111620]">
                          {currSym}{b.price.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 text-right text-slate-600 font-sans text-[10px]">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Execution Telemetry */}
            <div className="pt-2 border-t border-[#21262d] text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#00c076]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Biometric DMA Guard Active</span>
              </span>
              <span>
                Cash Available:{' '}
                <strong className="text-white">
                  {currSym}
                  {cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* 4. Streaming Real-Time Time & Sales Tape */
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 space-y-3 shadow">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#21262d]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Direct Exchange Time & Sales Tape ({isCanadian ? 'TMX TSX / Alpha / Chi-X' : 'NASDAQ / Arca / EDGX'})
              </span>
              <span className="w-2 h-2 rounded-full bg-[#00c076] animate-ping"></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-sans">Filter Prints:</span>
              <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[10px]">
                {(['ALL', 'LARGE', 'BLOCK'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setTapeFilter(f)}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      tapeFilter === f ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f === 'ALL' ? 'All Prints' : f === 'LARGE' ? '≥ 500' : '≥ 1,000 (Blocks)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tape Grid Table */}
          <div className="overflow-y-auto max-h-[460px] border border-[#21262d] rounded bg-[#090d11]">
            <table className="w-full text-xs">
              <thead className="bg-[#12161f] text-[10px] text-slate-400 uppercase font-semibold border-b border-[#21262d] sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-3 text-left">TIMESTAMP</th>
                  <th className="py-2 px-3 text-center">VENUE</th>
                  <th className="py-2 px-3 text-right">PRICE ({currSym})</th>
                  <th className="py-2 px-3 text-right">SIZE</th>
                  <th className="py-2 px-3 text-center">SIDE</th>
                  <th className="py-2 px-3 text-right">CONSIDERATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161b22]">
                {filteredTape.map(p => {
                  const isUp = p.side === 'BUY';
                  const notional = p.price * p.size;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleQuickOrder(isUp ? 'BUY' : 'SELL', p.price)}
                      className={`hover:bg-[#161b22] transition-colors cursor-pointer ${
                        p.isBlock ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-1 px-3 text-slate-400 font-mono text-[11px]">{p.time}</td>
                      <td className="py-1 px-3 text-center">
                        <span className="px-1.5 py-0.2 rounded bg-[#1c2128] text-slate-300 font-bold text-[10px]">
                          {p.venue}
                        </span>
                      </td>
                      <td className={`py-1 px-3 text-right font-bold ${isUp ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                        {currSym}{p.price.toFixed(2)}
                      </td>
                      <td className="py-1 px-3 text-right font-bold text-white">
                        {p.size.toLocaleString()}{' '}
                        {p.isBlock && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-black font-black uppercase ml-1">
                            BLOCK
                          </span>
                        )}
                      </td>
                      <td className="py-1 px-3 text-center">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            isUp ? 'bg-[#00c076]/15 text-[#00c076]' : 'bg-[#ff3b57]/15 text-[#ff3b57]'
                          }`}
                        >
                          {p.side}
                        </span>
                      </td>
                      <td className="py-1 px-3 text-right text-slate-300 font-mono">
                        {currSym}{notional.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
