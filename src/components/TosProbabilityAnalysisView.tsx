import React, { useState, useMemo } from 'react';
import {
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Table,
  Target,
  Crosshair,
  Sliders,
  RotateCcw,
  Info,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Asset, OrderSide } from '../types';
import { generateOptionsChainForAsset } from '../data/optionsAndMacroData';

interface TosProbabilityAnalysisViewProps {
  asset: Asset;
  assets: Asset[];
  onSelectSymbol: (symbol: string) => void;
  onPopulateOrder: (symbol: string, side: OrderSide, price: number) => void;
}

export const TosProbabilityAnalysisView: React.FC<TosProbabilityAnalysisViewProps> = ({
  asset,
  assets,
  onSelectSymbol,
  onPopulateOrder
}) => {
  const spotPrice = asset.price;

  // Probability Target Price state (defaults to +8% above spot)
  const [targetPrice, setTargetPrice] = useState<number>(Number((spotPrice * 1.08).toFixed(2)));
  const [ivMultiplier, setIvMultiplier] = useState<number>(1.0); // 0.6x to 2.0x
  const [show1Sigma, setShow1Sigma] = useState<boolean>(true);
  const [show2Sigma, setShow2Sigma] = useState<boolean>(true);
  const [show3Sigma, setShow3Sigma] = useState<boolean>(true);
  const [showBellCurves, setShowBellCurves] = useState<boolean>(true);
  const [selectedExpiryLabel, setSelectedExpiryLabel] = useState<string | null>(null);

  // Load all option series
  const optionSeriesList = useMemo(() => {
    return generateOptionsChainForAsset(asset.symbol, asset.price);
  }, [asset.symbol, asset.price]);

  const maxDte = Math.max(...optionSeriesList.map(s => s.dte));

  // Gaussian Normal Distribution Cumulative Distribution Function (CDF)
  const normCdf = (z: number) => {
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

  // Compute Probability Metrics Across ALL Expirations
  const allExpirationsAnalysis = useMemo(() => {
    return optionSeriesList.map(series => {
      const effectiveIv = (series.ivMean * ivMultiplier) / 100;
      const timeFraction = Math.max(0.0001, series.dte / 365);
      const sigmaTime = effectiveIv * Math.sqrt(timeFraction);

      const move1Sigma = spotPrice * sigmaTime;
      const move2Sigma = move1Sigma * 2.0;
      const move3Sigma = move1Sigma * 3.0;

      const upper1Sigma = spotPrice + move1Sigma;
      const lower1Sigma = Math.max(0.1, spotPrice - move1Sigma);
      const upper2Sigma = spotPrice + move2Sigma;
      const lower2Sigma = Math.max(0.1, spotPrice - move2Sigma);
      const upper3Sigma = spotPrice + move3Sigma;
      const lower3Sigma = Math.max(0.1, spotPrice - move3Sigma);

      // Probabilities at targetPrice
      const d1 = (Math.log(spotPrice / targetPrice) + 0.5 * Math.pow(sigmaTime, 2)) / (sigmaTime || 0.01);
      const d2 = d1 - sigmaTime;

      const isAbove = targetPrice >= spotPrice;
      const probITM = isAbove ? (1 - normCdf(d2)) * 100 : normCdf(d2) * 100;
      const probTouch = Math.min(99.9, probITM * 1.85);

      return {
        expirationDate: series.expirationDate,
        dte: series.dte,
        ivMean: Number((series.ivMean * ivMultiplier).toFixed(1)),
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
        probITM: Math.max(0.1, Math.min(99.9, probITM)),
        probOTM: Math.max(0.1, Math.min(99.9, 100 - probITM)),
        probTouch: Math.max(0.1, Math.min(99.9, probTouch))
      };
    });
  }, [optionSeriesList, spotPrice, ivMultiplier, targetPrice]);

  // Overall min and max prices for chart scaling
  const maxPrice = Math.max(...allExpirationsAnalysis.map(e => (show3Sigma ? e.upper3Sigma : e.upper2Sigma))) * 1.05;
  const minPrice = Math.min(...allExpirationsAnalysis.map(e => (show3Sigma ? e.lower3Sigma : e.lower2Sigma))) * 0.95;
  const priceSpan = Math.max(1, maxPrice - minPrice);

  const activeExp = useMemo(() => {
    return allExpirationsAnalysis.find(e => e.expirationDate === selectedExpiryLabel) || allExpirationsAnalysis[3];
  }, [allExpirationsAnalysis, selectedExpiryLabel]);

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      {/* 1. Header Toolbar */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 shadow">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-sans font-bold text-white">
            <span className="w-4 h-4 rounded bg-amber-400 text-black font-black text-[10px] flex items-center justify-center font-mono">
              1
            </span>
            <span className="text-base tracking-tight">{asset.symbol} Probability Analysis</span>
            <span className="text-slate-400 text-xs font-normal">
              · Spot: ${spotPrice.toFixed(2)}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-bold">
            ALL {allExpirationsAnalysis.length} EXPIRATIONS (2D to {maxDte}D)
          </span>
        </div>

        {/* Sigma & Bell Curve Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShow1Sigma(!show1Sigma)}
            className={`px-2 py-0.5 rounded border text-[11px] font-bold transition-colors flex items-center gap-1 ${
              show1Sigma ? 'bg-[#1c2128] text-[#00c076] border-emerald-500/40' : 'text-slate-500 border-transparent'
            }`}
          >
            <span className="w-2 h-0.5 bg-[#00c076]"></span> 1σ (68.3%)
          </button>

          <button
            onClick={() => setShow2Sigma(!show2Sigma)}
            className={`px-2 py-0.5 rounded border text-[11px] font-bold transition-colors flex items-center gap-1 ${
              show2Sigma ? 'bg-[#1c2128] text-purple-400 border-purple-500/40' : 'text-slate-500 border-transparent'
            }`}
          >
            <span className="w-2 h-0.5 bg-purple-400"></span> 2σ (95.4%)
          </button>

          <button
            onClick={() => setShow3Sigma(!show3Sigma)}
            className={`px-2 py-0.5 rounded border text-[11px] font-bold transition-colors flex items-center gap-1 ${
              show3Sigma ? 'bg-[#1c2128] text-sky-400 border-sky-500/40' : 'text-slate-500 border-transparent'
            }`}
          >
            <span className="w-2 h-0.5 bg-sky-400"></span> 3σ (99.7%)
          </button>

          <button
            onClick={() => setShowBellCurves(!showBellCurves)}
            className={`px-2 py-0.5 rounded border text-[11px] font-bold transition-colors ${
              showBellCurves ? 'bg-[#1c2128] text-amber-400 border-amber-400/40' : 'text-slate-500 border-transparent'
            }`}
          >
            Bell Curves
          </button>
        </div>
      </div>

      {/* 2. Interactive Target Price Intersect Bar across All Expirations */}
      <div className="bg-[#121620] border border-amber-500/30 rounded-lg p-3 shadow space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span className="text-white font-bold uppercase tracking-wider text-xs">
              Universal Target Price Probability Scanner (All Expirations)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Target Price Input */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-sans text-[11px]">Target Price:</span>
              <div className="flex items-center bg-[#1c2128] border border-[#30363d] rounded px-2 py-0.5">
                <span className="text-slate-500 mr-1">$</span>
                <input
                  type="number"
                  step="0.5"
                  value={targetPrice}
                  onChange={e => setTargetPrice(parseFloat(e.target.value) || spotPrice)}
                  className="w-20 bg-transparent text-white font-bold focus:outline-none font-mono"
                />
              </div>
              <span className="text-amber-400 font-bold text-xs">
                ({targetPrice >= spotPrice ? '+' : ''}{(((targetPrice - spotPrice) / spotPrice) * 100).toFixed(1)}%)
              </span>
            </div>

            {/* IV Stress Test Multiplier */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-[#21262d]">
              <span className="text-slate-400 font-sans text-[11px]">IV Shock:</span>
              <div className="flex items-center bg-[#1c2128] border border-[#30363d] rounded p-0.5">
                {[0.8, 1.0, 1.25, 1.5].map(mult => (
                  <button
                    key={mult}
                    onClick={() => setIvMultiplier(mult)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      ivMultiplier === mult ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mult === 1.0 ? 'Normal' : `${mult}x`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Expiry Quick Metrics HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-[#090d11] p-2 rounded border border-[#1c2128]">
            <div className="text-slate-400 text-[10px] font-sans">{activeExp.expirationDate} ({activeExp.dte} DTE)</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">
              ±${activeExp.move1Sigma.toFixed(2)} ({activeExp.movePct}%)
            </div>
            <div className="text-[9px] text-slate-500 font-sans">1σ Expected Move</div>
          </div>

          <div className="bg-[#090d11] p-2 rounded border border-[#1c2128]">
            <div className="text-slate-400 text-[10px] font-sans">Probability of Touch (POT)</div>
            <div className="text-sm font-bold text-amber-400 mt-0.5">
              {activeExp.probTouch.toFixed(1)}%
            </div>
            <div className="text-[9px] text-slate-500 font-sans">Touches ${targetPrice} before expiry</div>
          </div>

          <div className="bg-[#090d11] p-2 rounded border border-[#1c2128]">
            <div className="text-slate-400 text-[10px] font-sans">Probability Expiring ITM</div>
            <div className="text-sm font-bold text-[#00c076] mt-0.5">
              {activeExp.probITM.toFixed(1)}%
            </div>
            <div className="text-[9px] text-slate-500 font-sans">Finishes beyond ${targetPrice}</div>
          </div>

          <div className="bg-[#090d11] p-2 rounded border border-[#1c2128]">
            <div className="text-slate-400 text-[10px] font-sans">1σ Probability Range</div>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">
              ${activeExp.lower1Sigma.toFixed(1)} — ${activeExp.upper1Sigma.toFixed(1)}
            </div>
            <div className="text-[9px] text-slate-500 font-sans">68.3% Confidence Band</div>
          </div>
        </div>
      </div>

      {/* 3. FULL ALL-EXPIRATIONS PROBABILITY CONE GRAPH */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 shadow space-y-2">
        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#21262d]">
          <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            All-Expirations Expanding Probability Cone
          </span>
          <span className="text-slate-400 font-sans">
            Click on any expiration slice or anywhere on the canvas to set Target Price
          </span>
        </div>

        <div className="h-80 w-full bg-[#090d11] rounded border border-[#1c2128] p-2 relative">
          <svg
            className="w-full h-full overflow-visible cursor-crosshair"
            viewBox="0 0 1000 280"
            preserveAspectRatio="none"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickY = e.clientY - rect.top;
              const fraction = (260 - (clickY / rect.height) * 280) / 240;
              const clickedPrice = minPrice + fraction * priceSpan;
              if (clickedPrice > 0) setTargetPrice(Number(clickedPrice.toFixed(2)));
            }}
          >
            {/* Gridlines */}
            {[0, 56, 112, 168, 224, 280].map(y => (
              <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#1c2128" strokeDasharray="3 3" />
            ))}

            {/* Spot Price Baseline */}
            {(() => {
              const spotY = 260 - ((spotPrice - minPrice) / priceSpan) * 240;
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
                d={`M 0 ${260 - ((spotPrice - minPrice) / priceSpan) * 240} ${allExpirationsAnalysis
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 260 - ((exp.upper3Sigma - minPrice) / priceSpan) * 240;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} ${allExpirationsAnalysis
                  .slice()
                  .reverse()
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 260 - ((exp.lower3Sigma - minPrice) / priceSpan) * 240;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} Z`}
                fill="rgba(56, 189, 248, 0.08)"
              />
            )}

            {/* 2-Sigma Cone Shaded Area (95.4%) */}
            {show2Sigma && (
              <path
                d={`M 0 ${260 - ((spotPrice - minPrice) / priceSpan) * 240} ${allExpirationsAnalysis
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 260 - ((exp.upper2Sigma - minPrice) / priceSpan) * 240;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} ${allExpirationsAnalysis
                  .slice()
                  .reverse()
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 260 - ((exp.lower2Sigma - minPrice) / priceSpan) * 240;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} Z`}
                fill="rgba(168, 85, 247, 0.12)"
              />
            )}

            {/* 1-Sigma Cone Shaded Area (68.3%) */}
            {show1Sigma && (
              <path
                d={`M 0 ${260 - ((spotPrice - minPrice) / priceSpan) * 240} ${allExpirationsAnalysis
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 260 - ((exp.upper1Sigma - minPrice) / priceSpan) * 240;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} ${allExpirationsAnalysis
                  .slice()
                  .reverse()
                  .map(exp => {
                    const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                    const y = 260 - ((exp.lower1Sigma - minPrice) / priceSpan) * 240;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} Z`}
                fill="rgba(0, 192, 118, 0.18)"
              />
            )}

            {/* Upper & Lower Boundary Curves */}
            {show1Sigma && (
              <>
                <path
                  d={`M 0 ${260 - ((spotPrice - minPrice) / priceSpan) * 240} ${allExpirationsAnalysis
                    .map(exp => {
                      const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                      const y = 260 - ((exp.upper1Sigma - minPrice) / priceSpan) * 240;
                      return `L ${x} ${y}`;
                    })
                    .join(' ')}`}
                  fill="none"
                  stroke="#00c076"
                  strokeWidth="2"
                />
                <path
                  d={`M 0 ${260 - ((spotPrice - minPrice) / priceSpan) * 240} ${allExpirationsAnalysis
                    .map(exp => {
                      const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                      const y = 260 - ((exp.lower1Sigma - minPrice) / priceSpan) * 240;
                      return `L ${x} ${y}`;
                    })
                    .join(' ')}`}
                  fill="none"
                  stroke="#00c076"
                  strokeWidth="2"
                />
              </>
            )}

            {show2Sigma && (
              <>
                <path
                  d={`M 0 ${260 - ((spotPrice - minPrice) / priceSpan) * 240} ${allExpirationsAnalysis
                    .map(exp => {
                      const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                      const y = 260 - ((exp.upper2Sigma - minPrice) / priceSpan) * 240;
                      return `L ${x} ${y}`;
                    })
                    .join(' ')}`}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <path
                  d={`M 0 ${260 - ((spotPrice - minPrice) / priceSpan) * 240} ${allExpirationsAnalysis
                    .map(exp => {
                      const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
                      const y = 260 - ((exp.lower2Sigma - minPrice) / priceSpan) * 240;
                      return `L ${x} ${y}`;
                    })
                    .join(' ')}`}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </>
            )}

            {/* Target Price Line Across All Expirations */}
            {(() => {
              const targetY = 260 - ((targetPrice - minPrice) / priceSpan) * 240;
              return (
                <g>
                  <line x1="0" y1={targetY} x2="1000" y2={targetY} stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="5 3" />
                  <rect x="10" y={targetY - 10} width="160" height="20" fill="#1c2128" rx="3" stroke="#f59e0b" />
                  <text x="16" y={targetY + 4} fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Target: ${targetPrice.toFixed(2)}
                  </text>
                </g>
              );
            })()}

            {/* Expiration Slices Across All Dates */}
            {allExpirationsAnalysis.map(exp => {
              const x = (Math.sqrt(exp.dte) / Math.sqrt(maxDte)) * 960 + 20;
              const y1U = 260 - ((exp.upper1Sigma - minPrice) / priceSpan) * 240;
              const y1L = 260 - ((exp.lower1Sigma - minPrice) / priceSpan) * 240;
              const isSelected = exp.expirationDate === activeExp.expirationDate;

              return (
                <g
                  key={exp.expirationDate}
                  className="cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedExpiryLabel(exp.expirationDate);
                  }}
                >
                  {/* Vertical Expiration Line */}
                  <line
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="280"
                    stroke={isSelected ? '#f59e0b' : '#30363d'}
                    strokeWidth={isSelected ? 1.8 : 1}
                    strokeDasharray={isSelected ? 'none' : '2 2'}
                  />

                  {/* 1-Sigma Dots */}
                  <circle cx={x} cy={y1U} r={isSelected ? 4.5 : 2.5} fill="#00c076" />
                  <circle cx={x} cy={y1L} r={isSelected ? 4.5 : 2.5} fill="#00c076" />

                  {/* DTE Label */}
                  <text
                    x={x}
                    y="275"
                    textAnchor="middle"
                    fill={isSelected ? '#f59e0b' : '#94a3b8'}
                    fontSize="8.5"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fontFamily="monospace"
                  >
                    {exp.dte}d
                  </text>

                  {/* Expected Move Tag on Selected */}
                  {isSelected && (
                    <g>
                      <rect x={x - 30} y={y1U - 15} width="60" height="14" fill="#1c2128" rx="2" stroke="#00c076" />
                      <text x={x} y={y1U - 4} textAnchor="middle" fill="#00c076" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                        ±${exp.move1Sigma.toFixed(1)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 4. ALL EXPIRATIONS PROBABILITY MATRIX TABLE */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 shadow space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              All Expirations Probability & Expected Move Matrix
            </span>
          </div>

          <span className="text-slate-400 text-xs">
            Target Price: <strong className="text-amber-400">${targetPrice.toFixed(2)}</strong>
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
                <th className="py-2 px-3 text-amber-400">Prob of Touch (POT)</th>
                <th className="py-2 px-3 text-emerald-400">Prob Expiring ITM</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2128]">
              {allExpirationsAnalysis.map(exp => {
                const isSelected = exp.expirationDate === activeExp.expirationDate;

                return (
                  <tr
                    key={exp.expirationDate}
                    className={`hover:bg-[#161b22] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#1c2128]/60 font-bold text-amber-400' : ''
                    }`}
                    onClick={() => setSelectedExpiryLabel(exp.expirationDate)}
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
                    <td className="py-2 px-3 font-mono font-bold text-amber-400">
                      {exp.probTouch.toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-emerald-400">
                      {exp.probITM.toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onPopulateOrder(asset.symbol, targetPrice >= spotPrice ? 'BUY' : 'SELL', spotPrice);
                        }}
                        className="px-2 py-0.5 rounded bg-[#102018] hover:bg-[#142f22] text-[#00c076] border border-[#00c076]/40 font-bold text-[10px] cursor-pointer"
                      >
                        Trade
                      </button>
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
