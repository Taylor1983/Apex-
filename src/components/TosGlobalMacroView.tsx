import React, { useState, useMemo } from 'react';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Activity,
  DollarSign,
  AlertTriangle,
  Zap,
  BarChart3,
  Search,
  CheckSquare,
  Square,
  Info,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  RotateCcw
} from 'lucide-react';
import {
  MACRO_YIELD_CURVE,
  CENTRAL_BANK_RATES,
  MACRO_INDICATORS,
  MACRO_VOLATILITY_REGIME,
  UPCOMING_ECONOMIC_CALENDAR
} from '../data/optionsAndMacroData';
import { ALL_COUNTRY_YIELD_CURVES, STANDARD_TENORS } from '../data/sovereignYieldCurves';
import { CountryYieldCurve } from '../types';

type RegionFilter = 'ALL' | 'DEVELOPED' | 'AMERICAS' | 'EUROPE' | 'ASIA_PACIFIC' | 'EMERGING' | 'INVERTED';

export const TosGlobalMacroView: React.FC = () => {
  const [selectedMacroSection, setSelectedMacroSection] = useState<'RATES_CURVE' | 'CENTRAL_BANKS' | 'INDICATORS' | 'CALENDAR'>('RATES_CURVE');

  // Sovereign yield curve controls
  const [selectedCountryCodes, setSelectedCountryCodes] = useState<string[]>(['US', 'DE', 'GB', 'JP', 'CA']);
  const [activeInspectedCountryCode, setActiveInspectedCountryCode] = useState<string>('US');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredTenorIdx, setHoveredTenorIdx] = useState<number | null>(null);

  // Toggle single country selection on graph
  const toggleCountry = (code: string) => {
    setSelectedCountryCodes(prev => {
      if (prev.includes(code)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  // Presets
  const applyPreset = (preset: 'US_ONLY' | 'G7' | 'AMERICAS' | 'EUROPE' | 'ASIA_PAC' | 'INVERTED' | 'ALL') => {
    switch (preset) {
      case 'US_ONLY':
        setSelectedCountryCodes(['US']);
        setActiveInspectedCountryCode('US');
        break;
      case 'G7':
        setSelectedCountryCodes(['US', 'CA', 'DE', 'GB', 'FR', 'IT', 'JP']);
        setActiveInspectedCountryCode('US');
        break;
      case 'AMERICAS':
        setSelectedCountryCodes(['US', 'CA', 'MX', 'BR', 'CL']);
        setActiveInspectedCountryCode('US');
        break;
      case 'EUROPE':
        setSelectedCountryCodes(['DE', 'GB', 'FR', 'IT', 'ES', 'NL', 'CH']);
        setActiveInspectedCountryCode('DE');
        break;
      case 'ASIA_PAC':
        setSelectedCountryCodes(['JP', 'CN', 'IN', 'AU', 'KR', 'SG']);
        setActiveInspectedCountryCode('JP');
        break;
      case 'INVERTED':
        setSelectedCountryCodes(['CH', 'NO', 'HK', 'TR']);
        setActiveInspectedCountryCode('CH');
        break;
      case 'ALL':
        setSelectedCountryCodes(ALL_COUNTRY_YIELD_CURVES.map(c => c.countryCode));
        break;
    }
  };

  // Filtered countries list for selector & table
  const filteredCountries = useMemo(() => {
    return ALL_COUNTRY_YIELD_CURVES.filter(c => {
      // Search
      const matchesSearch =
        c.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.countryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bondName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.currency.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Region Filter
      if (regionFilter === 'AMERICAS') return c.region === 'Americas';
      if (regionFilter === 'EUROPE') return c.region === 'Europe';
      if (regionFilter === 'ASIA_PACIFIC') return c.region === 'Asia-Pacific';
      if (regionFilter === 'DEVELOPED') {
        return ['US', 'CA', 'DE', 'GB', 'FR', 'IT', 'JP', 'CH', 'AU', 'NL', 'SE', 'NO', 'SG', 'NZ'].includes(c.countryCode);
      }
      if (regionFilter === 'EMERGING') {
        return ['BR', 'MX', 'CL', 'CN', 'IN', 'PL', 'TR', 'ID', 'SA', 'ZA'].includes(c.countryCode);
      }
      if (regionFilter === 'INVERTED') {
        return c.curveStatus === 'INVERTED' || c.spread10Y2Y < 0;
      }
      return true;
    });
  }, [regionFilter, searchQuery]);

  // Active Curves to draw on the graph
  const activeCurves = useMemo(() => {
    return ALL_COUNTRY_YIELD_CURVES.filter(c => selectedCountryCodes.includes(c.countryCode));
  }, [selectedCountryCodes]);

  // Active inspected country details
  const inspectedCountry = useMemo(() => {
    return (
      ALL_COUNTRY_YIELD_CURVES.find(c => c.countryCode === activeInspectedCountryCode) ||
      ALL_COUNTRY_YIELD_CURVES[0]
    );
  }, [activeInspectedCountryCode]);

  // Min and Max yield calculation across active curves (with clamping for Turkey's extreme yield so chart doesn't squish)
  const { minY, maxY, hasExtremeYields } = useMemo(() => {
    let min = 0;
    let max = 6;
    let extreme = false;

    activeCurves.forEach(c => {
      c.tenors.forEach(t => {
        if (t.yield > 20) {
          extreme = true;
        } else {
          if (t.yield < min) min = t.yield;
          if (t.yield > max) max = t.yield;
        }
      });
    });

    // Provide comfortable padding
    return {
      minY: Math.floor(Math.min(min, 0)),
      maxY: Math.ceil(max + 1),
      hasExtremeYields: extreme
    };
  }, [activeCurves]);

  // Standard US 10Y for spread calculation
  const us10Y = useMemo(() => {
    const usCurve = ALL_COUNTRY_YIELD_CURVES.find(c => c.countryCode === 'US');
    return usCurve?.tenors.find(t => t.tenor === '10Y')?.yield || 3.79;
  }, []);

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* 1. Global Macro Top Telemetry Strip */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Global Macro & Cross-Asset Telemetry</h2>
          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
            SOVEREIGN MACRO
          </span>
          <span className="text-[10px] text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded border border-sky-400/20">
            {ALL_COUNTRY_YIELD_CURVES.length} COUNTRIES
          </span>
        </div>

        {/* Global Regime Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-400 font-sans text-[11px]">VIX Index:</span>
            <span className="text-[#00c076] font-bold">{MACRO_VOLATILITY_REGIME.vix}</span>
            <span className="text-[10px] text-slate-500">({MACRO_VOLATILITY_REGIME.vixChange})</span>
          </div>

          <span className="text-slate-600">|</span>

          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-400 font-sans text-[11px]">US 10Y-2Y Spread:</span>
            <span className="text-emerald-400 font-bold">+{MACRO_VOLATILITY_REGIME.yieldSpread10Y2Y}% (+14 bps)</span>
          </div>

          <span className="text-slate-600">|</span>

          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-400 font-sans text-[11px]">US Dollar (DXY):</span>
            <span className="text-white font-bold">{MACRO_VOLATILITY_REGIME.dxyDollarIndex}</span>
            <span className="text-[10px] text-slate-500">({MACRO_VOLATILITY_REGIME.dxyChange})</span>
          </div>

          <span className="text-slate-600">|</span>

          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-400 font-sans text-[11px]">MOVE (Bond Vol):</span>
            <span className="text-amber-400 font-bold">{MACRO_VOLATILITY_REGIME.moveIndex}</span>
          </div>
        </div>

        {/* Sub-Section Tabs */}
        <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
          <button
            onClick={() => setSelectedMacroSection('RATES_CURVE')}
            className={`px-3 py-1 rounded font-bold flex items-center gap-1.5 ${
              selectedMacroSection === 'RATES_CURVE' ? 'bg-[#1c2128] text-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Yield Curves (All Countries)</span>
          </button>
          <button
            onClick={() => setSelectedMacroSection('CENTRAL_BANKS')}
            className={`px-3 py-1 rounded font-bold ${
              selectedMacroSection === 'CENTRAL_BANKS' ? 'bg-[#1c2128] text-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Central Banks
          </button>
          <button
            onClick={() => setSelectedMacroSection('INDICATORS')}
            className={`px-3 py-1 rounded font-bold ${
              selectedMacroSection === 'INDICATORS' ? 'bg-[#1c2128] text-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Macro Indicators
          </button>
          <button
            onClick={() => setSelectedMacroSection('CALENDAR')}
            className={`px-3 py-1 rounded font-bold ${
              selectedMacroSection === 'CALENDAR' ? 'bg-[#1c2128] text-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Economic Calendar
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUBTAB 1: ALL COUNTRIES SOVEREIGN YIELD CURVES COMPARISON ENGINE       */}
      {/* ========================================================================= */}
      {selectedMacroSection === 'RATES_CURVE' && (
        <div className="space-y-4">
          {/* Main Yield Curves Graphical Studio */}
          <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow space-y-3.5">
            {/* Header with Title & Quick Presets */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-[#21262d]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Sovereign Yield Curves · Global Cross-Country Comparison
                  </h3>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    {activeCurves.length} Curves Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Term structure of interest rates from 1M overnight to 30Y sovereign debt across global benchmark bond markets.
                </p>
              </div>

              {/* Quick Preset Selector Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 font-sans text-[11px] mr-1">Presets:</span>
                <button
                  onClick={() => applyPreset('US_ONLY')}
                  className={`px-2 py-1 rounded border transition-colors ${
                    selectedCountryCodes.length === 1 && selectedCountryCodes[0] === 'US'
                      ? 'bg-[#1c2128] text-sky-400 border-sky-500/50 font-bold'
                      : 'bg-[#161b22] text-slate-400 border-[#21262d] hover:text-white'
                  }`}
                >
                  🇺🇸 US Only
                </button>
                <button
                  onClick={() => applyPreset('G7')}
                  className="px-2 py-1 rounded border bg-[#161b22] text-amber-400 border-[#21262d] hover:border-amber-400/40 hover:text-amber-300 font-semibold"
                >
                  ⚡ G7 Benchmarks
                </button>
                <button
                  onClick={() => applyPreset('AMERICAS')}
                  className="px-2 py-1 rounded border bg-[#161b22] text-slate-300 border-[#21262d] hover:text-white"
                >
                  🌎 Americas
                </button>
                <button
                  onClick={() => applyPreset('EUROPE')}
                  className="px-2 py-1 rounded border bg-[#161b22] text-slate-300 border-[#21262d] hover:text-white"
                >
                  🇪🇺 Europe
                </button>
                <button
                  onClick={() => applyPreset('ASIA_PAC')}
                  className="px-2 py-1 rounded border bg-[#161b22] text-slate-300 border-[#21262d] hover:text-white"
                >
                  🌏 Asia-Pac
                </button>
                <button
                  onClick={() => applyPreset('INVERTED')}
                  className="px-2 py-1 rounded border bg-[#161b22] text-rose-400 border-[#21262d] hover:border-rose-400/40 font-semibold"
                  title="Curves with 10Y-2Y negative spread"
                >
                  ⚠️ Inverted Curves
                </button>
                <button
                  onClick={() => applyPreset('ALL')}
                  className="px-2 py-1 rounded border bg-[#161b22] text-slate-400 border-[#21262d] hover:text-white text-[10px]"
                >
                  Select All
                </button>
              </div>
            </div>

            {/* Active Curves Color Legend Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-sans text-[11px]">Overlay Curves:</span>
              {activeCurves.map(c => {
                const isInspected = c.countryCode === activeInspectedCountryCode;
                const ten10Y = c.tenors.find(t => t.tenor === '10Y')?.yield || 0;
                return (
                  <div
                    key={c.countryCode}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all cursor-pointer ${
                      isInspected
                        ? 'bg-[#1c2128] border-amber-400/60 shadow-sm'
                        : 'bg-[#12161f] border-[#21262d] hover:border-slate-500'
                    }`}
                    onClick={() => setActiveInspectedCountryCode(c.countryCode)}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                    <span className="font-bold text-white">{c.flag} {c.countryCode}</span>
                    <span className="font-mono text-[11px]" style={{ color: c.color }}>
                      {ten10Y.toFixed(2)}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCountry(c.countryCode);
                      }}
                      className="ml-1 text-slate-500 hover:text-rose-400 text-[10px]"
                      title="Remove from overlay"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Interactive SVG Multi-Curve Chart */}
            <div className="h-72 sm:h-80 w-full bg-[#070a0e] rounded border border-[#1c2128] p-3 relative overflow-hidden">
              {/* Extreme yield alert if Turkey is selected */}
              {hasExtremeYields && (
                <div className="absolute top-3 right-3 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded text-[10px] text-amber-300 z-10 font-sans">
                  * Note: Hyper-rate curves (e.g. Turkey ~30-48%) are clamped for chart readability. Check table below for full values.
                </div>
              )}

              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 900 240"
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredTenorIdx(null)}
              >
                {/* Horizontal Grid lines & Yield Percentage labels */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const yVal = minY + (i / 5) * (maxY - minY);
                  const yPos = 210 - (i / 5) * 180;
                  return (
                    <g key={i}>
                      <line x1="45" y1={yPos} x2="880" y2={yPos} stroke="#171e27" strokeDasharray="3 3" />
                      <text x="40" y={yPos + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                        {yVal.toFixed(1)}%
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Tenor Guideline Columns */}
                {STANDARD_TENORS.map((tenor, idx) => {
                  const x = 55 + (idx / (STANDARD_TENORS.length - 1)) * 820;
                  const isHovered = hoveredTenorIdx === idx;
                  return (
                    <g key={tenor}>
                      <line
                        x1={x}
                        y1="15"
                        x2={x}
                        y2="210"
                        stroke={isHovered ? '#38bdf8' : '#141a22'}
                        strokeWidth={isHovered ? 1.5 : 1}
                        strokeDasharray={isHovered ? 'none' : '2 2'}
                      />
                      {/* Interactive Hover Hitbox */}
                      <rect
                        x={x - 30}
                        y="0"
                        width="60"
                        height="240"
                        fill="transparent"
                        className="cursor-crosshair"
                        onMouseEnter={() => setHoveredTenorIdx(idx)}
                      />
                      <text
                        x={x}
                        y="226"
                        fill={isHovered ? '#38bdf8' : '#94a3b8'}
                        fontSize="10"
                        fontWeight={isHovered ? 'bold' : 'normal'}
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {tenor}
                      </text>
                    </g>
                  );
                })}

                {/* Draw Curves for Each Active Country */}
                {activeCurves.map(country => {
                  const isInspected = country.countryCode === activeInspectedCountryCode;
                  const points: { x: number; y: number; yieldVal: number }[] = [];

                  STANDARD_TENORS.forEach((tenor, idx) => {
                    const foundPoint = country.tenors.find(t => t.tenor === tenor);
                    if (foundPoint) {
                      const x = 55 + (idx / (STANDARD_TENORS.length - 1)) * 820;
                      // Clamped yield to chart bounds
                      const clampedYield = Math.min(maxY, Math.max(minY, foundPoint.yield));
                      const y = 210 - ((clampedYield - minY) / (maxY - minY || 1)) * 180;
                      points.push({ x, y, yieldVal: foundPoint.yield });
                    }
                  });

                  if (points.length < 2) return null;

                  const pathD = points.reduce((acc, pt, idx) => {
                    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
                  }, '');

                  return (
                    <g key={country.countryCode} className="transition-opacity">
                      {/* Yield Curve Line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={country.color}
                        strokeWidth={isInspected ? 3 : 1.8}
                        strokeOpacity={isInspected ? 1 : 0.75}
                      />

                      {/* Nodes on Each Point */}
                      {points.map((pt, pIdx) => {
                        const isNodeHovered = hoveredTenorIdx !== null && STANDARD_TENORS[hoveredTenorIdx] === country.tenors[pIdx]?.tenor;
                        return (
                          <circle
                            key={pIdx}
                            cx={pt.x}
                            cy={pt.y}
                            r={isNodeHovered ? 5 : isInspected ? 3.5 : 2.5}
                            fill={country.color}
                            stroke="#070a0e"
                            strokeWidth={1.5}
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Hover Crosshair Tooltip Callout */}
                {hoveredTenorIdx !== null && (
                  <g>
                    {(() => {
                      const hx = 55 + (hoveredTenorIdx / (STANDARD_TENORS.length - 1)) * 820;
                      const tenor = STANDARD_TENORS[hoveredTenorIdx];
                      const activeTenorPoints = activeCurves
                        .map(c => {
                          const p = c.tenors.find(t => t.tenor === tenor);
                          return { country: c, point: p };
                        })
                        .filter(item => item.point !== undefined);

                      return (
                        <g>
                          <line x1={hx} y1="10" x2={hx} y2="210" stroke="#38bdf8" strokeWidth="1.2" />
                          <circle cx={hx} cy="226" r="3" fill="#38bdf8" />

                          {/* Overlay Floating Card */}
                          <foreignObject
                            x={hx > 550 ? hx - 200 : hx + 15}
                            y="15"
                            width="185"
                            height="190"
                            className="pointer-events-none"
                          >
                            <div className="bg-[#0e1217]/95 border border-[#38bdf8]/50 p-2.5 rounded shadow-xl backdrop-blur-sm text-[10px] space-y-1">
                              <div className="flex items-center justify-between border-b border-[#21262d] pb-1 text-slate-300 font-bold">
                                <span>Tenor: {tenor}</span>
                                <span className="text-sky-400 font-sans">Cross-Curve</span>
                              </div>
                              <div className="space-y-1 pt-0.5 max-h-36 overflow-y-auto">
                                {activeTenorPoints.map(item => (
                                  <div key={item.country.countryCode} className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-slate-300">
                                      <span>{item.country.flag}</span>
                                      <span className="font-semibold">{item.country.countryCode}:</span>
                                    </span>
                                    <span className="font-bold font-mono" style={{ color: item.country.color }}>
                                      {item.point?.yield.toFixed(2)}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })()}
                  </g>
                )}
              </svg>
            </div>

            {/* Selected Country Spotlight Telemetry Card */}
            <div className="bg-[#121620] border border-[#21262d] rounded-lg p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c2128] pb-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{inspectedCountry.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        {inspectedCountry.countryName} ({inspectedCountry.bondName})
                      </h4>
                      <span className="px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-300 font-bold text-[10px] border border-sky-500/30">
                        {inspectedCountry.currency}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                        {inspectedCountry.creditRating} Rating
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      Central Bank: <strong className="text-slate-200">{inspectedCountry.centralBank}</strong> · Policy Rate: <strong className="text-emerald-400">{inspectedCountry.policyRate.toFixed(2)}%</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <div className="text-slate-400 font-sans text-[10px]">10Y Benchmark</div>
                    <div className="text-base font-bold text-white">
                      {inspectedCountry.tenors.find(t => t.tenor === '10Y')?.yield.toFixed(2)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 font-sans text-[10px]">10Y-2Y Curve Slope</div>
                    <div className={`text-base font-bold ${inspectedCountry.spread10Y2Y >= 0 ? 'text-[#00c076]' : 'text-rose-400'}`}>
                      {inspectedCountry.spread10Y2Y >= 0 ? '+' : ''}{inspectedCountry.spread10Y2Y} bps
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 font-sans text-[10px]">Curve Status</div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inspectedCountry.curveStatus === 'INVERTED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : inspectedCountry.curveStatus === 'STEEP'
                          ? 'bg-emerald-500/20 text-[#00c076] border border-emerald-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      }`}
                    >
                      {inspectedCountry.curveStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tenor Rates Strip for Inspected Country */}
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-11 gap-2 text-center">
                {inspectedCountry.tenors.map(y => (
                  <div key={y.tenor} className="bg-[#090d11] p-2 rounded border border-[#1c2128]">
                    <div className="text-slate-400 text-[10px] font-sans">{y.tenor}</div>
                    <div className="text-white font-bold text-xs mt-0.5">{y.yield.toFixed(2)}%</div>
                    <div className={`text-[10px] mt-0.5 font-mono ${y.change1D >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                      {y.change1D >= 0 ? '+' : ''}{y.change1D.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Comprehensive Global Sovereign Yield Comparison Table */}
          <div className="bg-[#0e1217] border border-[#21262d] rounded-lg overflow-hidden shadow">
            {/* Header with Search and Region Filter Tabs */}
            <div className="bg-[#161b22] px-4 py-2.5 border-b border-[#21262d] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Global Sovereign Yield Matrix · All Countries ({filteredCountries.length} Available)
                </h3>
              </div>

              {/* Region Filter Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter country, currency, bond..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-[#090d11] border border-[#21262d] rounded pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-52"
                  />
                </div>

                <div className="flex items-center bg-[#090d11] border border-[#21262d] rounded p-0.5 text-[10px]">
                  {(['ALL', 'DEVELOPED', 'AMERICAS', 'EUROPE', 'ASIA_PACIFIC', 'EMERGING', 'INVERTED'] as RegionFilter[]).map(r => (
                    <button
                      key={r}
                      onClick={() => setRegionFilter(r)}
                      className={`px-2 py-0.5 rounded font-bold transition-colors ${
                        regionFilter === r ? 'bg-[#1c2128] text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sovereign Bonds Table */}
            <div className="overflow-x-auto text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-[#12161f] text-slate-400 uppercase text-[10px] font-semibold border-b border-[#21262d]">
                  <tr>
                    <th className="py-2 px-3 text-center">Chart</th>
                    <th className="py-2 px-3">Country / Sovereign Bond</th>
                    <th className="py-2 px-2">Currency</th>
                    <th className="py-2 px-2">Central Bank</th>
                    <th className="py-2 px-2 text-right">Policy Rate</th>
                    <th className="py-2 px-2 text-right">2Y Yield</th>
                    <th className="py-2 px-2 text-right">10Y Benchmark</th>
                    <th className="py-2 px-2 text-right">10Y-2Y Spread</th>
                    <th className="py-2 px-2 text-right">Spread vs US 10Y</th>
                    <th className="py-2 px-2 text-center">Rating</th>
                    <th className="py-2 px-2 text-center">Curve Shape</th>
                    <th className="py-2 px-3 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161b22]">
                  {filteredCountries.map(country => {
                    const isSelected = selectedCountryCodes.includes(country.countryCode);
                    const isInspected = country.countryCode === activeInspectedCountryCode;
                    const y2 = country.tenors.find(t => t.tenor === '2Y')?.yield;
                    const y10 = country.tenors.find(t => t.tenor === '10Y')?.yield || 0;
                    const spreadVsUS = Math.round((y10 - us10Y) * 100);

                    return (
                      <tr
                        key={country.countryCode}
                        className={`hover:bg-[#161b22]/70 text-slate-300 transition-colors cursor-pointer ${
                          isInspected ? 'bg-[#1c2128]/50' : ''
                        }`}
                        onClick={() => setActiveInspectedCountryCode(country.countryCode)}
                      >
                        {/* Checkbox for Chart Overlay */}
                        <td className="py-2 px-3 text-center" onClick={(e) => { e.stopPropagation(); toggleCountry(country.countryCode); }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCountry(country.countryCode)}
                            className="cursor-pointer rounded accent-sky-400"
                          />
                        </td>

                        {/* Country & Bond Name */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{country.flag}</span>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{country.countryName}</span>
                                <span className="text-[10px] text-slate-400 font-mono font-normal">({country.countryCode})</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-sans truncate max-w-xs">
                                {country.bondName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Currency */}
                        <td className="py-2 px-2 font-mono font-bold text-sky-400">
                          {country.currency}
                        </td>

                        {/* Central Bank */}
                        <td className="py-2 px-2 text-slate-300 font-sans">
                          {country.centralBank}
                        </td>

                        {/* Policy Rate */}
                        <td className="py-2 px-2 text-right font-mono font-bold text-white">
                          {country.policyRate.toFixed(2)}%
                        </td>

                        {/* 2Y Yield */}
                        <td className="py-2 px-2 text-right font-mono text-slate-200">
                          {y2 !== undefined ? `${y2.toFixed(2)}%` : '—'}
                        </td>

                        {/* 10Y Benchmark */}
                        <td className="py-2 px-2 text-right font-mono font-bold text-white">
                          <span style={{ color: country.color }}>{y10.toFixed(2)}%</span>
                        </td>

                        {/* 10Y-2Y Spread */}
                        <td className={`py-2 px-2 text-right font-mono font-semibold ${country.spread10Y2Y >= 0 ? 'text-[#00c076]' : 'text-rose-400'}`}>
                          {country.spread10Y2Y >= 0 ? '+' : ''}{country.spread10Y2Y} bps
                        </td>

                        {/* Spread vs US 10Y */}
                        <td className={`py-2 px-2 text-right font-mono font-semibold ${spreadVsUS >= 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                          {spreadVsUS >= 0 ? '+' : ''}{spreadVsUS} bps
                        </td>

                        {/* Rating */}
                        <td className="py-2 px-2 text-center font-mono">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                            {country.creditRating}
                          </span>
                        </td>

                        {/* Curve Shape Badge */}
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              country.curveStatus === 'INVERTED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : country.curveStatus === 'STEEP'
                                ? 'bg-emerald-500/20 text-[#00c076] border border-emerald-500/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}
                          >
                            {country.curveStatus}
                          </span>
                        </td>

                        {/* Action Inspect Button */}
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveInspectedCountryCode(country.countryCode);
                              if (!selectedCountryCodes.includes(country.countryCode)) {
                                toggleCountry(country.countryCode);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              isInspected
                                ? 'bg-amber-400 text-black border-amber-400'
                                : 'bg-[#1c2128] text-slate-300 border-[#21262d] hover:text-white'
                            }`}
                          >
                            Inspect
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
      )}

      {/* ========================================================================= */}
      {/* 3. SUBTAB 2: GLOBAL CENTRAL BANKS                                         */}
      {/* ========================================================================= */}
      {selectedMacroSection === 'CENTRAL_BANKS' && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow space-y-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              G10 Central Bank Policy Stances & Benchmark Rates
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Comparative monetary policy divergence and upcoming policy decision meetings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CENTRAL_BANK_RATES.map(cb => (
              <div key={cb.bank} className="bg-[#090d11] p-3.5 rounded border border-[#1c2128] space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-bold text-xs">{cb.bank}</div>
                    <div className="text-slate-500 font-sans text-[11px]">Currency: {cb.currency}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cb.stance === 'Hawkish'
                        ? 'bg-rose-500/20 text-rose-300'
                        : cb.stance === 'Dovish'
                        ? 'bg-emerald-500/20 text-[#00c076]'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {cb.stance}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#1c2128] flex items-baseline justify-between">
                  <span className="text-slate-400 font-sans text-[11px]">Benchmark Rate:</span>
                  <span className="text-lg font-bold text-white">{cb.rate.toFixed(3)}%</span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="font-sans">Next Decision:</span>
                  <span className="text-amber-400 font-semibold">{cb.nextMeeting}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUBTAB 3: MACRO ECONOMIC INDICATORS                                    */}
      {/* ========================================================================= */}
      {selectedMacroSection === 'INDICATORS' && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg overflow-hidden shadow">
          <div className="bg-[#161b22] px-4 py-2 border-b border-[#21262d]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Macroeconomic Fundamentals & Growth Telemetry
            </h3>
          </div>

          <div className="overflow-x-auto text-[11px]">
            <table className="w-full text-left">
              <thead className="bg-[#12161f] text-slate-400 uppercase text-[10px] border-b border-[#21262d]">
                <tr>
                  <th className="py-2 px-3">Indicator</th>
                  <th className="py-2 px-2">Category</th>
                  <th className="py-2 px-2 text-right">Latest Print</th>
                  <th className="py-2 px-2 text-right">Prior</th>
                  <th className="py-2 px-2 text-right">Consensus</th>
                  <th className="py-2 px-2 text-center">Trend</th>
                  <th className="py-2 px-3 text-center">Macro Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161b22]">
                {MACRO_INDICATORS.map(ind => (
                  <tr key={ind.name} className="hover:bg-[#161b22]/50 text-slate-300">
                    <td className="py-2 px-3 font-bold text-white">{ind.name}</td>
                    <td className="py-2 px-2 text-slate-400 font-sans">{ind.category}</td>
                    <td className="py-2 px-2 text-right font-bold text-white">{ind.current}</td>
                    <td className="py-2 px-2 text-right text-slate-500">{ind.prior}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{ind.consensus}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`font-bold ${ind.trend === 'UP' ? 'text-[#00c076]' : ind.trend === 'DOWN' ? 'text-sky-400' : 'text-slate-400'}`}>
                        {ind.trend}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ind.signal === 'Positive'
                            ? 'bg-emerald-500/15 text-[#00c076]'
                            : ind.signal === 'Caution'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {ind.signal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUBTAB 4: ECONOMIC CALENDAR                                            */}
      {/* ========================================================================= */}
      {selectedMacroSection === 'CALENDAR' && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg overflow-hidden shadow">
          <div className="bg-[#161b22] px-4 py-2 border-b border-[#21262d] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Upcoming High-Impact Global Economic Releases
            </h3>
            <span className="text-[10px] text-amber-400 font-mono">Real-time Feed</span>
          </div>

          <div className="overflow-x-auto text-[11px]">
            <table className="w-full text-left">
              <thead className="bg-[#12161f] text-slate-400 uppercase text-[10px] border-b border-[#21262d]">
                <tr>
                  <th className="py-2 px-3">Date / Time</th>
                  <th className="py-2 px-2">Country</th>
                  <th className="py-2 px-2">Event</th>
                  <th className="py-2 px-2 text-center">Impact</th>
                  <th className="py-2 px-2 text-right">Consensus</th>
                  <th className="py-2 px-3 text-right">Previous</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161b22]">
                {UPCOMING_ECONOMIC_CALENDAR.map(ev => (
                  <tr key={ev.id} className="hover:bg-[#161b22]/50 text-slate-300">
                    <td className="py-2 px-3 text-white font-mono">
                      <span>{ev.date} · </span>
                      <span className="text-amber-400">{ev.time}</span>
                    </td>
                    <td className="py-2 px-2 font-bold text-white">{ev.country}</td>
                    <td className="py-2 px-2 font-semibold text-slate-200">{ev.event}</td>
                    <td className="py-2 px-2 text-center">
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        HIGH
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-white">{ev.consensus}</td>
                    <td className="py-2 px-3 text-right text-slate-500">{ev.previous}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
