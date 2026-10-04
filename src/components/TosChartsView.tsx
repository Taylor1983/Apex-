import React, { useState, useMemo } from 'react';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Activity,
  Sliders,
  Zap,
  Info,
  Clock,
  Eye,
  Settings,
  Target,
  SlidersHorizontal,
  Plus,
  Minus,
  Layers
} from 'lucide-react';
import { Asset, OrderSide } from '../types';
import { TosMarketDepthView } from './TosMarketDepthView';

interface TosChartsViewProps {
  asset: Asset;
  assets: Asset[];
  onSelectSymbol: (symbol: string) => void;
  onPopulateOrder: (symbol: string, side: OrderSide, price: number) => void;
}

type ChartType = 'CANDLE' | 'OHLC' | 'LINE' | 'AREA' | 'HEIKIN_ASHI';
type Timeframe = '1m' | '5m' | '15m' | '1h' | '1D' | '1W' | '1Y';
type LowerIndicator = 'VOLUME' | 'RSI' | 'MACD';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20: number;
  sma50: number;
  ema9: number;
  bollingerUpper: number;
  bollingerLower: number;
  vwap: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHist: number;
}

interface ConeStep {
  day: number;
  x: number;
  upper3Sigma: number;
  upper2Sigma: number;
  upper1Sigma: number;
  mean: number;
  lower1Sigma: number;
  lower2Sigma: number;
  lower3Sigma: number;
}

