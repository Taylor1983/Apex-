import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Activity,
  Layers,
  RotateCw,
  Eye,
  Sliders,
  Maximize2,
  Table,
  Zap,
  Info,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Target,
  ArrowRight,
  Play,
  Pause,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Shuffle,
  ChevronDown,
  ChevronRight,
  X,
  Gauge,
  Flame,
  Binary,
  Cpu
} from 'lucide-react';
import { Asset, OrderSide } from '../types';

interface TosVolatilitySurfaceViewProps {
  asset: Asset;
  assets: Asset[];
  onSelectSymbol: (symbol: string) => void;
  onPopulateOrder?: (symbol: string, side: OrderSide, price: number, optionDetails?: any) => void;
}

// 1. Metric / Mathematical Formulation Variations
export type SurfaceMetricVariation =
  | 'IMPLIED_VOL' // Standard Black-Scholes Implied Volatility σ (%)
  | 'TOTAL_VARIANCE' // Gatheral SVI Total Variance w(k, τ) = σ² * τ
  | 'LOCAL_VOL' // Dupire Local Volatility σ_loc(K, T)
  | 'FORWARD_VOL' // Forward-Starting Volatility σ_fwd(T1, T2)
  | 'VOL_OF_VOL' // Volatility Convexity / Butterfly Curvature ∂²σ/∂K²
  | 'VEGA_SURFACE'; // Option Vega Risk Exposure Surface ν(K, T) ($/1% vol)

// 2. Market Regime & Structural Shape Variations
export type SurfaceRegimeVariation =
  | 'CURRENT_MARKET' // Live asset baseline calibrated to market quotes
  | 'EARNINGS_SPIKE' // Binary Event / Earnings Spike (Front-month inverted backwardation)
  | 'PANIC_CRASH_SKEW' // Downside Crash Protection Skew (Heavy put bid)
  | 'DUAL_WING_SQUEEZE' // Dual Wing Convexity Smile (Crypto / Retail Meme bid)
  | 'STEEP_CONTANGO' // Low Front-Month Vol rising into long-dated LEAPS
  | 'IV_CRUSH' // Post-Event Volatility Implosion (-35% collapse)
  | 'VOL_SQUEEZE'; // Ultra-compressed range-bound coil prior to breakout

// 3. Coordinate / Moneyness Variations
export type MoneynessCoordinateVariation =
  | 'STRIKE_DOLLARS' // Strike Price ($)
  | 'PERCENT_MONEYNESS' // Moneyness % (K/S - 1)
  | 'DELTA_METRIC' // Option Delta (10Δ Put to 10Δ Call)
  | 'LOG_MONEYNESS'; // Log-Moneyness ln(K/S)

export interface SurfaceGridPoint {
  strike: number;
  moneynessPct: number; // e.g. -20% to +20%
  logMoneyness: number;
  deltaCall: number;
  deltaPut: number;
  dte: number;
  expiryLabel: string;
  iv: number; // IV % e.g. 42.5
  metricValue: number; // Value plotted on Z-axis depending on metric variation
  metricUnit: string;
  totalVariance: number;
  localVol: number;
  forwardVol: number;
  volOfVol: number;
  vega: number;
  callPrice: number;
  putPrice: number;
  // 3D coordinates (normalized -1 to 1)
  xNorm: number; // Moneyness/Strike/Coord
  yNorm: number; // DTE
  zNorm: number; // Metric Value
}

