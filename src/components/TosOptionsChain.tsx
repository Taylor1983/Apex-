import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Activity,
  Table,
  Eye,
  Sliders,
  Maximize2,
  Calendar,
  Percent,
  CheckCircle2,
  Crosshair
} from 'lucide-react';
import { Asset, OptionExpirationSeries, OptionStrikeRow, OrderSide, OptionSpreadDetails, OptionSpreadLeg } from '../types';
import { generateOptionsChainForAsset } from '../data/optionsAndMacroData';

interface TosOptionsChainProps {
  asset: Asset;
  onPopulateOptionOrder: (
    symbol: string,
    side: OrderSide,
    strike: number,
    expiration: string,
    optionType: 'CALL' | 'PUT',
    price: number
  ) => void;
  onPopulateSpreadOrder?: (order: {
    symbol: string;
    side: OrderSide;
    price: number;
    optionSpreadDetails: OptionSpreadDetails;
    isSimulated?: boolean;
  }) => void;
}

type ChainViewMode = 'CONE_AND_TABLE' | 'CONE_ONLY' | 'TABLE_ONLY';

export const TosOptionsChain: React.FC<TosOptionsChainProps> = ({
  asset,
  onPopulateOptionOrder,
  onPopulateSpreadOrder
}) => {
  const [chainViewMode, setChainViewMode] = useState<ChainViewMode>('CONE_AND_TABLE');
  const [spreadType, setSpreadType] = useState<'SINGLE' | 'VERTICAL' | 'STRADDLE' | 'IRON_CONDOR'>('SINGLE');
  const [strikeFilter, setStrikeFilter] = useState<number>(8); // Show 6, 8, 12, or All strikes
  const [showProbColumns, setShowProbColumns] = useState<boolean>(true);
  const [show3Sigma, setShow3Sigma] = useState<boolean>(true);
  const [selectedExpiry, setSelectedExpiry] = useState<string | null>('23 OCT 26');

  // Expanded accordion map
  const [expandedExpiries, setExpandedExpiries] = useState<Record<string, boolean>>({
    '02 OCT 26': false,
    '09 OCT 26': false,
    '16 OCT 26': false,
    '23 OCT 26': true, // Default open monthly front
    '20 NOV 26': false,
    '18 DEC 26': false
  });

  const toggleExpiry = (exp: string) => {
    setExpandedExpiries(prev => ({ ...prev, [exp]: !prev[exp] }));
  };

  // Generate full institutional series of expirations
  const optionSeriesList: OptionExpirationSeries[] = useMemo(() => {
    return generateOptionsChainForAsset(asset.symbol, asset.price);
  }, [asset.symbol, asset.price]);

  const spotPrice = asset.price;
  const maxDte = Math.max(...optionSeriesList.map(s => s.dte));

  // Compute Probability Cone Details for All Expirations
  const expirationsConeData = useMemo(() => {
    return optionSeriesList.map(series => {
      const ivDecimal = series.ivMean / 100;
      const timeFraction = Math.max(0.0001, series.dte / 365);
      const move1Sigma = spotPrice * ivDecimal * Math.sqrt(timeFraction);
      const move2Sigma = move1Sigma * 2.0;
      const move3Sigma = move1Sigma * 3.0;

      const upper1Sigma = spotPrice + move1Sigma;
      const lower1Sigma = Math.max(0.1, spotPrice - move1Sigma);
      const upper2Sigma = spotPrice + move2Sigma;
      const lower2Sigma = Math.max(0.1, spotPrice - move2Sigma);
      const upper3Sigma = spotPrice + move3Sigma;
      const lower3Sigma = Math.max(0.1, spotPrice - move3Sigma);

      // Volume & OI summaries across this expiration
      const totalCallVol = series.strikes.reduce((acc, s) => acc + s.call.volume, 0);
      const totalPutVol = series.strikes.reduce((acc, s) => acc + s.put.volume, 0);
      const totalCallOI = series.strikes.reduce((acc, s) => acc + s.call.openInterest, 0);
      const totalPutOI = series.strikes.reduce((acc, s) => acc + s.put.openInterest, 0);
      const putCallRatio = totalCallVol > 0 ? (totalPutVol / totalCallVol).toFixed(2) : '1.00';
      const putCallOIRatio = totalCallOI > 0 ? (totalPutOI / totalCallOI).toFixed(2) : '1.00';

      return {
        ...series,
        move1Sigma,
        move2Sigma,
        move3Sigma,
        upper1Sigma,
        lower1Sigma,
        upper2Sigma,
        lower2Sigma,
        upper3Sigma,
        lower3Sigma,
        movePct: ((move1Sigma / spotPrice) * 100).toFixed(1),
        totalCallVol,
        totalPutVol,
        totalCallOI,
        totalPutOI,
        putCallRatio,
        putCallOIRatio
      };
    });
  }, [optionSeriesList, spotPrice]);

  // Aggregate Total Put/Call Volume & OI across all series for the active underlying asset
  const aggregateMetrics = useMemo(() => {
    let callVol = 0;
    let putVol = 0;
    let callOI = 0;
    let putOI = 0;

    expirationsConeData.forEach(exp => {
      callVol += exp.totalCallVol;
      putVol += exp.totalPutVol;
      callOI += exp.totalCallOI;
      putOI += exp.totalPutOI;
    });

    const pcrVol = callVol > 0 ? Number((putVol / callVol).toFixed(2)) : 0.85;
    const pcrOI = callOI > 0 ? Number((putOI / callOI).toFixed(2)) : 0.92;

    let sentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH' = 'NEUTRAL';
    if (pcrVol < 0.75) sentiment = 'BULLISH';
    else if (pcrVol > 1.05) sentiment = 'BEARISH';

    return {
      callVol,
      putVol,
      totalVol: callVol + putVol,
      callOI,
      putOI,
      totalOI: callOI + putOI,
      pcrVol,
      pcrOI,
      sentiment
    };
  }, [expirationsConeData]);

  // Overall min and max prices for the all-expirations probability cone chart
  const maxConePrice = Math.max(...expirationsConeData.map(e => (show3Sigma ? e.upper3Sigma : e.upper2Sigma))) * 1.05;
  const minConePrice = Math.min(...expirationsConeData.map(e => (show3Sigma ? e.lower3Sigma : e.lower2Sigma))) * 0.95;
  const conePriceSpan = Math.max(1, maxConePrice - minConePrice);

  // Active hovered or selected expiration
  const activeCone = useMemo(() => {
    return expirationsConeData.find(e => e.expirationDate === selectedExpiry) || expirationsConeData[3];
  }, [expirationsConeData, selectedExpiry]);

  // Normal Distribution CDF for Strike ITM & Touch probability calculation
  const calculateStrikeProbabilities = (strike: number, dte: number, ivPct: number, isCall: boolean) => {
    const sigma = (ivPct / 100) * Math.sqrt(Math.max(1, dte) / 365);
    const d1 = (Math.log(spotPrice / strike) + 0.5 * Math.pow(sigma, 2)) / (sigma || 0.01);
    const d2 = d1 - sigma;

    // Standard normal CDF approximation
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

    const probITM = isCall ? (1 - cdf(d2)) * 100 : cdf(d2) * 100;
    const probTouch = Math.min(99.9, probITM * 1.85);

    return {
      probITM: Number(Math.max(0.1, Math.min(99.9, probITM)).toFixed(1)),
      probTouch: Number(Math.max(0.1, Math.min(99.9, probTouch)).toFixed(1))
    };
  };

  const handleOptionClick = (
    side: OrderSide,
    strike: number,
    expiration: string,
    optionType: 'CALL' | 'PUT',
    price: number,
    allStrikesInSeries: OptionStrikeRow[]
  ) => {
    if (spreadType === 'SINGLE' || !onPopulateSpreadOrder) {
      onPopulateOptionOrder(asset.symbol, side, strike, expiration, optionType, price);
      return;
    }

    const currentIdx = allStrikesInSeries.findIndex(s => s.strike === strike);
    const nextRow = allStrikesInSeries[Math.min(allStrikesInSeries.length - 1, currentIdx + 1)];
    const prevRow = allStrikesInSeries[Math.max(0, currentIdx - 1)];

    if (spreadType === 'VERTICAL') {
      const isCall = optionType === 'CALL';
      const otherStrike = isCall ? (nextRow?.strike || strike + 5) : (prevRow?.strike || strike - 5);
      const otherMid = isCall
        ? (nextRow?.call.last || nextRow?.call.ask || price * 0.6)
        : (prevRow?.put.last || prevRow?.put.ask || price * 0.6);

      const isDebit = side === 'BUY';
      const stratName = isCall
        ? (isDebit ? 'Bull Call Spread' : 'Bear Call Credit Spread')
        : (isDebit ? 'Bear Put Spread' : 'Bull Put Credit Spread');

      const legs: OptionSpreadLeg[] = [
        {
          id: 'leg-1',
          side,
          quantity: 1,
          strike,
          expiration,
          optionType,
          bid: Number((price * 0.98).toFixed(2)),
          ask: Number((price * 1.02).toFixed(2)),
          mid: price
        },
        {
          id: 'leg-2',
          side: side === 'BUY' ? 'SELL' : 'BUY',
          quantity: 1,
          strike: otherStrike,
          expiration,
          optionType,
          bid: Number((otherMid * 0.98).toFixed(2)),
          ask: Number((otherMid * 1.02).toFixed(2)),
          mid: otherMid
        }
      ];

      const netPrice = Number(Math.max(0.1, Math.abs(price - otherMid)).toFixed(2));
      const spreadDetails: OptionSpreadDetails = {
        strategyName: stratName,
        strategyType: 'VERTICAL',
        netDebitOrCredit: isDebit ? 'DEBIT' : 'CREDIT',
        netPrice,
        legs,
        spreadWidth: Math.abs(strike - otherStrike),
        maxProfit: Number((Math.abs(strike - otherStrike) - netPrice).toFixed(2)),
        maxLoss: netPrice,
        breakeven: [isCall ? strike + netPrice : strike - netPrice]
      };

      onPopulateSpreadOrder({
        symbol: asset.symbol,
        side,
        price: netPrice,
        optionSpreadDetails: spreadDetails
      });
    } else if (spreadType === 'STRADDLE') {
      const currentRow = allStrikesInSeries[currentIdx];
      const callMid = currentRow?.call.last || price;
      const putMid = currentRow?.put.last || price;

      const stratName = side === 'BUY' ? 'Long Straddle' : 'Short Straddle';
      const legs: OptionSpreadLeg[] = [
        {
          id: 'leg-1',
          side,
          quantity: 1,
          strike,
          expiration,
          optionType: 'CALL',
          bid: Number((callMid * 0.98).toFixed(2)),
          ask: Number((callMid * 1.02).toFixed(2)),
          mid: callMid
        },
        {
          id: 'leg-2',
          side,
          quantity: 1,
          strike,
          expiration,
          optionType: 'PUT',
          bid: Number((putMid * 0.98).toFixed(2)),
          ask: Number((putMid * 1.02).toFixed(2)),
          mid: putMid
        }
      ];

      const netPrice = Number((callMid + putMid).toFixed(2));
      const spreadDetails: OptionSpreadDetails = {
        strategyName: stratName,
        strategyType: 'STRADDLE',
        netDebitOrCredit: side === 'BUY' ? 'DEBIT' : 'CREDIT',
        netPrice,
        legs,
        maxLoss: side === 'BUY' ? netPrice : 'Undefined',
        breakeven: [strike - netPrice, strike + netPrice]
      };

      onPopulateSpreadOrder({
        symbol: asset.symbol,
        side,
        price: netPrice,
        optionSpreadDetails: spreadDetails
      });
    } else if (spreadType === 'IRON_CONDOR') {
      const putLongRow = allStrikesInSeries[Math.max(0, currentIdx - 2)];
      const putShortRow = allStrikesInSeries[Math.max(0, currentIdx - 1)];
      const callShortRow = allStrikesInSeries[Math.min(allStrikesInSeries.length - 1, currentIdx + 1)];
      const callLongRow = allStrikesInSeries[Math.min(allStrikesInSeries.length - 1, currentIdx + 2)];

      const legs: OptionSpreadLeg[] = [
        {
          id: 'leg-1',
          side: 'BUY',
          quantity: 1,
          strike: putLongRow?.strike || strike - 10,
          expiration,
          optionType: 'PUT',
          bid: 0.8,
          ask: 0.9,
          mid: 0.85
        },
        {
          id: 'leg-2',
          side: 'SELL',
          quantity: 1,
          strike: putShortRow?.strike || strike - 5,
          expiration,
          optionType: 'PUT',
          bid: 2.1,
          ask: 2.2,
          mid: 2.15
        },
        {
          id: 'leg-3',
          side: 'SELL',
          quantity: 1,
          strike: callShortRow?.strike || strike + 5,
          expiration,
          optionType: 'CALL',
          bid: 2.2,
          ask: 2.3,
          mid: 2.25
        },
        {
          id: 'leg-4',
          side: 'BUY',
          quantity: 1,
          strike: callLongRow?.strike || strike + 10,
          expiration,
          optionType: 'CALL',
          bid: 0.9,
          ask: 1.0,
          mid: 0.95
        }
      ];

      const netCredit = 2.60;
      const spreadDetails: OptionSpreadDetails = {
        strategyName: 'Iron Condor',
        strategyType: 'IRON_CONDOR',
        netDebitOrCredit: 'CREDIT',
        netPrice: netCredit,
        legs,
        maxProfit: netCredit * 100,
        maxLoss: (5 - netCredit) * 100,
        breakeven: [strike - 5 - netCredit, strike + 5 + netCredit]
      };

      onPopulateSpreadOrder({
        symbol: asset.symbol,
        side: 'SELL',
        price: netCredit,
        optionSpreadDetails: spreadDetails
      });
    }
  };

  const isCanadianAsset = asset.symbol.endsWith('.TO') || asset.currency === 'CAD';
  const currSym = isCanadianAsset ? 'C$' : '$';

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      {/* Canadian MX (Bourse de Montréal) & CDCC Clearing Banner */}
      {isCanadianAsset && (
        <div className="bg-[#12161f] border border-[#21262d] rounded-lg px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base">🇨🇦</span>
            <span className="text-white font-bold text-xs uppercase tracking-wide">
              Bourse de Montréal (MX) · Canadian Derivatives
            </span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              TMX Quantum XA
            </span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              CDCC Cleared
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span>Currency: <strong className="text-amber-300 font-mono">CAD (C$)</strong></span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-sans">
              CRA Registered Eligible (TFSA / RRSP / RESP)
            </span>
          </div>
        </div>
      )}

      {/* 1. thinkorswim Options Chain Master Control Bar */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 shadow">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-sans font-bold text-white">
            <span className="w-4 h-4 rounded bg-amber-400 text-black font-black text-[10px] flex items-center justify-center font-mono">
              1
            </span>
            <span className="text-base tracking-tight">{asset.symbol} Options Chain</span>
            {isCanadianAsset && (
              <span className="px-1.5 py-0.2 rounded bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-bold font-mono">
                MX / TSX
              </span>
            )}
            <span className="text-slate-400 text-xs font-normal">
              · Spot: {currSym}{asset.price >= 1000 ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : asset.price.toFixed(2)}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          {/* Spread Strategy Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-sans text-[11px]">Strategy:</span>
            <select
              value={spreadType}
              onChange={e => setSpreadType(e.target.value as any)}
              className="bg-[#1c2128] border border-[#30363d] text-white rounded px-2 py-0.5 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="SINGLE">Single (Call / Put)</option>
              <option value="VERTICAL">Vertical Spread</option>
              <option value="STRADDLE">Straddle / Strangle</option>
              <option value="IRON_CONDOR">Iron Condor</option>
            </select>
          </div>

          <span className="text-slate-600 hidden md:inline">|</span>

          {/* Strikes count filter */}
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-sans">
            <span>Strikes:</span>
            <div className="flex items-center bg-[#161b22] rounded border border-[#21262d] p-0.5 font-mono">
              {[6, 8, 12].map(n => (
                <button
                  key={n}
                  onClick={() => setStrikeFilter(n)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    strikeFilter === n ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <span className="text-slate-600 hidden lg:inline">|</span>

          {/* OVERALL AGGREGATE PUT/CALL RATIO & VOLUME SENTIMENT HUD */}
          <div className="hidden lg:flex items-center gap-3 bg-[#12161f] border border-[#21262d] px-2.5 py-1 rounded text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-sans text-[11px]">PCR (Vol):</span>
              <span className={`font-bold ${
                aggregateMetrics.pcrVol < 0.8
                  ? 'text-[#00c076]'
                  : aggregateMetrics.pcrVol > 1.05
                  ? 'text-[#ff3b57]'
                  : 'text-amber-400'
              }`}>
                {aggregateMetrics.pcrVol.toFixed(2)}
              </span>
              <span className={`text-[9px] px-1 py-0.1 rounded font-bold ${
                aggregateMetrics.sentiment === 'BULLISH'
                  ? 'bg-[#00c076]/15 text-[#00c076] border border-[#00c076]/30'
                  : aggregateMetrics.sentiment === 'BEARISH'
                  ? 'bg-[#ff3b57]/15 text-[#ff3b57] border border-[#ff3b57]/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                {aggregateMetrics.sentiment}
              </span>
            </div>

            <span className="text-slate-700">·</span>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span className="font-sans">PCR (OI):</span>
              <span className="text-slate-200 font-bold">{aggregateMetrics.pcrOI.toFixed(2)}</span>
            </div>

            <span className="text-slate-700">·</span>

            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-[#00c076]">Calls: {(aggregateMetrics.callVol / 1000).toFixed(1)}k</span>
              <span className="text-slate-600">/</span>
              <span className="text-[#ff3b57]">Puts: {(aggregateMetrics.putVol / 1000).toFixed(1)}k</span>
            </div>
          </div>
        </div>

        {/* View Mode & Probability Cone Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Probability Columns Toggle */}
          <button
            onClick={() => setShowProbColumns(!showProbColumns)}
            className={`px-2 py-1 rounded border text-[11px] font-bold transition-colors flex items-center gap-1 ${
              showProbColumns ? 'bg-[#1c2128] text-amber-400 border-amber-400/40' : 'text-slate-400 border-[#21262d] hover:text-white'
            }`}
            title="Display Strike Probability ITM and Touch columns"
          >
            <Percent className="w-3 h-3" />
            <span>Prob.ITM / Touch</span>
          </button>

          {/* View Mode Tabs */}
          <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
            <button
              onClick={() => setChainViewMode('CONE_AND_TABLE')}
              className={`px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
                chainViewMode === 'CONE_AND_TABLE' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Cone + Chain</span>
            </button>
            <button
              onClick={() => setChainViewMode('CONE_ONLY')}
              className={`px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
                chainViewMode === 'CONE_ONLY' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3 text-[#00c076]" />
              <span>All Expirations Cone</span>
            </button>
            <button
              onClick={() => setChainViewMode('TABLE_ONLY')}
              className={`px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
                chainViewMode === 'TABLE_ONLY' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3 h-3" />
              <span>Chain Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ALL EXPIRATIONS PROBABILITY CONE TIMELINE SURFACE (When Active) */}
      {(chainViewMode === 'CONE_AND_TABLE' || chainViewMode === 'CONE_ONLY') && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 shadow space-y-3 animate-in fade-in">
          {/* Header of Probability Cone Surface */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#21262d]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00c076] animate-pulse"></div>
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Options Probability Cone · All Expirations Term Structure
              </span>
              <span className="text-slate-400 font-sans text-xs hidden sm:inline">
                ({expirationsConeData.length} active expirations from 2 DTE to 841 DTE)
              </span>
            </div>

            {/* Sigma Toggles & Expected Move Metric */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <button
                onClick={() => setShow3Sigma(!show3Sigma)}
                className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  show3Sigma ? 'bg-[#1c2128] text-sky-400 border-sky-500/40' : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                <span className="w-2 h-0.5 bg-sky-400"></span> 3σ (99.7%)
              </button>

              <span className="text-purple-400 flex items-center gap-1">
                <span className="w-2 h-0.5 bg-purple-400"></span> 2σ (95.4%)
              </span>

              <span className="text-[#00c076] flex items-center gap-1">
                <span className="w-2 h-0.5 bg-[#00c076]"></span> 1σ (68.3%)
              </span>
            </div>
          </div>

          {/* Active Expiration Real-Time HUD */}
          <div className="bg-[#12161f] border border-[#1c2128] px-3 py-2 rounded-lg flex flex-wrap items-center justify-between text-xs font-mono">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <span className="text-slate-300">
                Selected Expiry:{' '}
                <strong className="text-amber-400 font-bold text-sm">{activeCone.expirationDate}</strong>
                <span className="text-slate-400 ml-1">({activeCone.dte} DTE)</span>
              </span>

              <span className="text-slate-300">
                Implied Vol: <strong className="text-[#00c076]">{activeCone.ivMean}%</strong>
              </span>

              <span className="text-slate-300">
                P/C Ratio:{' '}
                <strong className={`font-mono font-bold ${
                  Number(activeCone.putCallRatio) < 0.8
                    ? 'text-[#00c076]'
                    : Number(activeCone.putCallRatio) > 1.05
                    ? 'text-[#ff3b57]'
                    : 'text-amber-400'
                }`}>
                  {activeCone.putCallRatio}
                </strong>
                <span className="text-slate-500 text-[10px] ml-1">
                  ({(activeCone.totalPutVol / 1000).toFixed(1)}k P / {(activeCone.totalCallVol / 1000).toFixed(1)}k C)
                </span>
              </span>

              <span className="text-slate-300">
                1σ Expected Move:{' '}
                <strong className="text-emerald-400 font-bold">
                  ±${activeCone.move1Sigma.toFixed(2)} ({activeCone.movePct}%)
                </strong>
              </span>

              <span className="text-slate-300">
                1σ Range:{' '}
                <strong className="text-white font-mono">
                  ${activeCone.lower1Sigma.toFixed(2)} — ${activeCone.upper1Sigma.toFixed(2)}
                </strong>
              </span>

              <span className="text-slate-300 hidden md:inline">
                2σ Range:{' '}
                <strong className="text-purple-400 font-mono">
                  ${activeCone.lower2Sigma.toFixed(2)} — ${activeCone.upper2Sigma.toFixed(2)}
                </strong>
              </span>
            </div>

            <button
              onClick={() => {
                setExpandedExpiries(prev => ({ ...prev, [activeCone.expirationDate]: true }));
                const element = document.getElementById(`expiry-${activeCone.expirationDate}`);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1 bg-[#102018] hover:bg-[#142f22] text-[#00c076] border border-[#00c076]/40 rounded text-[11px] font-bold cursor-pointer flex items-center gap-1"
            >
              <span>Expand Strikes</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* ALL EXPIRATIONS PROBABILITY CONE GRAPHICAL CANVAS */}
          <div className="h-64 sm:h-72 w-full bg-[#090d11] rounded border border-[#1c2128] p-2 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 240" preserveAspectRatio="none">
              {/* Horizontal Price Grid Lines */}
              {[0, 48, 96, 144, 192, 240].map(y => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#1c2128" strokeDasharray="3 3" />
              ))}

              {/* Spot Price Baseline */}
              {(() => {
                const spotY = 220 - ((spotPrice - minConePrice) / conePriceSpan) * 200;
                return (
                  <g>
                    <line x1="0" y1={spotY} x2="1000" y2={spotY} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="1.2" />
                    <text x="10" y={spotY - 4} fill="#f59e0b" fontSize="9" fontFamily="monospace">
                      Spot ${spotPrice.toFixed(2)}
                    </text>
                  </g>
                );
              })()}

              {/* 3-Sigma Outer Cone Shaded Area */}
              {show3Sigma && (
                <path
                  d={`M 0 ${220 - ((spotPrice - minConePrice) / conePriceSpan) * 200} ${expirationsConeData
                    .map(exp => {
                      const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                      const y = 220 - ((exp.upper3Sigma - minConePrice) / conePriceSpan) * 200;
                      return `L ${x} ${y}`;
                    })
                    .join(' ')} ${expirationsConeData
                    .slice()
                    .reverse()
                    .map(exp => {
                      const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                      const y = 220 - ((exp.lower3Sigma - minConePrice) / conePriceSpan) * 200;
                      return `L ${x} ${y}`;
                    })
                    .join(' ')} Z`}
                  fill="rgba(56, 189, 248, 0.08)"
                />
              )}

              {/* 2-Sigma Cone Shaded Area (95.4%) */}
              <path
                d={`M 0 ${220 - ((spotPrice - minConePrice) / conePriceSpan) * 200} ${expirationsConeData
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 220 - ((exp.upper2Sigma - minConePrice) / conePriceSpan) * 200;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} ${expirationsConeData
                  .slice()
                  .reverse()
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 220 - ((exp.lower2Sigma - minConePrice) / conePriceSpan) * 200;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} Z`}
                fill="rgba(168, 85, 247, 0.12)"
              />

              {/* 1-Sigma Cone Shaded Area (68.3%) */}
              <path
                d={`M 0 ${220 - ((spotPrice - minConePrice) / conePriceSpan) * 200} ${expirationsConeData
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 220 - ((exp.upper1Sigma - minConePrice) / conePriceSpan) * 200;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} ${expirationsConeData
                  .slice()
                  .reverse()
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 220 - ((exp.lower1Sigma - minConePrice) / conePriceSpan) * 200;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} Z`}
                fill="rgba(0, 192, 118, 0.18)"
              />

              {/* Upper & Lower Boundary Curves */}
              <path
                d={`M 0 ${220 - ((spotPrice - minConePrice) / conePriceSpan) * 200} ${expirationsConeData
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 220 - ((exp.upper1Sigma - minConePrice) / conePriceSpan) * 200;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')}`}
                fill="none"
                stroke="#00c076"
                strokeWidth="2"
              />

              <path
                d={`M 0 ${220 - ((spotPrice - minConePrice) / conePriceSpan) * 200} ${expirationsConeData
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 220 - ((exp.lower1Sigma - minConePrice) / conePriceSpan) * 200;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')}`}
                fill="none"
                stroke="#00c076"
                strokeWidth="2"
              />

              <path
                d={`M 0 ${220 - ((spotPrice - minConePrice) / conePriceSpan) * 200} ${expirationsConeData
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 220 - ((exp.upper2Sigma - minConePrice) / conePriceSpan) * 200;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')}`}
                fill="none"
                stroke="#c084fc"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              <path
                d={`M 0 ${220 - ((spotPrice - minConePrice) / conePriceSpan) * 200} ${expirationsConeData
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 220 - ((exp.lower2Sigma - minConePrice) / conePriceSpan) * 200;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')}`}
                fill="none"
                stroke="#c084fc"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              {/* Vertical Expiration Slices Across All Dates */}
              {expirationsConeData.map(exp => {
                const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                const y1U = 220 - ((exp.upper1Sigma - minConePrice) / conePriceSpan) * 200;
                const y1L = 220 - ((exp.lower1Sigma - minConePrice) / conePriceSpan) * 200;
                const isSelected = exp.expirationDate === activeCone.expirationDate;

                return (
                  <g
                    key={exp.expirationDate}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedExpiry(exp.expirationDate);
                      setExpandedExpiries(prev => ({ ...prev, [exp.expirationDate]: true }));
                    }}
                  >
                    {/* Vertical Expiration Line */}
                    <line
                      x1={x}
                      y1="0"
                      x2={x}
                      y2="240"
                      stroke={isSelected ? '#f59e0b' : '#30363d'}
                      strokeWidth={isSelected ? 1.5 : 1}
                      strokeDasharray={isSelected ? 'none' : '2 2'}
                    />

                    {/* Expiration Dots on 1σ Boundaries */}
                    <circle cx={x} cy={y1U} r={isSelected ? 4 : 2.5} fill="#00c076" />
                    <circle cx={x} cy={y1L} r={isSelected ? 4 : 2.5} fill="#00c076" />

                    {/* Expiration Label at Bottom */}
                    <text
                      x={x}
                      y="234"
                      textAnchor="middle"
                      fill={isSelected ? '#f59e0b' : '#94a3b8'}
                      fontSize="8"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="monospace"
                    >
                      {exp.dte}d
                    </text>

                    {/* Expected Move Tag on top */}
                    {isSelected && (
                      <g>
                        <rect x={x - 28} y={y1U - 14} width="56" height="12" fill="#1c2128" rx="2" stroke="#00c076" />
                        <text x={x} y={y1U - 5} textAnchor="middle" fill="#00c076" fontSize="8" fontWeight="bold" fontFamily="monospace">
                          ±${exp.move1Sigma.toFixed(1)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* All Expirations Cone Quick-Selector Buttons Strip */}
          <div className="overflow-x-auto no-scrollbar pt-1">
            <div className="flex items-center gap-1.5 min-w-max">
              {expirationsConeData.map(exp => {
                const isSelected = exp.expirationDate === activeCone.expirationDate;
                return (
                  <button
                    key={exp.expirationDate}
                    onClick={() => {
                      setSelectedExpiry(exp.expirationDate);
                      setExpandedExpiries(prev => ({ ...prev, [exp.expirationDate]: true }));
                    }}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-mono border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c2128] text-amber-400 border-amber-400/70 shadow-sm'
                        : 'bg-[#12161f] text-slate-300 border-[#21262d] hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between gap-2">
                      <span>{exp.expirationDate}</span>
                      <span className="text-[10px] text-amber-400">({exp.dte}d)</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      ±${exp.move1Sigma.toFixed(2)} ({exp.movePct}%)
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. ALL EXPIRATIONS SUMMARY MATRIX TABLE (When in CONE_ONLY Mode) */}
      {chainViewMode === 'CONE_ONLY' && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 shadow space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                All Expirations Expected Move & Probability Cone Matrix
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Spot Price: <strong className="text-white">${spotPrice.toFixed(2)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-center">
              <thead className="bg-[#12161f] text-slate-400 uppercase text-[10px] font-semibold border-b border-[#21262d]">
                <tr>
                  <th className="py-2 px-3 text-left">Expiration Series</th>
                  <th className="py-2 px-3">DTE</th>
                  <th className="py-2 px-3">IV Mean</th>
                  <th className="py-2 px-3">1σ Expected Move</th>
                  <th className="py-2 px-3">1σ Range (68.3%)</th>
                  <th className="py-2 px-3">2σ Range (95.4%)</th>
                  <th className="py-2 px-3">Put/Call Ratio</th>
                  <th className="py-2 px-3">Total Volume</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2128]">
                {expirationsConeData.map(exp => {
                  const isSelected = exp.expirationDate === activeCone.expirationDate;

                  return (
                    <tr
                      key={exp.expirationDate}
                      className={`hover:bg-[#161b22] transition-colors ${
                        isSelected ? 'bg-[#1c2128]/60 font-bold text-amber-400' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-left font-bold flex items-center gap-1.5">
                        {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                        <span className={isSelected ? 'text-amber-400' : 'text-white'}>
                          {exp.expirationDate}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono">{exp.dte} DTE</td>
                      <td className="py-2 px-3 font-mono text-[#00c076]">{exp.ivMean}%</td>
                      <td className="py-2 px-3 font-mono text-emerald-400 font-bold">
                        ±${exp.move1Sigma.toFixed(2)} ({exp.movePct}%)
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-200">
                        ${exp.lower1Sigma.toFixed(2)} — ${exp.upper1Sigma.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 font-mono text-purple-400">
                        ${exp.lower2Sigma.toFixed(2)} — ${exp.upper2Sigma.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">{exp.putCallRatio}</td>
                      <td className="py-2 px-3 font-mono text-slate-400">
                        {(exp.totalCallVol + exp.totalPutVol).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedExpiry(exp.expirationDate);
                            setChainViewMode('CONE_AND_TABLE');
                            setExpandedExpiries(prev => ({ ...prev, [exp.expirationDate]: true }));
                          }}
                          className="px-2 py-0.5 rounded bg-[#102018] hover:bg-[#142f22] text-[#00c076] border border-[#00c076]/40 font-bold text-[10px] cursor-pointer"
                        >
                          View Chain
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. EXPIRATION ACCORDIONS & STRIKE TABLES (When in CONE_AND_TABLE or TABLE_ONLY Mode) */}
      {(chainViewMode === 'CONE_AND_TABLE' || chainViewMode === 'TABLE_ONLY') && (
        <div className="space-y-2">
          {expirationsConeData.map(series => {
            const isOpen = expandedExpiries[series.expirationDate];
            const displayedStrikes = series.strikes.slice(0, strikeFilter);
            const isSelected = series.expirationDate === activeCone.expirationDate;

            return (
              <div
                id={`expiry-${series.expirationDate}`}
                key={series.expirationDate}
                className={`bg-[#0e1217] border rounded-lg overflow-hidden shadow transition-all ${
                  isSelected ? 'border-amber-400/50 ring-1 ring-amber-400/20' : 'border-[#21262d]'
                }`}
              >
                {/* Expiration Accordion Header with Mini Probability Cone Bar */}
                <div
                  onClick={() => toggleExpiry(series.expirationDate)}
                  className="bg-[#161b22] hover:bg-[#1c2128] px-3 py-2 flex flex-wrap items-center justify-between cursor-pointer transition-colors border-b border-[#21262d] gap-2"
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="font-bold text-white text-xs">{series.expirationDate}</span>
                    <span className="text-amber-400 font-bold text-[11px]">({series.dte} DTE)</span>
                    <span className="text-slate-500 font-sans text-xs hidden sm:inline">
                      · {series.strikes.length} Strikes
                    </span>
                  </div>

                  {/* PROBABILITY CONE HORIZONTAL MINI-BAR ON HEADER */}
                  <div className="hidden lg:flex items-center gap-2 bg-[#0d1117] px-2.5 py-1 rounded border border-[#21262d] text-[10px]">
                    <span className="text-slate-400 font-sans">Probability Cone:</span>
                    <span className="text-purple-400 font-mono">${series.lower2Sigma.toFixed(1)}</span>
                    <div className="w-24 h-1.5 bg-[#1c2128] rounded-full relative overflow-hidden flex items-center">
                      <div className="absolute left-1/4 right-1/4 h-full bg-[#00c076]/40"></div>
                      <div className="absolute left-1/2 -ml-0.5 w-1 h-full bg-amber-400"></div>
                    </div>
                    <span className="text-purple-400 font-mono">${series.upper2Sigma.toFixed(1)}</span>
                  </div>

                  {/* Expected Move Figures */}
                  <div className="flex items-center gap-3 sm:gap-4 text-[11px] font-mono">
                    <span className="text-slate-400 hidden sm:inline">
                      Implied Vol: <strong className="text-[#00c076]">{series.ivMean}%</strong>
                    </span>
                    <span className="text-slate-400">
                      PCR: <strong className={Number(series.putCallRatio) < 0.8 ? 'text-[#00c076]' : Number(series.putCallRatio) > 1.05 ? 'text-[#ff3b57]' : 'text-amber-400'}>{series.putCallRatio}</strong>
                    </span>
                    <span className="text-slate-400">
                      1σ Move: <strong className="text-emerald-400">±${series.move1Sigma.toFixed(2)}</strong>
                    </span>
                    <span className="text-slate-400 hidden md:inline">
                      Cone: <strong className="text-white">${series.lower1Sigma.toFixed(1)} - ${series.upper1Sigma.toFixed(1)}</strong>
                    </span>
                  </div>
                </div>

                {/* Strikes Table (Calls on Left, Center Strike with Cone Badges, Puts on Right) */}
                {isOpen && (
                  <div className="overflow-x-auto text-[11px]">
                    <table className="w-full text-center">
                      <thead className="bg-[#12161f] text-[10px] text-slate-400 uppercase font-semibold border-b border-[#21262d]">
                        <tr>
                          {/* CALL HEADERS */}
                          <th className="py-1 px-1 text-slate-500">Vol</th>
                          <th className="py-1 px-1 text-slate-500">OI</th>
                          <th className="py-1 px-1 text-slate-400">IV%</th>
                          {showProbColumns && (
                            <>
                              <th className="py-1 px-1 text-amber-400">P.Touch</th>
                              <th className="py-1 px-1 text-emerald-400">P.ITM</th>
                            </>
                          )}
                          <th className="py-1 px-1 text-slate-300">Delta</th>
                          <th className="py-1 px-1.5 text-[#00c076] font-bold">Call Bid</th>
                          <th className="py-1 px-1.5 text-[#00c076] font-bold">Call Ask</th>

                          {/* STRIKE CENTER HEADER */}
                          <th className="py-1 px-3 bg-[#18202c] text-amber-400 font-black border-x border-[#21262d]">
                            STRIKE (CONE)
                          </th>

                          {/* PUT HEADERS */}
                          <th className="py-1 px-1.5 text-[#ff3b57] font-bold">Put Bid</th>
                          <th className="py-1 px-1.5 text-[#ff3b57] font-bold">Put Ask</th>
                          <th className="py-1 px-1 text-slate-300">Delta</th>
                          {showProbColumns && (
                            <>
                              <th className="py-1 px-1 text-emerald-400">P.ITM</th>
                              <th className="py-1 px-1 text-amber-400">P.Touch</th>
                            </>
                          )}
                          <th className="py-1 px-1 text-slate-400">IV%</th>
                          <th className="py-1 px-1 text-slate-500">OI</th>
                          <th className="py-1 px-1 text-slate-500">Vol</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#161b22]">
                        {displayedStrikes.map(row => {
                          const callItm = row.call.itm;
                          const putItm = row.put.itm;

                          // Check if strike falls inside 1σ or 2σ Probability Cone for this expiration
                          const inside1Sigma = row.strike >= series.lower1Sigma && row.strike <= series.upper1Sigma;
                          const inside2Sigma = row.strike >= series.lower2Sigma && row.strike <= series.upper2Sigma;

                          // Probabilities calculation
                          const callProb = calculateStrikeProbabilities(row.strike, series.dte, row.call.iv, true);
                          const putProb = calculateStrikeProbabilities(row.strike, series.dte, row.put.iv, false);

                          return (
                            <tr
                              key={row.strike}
                              className={`hover:bg-[#161b22]/70 transition-colors ${
                                inside1Sigma ? 'bg-[#0f181f]/40' : ''
                              }`}
                            >
                              {/* CALL DATA */}
                              <td className={`py-1 px-1 text-slate-400 ${callItm ? 'bg-[#121c28]' : ''}`}>
                                {row.call.volume}
                              </td>
                              <td className={`py-1 px-1 text-slate-500 ${callItm ? 'bg-[#121c28]' : ''}`}>
                                {row.call.openInterest}
                              </td>
                              <td className={`py-1 px-1 text-slate-300 ${callItm ? 'bg-[#121c28]' : ''}`}>
                                {row.call.iv}%
                              </td>
                              {showProbColumns && (
                                <>
                                  <td className={`py-1 px-1 font-mono text-amber-400 ${callItm ? 'bg-[#121c28]' : ''}`}>
                                    {callProb.probTouch}%
                                  </td>
                                  <td className={`py-1 px-1 font-mono text-emerald-400 ${callItm ? 'bg-[#121c28]' : ''}`}>
                                    {callProb.probITM}%
                                  </td>
                                </>
                              )}
                              <td className={`py-1 px-1 text-sky-400 font-semibold ${callItm ? 'bg-[#121c28]' : ''}`}>
                                {row.call.delta.toFixed(2)}
                              </td>
                              {/* Call Bid */}
                              <td
                                onClick={() =>
                                  handleOptionClick(
                                    'SELL',
                                    row.strike,
                                    series.expirationDate,
                                    'CALL',
                                    row.call.bid,
                                    series.strikes
                                  )
                                }
                                className={`py-1 px-1.5 text-[#00c076] font-bold cursor-pointer hover:bg-[#142f22] ${
                                  callItm ? 'bg-[#121c28]' : ''
                                }`}
                                title={spreadType === 'SINGLE' ? "Click to Sell Call" : `Click to Stage ${spreadType} Strategy`}
                              >
                                ${row.call.bid.toFixed(2)}
                              </td>
                              {/* Call Ask */}
                              <td
                                onClick={() =>
                                  handleOptionClick(
                                    'BUY',
                                    row.strike,
                                    series.expirationDate,
                                    'CALL',
                                    row.call.ask,
                                    series.strikes
                                  )
                                }
                                className={`py-1 px-1.5 text-[#00c076] font-bold cursor-pointer hover:bg-[#142f22] ${
                                  callItm ? 'bg-[#121c28]' : ''
                                }`}
                                title={spreadType === 'SINGLE' ? "Click to Buy Call" : `Click to Stage ${spreadType} Strategy`}
                              >
                                ${row.call.ask.toFixed(2)}
                              </td>

                              {/* CENTER STRIKE COLUMN WITH PROBABILITY CONE BADGE */}
                              <td className="py-1 px-2.5 bg-[#18202c] font-black text-white border-x border-[#21262d]">
                                <div className="flex items-center justify-center gap-1.5">
                                  <span>${row.strike.toFixed(2)}</span>
                                  {inside1Sigma ? (
                                    <span
                                      className="text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-[#00c076] border border-emerald-500/30"
                                      title="Inside 1-Sigma Expected Move (68.3% Confidence)"
                                    >
                                      1σ
                                    </span>
                                  ) : inside2Sigma ? (
                                    <span
                                      className="text-[9px] font-bold px-1 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                      title="Inside 2-Sigma Expected Move (95.4% Confidence)"
                                    >
                                      2σ
                                    </span>
                                  ) : null}
                                </div>
                              </td>

                              {/* PUT DATA */}
                              {/* Put Bid */}
                              <td
                                onClick={() =>
                                  handleOptionClick(
                                    'SELL',
                                    row.strike,
                                    series.expirationDate,
                                    'PUT',
                                    row.put.bid,
                                    series.strikes
                                  )
                                }
                                className={`py-1 px-1.5 text-[#ff3b57] font-bold cursor-pointer hover:bg-[#2e191e] ${
                                  putItm ? 'bg-[#28151a]' : ''
                                }`}
                                title={spreadType === 'SINGLE' ? "Click to Sell Put" : `Click to Stage ${spreadType} Strategy`}
                              >
                                ${row.put.bid.toFixed(2)}
                              </td>
                              {/* Put Ask */}
                              <td
                                onClick={() =>
                                  handleOptionClick(
                                    'BUY',
                                    row.strike,
                                    series.expirationDate,
                                    'PUT',
                                    row.put.ask,
                                    series.strikes
                                  )
                                }
                                className={`py-1 px-1.5 text-[#ff3b57] font-bold cursor-pointer hover:bg-[#2e191e] ${
                                  putItm ? 'bg-[#28151a]' : ''
                                }`}
                                title={spreadType === 'SINGLE' ? "Click to Buy Put" : `Click to Stage ${spreadType} Strategy`}
                              >
                                ${row.put.ask.toFixed(2)}
                              </td>
                              <td className={`py-1 px-1 text-sky-400 font-semibold ${putItm ? 'bg-[#28151a]' : ''}`}>
                                {row.put.delta.toFixed(2)}
                              </td>
                              {showProbColumns && (
                                <>
                                  <td className={`py-1 px-1 font-mono text-emerald-400 ${putItm ? 'bg-[#28151a]' : ''}`}>
                                    {putProb.probITM}%
                                  </td>
                                  <td className={`py-1 px-1 font-mono text-amber-400 ${putItm ? 'bg-[#28151a]' : ''}`}>
                                    {putProb.probTouch}%
                                  </td>
                                </>
                              )}
                              <td className={`py-1 px-1 text-slate-300 ${putItm ? 'bg-[#28151a]' : ''}`}>
                                {row.put.iv}%
                              </td>
                              <td className={`py-1 px-1 text-slate-500 ${putItm ? 'bg-[#28151a]' : ''}`}>
                                {row.put.openInterest}
                              </td>
                              <td className={`py-1 px-1 text-slate-400 ${putItm ? 'bg-[#28151a]' : ''}`}>
                                {row.put.volume}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