export const TosChartsView: React.FC<TosChartsViewProps> = ({
  asset,
  assets,
  onSelectSymbol,
  onPopulateOrder
}) => {
  const [chartType, setChartType] = useState<ChartType>('CANDLE');
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [lowerIndicator, setLowerIndicator] = useState<LowerIndicator>('RSI');
  const [showActiveTraderDock, setShowActiveTraderDock] = useState<boolean>(false);

  // Probability Cone State
  const [showProbabilityCone, setShowProbabilityCone] = useState<boolean>(true);
  const [show3Sigma, setShow3Sigma] = useState<boolean>(true);
  const [showBellCurve, setShowBellCurve] = useState<boolean>(true);
  const [coneDays, setConeDays] = useState<number>(30); // 7, 14, 30, 45, 60, 90
  const [coneIvInput, setConeIvInput] = useState<number>(
    asset.assetClass === 'crypto' ? 58.0 : asset.symbol === 'NVDA' ? 44.0 : 28.0
  );
  const [probTargetPrice, setProbTargetPrice] = useState<number>(Number((asset.price * 1.08).toFixed(2)));

  // Study Overlay Toggles
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVWAP, setShowVWAP] = useState(true);
  const [showFibo, setShowFibo] = useState(false);

  // Hover crosshair state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Generate 48 periods of realistic OHLCV candle data around asset.price
  const candles: CandleData[] = useMemo(() => {
    const list: CandleData[] = [];
    const count = 48;
    const basePrice = asset.price * (timeframe === '1Y' ? 0.78 : timeframe === '1D' ? 0.94 : 0.985);
    let prevClose = basePrice;

    const pricesAcc: number[] = [];

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const trend = Math.sin(progress * Math.PI * 2.2) * 0.04 + progress * 0.06;
      const noise = (Math.sin(i * 1.8) * 0.012) + (Math.cos(i * 2.4) * 0.008);
      
      const open = i === 0 ? prevClose : prevClose * (1 + (Math.random() - 0.49) * 0.003);
      const close = i === count - 1 ? asset.price : open * (1 + trend * 0.15 + noise);
      const high = Math.max(open, close) * (1 + Math.random() * 0.008 + 0.002);
      const low = Math.min(open, close) * (1 - Math.random() * 0.008 - 0.002);
      const volume = Math.floor(Math.random() * 125000) + 45000;

      prevClose = close;
      pricesAcc.push(close);

      // Moving Averages
      const window20 = pricesAcc.slice(Math.max(0, pricesAcc.length - 20));
      const sma20 = window20.reduce((a, b) => a + b, 0) / window20.length;

      const window50 = pricesAcc.slice(Math.max(0, pricesAcc.length - 35));
      const sma50 = window50.reduce((a, b) => a + b, 0) / window50.length;

      const ema9 = i === 0 ? close : (close * (2 / 10)) + (pricesAcc[i - 1] * (1 - 2 / 10));

      const variance = window20.reduce((acc, val) => acc + Math.pow(val - sma20, 2), 0) / window20.length;
      const stdDev = Math.sqrt(variance);
      const bollingerUpper = sma20 + stdDev * 2.0;
      const bollingerLower = sma20 - stdDev * 2.0;

      const vwap = (high + low + close) / 3 * (1 + (Math.sin(i * 0.5) * 0.003));
      const rsi = Math.min(88, Math.max(18, 50 + (close - open) / open * 800 + Math.sin(i * 0.6) * 18));

      const macd = (close - sma20) * 0.8;
      const macdSignal = macd * 0.75;
      const macdHist = macd - macdSignal;

      const dateStr = timeframe === '1D' || timeframe === '1W' || timeframe === '1Y'
        ? `Day ${i + 1}`
        : `${9 + Math.floor(i / 6)}:${((i % 6) * 10).toString().padStart(2, '0')}`;

      list.push({
        time: dateStr,
        open,
        high,
        low,
        close,
        volume,
        sma20,
        sma50,
        ema9,
        bollingerUpper,
        bollingerLower,
        vwap,
        rsi,
        macd,
        macdSignal,
        macdHist
      });
    }
    return list;
  }, [asset.price, timeframe]);

  // Probability Cone Geometry & Calculations
  const spotPrice = asset.price;
  const candleEndRatio = showProbabilityCone ? 0.66 : 0.98; // Candles take left 66% if cone is active
  const coneStartRatio = 0.66;
  const coneEndRatio = 0.91; // Leave room on right for Gaussian Bell Curve distribution
  const bellCurveWidth = 75; // SVG coordinate width for vertical normal distribution curve

  // Compute Probability Cone Steps across future projection
  const coneSteps: ConeStep[] = useMemo(() => {
    const steps: ConeStep[] = [];
    const count = 14;
    const sigma = coneIvInput / 100;

    for (let i = 0; i <= count; i++) {
      const progress = i / count;
      const day = progress * coneDays;
      const timeFraction = Math.max(0.0001, day / 365);
      
      const move1Sigma = spotPrice * sigma * Math.sqrt(timeFraction);
      const move2Sigma = move1Sigma * 2.0;
      const move3Sigma = move1Sigma * 3.0;

      const upper3Sigma = spotPrice + move3Sigma;
      const upper2Sigma = spotPrice + move2Sigma;
      const upper1Sigma = spotPrice + move1Sigma;
      const mean = spotPrice;
      const lower1Sigma = spotPrice - move1Sigma;
      const lower2Sigma = spotPrice - move2Sigma;
      const lower3Sigma = spotPrice - move3Sigma;

      const x = 1000 * (coneStartRatio + progress * (coneEndRatio - coneStartRatio));

      steps.push({
        day: Number(day.toFixed(0)),
        x,
        upper3Sigma,
        upper2Sigma,
        upper1Sigma,
        mean,
        lower1Sigma,
        lower2Sigma,
        lower3Sigma
      });
    }
    return steps;
  }, [spotPrice, coneDays, coneIvInput, coneStartRatio, coneEndRatio]);

  // Overall Min / Max for scaling including cone boundaries
  const lastCone = coneSteps[coneSteps.length - 1];
  const minPrice = useMemo(() => {
    const candleMin = Math.min(...candles.map(c => Math.min(c.low, c.bollingerLower)));
    if (!showProbabilityCone) return candleMin * 0.995;
    const coneMin = show3Sigma ? lastCone.lower3Sigma : lastCone.lower2Sigma;
    return Math.min(candleMin, coneMin) * 0.98;
  }, [candles, showProbabilityCone, show3Sigma, lastCone]);

  const maxPrice = useMemo(() => {
    const candleMax = Math.max(...candles.map(c => Math.max(c.high, c.bollingerUpper)));
    if (!showProbabilityCone) return candleMax * 1.005;
    const coneMax = show3Sigma ? lastCone.upper3Sigma : lastCone.upper2Sigma;
    return Math.max(candleMax, coneMax) * 1.02;
  }, [candles, showProbabilityCone, show3Sigma, lastCone]);

  const priceSpan = Math.max(1, maxPrice - minPrice);

  // Active Candle under crosshair or last candle
  const activeCandle = hoverIndex !== null ? candles[hoverIndex] : candles[candles.length - 1];

  // Fibonacci Levels
  const fiboHigh = Math.max(...candles.map(c => c.high));
  const fiboLow = Math.min(...candles.map(c => c.low));
  const fiboDiff = fiboHigh - fiboLow;
  const fiboLevels = [
    { label: '0.0%', price: fiboHigh },
    { label: '38.2%', price: fiboHigh - fiboDiff * 0.382 },
    { label: '50.0%', price: fiboHigh - fiboDiff * 0.500 },
    { label: '61.8%', price: fiboHigh - fiboDiff * 0.618 },
    { label: '100%', price: fiboLow }
  ];

  // Probability Calculator for user-input price using Gaussian Normal CDF
  const probAnalysis = useMemo(() => {
    const sigma = (coneIvInput / 100) * Math.sqrt(coneDays / 365);
    const d1 = (Math.log(spotPrice / probTargetPrice) + 0.5 * Math.pow(sigma, 2)) / (sigma || 0.01);
    const d2 = d1 - sigma;

    // Standard normal CDF approximation (Abramowitz & Stegun formula)
    const cdf = (z: number) => {
      const b1 = 0.31938153;
      const b2 = -0.356563782;
      const b3 = 1.781477937;
      const b4 = -1.821255978;
      const b5 = 1.330274429;
      const p = 0.2316419;
      const c = 0.39894228;
      if (z >= 0.0) {
        const t = 1.0 / (1.0 + p * z);
        return 1.0 - c * Math.exp(-z * z / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
      } else {
        const t = 1.0 / (1.0 - p * z);
        return c * Math.exp(-z * z / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
      }
    };

    const isAbove = probTargetPrice >= spotPrice;
    const probITM = isAbove ? (1 - cdf(d2)) * 100 : cdf(d2) * 100;
    const probTouch = Math.min(99.9, probITM * 1.85);

    return {
      probITM: Math.max(0.1, Math.min(99.9, probITM)),
      probOTM: Math.max(0.1, Math.min(99.9, 100 - probITM)),
      probTouch: Math.max(0.1, Math.min(99.9, probTouch))
    };
  }, [spotPrice, probTargetPrice, coneIvInput, coneDays]);

  // Click on chart handler to set target price
  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const relativeY = clickY / rect.height; // 0 at top, 1 at bottom
    // Main canvas height runs approx 30 to 330 in viewBox 360
    const priceFraction = (330 - (relativeY * 360)) / 300;
    const clickedPrice = minPrice + priceFraction * priceSpan;
    if (clickedPrice > 0) {
      setProbTargetPrice(Number(clickedPrice.toFixed(2)));
    }
  };

  // Bell Curve Points calculation for terminal distribution on right axis
  const bellCurvePoints = useMemo(() => {
    if (!showProbabilityCone || !showBellCurve) return [];
    const points: { x: number; y: number; price: number }[] = [];
    const steps = 40;
    const sigmaPrice = spotPrice * (coneIvInput / 100) * Math.sqrt(coneDays / 365);
    const startX = lastCone.x;
    const maxBellWidth = bellCurveWidth;

    const spanMin = spotPrice - 3.2 * sigmaPrice;
    const spanMax = spotPrice + 3.2 * sigmaPrice;

    for (let i = 0; i <= steps; i++) {
      const price = spanMin + (i / steps) * (spanMax - spanMin);
      const z = (price - spotPrice) / (sigmaPrice || 1);
      // Gaussian PDF formula: e^(-z^2/2)
      const pdf = Math.exp(-0.5 * z * z);
      const x = startX + pdf * maxBellWidth;
      const y = 330 - ((price - minPrice) / priceSpan) * 300;
      points.push({ x, y, price });
    }
    return points;
  }, [showProbabilityCone, showBellCurve, lastCone, spotPrice, coneIvInput, coneDays, minPrice, priceSpan]);

  return (
    <div className="space-y-2 font-mono text-xs select-none">
      {/* 1. thinkorswim Chart Top Header Controls */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 shadow">
        <div className="flex flex-wrap items-center gap-3">
          {/* Symbol & Link Tag */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-amber-400 text-black font-black text-[10px] flex items-center justify-center font-mono">
              1
            </span>
            <div className="font-sans flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">{asset.symbol}</span>
              {(asset.currency === 'CAD' || asset.symbol.endsWith('.TO')) && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/15 text-red-300 border border-red-500/30 font-bold font-mono">
                  {asset.exchange || 'TSX'} LIVE
                </span>
              )}
              <span className="text-slate-400 text-xs hidden sm:inline">{asset.name}</span>
            </div>
          </div>

          <span className="text-slate-600">|</span>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
            {(['1m', '5m', '15m', '1h', '1D', '1W', '1Y'] as Timeframe[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  timeframe === tf ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <span className="text-slate-600 hidden md:inline">|</span>

          {/* Chart Style Selector */}
          <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
            {(['CANDLE', 'OHLC', 'LINE', 'AREA', 'HEIKIN_ASHI'] as ChartType[]).map(ct => (
              <button
                key={ct}
                onClick={() => setChartType(ct)}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  chartType === ct ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {ct === 'HEIKIN_ASHI' ? 'Heikin' : ct}
              </button>
            ))}
          </div>
        </div>

        {/* Right Study Buttons with PROBABILITY CONE */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {/* Probability Cone Toggle */}
          <button
            onClick={() => setShowProbabilityCone(!showProbabilityCone)}
            className={`px-2.5 py-1 rounded font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              showProbabilityCone
                ? 'bg-[#1c2128] text-amber-400 border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-transparent text-slate-400 border-[#21262d] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Probability Cone (1σ / 2σ / 3σ)</span>
          </button>

          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-2 py-0.5 rounded font-bold border transition-colors ${
              showSMA20 ? 'bg-[#161b22] text-[#f59e0b] border-amber-500/40' : 'bg-transparent text-slate-500 border-[#21262d]'
            }`}
          >
            SMA 20
          </button>

          <button
            onClick={() => setShowVWAP(!showVWAP)}
            className={`px-2 py-0.5 rounded font-bold border transition-colors ${
              showVWAP ? 'bg-[#161b22] text-[#00c076] border-emerald-500/40' : 'bg-transparent text-slate-500 border-[#21262d]'
            }`}
          >
            VWAP
          </button>

          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2 py-0.5 rounded font-bold border transition-colors ${
              showBollinger ? 'bg-[#161b22] text-[#a855f7] border-purple-500/40' : 'bg-transparent text-slate-500 border-[#21262d]'
            }`}
          >
            Bollinger ±2σ
          </button>

          <button
            onClick={() => setShowFibo(!showFibo)}
            className={`px-2 py-0.5 rounded font-bold border transition-colors ${
              showFibo ? 'bg-[#161b22] text-rose-400 border-rose-500/40' : 'bg-transparent text-slate-500 border-[#21262d]'
            }`}
          >
            Fibonacci
          </button>

          <span className="text-slate-600">|</span>

          <button
            onClick={() => setShowActiveTraderDock(!showActiveTraderDock)}
            className={`px-2 py-0.5 rounded font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showActiveTraderDock
                ? 'bg-[#1c2128] text-amber-400 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'bg-transparent text-slate-400 border-[#21262d] hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3 text-amber-400" />
            <span>Active Trader (DOM)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c076] animate-pulse"></span>
          </button>
        </div>
      </div>

      {/* 2. Probability Cone Parameters Toolbar (When Cone is Active) */}
      {showProbabilityCone && (
        <div className="bg-[#121620] border border-amber-500/30 rounded-lg px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-in fade-in">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Probability Cone Engine:</span>
            </div>

            {/* Cone Days Horizon */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400 font-sans text-[11px]">Horizon:</span>
              <div className="flex items-center bg-[#1c2128] rounded border border-[#30363d] p-0.5">
                {[7, 14, 30, 45, 60, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setConeDays(d)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      coneDays === d ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            {/* Implied Volatility Input with Steppers */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400 font-sans text-[11px]">IV (σ):</span>
              <div className="flex items-center bg-[#1c2128] border border-[#30363d] rounded">
                <button
                  onClick={() => setConeIvInput(prev => Math.max(5, prev - 1))}
                  className="px-1.5 py-0.5 text-slate-400 hover:text-white"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max="180"
                  value={coneIvInput}
                  onChange={e => setConeIvInput(parseFloat(e.target.value) || 30)}
                  className="w-12 bg-transparent text-white font-bold text-center focus:outline-none"
                />
                <span className="text-slate-400 pr-1 text-[11px]">%</span>
                <button
                  onClick={() => setConeIvInput(prev => Math.min(180, prev + 1))}
                  className="px-1.5 py-0.5 text-slate-400 hover:text-white"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Expected Move Metric */}
            <div className="flex items-baseline gap-1 text-slate-300">
              <span className="text-slate-400 font-sans text-[11px]">Expected 1σ Move:</span>
              <span className="text-[#00c076] font-bold">
                ±${(lastCone.upper1Sigma - spotPrice).toFixed(2)} ({(((lastCone.upper1Sigma - spotPrice) / spotPrice) * 100).toFixed(1)}%)
              </span>
            </div>

            {/* Underlying Put/Call Sentiment Tag */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#090d11] px-2 py-0.5 rounded border border-[#1c2128]">
              <span className="text-slate-400 font-sans text-[11px]">Put/Call Ratio:</span>
              <span className={`font-bold ${
                asset.symbol === 'NVDA' ? 'text-[#00c076]' : asset.symbol.endsWith('.TO') ? 'text-[#00c076]' : 'text-amber-400'
              }`}>
                {asset.symbol === 'NVDA' ? '0.74' : asset.symbol.endsWith('.TO') ? '0.68' : '0.82'}
              </span>
              <span className="text-[9px] px-1 py-0.1 rounded font-bold bg-[#00c076]/15 text-[#00c076] border border-[#00c076]/30">
                {asset.symbol === 'NVDA' || asset.symbol.endsWith('.TO') ? 'BULLISH SKEW' : 'NEUTRAL'}
              </span>
            </div>
          </div>

          {/* Sigma Bands Toggles */}
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setShow3Sigma(!show3Sigma)}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                show3Sigma ? 'bg-[#1c2128] text-sky-400 border-sky-500/40' : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              <span className="w-2.5 h-0.5 bg-sky-400"></span> 3σ (99.7%)
            </button>

            <span className="text-purple-400 flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-purple-400"></span> 2σ (95.4%)
            </span>

            <span className="text-[#00c076] flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#00c076]"></span> 1σ (68.3%)
            </span>

            <button
              onClick={() => setShowBellCurve(!showBellCurve)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                showBellCurve ? 'bg-[#1c2128] text-amber-400 border-amber-500/40' : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              Bell Curve PDF
            </button>
          </div>
        </div>
      )}

      {/* 3. Real-Time HUD Bar */}
      <div className="bg-[#12161f] border border-[#21262d] px-3 py-1.5 rounded-lg flex flex-wrap items-center justify-between text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-400 font-sans">
            T: <strong className="text-white">{activeCandle.time}</strong>
          </span>
          <span>
            O: <strong className="text-white">${activeCandle.open.toFixed(2)}</strong>
          </span>
          <span>
            H: <strong className="text-[#00c076]">${activeCandle.high.toFixed(2)}</strong>
          </span>
          <span>
            L: <strong className="text-[#ff3b57]">${activeCandle.low.toFixed(2)}</strong>
          </span>
          <span>
            C: <strong className="text-white">${activeCandle.close.toFixed(2)}</strong>
          </span>
          <span>
            Vol: <strong className="text-slate-300">{(activeCandle.volume / 1000).toFixed(1)}k</strong>
          </span>
          {lowerIndicator === 'RSI' && (
            <span>
              RSI: <strong className="text-cyan-400">{activeCandle.rsi.toFixed(1)}</strong>
            </span>
          )}
          {lowerIndicator === 'MACD' && (
            <span>
              MACD: <strong className="text-indigo-400">{activeCandle.macd.toFixed(2)}</strong>
            </span>
          )}
        </div>

        {/* Quick Trade on Chart */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onPopulateOrder(asset.symbol, 'BUY', asset.price)}
            className="px-2.5 py-1 bg-[#102018] hover:bg-[#142f22] text-[#00c076] border border-[#00c076]/40 rounded text-[11px] font-bold cursor-pointer"
          >
            BUY MKT
          </button>
          <button
            onClick={() => onPopulateOrder(asset.symbol, 'SELL', asset.price)}
            className="px-2.5 py-1 bg-[#1f1518] hover:bg-[#2e191e] text-[#ff3b57] border border-[#ff3b57]/40 rounded text-[11px] font-bold cursor-pointer"
          >
            SELL MKT
          </button>
        </div>
      </div>

      {/* 4. Chart Area & Optional Active Trader DOM Dock */}
      <div className={showActiveTraderDock ? "grid grid-cols-1 xl:grid-cols-12 gap-3" : ""}>
        <div className={showActiveTraderDock ? "xl:col-span-8 space-y-3" : "space-y-3"}>
          {/* Main Chart Canvas with Probability Cone & Bell Curve */}
          <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 shadow space-y-2">
        <div className="h-[430px] w-full bg-[#090d11] rounded border border-[#1c2128] p-2 relative flex flex-col justify-between">
          <svg
            className="w-full h-full overflow-visible cursor-crosshair"
            viewBox="0 0 1000 360"
            preserveAspectRatio="none"
            onClick={handleChartClick}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Price Horizontal Gridlines */}
            {[0, 72, 144, 216, 288, 360].map(y => (
              <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#1c2128" strokeDasharray="3 3" />
            ))}

            {/* Fibonacci Levels Overlay */}
            {showFibo && (
              <g>
                {fiboLevels.map((fib, idx) => {
                  const y = 330 - ((fib.price - minPrice) / priceSpan) * 300;
                  return (
                    <g key={idx}>
                      <line x1="0" y1={y} x2="1000" y2={y} stroke="rgba(244,63,94,0.3)" strokeDasharray="4 2" />
                      <text x="5" y={y - 3} fill="#fb7185" fontSize="9" fontFamily="monospace">
                        Fib {fib.label} (${fib.price.toFixed(2)})
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* PROBABILITY CONE OVERLAY */}
            {showProbabilityCone && (
              <g>
                {/* 3-Sigma Outer Cone Shaded Area (99.7% Probability) */}
                {show3Sigma && (
                  <>
                    <path
                      d={`${coneSteps
                        .map((s, idx) => {
                          const y = 330 - ((s.upper3Sigma - minPrice) / priceSpan) * 300;
                          return `${idx === 0 ? 'M' : 'L'} ${s.x} ${y}`;
                        })
                        .join(' ')} ${coneSteps
                        .slice()
                        .reverse()
                        .map((s) => {
                          const y = 330 - ((s.lower3Sigma - minPrice) / priceSpan) * 300;
                          return `L ${s.x} ${y}`;
                        })
                        .join(' ')} Z`}
                      fill="rgba(56, 189, 248, 0.08)"
                    />
                    <path
                      d={coneSteps
                        .map((s, idx) => {
                          const y = 330 - ((s.upper3Sigma - minPrice) / priceSpan) * 300;
                          return `${idx === 0 ? 'M' : 'L'} ${s.x} ${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeDasharray="6 3"
                    />
                    <path
                      d={coneSteps
                        .map((s, idx) => {
                          const y = 330 - ((s.lower3Sigma - minPrice) / priceSpan) * 300;
                          return `${idx === 0 ? 'M' : 'L'} ${s.x} ${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeDasharray="6 3"
                    />
                  </>
                )}

                {/* 2-Sigma Outer Cone Shaded Area (95.4% Probability) */}
                <path
                  d={`${coneSteps
                    .map((s, idx) => {
                      const y = 330 - ((s.upper2Sigma - minPrice) / priceSpan) * 300;
                      return `${idx === 0 ? 'M' : 'L'} ${s.x} ${y}`;
                    })
                    .join(' ')} ${coneSteps
                    .slice()
                    .reverse()
                    .map((s) => {
                      const y = 330 - ((s.lower2Sigma - minPrice) / priceSpan) * 300;
                      return `L ${s.x} ${y}`;
                    })
                    .join(' ')} Z`}
                  fill="rgba(168, 85, 247, 0.12)"
                />

                {/* 1-Sigma Inner Cone Shaded Area (68.3% Probability) */}
                <path
                  d={`${coneSteps
                    .map((s, idx) => {
                      const y = 330 - ((s.upper1Sigma - minPrice) / priceSpan) * 300;
                      return `${idx === 0 ? 'M' : 'L'} ${s.x} ${y}`;
                    })
                    .join(' ')} ${coneSteps
                    .slice()
                    .reverse()
                    .map((s) => {
                      const y = 330 - ((s.lower1Sigma - minPrice) / priceSpan) * 300;
                      return `L ${s.x} ${y}`;
                    })
                    .join(' ')} Z`}
                  fill="rgba(0, 192, 118, 0.18)"
                />

                {/* +2 Sigma Boundary Curve */}
                <path
                  d={coneSteps
                    .map((s, idx) => {
                      const y = 330 - ((s.upper2Sigma - minPrice) / priceSpan) * 300;
                      return `${idx === 0 ? 'M' : 'L'} ${s.x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />

                {/* +1 Sigma Boundary Curve */}
                <path
                  d={coneSteps
                    .map((s, idx) => {
                      const y = 330 - ((s.upper1Sigma - minPrice) / priceSpan) * 300;
                      return `${idx === 0 ? 'M' : 'L'} ${s.x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#00c076"
                  strokeWidth="2"
                />

                {/* Mean / Expected Trajectory Line */}
                <path
                  d={coneSteps
                    .map((s, idx) => {
                      const y = 330 - ((s.mean - minPrice) / priceSpan) * 300;
                      return `${idx === 0 ? 'M' : 'L'} ${s.x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {/* -1 Sigma Boundary Curve */}
                <path
                  d={coneSteps
                    .map((s, idx) => {
                      const y = 330 - ((s.lower1Sigma - minPrice) / priceSpan) * 300;
                      return `${idx === 0 ? 'M' : 'L'} ${s.x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#00c076"
                  strokeWidth="2"
                />

                {/* -2 Sigma Boundary Curve */}
                <path
                  d={coneSteps
                    .map((s, idx) => {
                      const y = 330 - ((s.lower2Sigma - minPrice) / priceSpan) * 300;
                      return `${idx === 0 ? 'M' : 'L'} ${s.x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />

                {/* GAUSSIAN BELL CURVE PDF ON RIGHT MARGIN */}
                {showBellCurve && bellCurvePoints.length > 0 && (
                  <g>
                    {/* Shaded Bell Curve Area */}
                    <path
                      d={`M ${lastCone.x} ${bellCurvePoints[0].y} ${bellCurvePoints
                        .map(p => `L ${p.x} ${p.y}`)
                        .join(' ')} L ${lastCone.x} ${bellCurvePoints[bellCurvePoints.length - 1].y} Z`}
                      fill="rgba(245, 158, 11, 0.12)"
                    />
                    {/* Bell Curve Contour Line */}
                    <path
                      d={bellCurvePoints
                        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                        .join(' ')}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.8"
                    />
                    {/* Peak Marker */}
                    {(() => {
                      const peakY = 330 - ((spotPrice - minPrice) / priceSpan) * 300;
                      return (
                        <circle cx={lastCone.x + bellCurveWidth} cy={peakY} r="3" fill="#f59e0b" />
                      );
                    })()}
                  </g>
                )}

                {/* Terminal Price Markers on Right Edge */}
                {(() => {
                  const x = lastCone.x + (showBellCurve ? 12 : -4);
                  const y3U = 330 - ((lastCone.upper3Sigma - minPrice) / priceSpan) * 300;
                  const y2U = 330 - ((lastCone.upper2Sigma - minPrice) / priceSpan) * 300;
                  const y1U = 330 - ((lastCone.upper1Sigma - minPrice) / priceSpan) * 300;
                  const yM = 330 - ((lastCone.mean - minPrice) / priceSpan) * 300;
                  const y1L = 330 - ((lastCone.lower1Sigma - minPrice) / priceSpan) * 300;
                  const y2L = 330 - ((lastCone.lower2Sigma - minPrice) / priceSpan) * 300;
                  const y3L = 330 - ((lastCone.lower3Sigma - minPrice) / priceSpan) * 300;

                  return (
                    <g>
                      {/* +3 Sigma Label */}
                      {show3Sigma && (
                        <g>
                          <rect x={x} y={y3U - 8} width="78" height="15" fill="#161b22" rx="2" stroke="#38bdf8" />
                          <text x={x + 4} y={y3U + 3} fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                            +3σ ${lastCone.upper3Sigma.toFixed(1)}
                          </text>
                        </g>
                      )}

                      {/* +2 Sigma Label */}
                      <rect x={x} y={y2U - 8} width="78" height="15" fill="#161b22" rx="2" stroke="#c084fc" />
                      <text x={x + 4} y={y2U + 3} fill="#c084fc" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        +2σ ${lastCone.upper2Sigma.toFixed(1)}
                      </text>

                      {/* +1 Sigma Label */}
                      <rect x={x} y={y1U - 8} width="78" height="15" fill="#161b22" rx="2" stroke="#00c076" />
                      <text x={x + 4} y={y1U + 3} fill="#00c076" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        +1σ ${lastCone.upper1Sigma.toFixed(1)}
                      </text>

                      {/* Mean Label */}
                      <rect x={x} y={yM - 8} width="78" height="15" fill="#1c2128" rx="2" stroke="#f59e0b" />
                      <text x={x + 4} y={yM + 3} fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        Spot ${spotPrice.toFixed(1)}
                      </text>

                      {/* -1 Sigma Label */}
                      <rect x={x} y={y1L - 8} width="78" height="15" fill="#161b22" rx="2" stroke="#00c076" />
                      <text x={x + 4} y={y1L + 3} fill="#00c076" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        -1σ ${lastCone.lower1Sigma.toFixed(1)}
                      </text>

                      {/* -2 Sigma Label */}
                      <rect x={x} y={y2L - 8} width="78" height="15" fill="#161b22" rx="2" stroke="#c084fc" />
                      <text x={x + 4} y={y2L + 3} fill="#c084fc" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        -2σ ${lastCone.lower2Sigma.toFixed(1)}
                      </text>

                      {/* -3 Sigma Label */}
                      {show3Sigma && (
                        <g>
                          <rect x={x} y={y3L - 8} width="78" height="15" fill="#161b22" rx="2" stroke="#38bdf8" />
                          <text x={x + 4} y={y3L + 3} fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                            -3σ ${lastCone.lower3Sigma.toFixed(1)}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })()}

                {/* Vertical TODAY / EXPIRATION Partition Line */}
                <line x1={coneSteps[0].x} y1="0" x2={coneSteps[0].x} y2="360" stroke="#f59e0b" strokeDasharray="3 3" />
                <text x={coneSteps[0].x + 5} y="15" fill="#f59e0b" fontSize="9" fontFamily="monospace">
                  TODAY (NOW)
                </text>
                <text x={lastCone.x - 70} y="15" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  +{coneDays}D EXPIRY
                </text>
              </g>
            )}

            {/* Target Price Guide Line */}
            {(() => {
              const targetY = 330 - ((probTargetPrice - minPrice) / priceSpan) * 300;
              return (
                <g>
                  <line x1="0" y1={targetY} x2="1000" y2={targetY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
                  <rect x="10" y={targetY - 10} width="160" height="20" fill="#1c2128" rx="3" stroke="#f59e0b" />
                  <text x="16" y={targetY + 4} fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Target: ${probTargetPrice.toFixed(2)} ({probAnalysis.probITM.toFixed(1)}% ITM)
                  </text>
                </g>
              );
            })()}

            {/* SMA 20 Overlay */}
            {showSMA20 && (
              <path
                d={candles
                  .map((c, idx) => {
                    const x = (idx / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20;
                    const y = 330 - ((c.sma20 - minPrice) / priceSpan) * 300;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
              />
            )}

            {/* VWAP Overlay */}
            {showVWAP && (
              <path
                d={candles
                  .map((c, idx) => {
                    const x = (idx / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20;
                    const y = 330 - ((c.vwap - minPrice) / priceSpan) * 300;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#00c076"
                strokeWidth="1.8"
                strokeDasharray="2 2"
              />
            )}

            {/* Candlesticks */}
            {chartType === 'CANDLE' || chartType === 'HEIKIN_ASHI' ? (
              <g>
                {candles.map((c, idx) => {
                  const x = (idx / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20;
                  const openY = 330 - ((c.open - minPrice) / priceSpan) * 300;
                  const closeY = 330 - ((c.close - minPrice) / priceSpan) * 300;
                  const highY = 330 - ((c.high - minPrice) / priceSpan) * 300;
                  const lowY = 330 - ((c.low - minPrice) / priceSpan) * 300;
                  const isGreen = c.close >= c.open;
                  const candleWidth = showProbabilityCone ? 8 : 12;

                  return (
                    <g key={idx}>
                      <line x1={x} y1={highY} x2={x} y2={lowY} stroke={isGreen ? '#00c076' : '#ff3b57'} strokeWidth="1.5" />
                      <rect
                        x={x - candleWidth / 2}
                        y={Math.min(openY, closeY)}
                        width={candleWidth}
                        height={Math.max(Math.abs(closeY - openY), 3)}
                        fill={isGreen ? '#00c076' : '#ff3b57'}
                        stroke={isGreen ? '#00c076' : '#ff3b57'}
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}
              </g>
            ) : (
              /* LINE / AREA */
              <path
                d={candles
                  .map((c, idx) => {
                    const x = (idx / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20;
                    const y = 330 - ((c.close - minPrice) / priceSpan) * 300;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#00c076"
                strokeWidth="2.5"
              />
            )}

            {/* Crosshair on Hover */}
            {hoverIndex !== null && (
              <g>
                <line
                  x1={(hoverIndex / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20}
                  y1="0"
                  x2={(hoverIndex / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20}
                  y2="360"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              </g>
            )}

            {/* Invisible hover regions for Candlesticks */}
            {candles.map((_, idx) => (
              <rect
                key={idx}
                x={(idx / candles.length) * (1000 * candleEndRatio)}
                y="0"
                width={(1000 * candleEndRatio) / candles.length}
                height="360"
                fill="transparent"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            ))}
          </svg>
        </div>

        {/* 5. Lower Indicator Sub-Chart Panel (Volume / RSI / MACD) */}
        <div className="bg-[#090d11] rounded border border-[#1c2128] p-2 space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans text-[11px]">Lower Study:</span>
              <div className="flex items-center bg-[#161b22] rounded border border-[#21262d] p-0.5 text-[10px]">
                {(['RSI', 'MACD', 'VOLUME'] as LowerIndicator[]).map(ind => (
                  <button
                    key={ind}
                    onClick={() => setLowerIndicator(ind)}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      lowerIndicator === ind ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {ind === 'VOLUME' ? 'Volume (20 SMA)' : ind === 'RSI' ? 'RSI (14)' : 'MACD (12, 26, 9)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              {lowerIndicator === 'RSI' && (
                <span>
                  Overbought: <strong className="text-rose-400">70</strong> · Oversold: <strong className="text-emerald-400">30</strong>
                </span>
              )}
              {lowerIndicator === 'MACD' && (
                <span>
                  MACD: <strong className="text-sky-400">Blue</strong> · Signal: <strong className="text-amber-400">Orange</strong> · Hist: <strong className="text-emerald-400">Bars</strong>
                </span>
              )}
              {lowerIndicator === 'VOLUME' && (
                <span>
                  Green: <strong className="text-[#00c076]">Buy</strong> · Red: <strong className="text-[#ff3b57]">Sell</strong> · Yellow: <strong className="text-amber-400">20 SMA</strong>
                </span>
              )}
            </div>
          </div>

          <div className="h-24 w-full bg-[#0d1117] rounded border border-[#1c2128] p-1.5 relative">
            <svg className="w-full h-full" viewBox="0 0 1000 80" preserveAspectRatio="none">
              {/* Lower Indicator Gridlines */}
              <line x1="0" y1="20" x2="1000" y2="20" stroke="#1c2128" strokeDasharray="2 2" />
              <line x1="0" y1="40" x2="1000" y2="40" stroke="#1c2128" strokeDasharray="2 2" />
              <line x1="0" y1="60" x2="1000" y2="60" stroke="#1c2128" strokeDasharray="2 2" />

              {/* RSI Sub-Chart */}
              {lowerIndicator === 'RSI' && (
                <g>
                  {/* 70 Overbought Line */}
                  <line x1="0" y1="24" x2="1000" y2="24" stroke="#ff3b57" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <text x="5" y="22" fill="#ff3b57" fontSize="8" fontFamily="monospace">70 OB</text>

                  {/* 50 Midline */}
                  <line x1="0" y1="40" x2="1000" y2="40" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />

                  {/* 30 Oversold Line */}
                  <line x1="0" y1="56" x2="1000" y2="56" stroke="#00c076" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <text x="5" y="66" fill="#00c076" fontSize="8" fontFamily="monospace">30 OS</text>

                  {/* RSI Curve */}
                  <path
                    d={candles
                      .map((c, idx) => {
                        const x = (idx / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20;
                        const y = 80 - (c.rsi / 100) * 80;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2"
                  />
                </g>
              )}

              {/* MACD Sub-Chart */}
              {lowerIndicator === 'MACD' && (
                <g>
                  {/* Zero Line */}
                  <line x1="0" y1="40" x2="1000" y2="40" stroke="#475569" strokeWidth="1" />

                  {/* MACD Histogram Bars */}
                  {candles.map((c, idx) => {
                    const x = (idx / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20;
                    const barHeight = Math.min(35, Math.abs(c.macdHist) * 4);
                    const isGreen = c.macdHist >= 0;
                    const y = isGreen ? 40 - barHeight : 40;

                    return (
                      <rect
                        key={idx}
                        x={x - 3}
                        y={y}
                        width="6"
                        height={Math.max(barHeight, 1)}
                        fill={isGreen ? '#00c076' : '#ff3b57'}
                        opacity="0.8"
                      />
                    );
                  })}

                  {/* MACD Fast Line */}
                  <path
                    d={candles
                      .map((c, idx) => {
                        const x = (idx / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20;
                        const y = 40 - c.macd * 3.5;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                  />

                  {/* MACD Signal Line */}
                  <path
                    d={candles
                      .map((c, idx) => {
                        const x = (idx / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20;
                        const y = 40 - c.macdSignal * 3.5;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                </g>
              )}

              {/* Volume Sub-Chart */}
              {lowerIndicator === 'VOLUME' && (
                <g>
                  {/* Volume Bars */}
                  {candles.map((c, idx) => {
                    const x = (idx / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20;
                    const maxVol = Math.max(...candles.map(item => item.volume));
                    const barHeight = (c.volume / maxVol) * 65;
                    const isGreen = c.close >= c.open;

                    return (
                      <rect
                        key={idx}
                        x={x - 4}
                        y={80 - barHeight}
                        width="8"
                        height={barHeight}
                        fill={isGreen ? '#00c076' : '#ff3b57'}
                        opacity="0.75"
                      />
                    );
                  })}

                  {/* 20 SMA Volume Overlay */}
                  <path
                    d={candles
                      .map((_, idx) => {
                        const x = (idx / (candles.length - 1)) * (1000 * candleEndRatio - 20) + 20;
                        const slice = candles.slice(Math.max(0, idx - 15), idx + 1);
                        const avgVol = slice.reduce((a, b) => a + b.volume, 0) / slice.length;
                        const maxVol = Math.max(...candles.map(item => item.volume));
                        const y = 80 - (avgVol / maxVol) * 65;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* 6. Probability Target Calculator Tool (thinkorswim Probability Analysis Tool) */}
        <div className="bg-[#090d11] rounded border border-[#1c2128] p-3 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1c2128]">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Gaussian Probability of Target Price Calculator
              </span>
              <span className="text-slate-500 font-sans hidden sm:inline">· Click on chart to place target level</span>
            </div>
            <span className="text-amber-400 font-bold">Horizon: {coneDays} Days Ahead ({coneIvInput}% IV)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            {/* Target Price Input */}
            <div className="space-y-1">
              <label className="text-slate-400 font-sans text-[11px] flex justify-between">
                <span>Price Target Level:</span>
                <span className="text-amber-400 font-mono">
                  {probTargetPrice >= spotPrice ? '+' : ''}{(((probTargetPrice - spotPrice) / spotPrice) * 100).toFixed(1)}%
                </span>
              </label>
              <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded px-2 py-1">
                <span className="text-slate-500 mr-1">$</span>
                <input
                  type="number"
                  step="0.5"
                  value={probTargetPrice}
                  onChange={e => setProbTargetPrice(parseFloat(e.target.value) || spotPrice)}
                  className="w-full bg-transparent text-white font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Probability of Touching (POT) */}
            <div className="bg-[#12161f] p-2 rounded border border-[#1c2128] text-center">
              <div className="text-slate-400 text-[10px] font-sans">Probability of Touch (POT)</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">
                {probAnalysis.probTouch.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 font-sans">Touches strike before expiry</div>
            </div>

            {/* Probability of Expiring In The Money (ITM) */}
            <div className="bg-[#12161f] p-2 rounded border border-[#1c2128] text-center">
              <div className="text-slate-400 text-[10px] font-sans">Probability of Expiring ITM</div>
              <div className="text-base font-bold text-[#00c076] mt-0.5">
                {probAnalysis.probITM.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 font-sans">Finishes beyond level</div>
            </div>

            {/* Probability of Expiring Out of The Money (OTM) */}
            <div className="bg-[#12161f] p-2 rounded border border-[#1c2128] text-center">
              <div className="text-slate-400 text-[10px] font-sans">Probability of Expiring OTM</div>
              <div className="text-base font-bold text-sky-400 mt-0.5">
                {probAnalysis.probOTM.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 font-sans">Fails to finish beyond level</div>
            </div>
          </div>
        </div>
      </div>
        </div>

        {/* Right Active Trader DOM Dock */}
        {showActiveTraderDock && (
          <div className="xl:col-span-4 bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5 space-y-2 h-fit">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#21262d] text-xs font-mono">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Active Trader Dock ({asset.symbol})</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00c076] animate-pulse"></span>
              </span>
              <button
                onClick={() => setShowActiveTraderDock(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Close Active Trader Dock"
              >
                ✕
              </button>
            </div>
            <TosMarketDepthView
              asset={asset}
              assets={assets}
              onSelectSymbol={onSelectSymbol}
              onPopulateOrder={onPopulateOrder}
              cashBalance={100000}
              compact={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