export const TosVolatilitySurfaceView: React.FC<TosVolatilitySurfaceViewProps> = ({
  asset,
  assets,
  onSelectSymbol,
  onPopulateOrder
}) => {
  const spotPrice = asset.price;

  // Primary Variations State
  const [metricVariation, setMetricVariation] = useState<SurfaceMetricVariation>('IMPLIED_VOL');
  const [regimeVariation, setRegimeVariation] = useState<SurfaceRegimeVariation>('CURRENT_MARKET');
  const [coordVariation, setCoordVariation] = useState<MoneynessCoordinateVariation>('STRIKE_DOLLARS');
  const [isVariationDrawerOpen, setIsVariationDrawerOpen] = useState<boolean>(false);

  // View presentation mode
  const [viewMode, setViewMode] = useState<'3D_SURFACE' | '2D_CONTOUR' | 'SKEW_SLICES' | 'TERM_STRUCTURE'>('3D_SURFACE');
  const [colorPalette, setColorPalette] = useState<'TOS_HEATMAP' | 'PLASMA_CYBER' | 'EMERALD_ALPHA' | 'TURBO_SPECTRAL'>('TOS_HEATMAP');
  const [wireframeOnly, setWireframeOnly] = useState<boolean>(false);
  const [showDataPoints, setShowDataPoints] = useState<boolean>(true);

  // 3D Rotation Controls
  const [azimuth, setAzimuth] = useState<number>(45); // horizontal angle (0 to 360)
  const [elevation, setElevation] = useState<number>(32); // vertical tilt (15 to 75)
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1.05);

  // Surface Model Shocks / Scenario Testing
  const [ivParallelShift, setIvParallelShift] = useState<number>(0); // -15% to +25%
  const [skewTilt, setSkewTilt] = useState<number>(0); // -10 (flatter) to +10 (steeper put skew)
  const [termStructureTilt, setTermStructureTilt] = useState<number>(0); // -10 (inverted/event) to +10 (steep contango)

  // Hovered probe point
  const [hoveredPoint, setHoveredPoint] = useState<SurfaceGridPoint | null>(null);

  // Mouse drag tracking for 3D rotation
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Expiration Tenors for the surface
  const expirations = useMemo(() => [
    { label: '02 OCT 26', dte: 2, termFactor: 1.14 },
    { label: '09 OCT 26', dte: 9, termFactor: 1.08 },
    { label: '16 OCT 26', dte: 16, termFactor: 1.04 },
    { label: '23 OCT 26', dte: 23, termFactor: 1.02 },
    { label: '44 OCT 26', dte: 44, termFactor: 1.00 },
    { label: '79 OCT 26', dte: 79, termFactor: 0.97 },
    { label: '163 DEC 26', dte: 163, termFactor: 0.94 },
    { label: '254 MAR 27', dte: 254, termFactor: 0.92 },
    { label: '436 OCT 27', dte: 436, termFactor: 0.90 }
  ], []);

  // Moneyness buckets from 80% (Deep OTM Put) to 120% (Deep OTM Call)
  const moneynessLevels = useMemo(() => [
    -20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20
  ], []);

  // Base IV determined by asset profile
  const baseAssetIv = useMemo(() => {
    if (asset.assetClass === 'crypto') return 58.5;
    if (asset.symbol === 'NVDA') return 44.2;
    if (asset.symbol === 'TSLA') return 48.0;
    if (asset.symbol === 'SPY' || asset.symbol === 'QQQ') return 18.2;
    return 26.5;
  }, [asset.assetClass, asset.symbol]);

  // Regime Variation Multipliers & Offsets
  const regimeModifiers = useMemo(() => {
    switch (regimeVariation) {
      case 'EARNINGS_SPIKE':
        return {
          frontMonthBoost: 22.0,
          backMonthShift: -2.0,
          skewScale: 1.35,
          wingScale: 1.25,
          name: 'Earnings / Binary Event Shock',
          desc: 'Front-month short dated options experience a sharp IV spike with backwardation term curve.'
        };
      case 'PANIC_CRASH_SKEW':
        return {
          frontMonthBoost: 8.0,
          backMonthShift: 4.0,
          skewScale: 2.2, // extreme put skew
          wingScale: 0.8,
          name: 'Panic Crash / Downside Skew',
          desc: 'Institutional put options trade at a massive premium as market participants hedge tail risk.'
        };
      case 'DUAL_WING_SQUEEZE':
        return {
          frontMonthBoost: 12.0,
          backMonthShift: 6.0,
          skewScale: 1.5,
          wingScale: 2.1, // both calls and puts bid
          name: 'Dual-Wing Convexity / Crypto Squeeze',
          desc: 'Extreme upside call speculation and downside gamma hedging creates a deep U-shaped smile.'
        };
      case 'STEEP_CONTANGO':
        return {
          frontMonthBoost: -9.0,
          backMonthShift: 8.5,
          skewScale: 0.9,
          wingScale: 0.9,
          name: 'Steep Contango / Low-Vol Roll',
          desc: 'Calm short-term regime with term premium expanding steadily toward long-dated LEAPS.'
        };
      case 'IV_CRUSH':
        return {
          frontMonthBoost: -18.0,
          backMonthShift: -5.0,
          skewScale: 0.7,
          wingScale: 0.7,
          name: 'Post-Event Volatility Implosion',
          desc: 'Immediate post-earnings vol crush with implied volatility collapsing across front strikes.'
        };
      case 'VOL_SQUEEZE':
        return {
          frontMonthBoost: -6.0,
          backMonthShift: -3.0,
          skewScale: 0.85,
          wingScale: 0.85,
          name: 'Vol Squeeze / Compression',
          desc: 'Implied volatility compressed into multi-month lows, coiling ahead of an anticipated breakout.'
        };
      case 'CURRENT_MARKET':
      default:
        return {
          frontMonthBoost: 0,
          backMonthShift: 0,
          skewScale: 1.0,
          wingScale: 1.0,
          name: 'Live Calibrated Market Baseline',
          desc: 'Real-time volatility smile and term structure calibrated to live order book dynamics.'
        };
    }
  }, [regimeVariation]);

  // Metric Variation Metadata (Descriptions & Formulations)
  const metricVariationInfo = useMemo(() => {
    switch (metricVariation) {
      case 'TOTAL_VARIANCE':
        return {
          title: 'Total Implied Variance Surface',
          symbolLabel: 'w(k, τ) = σ² * τ',
          unit: 'w',
          formula: 'w(k, τ) = σ_BS²(k, τ) × τ',
          description: 'Gatheral SVI Total Variance space. Linear in time for arbitrage-free calendar spreads.',
          decimals: 3
        };
      case 'LOCAL_VOL':
        return {
          title: 'Dupire Local Volatility Surface',
          symbolLabel: 'σ_loc(K, T)',
          unit: '%',
          formula: 'σ_loc²(K,T) = (∂C/∂T) / [½ K² (∂²C/∂K²)]',
          description: 'Instantaneous diffusion volatility coefficient reflecting local asset dynamics.',
          decimals: 1
        };
      case 'FORWARD_VOL':
        return {
          title: 'Forward-Starting Volatility Surface',
          symbolLabel: 'σ_fwd(T1, T2)',
          unit: '%',
          formula: 'σ_fwd = √[(σ₂²T₂ - σ₁²T₁) / (T₂ - T₁)]',
          description: 'Forward implied volatility expectations between sequential expiration dates.',
          decimals: 1
        };
      case 'VOL_OF_VOL':
        return {
          title: 'Volatility of Volatility (Convexity)',
          symbolLabel: '∂²σ / ∂K²',
          unit: 'curv',
          formula: 'χ = [σ(K+Δ) - 2σ(K) + σ(K-Δ)] / Δ²',
          description: 'Wing convexity and curvature of the smile, tracking butterfly tail-risk pricing.',
          decimals: 4
        };
      case 'VEGA_SURFACE':
        return {
          title: 'Option Vega Sensitivity Surface',
          symbolLabel: 'ν(K, T) = S√T φ(d₁)',
          unit: '$',
          formula: 'ν = S × √T × (1/√(2π)) e^(-d₁²/2) × 0.01',
          description: 'Dollar sensitivity exposure per 1% absolute shift in implied volatility.',
          decimals: 2
        };
      case 'IMPLIED_VOL':
      default:
        return {
          title: 'Implied Volatility Surface',
          symbolLabel: 'σ(K, T) [%]',
          unit: '%',
          formula: 'C_BS(S, K, T, σ) = C_market',
          description: 'Standard institutional annualized Black-Scholes implied volatility surface.',
          decimals: 1
        };
    }
  }, [metricVariation]);

  // Generate 2D Matrix of Surface Grid Points: DTE (rows) x Moneyness (cols)
  const surfaceMatrix: SurfaceGridPoint[][] = useMemo(() => {
    return expirations.map((exp, dteIdx) => {
      const t = Math.max(exp.dte / 365, 0.005);
      const prevDte = dteIdx > 0 ? expirations[dteIdx - 1].dte : 0;
      const tPrev = Math.max(prevDte / 365, 0.001);

      return moneynessLevels.map((mPct, mIdx) => {
        const strike = Number((spotPrice * (1 + mPct / 100)).toFixed(2));
        const logMoneyness = Number(Math.log(strike / spotPrice).toFixed(3));
        
        // Term structure baseline
        const dteRatio = exp.dte / 45;
        const baseTermAdjust = (exp.termFactor - 1.0) * (1 - termStructureTilt * 0.08) + (termStructureTilt * 0.02 * Math.log(Math.max(1, dteRatio)));
        
        // Regime term influence
        const regimeTermImpact = (regimeModifiers.frontMonthBoost / (1 + (exp.dte / 18))) + (regimeModifiers.backMonthShift * Math.min(1.5, exp.dte / 100));

        // SVI-like Volatility Skew Smile
        const skewBase = mPct < 0
          ? Math.pow(Math.abs(mPct), 1.3) * (0.42 + skewTilt * 0.025) * regimeModifiers.skewScale
          : Math.pow(mPct, 1.15) * (0.16 - skewTilt * 0.008) * regimeModifiers.wingScale;

        // Volatility dampening over time
        const termSkewDampener = 1.0 / Math.pow(Math.max(1, exp.dte / 14), 0.22);
        const effectiveSkew = skewBase * termSkewDampener;

        // Combined implied volatility (%)
        const rawIv = (baseAssetIv * (1 + baseTermAdjust) + regimeTermImpact + effectiveSkew + ivParallelShift);
        const iv = Math.max(8.0, Number(rawIv.toFixed(2)));

        // Black-Scholes Delta Approximation
        const sigma = iv / 100;
        const d1 = (Math.log(spotPrice / strike) + (0.045 + 0.5 * sigma * sigma) * t) / (sigma * Math.sqrt(t));
        
        // NormCDF approx
        const normCdf = (x: number) => {
          const tVal = 1 / (1 + 0.2316419 * Math.abs(x));
          const d = 0.3989422804014337 * Math.exp(-x * x / 2);
          const prob = d * tVal * (0.31938153 + tVal * (-0.356563782 + tVal * (1.781477937 + tVal * (-1.821255978 + tVal * 1.330274429))));
          return x > 0 ? 1 - prob : prob;
        };

        const deltaCall = Number(normCdf(d1).toFixed(2));
        const deltaPut = Number((deltaCall - 1).toFixed(2));

        // 1. Total Variance: w = σ² * τ
        const totalVariance = Number((sigma * sigma * t).toFixed(4));

        // 2. Local Volatility (Dupire approx)
        // Local vol exhibits steeper wings and time gradient
        const localVol = Number(Math.max(6.0, (iv * 1.08 + (mPct < 0 ? Math.abs(mPct) * 0.28 : mPct * 0.12) - (t * 2.2))).toFixed(2));

        // 3. Forward Volatility: σ_fwd = sqrt((σ2²*T2 - σ1²*T1)/(T2 - T1))
        let forwardVol = iv;
        if (dteIdx > 0 && t > tPrev) {
          const varCurr = sigma * sigma * t;
          const prevSigma = (iv * 0.98) / 100;
          const varPrev = prevSigma * prevSigma * tPrev;
          const fwdVar = Math.max(0.01, (varCurr - varPrev) / (t - tPrev));
          forwardVol = Number((Math.sqrt(fwdVar) * 100).toFixed(2));
        }

        // 4. Vol of Vol / Curvature: ∂²σ / ∂K²
        const volOfVol = Number((0.0018 + (Math.abs(mPct) * 0.00035) / Math.sqrt(t)).toFixed(4));

        // 5. Option Vega Sensitivity: ν = S * sqrt(T) * φ(d1) * 0.01
        const phiD1 = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * d1 * d1);
        const vega = Number((spotPrice * Math.sqrt(t) * phiD1 * 0.01).toFixed(2));

        // Theoretical option prices
        const callPrice = Number(Math.max(0.05, (spotPrice * deltaCall - strike * Math.exp(-0.045 * t) * normCdf(d1 - sigma * Math.sqrt(t)))).toFixed(2));
        const putPrice = Number(Math.max(0.05, (callPrice + strike * Math.exp(-0.045 * t) - spotPrice)).toFixed(2));

        // Select the active Metric Value for the Z-Axis
        let metricValue = iv;
        let metricUnit = '%';
        if (metricVariation === 'TOTAL_VARIANCE') {
          metricValue = totalVariance;
          metricUnit = 'w';
        } else if (metricVariation === 'LOCAL_VOL') {
          metricValue = localVol;
          metricUnit = '%';
        } else if (metricVariation === 'FORWARD_VOL') {
          metricValue = forwardVol;
          metricUnit = '%';
        } else if (metricVariation === 'VOL_OF_VOL') {
          metricValue = volOfVol * 1000; // scale for visualization
          metricUnit = 'curv';
        } else if (metricVariation === 'VEGA_SURFACE') {
          metricValue = vega;
          metricUnit = '$';
        }

        // Normalized 3D X-Coordinate based on coordVariation
        let xNorm = (mIdx / (moneynessLevels.length - 1)) * 2 - 1; // default strike
        if (coordVariation === 'DELTA_METRIC') {
          // Delta mapping from 0.10 to 0.90
          xNorm = ((deltaCall - 0.1) / 0.8) * 2 - 1;
        } else if (coordVariation === 'LOG_MONEYNESS') {
          xNorm = (logMoneyness / 0.2) * 1.0;
        }

        const yNorm = (dteIdx / (expirations.length - 1)) * 2 - 1; // -1 to 1 (DTE)

        return {
          strike,
          moneynessPct: mPct,
          logMoneyness,
          deltaCall,
          deltaPut,
          dte: exp.dte,
          expiryLabel: exp.label,
          iv,
          metricValue,
          metricUnit,
          totalVariance,
          localVol,
          forwardVol,
          volOfVol,
          vega,
          callPrice,
          putPrice,
          xNorm,
          yNorm,
          zNorm: 0
        };
      });
    });
  }, [
    spotPrice,
    baseAssetIv,
    ivParallelShift,
    skewTilt,
    termStructureTilt,
    regimeModifiers,
    metricVariation,
    coordVariation,
    expirations,
    moneynessLevels
  ]);

  // Overall min and max metric value across the entire matrix for normalization
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    surfaceMatrix.forEach(row => {
      row.forEach(p => {
        if (p.metricValue < min) min = p.metricValue;
        if (p.metricValue > max) max = p.metricValue;
      });
    });
    return { minVal: min, maxVal: max };
  }, [surfaceMatrix]);

  // Assign normalized Z coordinates to points
  const pointsWithNormZ = useMemo(() => {
    const valSpan = Math.max(0.0001, maxVal - minVal);
    return surfaceMatrix.map(row =>
      row.map(p => ({
        ...p,
        zNorm: ((p.metricValue - minVal) / valSpan) * 2 - 1 // -1 to +1
      }))
    );
  }, [surfaceMatrix, minVal, maxVal]);

  // Auto rotation ticker
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setAzimuth(prev => (prev + 0.8) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // Quick Cycle Variation Handler
  const handleCycleVariation = () => {
    const variations: SurfaceMetricVariation[] = [
      'IMPLIED_VOL',
      'TOTAL_VARIANCE',
      'LOCAL_VOL',
      'FORWARD_VOL',
      'VOL_OF_VOL',
      'VEGA_SURFACE'
    ];
    const currentIndex = variations.indexOf(metricVariation);
    const nextIndex = (currentIndex + 1) % variations.length;
    setMetricVariation(variations[nextIndex]);
  };

  // Quick Cycle Regime Handler
  const handleCycleRegime = () => {
    const regimes: SurfaceRegimeVariation[] = [
      'CURRENT_MARKET',
      'EARNINGS_SPIKE',
      'PANIC_CRASH_SKEW',
      'DUAL_WING_SQUEEZE',
      'STEEP_CONTANGO',
      'IV_CRUSH',
      'VOL_SQUEEZE'
    ];
    const currentIndex = regimes.indexOf(regimeVariation);
    const nextIndex = (currentIndex + 1) % regimes.length;
    setRegimeVariation(regimes[nextIndex]);
  };

  // Mouse drag handlers on 3D canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setAzimuth(prev => {
      const next = (prev + deltaX * 0.7) % 360;
      return next < 0 ? next + 360 : next;
    });

    setElevation(prev => {
      const next = prev - deltaY * 0.5;
      return Math.min(80, Math.max(12, next));
    });
  }, []);

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Color mapping function based on Metric elevation
  const getElevationColor = useCallback((val: number, alpha: number = 0.85) => {
    const ratio = Math.max(0, Math.min(1, (val - minVal) / Math.max(0.0001, maxVal - minVal)));

    if (colorPalette === 'TOS_HEATMAP') {
      // Classic thinkorswim: Low = Forest Emerald, Mid = Amber Gold, High = Crimson Fire
      if (ratio < 0.35) {
        const sub = ratio / 0.35;
        const r = Math.round(0 + sub * 20);
        const g = Math.round(180 + sub * 60);
        const b = Math.round(90 - sub * 40);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } else if (ratio < 0.7) {
        const sub = (ratio - 0.35) / 0.35;
        const r = Math.round(20 + sub * 225);
        const g = Math.round(230 - sub * 45);
        const b = Math.round(50 - sub * 50);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } else {
        const sub = (ratio - 0.7) / 0.3;
        const r = Math.round(245 + sub * 10);
        const g = Math.round(185 - sub * 145);
        const b = Math.round(0 + sub * 50);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    } else if (colorPalette === 'PLASMA_CYBER') {
      const r = Math.round(80 + ratio * 175);
      const g = Math.round(30 + Math.sin(ratio * Math.PI) * 190);
      const b = Math.round(220 - ratio * 150);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else if (colorPalette === 'TURBO_SPECTRAL') {
      // High-resolution spectral gradient
      const r = Math.round(35 + Math.sin(ratio * Math.PI * 1.2) * 220);
      const g = Math.round(50 + Math.cos((ratio - 0.5) * Math.PI) * 200);
      const b = Math.round(240 * (1 - ratio));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else {
      // Emerald Alpha
      const r = Math.round(10 + ratio * 80);
      const g = Math.round(140 + ratio * 115);
      const b = Math.round(120 + ratio * 60);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }, [minVal, maxVal, colorPalette]);

  // 3D Perspective Projection Function
  const project3D = useCallback((x: number, y: number, z: number, canvasWidth: number = 800, canvasHeight: number = 460) => {
    const radAzimuth = (azimuth * Math.PI) / 180;
    const radElevation = (elevation * Math.PI) / 180;

    // Scale factors
    const scaleX = 220 * zoomScale;
    const scaleY = 170 * zoomScale;
    const scaleZ = 130 * zoomScale;

    const px = x * scaleX;
    const py = y * scaleY;
    const pz = z * scaleZ;

    // Rotate around Z axis (Azimuth)
    const cosAz = Math.cos(radAzimuth);
    const sinAz = Math.sin(radAzimuth);
    const x1 = px * cosAz - py * sinAz;
    const y1 = px * sinAz + py * cosAz;
    const z1 = pz;

    // Rotate around X axis (Elevation / Pitch)
    const cosEl = Math.cos(radElevation);
    const sinEl = Math.sin(radElevation);
    const x2 = x1;
    const y2 = y1 * cosEl - z1 * sinEl;
    const z2 = y1 * sinEl + z1 * cosEl;

    // Center on canvas
    const screenX = canvasWidth / 2 + x2;
    const screenY = canvasHeight / 2 - z2 + 30;

    return {
      x: screenX,
      y: screenY,
      depth: y2
    };
  }, [azimuth, elevation, zoomScale]);

  // Generate 3D Quadrilateral Mesh Facets for Painter's Algorithm Depth-Sorted Rendering
  const meshFacets = useMemo(() => {
    const facets: {
      points: [SurfaceGridPoint, SurfaceGridPoint, SurfaceGridPoint, SurfaceGridPoint];
      screenCoords: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
      avgDepth: number;
      avgMetricVal: number;
      fillColor: string;
      strokeColor: string;
      rowIdx: number;
      colIdx: number;
    }[] = [];

    const numRows = pointsWithNormZ.length;
    const numCols = pointsWithNormZ[0].length;

    for (let r = 0; r < numRows - 1; r++) {
      for (let c = 0; c < numCols - 1; c++) {
        const p00 = pointsWithNormZ[r][c];
        const p10 = pointsWithNormZ[r + 1][c];
        const p11 = pointsWithNormZ[r + 1][c + 1];
        const p01 = pointsWithNormZ[r][c + 1];

        const pr00 = project3D(p00.xNorm, p00.yNorm, p00.zNorm);
        const pr10 = project3D(p10.xNorm, p10.yNorm, p10.zNorm);
        const pr11 = project3D(p11.xNorm, p11.yNorm, p11.zNorm);
        const pr01 = project3D(p01.xNorm, p01.yNorm, p01.zNorm);

        const avgDepth = (pr00.depth + pr10.depth + pr11.depth + pr01.depth) / 4;
        const avgMetricVal = (p00.metricValue + p10.metricValue + p11.metricValue + p01.metricValue) / 4;

        facets.push({
          points: [p00, p10, p11, p01],
          screenCoords: [
            { x: pr00.x, y: pr00.y },
            { x: pr10.x, y: pr10.y },
            { x: pr11.x, y: pr11.y },
            { x: pr01.x, y: pr01.y }
          ],
          avgDepth,
          avgMetricVal,
          fillColor: getElevationColor(avgMetricVal, wireframeOnly ? 0.05 : 0.78),
          strokeColor: wireframeOnly ? getElevationColor(avgMetricVal, 0.9) : 'rgba(255, 255, 255, 0.18)',
          rowIdx: r,
          colIdx: c
        });
      }
    }

    return facets.sort((a, b) => b.avgDepth - a.avgDepth);
  }, [pointsWithNormZ, project3D, getElevationColor, wireframeOnly]);

  // Project bounding box axes
  const axisLines = useMemo(() => {
    const pOrigin = project3D(-1, -1, -1);
    const pX = project3D(1, -1, -1);
    const pY = project3D(-1, 1, -1);
    const pZ = project3D(-1, -1, 1);

    return {
      origin: pOrigin,
      x: pX,
      y: pY,
      z: pZ
    };
  }, [project3D]);

  // Institutional Surface Analytics Metrics
  const surfaceMetrics = useMemo(() => {
    const frontRow = pointsWithNormZ[0];
    const atmFront = frontRow.find(p => p.moneynessPct === 0) || frontRow[5];
    const putWingFront = frontRow.find(p => p.moneynessPct === -12) || frontRow[2];
    const callWingFront = frontRow.find(p => p.moneynessPct === 12) || frontRow[8];

    const backRow = pointsWithNormZ[pointsWithNormZ.length - 2];
    const atmBack = backRow.find(p => p.moneynessPct === 0) || backRow[5];

    const putSkewSlope = Number((putWingFront.iv - atmFront.iv).toFixed(2));
    const callSkewSlope = Number((callWingFront.iv - atmFront.iv).toFixed(2));
    const termStructureSlope = Number((atmBack.iv - atmFront.iv).toFixed(2));
    const isContango = termStructureSlope > 0;

    return {
      atmFrontIv: atmFront.iv,
      atmBackIv: atmBack.iv,
      putSkewSlope,
      callSkewSlope,
      termStructureSlope,
      isContango,
      rangeSpan: Number((maxVal - minVal).toFixed(metricVariationInfo.decimals))
    };
  }, [pointsWithNormZ, minVal, maxVal, metricVariationInfo]);

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. TOP HEADER & PRIMARY VARIATION CONTROL BAR */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 shadow-md space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase text-xs">
                    Volatility Surface Engine
                  </span>
                  <span className="px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded text-[10px] font-bold">
                    {metricVariationInfo.symbolLabel}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-sans">
                  Regime: <strong className="text-white">{regimeModifiers.name}</strong>
                </span>
              </div>
            </div>

            {/* Quick Symbol Pills */}
            <div className="hidden xl:flex items-center gap-1 border-l border-[#21262d] pl-3">
              {assets.slice(0, 7).map(a => (
                <button
                  key={a.symbol}
                  onClick={() => onSelectSymbol(a.symbol)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    a.symbol === asset.symbol
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-[#161b22] text-slate-400 hover:text-white border border-[#21262d]'
                  }`}
                >
                  {a.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* PRIMARY "CHANGE VARIATION" ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Change Variation Modal Button */}
            <button
              onClick={() => setIsVariationDrawerOpen(!isVariationDrawerOpen)}
              className="px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Change Variation</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isVariationDrawerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick Cycle Variation Button */}
            <button
              onClick={handleCycleVariation}
              className="px-2.5 py-1.5 rounded-md bg-[#161b22] hover:bg-[#1c2128] text-amber-400 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Quickly switch to next mathematical variation (IV, Total Variance, Local Vol, Forward Vol, Vol of Vol, Vega)"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Next Variation</span>
            </button>

            {/* Quick Cycle Regime Button */}
            <button
              onClick={handleCycleRegime}
              className="px-2.5 py-1.5 rounded-md bg-[#161b22] hover:bg-[#1c2128] text-slate-200 border border-[#21262d] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Cycle market regimes: Baseline, Earnings Spike, Crash Skew, Crypto Squeeze, Contango, IV Crush"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Cycle Regime</span>
            </button>
          </div>
        </div>

        {/* 2. VARIATION PILLS SELECTOR BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#21262d] text-[11px]">
          {/* Metric Variation Selector Pills */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">Surface Metric:</span>
            {[
              { id: 'IMPLIED_VOL', label: 'Implied Vol (σ)' },
              { id: 'TOTAL_VARIANCE', label: 'Total Variance (w)' },
              { id: 'LOCAL_VOL', label: 'Local Vol (σ_loc)' },
              { id: 'FORWARD_VOL', label: 'Forward Vol (σ_fwd)' },
              { id: 'VOL_OF_VOL', label: 'Vol of Vol (χ)' },
              { id: 'VEGA_SURFACE', label: 'Vega Risk (ν)' }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setMetricVariation(v.id as SurfaceMetricVariation)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  metricVariation === v.id
                    ? 'bg-amber-400 text-black shadow'
                    : 'bg-[#161b22] text-slate-400 hover:text-white border border-[#21262d]'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Coordinate Variation Selector */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">Moneyness:</span>
            {[
              { id: 'STRIKE_DOLLARS', label: 'Strike ($)' },
              { id: 'PERCENT_MONEYNESS', label: 'Moneyness %' },
              { id: 'DELTA_METRIC', label: 'Delta (Δ)' },
              { id: 'LOG_MONEYNESS', label: 'ln(K/S)' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setCoordVariation(c.id as MoneynessCoordinateVariation)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                  coordVariation === c.id
                    ? 'bg-sky-500 text-black shadow'
                    : 'bg-[#161b22] text-slate-400 hover:text-white border border-[#21262d]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. EXPANDABLE "CHANGE VARIATION" CONTROL PANEL / DRAWER */}
      {isVariationDrawerOpen && (
        <div className="bg-[#12171f] border-2 border-amber-500/50 rounded-lg p-4 shadow-2xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">
                Surface Variation Control Center
              </h3>
              <span className="text-[11px] text-slate-400 font-sans">
                Select mathematical formulations, market regimes, and coordinate transformations
              </span>
            </div>
            <button
              onClick={() => setIsVariationDrawerOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1c2128]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Box 1: Mathematical & Metric Variations */}
            <div className="bg-[#090d11] border border-[#21262d] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-[#21262d] pb-1">
                <span>1. Mathematical Variations</span>
                <span className="text-[10px] text-slate-500">Z-Axis Metric</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                {[
                  {
                    id: 'IMPLIED_VOL',
                    name: 'Implied Volatility (σ)',
                    formula: 'C_BS(S, K, T, σ) = C_mkt',
                    desc: 'Annualized Black-Scholes implied volatility percentage.'
                  },
                  {
                    id: 'TOTAL_VARIANCE',
                    name: 'Total Implied Variance (w)',
                    formula: 'w(k, τ) = σ² × τ',
                    desc: 'SVI parameterization. Monotonic in time for arbitrage-free calendar analysis.'
                  },
                  {
                    id: 'LOCAL_VOL',
                    name: 'Dupire Local Volatility',
                    formula: 'σ_loc² = (∂C/∂T) / [½K² ∂²C/∂K²]',
                    desc: 'Instantaneous local diffusion rate conditioned on spot reaching K at time T.'
                  },
                  {
                    id: 'FORWARD_VOL',
                    name: 'Forward-Starting Volatility',
                    formula: 'σ_fwd = √[(σ₂²T₂ - σ₁²T₁) / (T₂ - T₁)]',
                    desc: 'Forward variance pricing between successive expiration cycles.'
                  },
                  {
                    id: 'VOL_OF_VOL',
                    name: 'Vol of Vol (Convexity)',
                    formula: 'χ = ∂²σ / ∂K²',
                    desc: 'Smile curvature tracking butterfly spread and out-of-the-money fat-tail pricing.'
                  },
                  {
                    id: 'VEGA_SURFACE',
                    name: 'Option Vega Sensitivity',
                    formula: 'ν = S√T φ(d₁)',
                    desc: 'Dollar P/L sensitivity per 1.00% parallel shift in implied volatility.'
                  }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => setMetricVariation(item.id as SurfaceMetricVariation)}
                    className={`p-2 rounded cursor-pointer border transition-all ${
                      metricVariation === item.id
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                        : 'bg-[#161b22] border-[#21262d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className={metricVariation === item.id ? 'text-amber-300' : 'text-slate-300'}>
                        {item.name}
                      </span>
                      <code className="text-[10px] text-amber-400/90">{item.formula}</code>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 2: Market Regime Variations */}
            <div className="bg-[#090d11] border border-[#21262d] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-rose-400 border-b border-[#21262d] pb-1">
                <span>2. Market Regime Variations</span>
                <span className="text-[10px] text-slate-500">Structural Shape</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                {[
                  {
                    id: 'CURRENT_MARKET',
                    name: 'Current Market Baseline',
                    tag: 'Live Real-Time',
                    desc: 'Calibrated to active underlying price and implied volatility skew.'
                  },
                  {
                    id: 'EARNINGS_SPIKE',
                    name: 'Earnings / Binary Event Shock',
                    tag: 'Inverted Spike',
                    desc: 'Severe front-month backwardation spike with rapid term curve collapse.'
                  },
                  {
                    id: 'PANIC_CRASH_SKEW',
                    name: 'Downside Panic / Crash Skew',
                    tag: 'Heavy Put Bid',
                    desc: 'Steep asymmetric put skew driven by downside crash hedging demand.'
                  },
                  {
                    id: 'DUAL_WING_SQUEEZE',
                    name: 'Dual-Wing Convexity (Crypto/Meme)',
                    tag: 'High Gamma',
                    desc: 'U-shaped smile with elevated call wing speculation & put protection.'
                  },
                  {
                    id: 'STEEP_CONTANGO',
                    name: 'Steep Contango / Low-Vol Roll',
                    tag: 'Term Premium',
                    desc: 'Low front-month IV rising steadily toward LEAPS contracts.'
                  },
                  {
                    id: 'IV_CRUSH',
                    name: 'Post-Earnings Volatility Crush',
                    tag: 'IV Implosion',
                    desc: 'Immediate post-catalyst collapse in front-month implied volatility.'
                  },
                  {
                    id: 'VOL_SQUEEZE',
                    name: 'Vol Squeeze / Compression',
                    tag: 'Mean-Reversion',
                    desc: 'Compressed volatility surface coiling before directional breakout.'
                  }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => setRegimeVariation(item.id as SurfaceRegimeVariation)}
                    className={`p-2 rounded cursor-pointer border transition-all ${
                      regimeVariation === item.id
                        ? 'bg-rose-500/15 border-rose-500 text-white shadow-sm'
                        : 'bg-[#161b22] border-[#21262d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className={regimeVariation === item.id ? 'text-rose-300' : 'text-slate-300'}>
                        {item.name}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#21262d] text-slate-400 font-normal">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 3: Moneyness & Topology Variations */}
            <div className="bg-[#090d11] border border-[#21262d] rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-sky-400 border-b border-[#21262d] pb-1">
                <span>3. Coordinate & Render Variations</span>
                <span className="text-[10px] text-slate-500">Axes & Shader</span>
              </div>

              {/* Coordinate Options */}
              <div className="space-y-1.5 text-[11px]">
                <div className="text-[10px] text-slate-400 uppercase font-bold">X-Axis Coordinate:</div>
                {[
                  { id: 'STRIKE_DOLLARS', name: 'Strike Price ($)', desc: 'Absolute strike price levels in USD.' },
                  { id: 'PERCENT_MONEYNESS', name: 'Moneyness % (K/S - 1)', desc: 'Spot-relative percentage deviation (±20%).' },
                  { id: 'DELTA_METRIC', name: 'Delta Space (10Δ - 90Δ)', desc: 'Black-Scholes option delta mapping.' },
                  { id: 'LOG_MONEYNESS', name: 'Log-Moneyness ln(K/S)', desc: 'Canonical quant dimensionless moneyness.' }
                ].map(c => (
                  <div
                    key={c.id}
                    onClick={() => setCoordVariation(c.id as MoneynessCoordinateVariation)}
                    className={`p-1.5 rounded cursor-pointer border flex items-center justify-between text-xs ${
                      coordVariation === c.id
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                        : 'bg-[#161b22] border-[#21262d] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{c.name}</span>
                    {coordVariation === c.id && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                ))}
              </div>

              {/* Color Themes */}
              <div className="space-y-1.5 text-[11px] pt-2 border-t border-[#21262d]">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Color Palette Theme:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'TOS_HEATMAP', name: 'TOS Heatmap' },
                    { id: 'PLASMA_CYBER', name: 'Plasma Cyber' },
                    { id: 'TURBO_SPECTRAL', name: 'Turbo Spectral' },
                    { id: 'EMERALD_ALPHA', name: 'Emerald Alpha' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setColorPalette(p.id as any)}
                      className={`p-1.5 rounded text-[10px] font-bold border text-left ${
                        colorPalette === p.id
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-[#161b22] text-slate-400 border-[#21262d] hover:text-white'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. QUANTITATIVE KPI RIBBON FOR CURRENT VARIATION */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-sans uppercase">Active Variation</div>
          <div className="text-amber-400 font-bold text-xs mt-0.5 truncate">{metricVariationInfo.title}</div>
          <div className="text-[10px] text-slate-500 font-sans">{metricVariationInfo.symbolLabel}</div>
        </div>

        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-sans uppercase">Front ATM IV (30D)</div>
          <div className="text-white font-bold text-sm mt-0.5">{surfaceMetrics.atmFrontIv.toFixed(1)}%</div>
          <div className="text-[10px] text-slate-500 font-sans">Near-Term Vol</div>
        </div>

        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-sans uppercase">Back ATM IV (254D)</div>
          <div className="text-sky-400 font-bold text-sm mt-0.5">{surfaceMetrics.atmBackIv.toFixed(1)}%</div>
          <div className="text-[10px] text-slate-500 font-sans">Long-Tenor Anchor</div>
        </div>

        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-sans uppercase">25-Delta Put Skew</div>
          <div className="text-rose-400 font-bold text-sm mt-0.5">+{surfaceMetrics.putSkewSlope.toFixed(1)}% IV</div>
          <div className="text-[10px] text-slate-500 font-sans">Crash Hedging Slope</div>
        </div>

        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-sans uppercase">Term Structure</div>
          <div className={`font-bold text-sm mt-0.5 flex items-center gap-1 ${
            surfaceMetrics.isContango ? 'text-[#00c076]' : 'text-rose-400'
          }`}>
            <span>{surfaceMetrics.isContango ? 'CONTANGO' : 'BACKWARDATION'}</span>
            <span className="text-[10px]">({surfaceMetrics.termStructureSlope > 0 ? '+' : ''}{surfaceMetrics.termStructureSlope.toFixed(1)}%)</span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Slope Regime</div>
        </div>

        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-sans uppercase">Surface Range (Z)</div>
          <div className="text-white font-bold text-sm mt-0.5">
            {minVal.toFixed(metricVariationInfo.decimals)} - {maxVal.toFixed(metricVariationInfo.decimals)} {metricVariationInfo.unit}
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Min/Max Elevation</div>
        </div>
      </div>

      {/* 5. MAIN INTERACTIVE VISUALIZER PANEL */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow-xl relative overflow-hidden">
        {/* Controls Toolbar Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-[#21262d] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
              <button
                onClick={() => setViewMode('3D_SURFACE')}
                className={`px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === '3D_SURFACE' ? 'bg-[#1c2128] text-amber-400 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>3D Isometric</span>
              </button>
              <button
                onClick={() => setViewMode('2D_CONTOUR')}
                className={`px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === '2D_CONTOUR' ? 'bg-[#1c2128] text-amber-400 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>2D Contour</span>
              </button>
              <button
                onClick={() => setViewMode('SKEW_SLICES')}
                className={`px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'SKEW_SLICES' ? 'bg-[#1c2128] text-amber-400 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Smile Slices</span>
              </button>
              <button
                onClick={() => setViewMode('TERM_STRUCTURE')}
                className={`px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'TERM_STRUCTURE' ? 'bg-[#1c2128] text-amber-400 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Term Curve</span>
              </button>
            </div>

            {/* 3D Camera Controls */}
            {viewMode === '3D_SURFACE' && (
              <>
                <button
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`px-2.5 py-1 rounded font-bold flex items-center gap-1.5 border transition-all ${
                    isAutoRotating
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                      : 'bg-[#161b22] text-slate-300 border-[#21262d] hover:text-white'
                  }`}
                  title="Auto Orbit Surface"
                >
                  {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAutoRotating ? 'Pause Orbit' : 'Auto Orbit'}</span>
                </button>

                <button
                  onClick={() => {
                    setAzimuth(45);
                    setElevation(32);
                    setZoomScale(1.05);
                  }}
                  className="px-2 py-1 rounded bg-[#161b22] hover:bg-[#1c2128] text-slate-300 border border-[#21262d] hover:text-white flex items-center gap-1"
                  title="Reset 3D Camera Angles"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Reset Camera</span>
                </button>

                <button
                  onClick={() => setWireframeOnly(!wireframeOnly)}
                  className={`px-2 py-1 rounded font-bold border transition-all ${
                    wireframeOnly
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                      : 'bg-[#161b22] text-slate-400 border-[#21262d] hover:text-white'
                  }`}
                >
                  Wireframe
                </button>
              </>
            )}
          </div>

          {/* Quick Scenario Sliders */}
          <div className="flex items-center gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 bg-[#161b22] border border-[#21262d] px-2 py-0.5 rounded">
              <span className="text-slate-400">IV Shift:</span>
              <input
                type="range"
                min="-15"
                max="25"
                step="1"
                value={ivParallelShift}
                onChange={e => setIvParallelShift(Number(e.target.value))}
                className="w-14 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="font-bold text-white w-8 text-right">
                {ivParallelShift > 0 ? '+' : ''}{ivParallelShift}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#161b22] border border-[#21262d] px-2 py-0.5 rounded">
              <span className="text-slate-400">Skew Tilt:</span>
              <input
                type="range"
                min="-6"
                max="8"
                step="1"
                value={skewTilt}
                onChange={e => setSkewTilt(Number(e.target.value))}
                className="w-14 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00c076]"
              />
              <span className="font-bold text-white w-5 text-right">{skewTilt}</span>
            </div>

            {(ivParallelShift !== 0 || skewTilt !== 0 || termStructureTilt !== 0 || regimeVariation !== 'CURRENT_MARKET') && (
              <button
                onClick={() => {
                  setIvParallelShift(0);
                  setSkewTilt(0);
                  setTermStructureTilt(0);
                  setRegimeVariation('CURRENT_MARKET');
                }}
                className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* 5A. VIEW 1: 3D ISOMETRIC VOLATILITY SURFACE */}
        {viewMode === '3D_SURFACE' && (
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-[520px] bg-[#090d11] rounded-lg relative cursor-grab active:cursor-grabbing border border-[#1b2129] overflow-hidden select-none"
          >
            {/* 3D Interactive SVG Surface */}
            <svg className="w-full h-full" viewBox="0 0 800 480">
              {/* Background 3D Grid Planes / Axes */}
              <g className="text-slate-600 font-mono text-[9px]">
                <line
                  x1={axisLines.origin.x}
                  y1={axisLines.origin.y}
                  x2={axisLines.x.x}
                  y2={axisLines.x.y}
                  stroke="#30363d"
                  strokeWidth="1.5"
                />
                <line
                  x1={axisLines.origin.x}
                  y1={axisLines.origin.y}
                  x2={axisLines.y.x}
                  y2={axisLines.y.y}
                  stroke="#30363d"
                  strokeWidth="1.5"
                />
                <line
                  x1={axisLines.origin.x}
                  y1={axisLines.origin.y}
                  x2={axisLines.z.x}
                  y2={axisLines.z.y}
                  stroke="#388bfd"
                  strokeWidth="1.5"
                />

                {/* Axis Labels */}
                <text x={axisLines.x.x + 8} y={axisLines.x.y + 4} fill="#8b949e" fontWeight="bold">
                  {coordVariation === 'DELTA_METRIC' ? 'DELTA (Δ) →' : coordVariation === 'LOG_MONEYNESS' ? 'ln(K/S) →' : 'STRIKE ($K) →'}
                </text>
                <text x={axisLines.y.x - 14} y={axisLines.y.y + 16} fill="#8b949e" fontWeight="bold">
                  ← EXPIRATION (DTE)
                </text>
                <text x={axisLines.z.x - 10} y={axisLines.z.y - 10} fill="#58a6ff" fontWeight="bold">
                  ↑ {metricVariationInfo.symbolLabel}
                </text>
              </g>

              {/* 3D Depth-Sorted Facets (Polygons) */}
              {meshFacets.map((facet, idx) => {
                const pathD = `M ${facet.screenCoords[0].x} ${facet.screenCoords[0].y} L ${facet.screenCoords[1].x} ${facet.screenCoords[1].y} L ${facet.screenCoords[2].x} ${facet.screenCoords[2].y} L ${facet.screenCoords[3].x} ${facet.screenCoords[3].y} Z`;

                const isHoveredFacet = hoveredPoint && facet.points.some(
                  p => p.strike === hoveredPoint.strike && p.dte === hoveredPoint.dte
                );

                return (
                  <path
                    key={`facet-${idx}`}
                    d={pathD}
                    fill={isHoveredFacet ? 'rgba(255, 255, 255, 0.45)' : facet.fillColor}
                    stroke={isHoveredFacet ? '#ffffff' : facet.strokeColor}
                    strokeWidth={isHoveredFacet ? '1.5' : '0.8'}
                    className="transition-colors duration-75 cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(facet.points[0])}
                  />
                );
              })}

              {/* 3D Grid Vertices / Data Nodes */}
              {showDataPoints && pointsWithNormZ.map((row, rIdx) =>
                row.map((pt, cIdx) => {
                  const pr = project3D(pt.xNorm, pt.yNorm, pt.zNorm);
                  const isHovered = hoveredPoint?.strike === pt.strike && hoveredPoint?.dte === pt.dte;
                  const isAtm = pt.moneynessPct === 0;

                  return (
                    <circle
                      key={`pt-${rIdx}-${cIdx}`}
                      cx={pr.x}
                      cy={pr.y}
                      r={isHovered ? 6 : isAtm ? 3 : 1.8}
                      fill={isHovered ? '#ffffff' : isAtm ? '#fbbf24' : getElevationColor(pt.metricValue, 1)}
                      stroke={isHovered ? '#000000' : 'rgba(0,0,0,0.5)'}
                      strokeWidth={isHovered ? 2 : 0.8}
                      className="cursor-pointer transition-all duration-100 hover:scale-150"
                      onMouseEnter={e => {
                        e.stopPropagation();
                        setHoveredPoint(pt);
                      }}
                      onClick={() => {
                        if (onPopulateOrder) {
                          onPopulateOrder(asset.symbol, 'BUY', pt.callPrice, {
                            strike: pt.strike,
                            expiration: pt.expiryLabel,
                            optionType: 'CALL'
                          });
                        }
                      }}
                    />
                  );
                })
              )}

              {/* Hover Highlight Ring and Projected Ground Drop-Line */}
              {hoveredPoint && (() => {
                const pr = project3D(hoveredPoint.xNorm, hoveredPoint.yNorm, hoveredPoint.zNorm);
                const prFloor = project3D(hoveredPoint.xNorm, hoveredPoint.yNorm, -1);

                return (
                  <g>
                    <line
                      x1={pr.x}
                      y1={pr.y}
                      x2={prFloor.x}
                      y2={prFloor.y}
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      strokeDasharray="3,3"
                    />
                    <circle cx={prFloor.x} cy={prFloor.y} r="3" fill="#fbbf24" opacity="0.6" />
                    <circle cx={pr.x} cy={pr.y} r="8" fill="none" stroke="#fbbf24" strokeWidth="2" />
                    <circle cx={pr.x} cy={pr.y} r="3" fill="#fbbf24" />
                  </g>
                );
              })()}
            </svg>

            {/* Instruction Overlay Pill */}
            <div className="absolute top-3 left-3 bg-[#161b22]/90 backdrop-blur-md border border-[#21262d] rounded px-2.5 py-1.5 text-[10px] text-slate-300 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Click & drag to rotate (Pitch: {elevation}° · Azimuth: {azimuth.toFixed(0)}°)</span>
            </div>

            {/* Variation Formula Badge Overlay */}
            <div className="absolute top-3 left-64 hidden md:flex items-center gap-2 bg-[#161b22]/90 backdrop-blur-md border border-amber-500/40 rounded px-2.5 py-1 text-[11px] text-amber-300 font-mono">
              <Binary className="w-3.5 h-3.5 text-amber-400" />
              <span>{metricVariationInfo.formula}</span>
            </div>

            {/* Elevation Color Bar Legend */}
            <div className="absolute bottom-3 left-3 bg-[#161b22]/90 backdrop-blur-md border border-[#21262d] rounded p-2 text-[10px] space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[9px]">
                {metricVariationInfo.symbolLabel} Scale
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono">{minVal.toFixed(metricVariationInfo.decimals)}</span>
                <div
                  className="w-28 h-2 rounded"
                  style={{
                    background: colorPalette === 'TOS_HEATMAP'
                      ? 'linear-gradient(to right, #00c076, #fbbf24, #ef4444)'
                      : colorPalette === 'PLASMA_CYBER'
                      ? 'linear-gradient(to right, #501e96, #d946ef, #06b6d4)'
                      : colorPalette === 'TURBO_SPECTRAL'
                      ? 'linear-gradient(to right, #0055ff, #00ffaa, #ffdd00, #ff2200)'
                      : 'linear-gradient(to right, #064e3b, #10b981, #6ee7b7)'
                  }}
                />
                <span className="text-amber-400 font-bold font-mono">
                  {maxVal.toFixed(metricVariationInfo.decimals)} {metricVariationInfo.unit}
                </span>
              </div>
            </div>

            {/* Interactive Hover HUD / Probe Card */}
            {hoveredPoint && (
              <div className="absolute top-3 right-3 bg-[#161b22]/95 backdrop-blur-md border border-amber-500/50 rounded-lg p-3 text-xs w-68 shadow-2xl space-y-2 pointer-events-auto">
                <div className="flex items-center justify-between border-b border-[#21262d] pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className="font-bold text-white uppercase">{asset.symbol} Surface Probe</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 font-bold">
                    {hoveredPoint.expiryLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Strike / Moneyness:</span>
                    <div className="font-bold text-white text-xs">${hoveredPoint.strike.toFixed(2)}</div>
                    <span className="text-[10px] text-slate-500">
                      {hoveredPoint.moneynessPct >= 0 ? `+${hoveredPoint.moneynessPct}% Call` : `${hoveredPoint.moneynessPct}% Put`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">{metricVariationInfo.title}:</span>
                    <div className="font-bold text-amber-400 text-sm">
                      {hoveredPoint.metricValue.toFixed(metricVariationInfo.decimals)} {hoveredPoint.metricUnit}
                    </div>
                    <span className="text-[10px] text-slate-500">IV: {hoveredPoint.iv.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Additional metrics breakdown */}
                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-[#21262d] text-[10px]">
                  <div>
                    <span className="text-slate-500">Call Δ:</span>
                    <div className="font-bold text-[#00c076]">+{hoveredPoint.deltaCall}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Local Vol:</span>
                    <div className="font-bold text-sky-400">{hoveredPoint.localVol.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Var:</span>
                    <div className="font-bold text-amber-300">{hoveredPoint.totalVariance.toFixed(3)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#21262d]">
                  <button
                    onClick={() => {
                      if (onPopulateOrder) {
                        onPopulateOrder(asset.symbol, 'BUY', hoveredPoint.callPrice, {
                          strike: hoveredPoint.strike,
                          expiration: hoveredPoint.expiryLabel,
                          optionType: 'CALL'
                        });
                      }
                    }}
                    className="flex-1 py-1 px-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                  >
                    <span>Stage Call (${hoveredPoint.callPrice})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      if (onPopulateOrder) {
                        onPopulateOrder(asset.symbol, 'BUY', hoveredPoint.putPrice, {
                          strike: hoveredPoint.strike,
                          expiration: hoveredPoint.expiryLabel,
                          optionType: 'PUT'
                        });
                      }
                    }}
                    className="flex-1 py-1 px-2 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                  >
                    <span>Stage Put (${hoveredPoint.putPrice})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5B. VIEW 2: 2D CONTOUR HEATMAP */}
        {viewMode === '2D_CONTOUR' && (
          <div className="space-y-3">
            <div className="bg-[#090d11] border border-[#1b2129] rounded-lg p-4">
              <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>
                  {metricVariationInfo.title} Contour Heatmap (Moneyness vs Expiration)
                </span>
                <span className="text-[11px] text-slate-400 font-sans">
                  Hover or click cell to inspect / stage order
                </span>
              </div>

              {/* Heatmap Grid Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#21262d] text-slate-400">
                      <th className="p-2 text-left bg-[#161b22] sticky left-0 z-10">Expiration / DTE</th>
                      {moneynessLevels.map(m => (
                        <th key={m} className={`p-2 text-center ${m === 0 ? 'text-amber-400 font-bold bg-[#161b22]' : ''}`}>
                          {coordVariation === 'DELTA_METRIC'
                            ? `${m < 0 ? 50 + m * 2 : 50 + m * 2}Δ`
                            : m >= 0 ? `+${m}%` : `${m}%`}
                          <div className="text-[9px] font-normal text-slate-500">
                            ${(spotPrice * (1 + m / 100)).toFixed(0)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pointsWithNormZ.map((row) => (
                      <tr key={row[0].expiryLabel} className="border-b border-[#21262d]/50 hover:bg-[#161b22]/40">
                        <td className="p-2 font-bold text-white bg-[#161b22] sticky left-0 z-10 whitespace-nowrap">
                          {row[0].expiryLabel}
                          <span className="text-slate-400 font-normal ml-2">({row[0].dte}D)</span>
                        </td>
                        {row.map(pt => {
                          const isHovered = hoveredPoint?.strike === pt.strike && hoveredPoint?.dte === pt.dte;
                          const cellBg = getElevationColor(pt.metricValue, 0.45);

                          return (
                            <td
                              key={pt.strike}
                              onClick={() => {
                                setHoveredPoint(pt);
                                if (onPopulateOrder) {
                                  onPopulateOrder(asset.symbol, 'BUY', pt.callPrice, {
                                    strike: pt.strike,
                                    expiration: pt.expiryLabel,
                                    optionType: 'CALL'
                                  });
                                }
                              }}
                              onMouseEnter={() => setHoveredPoint(pt)}
                              className={`p-2 text-center cursor-pointer transition-all duration-100 ${
                                isHovered ? 'ring-2 ring-amber-400 z-10 scale-105 bg-amber-400/20' : ''
                              }`}
                              style={{ backgroundColor: cellBg }}
                            >
                              <div className="font-bold text-white text-xs">
                                {pt.metricValue.toFixed(metricVariationInfo.decimals)}
                              </div>
                              <div className="text-[9px] text-slate-300">IV {pt.iv.toFixed(0)}%</div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5C. VIEW 3: VOLATILITY SMILE SKEW SLICES */}
        {viewMode === 'SKEW_SLICES' && (
          <div className="space-y-3">
            <div className="bg-[#090d11] border border-[#1b2129] rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {metricVariationInfo.title} Curves Across Expirations ({asset.symbol})
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Variation: {metricVariationInfo.description}
                  </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-2.5 h-0.5 bg-amber-400"></span> 2D (Weekly)
                  </span>
                  <span className="flex items-center gap-1.5 text-[#00c076]">
                    <span className="w-2.5 h-0.5 bg-[#00c076]"></span> 16D (Front Month)
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <span className="w-2.5 h-0.5 bg-sky-400"></span> 44D (Mid-Term)
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <span className="w-2.5 h-0.5 bg-purple-400"></span> 254D (LEAPS)
                  </span>
                </div>
              </div>

              {/* 2D Multi-Curve SVG */}
              <div className="h-72 w-full">
                <svg className="w-full h-full" viewBox="0 0 760 260">
                  {[0, 1, 2, 3, 4].map(i => {
                    const y = 30 + i * 50;
                    const val = maxVal - (i / 4) * (maxVal - minVal);
                    return (
                      <g key={i}>
                        <line x1="60" y1={y} x2="730" y2={y} stroke="#21262d" strokeDasharray="3,3" />
                        <text x="50" y={y + 3} fill="#6e7681" textAnchor="end" fontSize="9" fontFamily="monospace">
                          {val.toFixed(metricVariationInfo.decimals)}
                        </text>
                      </g>
                    );
                  })}

                  {/* ATM Strike Line */}
                  <line x1="390" y1="20" x2="390" y2="230" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4,4" />
                  <text x="395" y="32" fill="#fbbf24" fontSize="9" fontWeight="bold">
                    ATM (${spotPrice.toFixed(0)})
                  </text>

                  {/* Curves for selected tenors */}
                  {[
                    { row: pointsWithNormZ[0], color: '#fbbf24', label: '2D Weekly' },
                    { row: pointsWithNormZ[2], color: '#00c076', label: '16D' },
                    { row: pointsWithNormZ[4], color: '#388bfd', label: '44D' },
                    { row: pointsWithNormZ[7], color: '#a855f7', label: '254D' }
                  ].map((series, sIdx) => {
                    const pointsStr = series.row.map((pt, idx) => {
                      const x = 70 + (idx / (series.row.length - 1)) * 640;
                      const y = 230 - ((pt.metricValue - minVal) / Math.max(0.0001, maxVal - minVal)) * 200;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <g key={sIdx}>
                        <polyline
                          fill="none"
                          stroke={series.color}
                          strokeWidth="2.5"
                          points={pointsStr}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {series.row.map((pt, idx) => {
                          const x = 70 + (idx / (series.row.length - 1)) * 640;
                          const y = 230 - ((pt.metricValue - minVal) / Math.max(0.0001, maxVal - minVal)) * 200;
                          const isHovered = hoveredPoint?.strike === pt.strike && hoveredPoint?.dte === pt.dte;

                          return (
                            <circle
                              key={idx}
                              cx={x}
                              cy={y}
                              r={isHovered ? 5 : 3}
                              fill={series.color}
                              stroke="#000000"
                              strokeWidth="1"
                              className="cursor-pointer hover:scale-150 transition-all"
                              onMouseEnter={() => setHoveredPoint(pt)}
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  {/* X-Axis Moneyness Labels */}
                  {moneynessLevels.map((m, idx) => {
                    const x = 70 + (idx / (moneynessLevels.length - 1)) * 640;
                    return (
                      <g key={m}>
                        <text x={x} y="248" fill="#8b949e" textAnchor="middle" fontSize="9">
                          {m >= 0 ? `+${m}%` : `${m}%`}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* 5D. VIEW 4: ATM TERM STRUCTURE CURVE */}
        {viewMode === 'TERM_STRUCTURE' && (
          <div className="space-y-3">
            <div className="bg-[#090d11] border border-[#1b2129] rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    At-The-Money (ATM) {metricVariationInfo.title} Term Structure
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Regime: {regimeModifiers.name} · {regimeModifiers.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Slope:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    surfaceMetrics.isContango ? 'bg-[#00c076]/20 text-[#00c076]' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {surfaceMetrics.isContango ? 'Contango (+)' : 'Backwardation (-)'}
                  </span>
                </div>
              </div>

              {/* Term Structure Line Chart */}
              <div className="h-72 w-full">
                <svg className="w-full h-full" viewBox="0 0 760 260">
                  {[0, 1, 2, 3, 4].map(i => {
                    const y = 30 + i * 50;
                    const val = maxVal - (i / 4) * (maxVal - minVal);
                    return (
                      <g key={i}>
                        <line x1="60" y1={y} x2="730" y2={y} stroke="#21262d" strokeDasharray="3,3" />
                        <text x="50" y={y + 3} fill="#6e7681" textAnchor="end" fontSize="9" fontFamily="monospace">
                          {val.toFixed(metricVariationInfo.decimals)}
                        </text>
                      </g>
                    );
                  })}

                  {(() => {
                    const atmPoints = pointsWithNormZ.map(row => row.find(p => p.moneynessPct === 0) || row[5]);
                    const pointsStr = atmPoints.map((pt, idx) => {
                      const x = 80 + (idx / (atmPoints.length - 1)) * 620;
                      const y = 230 - ((pt.metricValue - minVal) / Math.max(0.0001, maxVal - minVal)) * 190;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <g>
                        <polygon
                          points={`80,230 ${pointsStr} 700,230`}
                          fill="url(#termGrad)"
                          opacity="0.25"
                        />
                        <defs>
                          <linearGradient id="termGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        <polyline
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="3"
                          points={pointsStr}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {atmPoints.map((pt, idx) => {
                          const x = 80 + (idx / (atmPoints.length - 1)) * 620;
                          const y = 230 - ((pt.metricValue - minVal) / Math.max(0.0001, maxVal - minVal)) * 190;
                          const isHovered = hoveredPoint?.strike === pt.strike && hoveredPoint?.dte === pt.dte;

                          return (
                            <g key={idx}>
                              <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? 6 : 4}
                                fill="#fbbf24"
                                stroke="#000000"
                                strokeWidth="2"
                                className="cursor-pointer hover:scale-150 transition-all"
                                onMouseEnter={() => setHoveredPoint(pt)}
                              />
                              <text x={x} y={y - 10} fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
                                {pt.metricValue.toFixed(metricVariationInfo.decimals)}
                              </text>
                              <text x={x} y="248" fill="#8b949e" textAnchor="middle" fontSize="9">
                                {pt.expiryLabel}
                              </text>
                              <text x={x} y="258" fill="#6e7681" textAnchor="middle" fontSize="8">
                                ({pt.dte}D)
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. COMPLETE NUMERICAL SURFACE MATRIX TABLE WITH VARIATION COLUMNS */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {metricVariationInfo.title} Term Matrix & Multi-Variation Grid ({asset.symbol})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-sans">
            Active Variation: <strong className="text-amber-400">{metricVariationInfo.symbolLabel}</strong> ({regimeModifiers.name})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#21262d] text-slate-400 text-[11px] bg-[#161b22]">
                <th className="p-2.5 font-bold">Expiration</th>
                <th className="p-2.5 font-bold">DTE</th>
                <th className="p-2.5 font-bold">ATM Strike</th>
                <th className="p-2.5 font-bold">ATM IV%</th>
                <th className="p-2.5 font-bold text-amber-400">{metricVariationInfo.title}</th>
                <th className="p-2.5 font-bold">Total Variance (w)</th>
                <th className="p-2.5 font-bold">Local Vol (σ_loc)</th>
                <th className="p-2.5 font-bold">Vega ($/1%)</th>
                <th className="p-2.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]/60 font-mono text-[11px]">
              {pointsWithNormZ.map(row => {
                const atmPt = row.find(p => p.moneynessPct === 0) || row[5];

                return (
                  <tr key={atmPt.expiryLabel} className="hover:bg-[#161b22]/50 transition-colors">
                    <td className="p-2.5 font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {atmPt.expiryLabel}
                    </td>
                    <td className="p-2.5 text-slate-300">{atmPt.dte} Days</td>
                    <td className="p-2.5 text-white">${atmPt.strike.toFixed(2)}</td>
                    <td className="p-2.5 font-bold text-slate-300">{atmPt.iv.toFixed(1)}%</td>
                    <td className="p-2.5 font-bold text-amber-400">
                      {atmPt.metricValue.toFixed(metricVariationInfo.decimals)} {atmPt.metricUnit}
                    </td>
                    <td className="p-2.5 text-sky-400">{atmPt.totalVariance.toFixed(3)}</td>
                    <td className="p-2.5 text-[#00c076]">{atmPt.localVol.toFixed(1)}%</td>
                    <td className="p-2.5 text-slate-300">${atmPt.vega}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => {
                          if (onPopulateOrder) {
                            onPopulateOrder(asset.symbol, 'BUY', atmPt.callPrice, {
                              strike: atmPt.strike,
                              expiration: atmPt.expiryLabel,
                              optionType: 'CALL'
                            });
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-[#161b22] hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/30 text-[10px] font-bold transition-all"
                      >
                        Trade ATM
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
