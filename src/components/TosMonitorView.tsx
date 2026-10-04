import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Layers,
  ArrowRight,
  Activity,
  CheckCircle2,
  FileText,
  LayoutGrid,
  Table,
  RotateCcw,
  Download,
  Calendar,
  DollarSign,
  PieChart,
  Search,
  Filter,
  Sliders,
  Wallet,
  AlertTriangle,
  Flame,
  Check,
  Printer
} from 'lucide-react';
import {
  Asset,
  AssetClass,
  PortfolioHolding,
  PortfolioMetrics,
  RiskProfile,
  TradeOrder,
  AccountType
} from '../types';
import { ResetAccountModal } from './ResetAccountModal';
import { TosAccountStatementView } from './TosAccountStatementView';
import { CANADIAN_ACCOUNTS, CAD_USD_EXCHANGE_RATE } from '../data/canadianMarketData';

interface TosMonitorViewProps {
  holdings: PortfolioHolding[];
  metrics: PortfolioMetrics;
  riskProfile: RiskProfile;
  orders: TradeOrder[];
  onSelectSymbol: (symbol: string) => void;
  onPopulateOrder: (symbol: string, side: 'BUY' | 'SELL', price: number) => void;
  onNavigateToRebalance: () => void;
  assets: Asset[];
  isPaperTrading?: boolean;
  onTogglePaperTrading?: () => void;
  onResetAccount?: (options: { startingCash: number; mode: 'initial_model' | 'all_cash' }) => void;
  initialSubTab?: 'POSITIONS' | 'HEATMAP' | 'STATEMENT' | 'BENCHMARK';
  currentAccount?: AccountType;
  onSelectAccount?: (account: AccountType) => void;
}

export const TosMonitorView: React.FC<TosMonitorViewProps> = ({
  holdings,
  metrics,
  riskProfile,
  orders,
  onSelectSymbol,
  onPopulateOrder,
  onNavigateToRebalance,
  assets,
  isPaperTrading = true,
  onTogglePaperTrading,
  onResetAccount,
  initialSubTab,
  currentAccount = 'CA_MARGIN',
  onSelectAccount
}) => {
  // Main Monitor Tab View Selector
  const [monitorSubTab, setMonitorSubTab] = useState<'POSITIONS' | 'HEATMAP' | 'STATEMENT' | 'BENCHMARK'>(initialSubTab || 'POSITIONS');

  useEffect(() => {
    if (initialSubTab) {
      setMonitorSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Position Statement State
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'FILLED' | 'WORKING' | 'SIMULATED' | 'SPREADS'>('ALL');
  const [benchmark, setBenchmark] = useState<'SPY' | 'QQQ' | 'BALANCED_60_40'>('SPY');
  const [selectedReceipt, setSelectedReceipt] = useState<TradeOrder | null>(null);
  const [showMarginColumns, setShowMarginColumns] = useState<boolean>(true);

  // Helper to determine CIRO / Reg-T / CRA Margin Requirements for individual positions
  const getMarginRates = (assetClass: AssetClass, symbol: string, accountCategory?: string) => {
    // Registered Canadian Accounts (TFSA, RRSP, RESP): CRA rules require 100% Cash Margin
    if (accountCategory === 'CANADIAN_TFSA' || accountCategory === 'CANADIAN_RRSP' || accountCategory === 'CANADIAN_RESP') {
      return { initialPct: 1.00, maintPct: 1.00, ruleLabel: '100% CRA Cash' };
    }

    // Canadian Margin Account (CIRO / IIROC Rule 100)
    if (currentAccount === 'CA_MARGIN') {
      if (assetClass === 'crypto') {
        return { initialPct: 1.00, maintPct: 1.00, ruleLabel: '100% Cash' };
      }
      if (assetClass === 'fixed_income') {
        return { initialPct: 0.15, maintPct: 0.15, ruleLabel: '15% CIRO Gov' };
      }
      if (assetClass === 'commodities') {
        return { initialPct: 0.25, maintPct: 0.20, ruleLabel: '25% CIRO' };
      }
      // Blue-chip TSX/NYSE equities (CIRO 30% margin eligible)
      const isBlueChip = symbol.endsWith('.TO') || ['SHOP.TO', 'RY.TO', 'TD.TO', 'CNR.TO', 'ENB.TO', 'AAPL', 'MSFT', 'NVDA', 'SPY', 'QQQ'].includes(symbol);
      if (isBlueChip) {
        return { initialPct: 0.30, maintPct: 0.30, ruleLabel: '30% CIRO Blue-Chip' };
      }
      return { initialPct: 0.50, maintPct: 0.40, ruleLabel: '50% CIRO Std' };
    }

    // US Margin Account (FINRA Rule 4210 / Reg-T)
    if (assetClass === 'crypto') {
      return { initialPct: 1.00, maintPct: 1.00, ruleLabel: '100% Cash' };
    }
    if (assetClass === 'fixed_income') {
      return { initialPct: 0.15, maintPct: 0.15, ruleLabel: '15% Reg-T' };
    }
    if (assetClass === 'commodities') {
      return { initialPct: 0.25, maintPct: 0.20, ruleLabel: '25% Margin' };
    }
    return { initialPct: 0.50, maintPct: 0.25, ruleLabel: '50% Reg-T / 25% Maint' };
  };

  // Comprehensive Margin Requirement & Buying Power calculation for Position Statement
  const positionsMarginData = useMemo(() => {
    const activeAcc = CANADIAN_ACCOUNTS[currentAccount] || CANADIAN_ACCOUNTS.CA_MARGIN;
    let totalInitialMargin = 0;
    let totalMaintenanceMargin = 0;

    const items = holdings.map(h => {
      const { initialPct, maintPct, ruleLabel } = getMarginRates(h.assetClass, h.symbol, activeAcc.category);
      const initialReq = h.currentValue * initialPct;
      const maintReq = h.currentValue * maintPct;
      totalInitialMargin += initialReq;
      totalMaintenanceMargin += maintReq;

      return {
        ...h,
        initialPct,
        maintPct,
        ruleLabel,
        initialReq,
        maintReq,
        bpEffect: initialReq
      };
    });

    const isRegistered = activeAcc.category === 'CANADIAN_TFSA' || activeAcc.category === 'CANADIAN_RRSP' || activeAcc.category === 'CANADIAN_RESP';
    const maintenanceExcess = Math.max(0, metrics.nav - totalMaintenanceMargin);
    const marginCushionPct = totalMaintenanceMargin > 0 ? (metrics.nav / totalMaintenanceMargin) * 100 : 999;
    
    // Buying power
    const stockBuyingPower = isRegistered 
      ? metrics.cashBalance 
      : Math.max(0, metrics.cashBalance * 2 + (metrics.nav - totalMaintenanceMargin) * 1.5);
    const dayTradingBuyingPower = isRegistered 
      ? metrics.cashBalance 
      : Math.max(0, stockBuyingPower * 2);
    const optionBuyingPower = metrics.cashBalance;

    return {
      items,
      totalInitialMargin,
      totalMaintenanceMargin,
      maintenanceExcess,
      marginCushionPct,
      stockBuyingPower,
      dayTradingBuyingPower,
      optionBuyingPower,
      isMarginCall: metrics.nav < totalMaintenanceMargin,
      isRegistered
    };
  }, [holdings, currentAccount, metrics.nav, metrics.cashBalance]);

  // Heatmap Controls State
  const [heatmapClassFilter, setHeatmapClassFilter] = useState<string>('ALL');
  const [heatmapColorMetric, setHeatmapColorMetric] = useState<'CHANGE_PCT' | 'DAY_PNL' | 'TOTAL_PNL_PCT'>('CHANGE_PCT');
  const [heatmapSizeMetric, setHeatmapSizeMetric] = useState<'MARKET_VALUE' | 'EQUAL' | 'WEIGHT'>('MARKET_VALUE');
  const [heatmapGrouping, setHeatmapGrouping] = useState<'GROUPED' | 'FLAT'>('GROUPED');

  // Account Statement State
  const [statementTimeframe, setStatementTimeframe] = useState<'TODAY' | '7D' | '30D' | 'YTD' | 'ALL'>('30D');
  const [statementSearchQuery, setStatementSearchQuery] = useState<string>('');
  const [statementTypeFilter, setStatementTypeFilter] = useState<'ALL' | 'TRADES' | 'DIVIDENDS' | 'REBALANCE'>('ALL');
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [statementExportSuccess, setStatementExportSuccess] = useState<boolean>(false);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Group holdings by asset class
  const groupedHoldings: Record<AssetClass, PortfolioHolding[]> = useMemo(() => ({
    equities: holdings.filter(h => h.assetClass === 'equities'),
    crypto: holdings.filter(h => h.assetClass === 'crypto'),
    fixed_income: holdings.filter(h => h.assetClass === 'fixed_income'),
    commodities: holdings.filter(h => h.assetClass === 'commodities')
  }), [holdings]);

  const categoryTitles: Record<AssetClass, string> = {
    equities: 'Equities & Equity Options / ETFs',
    crypto: 'Digital Assets & Cryptocurrencies (24/7)',
    fixed_income: 'Fixed Income & Sovereign Treasuries',
    commodities: 'Commodities & Physical Precious Metals'
  };

  // Filtered orders for blotter
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderFilter === 'FILLED') return o.status === 'FILLED';
      if (orderFilter === 'WORKING') return o.status === 'WORKING' || o.status === 'QUEUED';
      if (orderFilter === 'SIMULATED') return o.isSimulated === true;
      if (orderFilter === 'SPREADS') return o.optionSpreadDetails !== undefined;
      return true;
    });
  }, [orders, orderFilter]);

  // Heatmap Holdings calculations
  const heatmapHoldings = useMemo(() => {
    let list = holdings.map(h => {
      const asset = assets.find(a => a.id === h.assetId);
      const change24hPct = asset ? asset.change24hPct : 0;
      const dayPnL = asset ? h.quantity * asset.change24h : 0;
      const totalPnLPct = h.avgBuyPrice > 0 ? ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100 : 0;
      return {
        ...h,
        asset,
        change24hPct,
        dayPnL,
        totalPnLPct
      };
    });

    if (heatmapClassFilter !== 'ALL') {
      list = list.filter(h => h.assetClass === heatmapClassFilter);
    }

    return list.sort((a, b) => b.currentValue - a.currentValue);
  }, [holdings, assets, heatmapClassFilter]);

  // Color generator for heatmap tiles
  const getTileColor = (h: typeof heatmapHoldings[0]) => {
    let val = h.change24hPct;
    if (heatmapColorMetric === 'DAY_PNL') val = h.dayPnL / 100;
    if (heatmapColorMetric === 'TOTAL_PNL_PCT') val = h.totalPnLPct;

    if (val >= 3.0) return 'bg-[#00c076]/25 border-[#00c076] text-[#00c076] hover:bg-[#00c076]/35';
    if (val >= 1.0) return 'bg-emerald-600/20 border-emerald-500/60 text-emerald-400 hover:bg-emerald-600/30';
    if (val >= 0.0) return 'bg-emerald-950/20 border-emerald-700/40 text-emerald-300 hover:bg-emerald-900/30';
    if (val >= -1.0) return 'bg-rose-950/20 border-rose-800/40 text-rose-300 hover:bg-rose-900/30';
    if (val >= -3.0) return 'bg-rose-900/25 border-rose-700/60 text-rose-400 hover:bg-rose-900/35';
    return 'bg-[#ff3b57]/25 border-[#ff3b57] text-[#ff3b57] hover:bg-[#ff3b57]/35';
  };

  // Benchmark chart data
  const chartPointsCount = 28;
  const chartData = useMemo(() => {
    const points: { label: string; portfolioVal: number; benchmarkReturnPct: number }[] = [];
    const baseNav = metrics.nav * 0.88;

    for (let i = 0; i < chartPointsCount; i++) {
      const progress = i / (chartPointsCount - 1);
      const trend = Math.sin(progress * Math.PI * 1.5) * 0.08 + progress * 0.14;
      const noise = Math.sin(i * 1.7) * 0.015;
      const val = i === chartPointsCount - 1 ? metrics.nav : baseNav * (1 + trend + noise);

      let bmkPct = 0;
      if (benchmark === 'SPY') {
        bmkPct = progress * 9.8 + Math.cos(i * 1.2) * 1.2;
      } else if (benchmark === 'QQQ') {
        bmkPct = progress * 14.2 + Math.cos(i * 1.4) * 2.1;
      } else {
        bmkPct = progress * 6.4 + Math.cos(i * 0.8) * 0.6;
      }

      points.push({ label: `D${i + 1}`, portfolioVal: val, benchmarkReturnPct: bmkPct });
    }
    return points;
  }, [benchmark, metrics.nav]);

  const minVal = Math.min(...chartData.map(p => p.portfolioVal)) * 0.98;
  const maxVal = Math.max(...chartData.map(p => p.portfolioVal)) * 1.02;

  // Account Statement Transactions Ledger
  const statementTransactions = useMemo(() => {
    return orders
      .filter(o => {
        if (statementTypeFilter === 'TRADES') return true;
        if (statementTypeFilter === 'DIVIDENDS') return false;
        if (statementTypeFilter === 'REBALANCE') return o.id.includes('reb');
        return true;
      })
      .filter(o => {
        if (!statementSearchQuery) return true;
        return o.symbol.toUpperCase().includes(statementSearchQuery.toUpperCase().trim());
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [orders, statementTypeFilter, statementSearchQuery]);

  // Export Account Statement
  const handleExportStatement = () => {
    const csvContent = [
      ['Date', 'Order ID', 'Symbol', 'Side', 'Type', 'Quantity', 'Price', 'Net Amount', 'Brokerage', 'Status'].join(','),
      ...statementTransactions.map(t => [
        new Date(t.timestamp).toISOString(),
        t.id,
        t.symbol,
        t.side,
        t.type,
        t.quantity,
        t.fillPrice || t.price,
        t.totalAmount,
        t.brokerageId,
        t.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `thinkorswim_statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatementExportSuccess(true);
    setTimeout(() => setStatementExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. TOP SUB-NAV BAR (Position Statement, Heatmap, Account Statement, Benchmark) */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-Tabs Switcher */}
          <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-xs font-mono">
            <button
              onClick={() => setMonitorSubTab('POSITIONS')}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                monitorSubTab === 'POSITIONS' ? 'bg-[#1c2128] text-amber-400 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Position Statement</span>
            </button>
            <button
              onClick={() => setMonitorSubTab('HEATMAP')}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                monitorSubTab === 'HEATMAP' ? 'bg-[#1c2128] text-amber-400 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c076] animate-pulse"></span>
              <span>Portfolio Heatmap</span>
            </button>
            <button
              onClick={() => setMonitorSubTab('STATEMENT')}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                monitorSubTab === 'STATEMENT' ? 'bg-[#1c2128] text-amber-400 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Account Statement</span>
            </button>
            <button
              onClick={() => setMonitorSubTab('BENCHMARK')}
              className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                monitorSubTab === 'BENCHMARK' ? 'bg-[#1c2128] text-amber-400 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Performance Curve</span>
            </button>
          </div>
        </div>

        {/* Paper Trading & Reset Account Actions */}
        <div className="flex items-center gap-2">
          {/* Mode Pill Indicator */}
          <div className="flex items-center gap-1.5 bg-[#161b22] border border-[#21262d] px-2.5 py-1 rounded text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isPaperTrading ? 'bg-amber-400 animate-pulse' : 'bg-[#00c076]'}`} />
            <span className={isPaperTrading ? 'text-amber-400 font-bold' : 'text-[#00c076] font-bold'}>
              {isPaperTrading ? 'paperMoney®' : 'LIVE DMA'}
            </span>
            {onTogglePaperTrading && (
              <button
                onClick={onTogglePaperTrading}
                className="ml-1 text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Switch
              </button>
            )}
          </div>

          {/* Reset Account Button */}
          {onResetAccount && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-2.5 py-1 bg-[#161b22] hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Reset Account Balances & Starting Portfolio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Account</span>
            </button>
          )}

          <button
            onClick={onNavigateToRebalance}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">Rebalancer</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SUBTAB: PORTFOLIO HEATMAP (Color-coded tiles by size, perf, day PnL) */}
      {/* ===================================================================== */}
      {monitorSubTab === 'HEATMAP' && (
        <div className="space-y-3">
          {/* Heatmap Controls Bar */}
          <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow">
            <div className="flex flex-wrap items-center gap-3">
              {/* Asset Class Filter */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Filter:</span>
                {[
                  { id: 'ALL', label: 'All Assets' },
                  { id: 'equities', label: 'Equities' },
                  { id: 'crypto', label: 'Crypto' },
                  { id: 'fixed_income', label: 'Bonds' },
                  { id: 'commodities', label: 'Commodities' }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setHeatmapClassFilter(c.id)}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      heatmapClassFilter === c.id
                        ? 'bg-amber-400 text-black shadow'
                        : 'bg-[#161b22] text-slate-400 hover:text-white border border-[#21262d]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Color Metric Selector */}
              <div className="flex items-center gap-1 text-[11px] pl-2 border-l border-[#21262d]">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Color by:</span>
                <select
                  value={heatmapColorMetric}
                  onChange={e => setHeatmapColorMetric(e.target.value as any)}
                  className="bg-[#161b22] border border-[#21262d] text-white rounded px-2 py-0.5 outline-none cursor-pointer"
                >
                  <option value="CHANGE_PCT">24h Return %</option>
                  <option value="DAY_PNL">Day P/L ($)</option>
                  <option value="TOTAL_PNL_PCT">Total P/L %</option>
                </select>
              </div>

              {/* Tile Size Selector */}
              <div className="flex items-center gap-1 text-[11px] pl-2 border-l border-[#21262d]">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Tile Size:</span>
                <select
                  value={heatmapSizeMetric}
                  onChange={e => setHeatmapSizeMetric(e.target.value as any)}
                  className="bg-[#161b22] border border-[#21262d] text-white rounded px-2 py-0.5 outline-none cursor-pointer"
                >
                  <option value="MARKET_VALUE">Market Value ($)</option>
                  <option value="WEIGHT">% Net Liq</option>
                  <option value="EQUAL">Equal Grid</option>
                </select>
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-slate-400">Heat:</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-600/30 text-rose-300 font-bold">-3%+</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-900/25 text-rose-400">-1%</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">0%</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950/20 text-emerald-300">+1%</span>
              <span className="px-1.5 py-0.2 rounded bg-[#00c076]/30 text-[#00c076] font-bold">+3%+</span>
            </div>
          </div>

          {/* Quick Heatmap KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px] uppercase">Total Positions</span>
              <div className="text-white font-bold text-sm mt-0.5">{heatmapHoldings.length} Assets</div>
              <span className="text-slate-500 text-[10px]">Active in portfolio</span>
            </div>
            <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px] uppercase">Portfolio Day P/L</span>
              <div className={`font-bold text-sm mt-0.5 ${metrics.dayPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                {metrics.dayPnL >= 0 ? '+' : ''}${Math.abs(metrics.dayPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-slate-500 text-[10px]">({metrics.dayPnLPct >= 0 ? '+' : ''}{metrics.dayPnLPct.toFixed(2)}%)</span>
            </div>
            <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px] uppercase">Top Gainer Today</span>
              {(() => {
                const topGainer = [...heatmapHoldings].sort((a, b) => b.change24hPct - a.change24hPct)[0];
                return (
                  <div>
                    <div className="text-[#00c076] font-bold text-sm mt-0.5 flex items-center gap-1">
                      <span>{topGainer?.symbol || 'N/A'}</span>
                      <span>+{topGainer?.change24hPct.toFixed(2)}%</span>
                    </div>
                    <span className="text-slate-500 text-[10px] truncate block">{topGainer?.name || ''}</span>
                  </div>
                );
              })()}
            </div>
            <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2.5">
              <span className="text-slate-400 text-[10px] uppercase">Total Net Liquidating Value</span>
              <div className="text-white font-bold text-sm mt-0.5">
                ${metrics.nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-slate-500 text-[10px]">Cash: ${metrics.cashBalance.toLocaleString('en-US')}</span>
            </div>
          </div>

          {/* Heatmap Tiles Dynamic Grid */}
          <div className="bg-[#090d11] border border-[#21262d] rounded-lg p-3 min-h-[480px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {heatmapHoldings.map(h => {
                const tileColorClass = getTileColor(h);
                const isBigTile = heatmapSizeMetric !== 'EQUAL' && h.weightPct >= 12;

                return (
                  <div
                    key={h.assetId}
                    onClick={() => onSelectSymbol(h.symbol)}
                    className={`rounded-lg border-2 p-3 transition-all duration-150 cursor-pointer relative overflow-hidden flex flex-col justify-between shadow-md ${tileColorClass} ${
                      isBigTile ? 'sm:col-span-2 min-h-[160px]' : 'min-h-[140px]'
                    }`}
                  >
                    {/* Top Row: Symbol, Link Badge, Class */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-amber-400 text-black font-black text-[9px] flex items-center justify-center font-mono">
                          1
                        </span>
                        <span className="font-extrabold text-white text-base tracking-tight">{h.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-slate-300 uppercase font-sans">
                          {h.assetClass}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-sm ${h.change24hPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                          {h.change24hPct >= 0 ? '+' : ''}{h.change24hPct.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Middle: Name & Mark Price */}
                    <div className="my-1.5">
                      <div className="text-[11px] text-slate-300 font-sans truncate">{h.name}</div>
                      <div className="text-white font-bold text-xs mt-0.5">
                        ${h.currentPrice >= 1000 ? h.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : h.currentPrice.toFixed(2)}
                      </div>
                    </div>

                    {/* Bottom: Day PnL & Market Value & Quick Actions */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="text-[10px] text-slate-400 font-sans uppercase">Day P/L</div>
                        <div className={`font-bold ${h.dayPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                          {h.dayPnL >= 0 ? '+' : ''}${Math.abs(h.dayPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-sans uppercase">Value ({h.weightPct.toFixed(1)}%)</div>
                        <div className="text-white font-bold">
                          ${h.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Quick Trade Buttons */}
                      <div className="flex items-center gap-1 pl-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onPopulateOrder(h.symbol, 'BUY', h.currentPrice);
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                        >
                          BUY
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onPopulateOrder(h.symbol, 'SELL', h.currentPrice);
                          }}
                          className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                        >
                          SELL
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. SUBTAB: ACCOUNT STATEMENT (thinkorswim Statement & Trade Ledger)  */}
      {/* ===================================================================== */}
      {monitorSubTab === 'STATEMENT' && (
        <TosAccountStatementView
          holdings={holdings}
          metrics={metrics}
          riskProfile={riskProfile}
          orders={orders}
          assets={assets}
          isPaperTrading={isPaperTrading}
          onTogglePaperTrading={onTogglePaperTrading}
          onOpenResetModal={() => setIsResetModalOpen(true)}
          onSelectSymbol={onSelectSymbol}
          onPopulateOrder={onPopulateOrder}
          currentAccount={currentAccount}
          onSelectAccount={onSelectAccount}
        />
      )}

      {/* ===================================================================== */}
      {/* 4. SUBTAB: POSITION STATEMENT (The Classic Table View)                */}
      {/* ===================================================================== */}
      {monitorSubTab === 'POSITIONS' && (() => {
        const activeAcc = CANADIAN_ACCOUNTS[currentAccount] || CANADIAN_ACCOUNTS.CA_MARGIN;
        const isCanadian = activeAcc.country === 'CA';
        const currSym = activeAcc.currency === 'CAD' ? 'C$' : '$';

        return (
          <div className="space-y-3 font-mono">
            {/* Canadian Account & CRA Registered Compliance Banner */}
            <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 shadow-md space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c2128] pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg">{isCanadian ? '🇨🇦' : '🇺🇸'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xs">{activeAcc.name}</span>
                      <span className="text-amber-400 font-bold text-xs">[{activeAcc.accountNumber}]</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        activeAcc.category === 'CANADIAN_TFSA'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : activeAcc.category === 'CANADIAN_RRSP'
                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                          : activeAcc.category === 'CANADIAN_RESP'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {activeAcc.taxTreatment}
                      </span>
                      <span className="text-[10px] text-slate-300 bg-[#21262d] px-1.5 py-0.2 rounded font-mono">
                        Base: {activeAcc.currency} ({currSym})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5 flex flex-wrap items-center gap-2">
                      <span>Regulator: <strong className="text-slate-200">{activeAcc.regulator}</strong></span>
                      <span className="text-slate-600">·</span>
                      <span className="text-emerald-400">{activeAcc.investorProtection}</span>
                      <span className="text-slate-600">·</span>
                      <span>Clearing: <strong className="text-slate-300">{isCanadian ? 'CDS / CDCC' : 'Apex Clearing Corp.'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Quick Account Switcher Pills */}
                {onSelectAccount && (
                  <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px] font-sans">
                    <span className="text-slate-500 px-1.5 text-[10px] uppercase font-bold">Switch:</span>
                    {(['CA_MARGIN', 'CA_TFSA', 'CA_RRSP', 'CA_RESP', 'US_MARGIN_PAPER'] as const).map(accKey => {
                      const acc = CANADIAN_ACCOUNTS[accKey];
                      const isSel = currentAccount === accKey;
                      return (
                        <button
                          key={accKey}
                          onClick={() => onSelectAccount(accKey)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-amber-400 text-black shadow-sm font-extrabold'
                              : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                          }`}
                        >
                          {accKey === 'CA_MARGIN' ? 'CA Margin' : accKey === 'CA_TFSA' ? 'TFSA' : accKey === 'CA_RRSP' ? 'RRSP' : accKey === 'CA_RESP' ? 'RESP' : 'US Paper'}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Registered Account Metrics & CRA Rules Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs font-mono">
                {/* Metric Card 1: CRA Contribution / Room */}
                <div className="bg-[#121620] border border-[#21262d] rounded p-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide font-sans flex items-center justify-between">
                    <span>{isCanadian ? 'CRA Contribution Room' : 'Reg-T Margin Status'}</span>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  </div>
                  {activeAcc.craContributionLimitAnnual ? (
                    <div className="mt-1 space-y-0.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-400 text-[11px] font-sans">2026 Annual Limit:</span>
                        <span className="text-white font-bold">{currSym}{activeAcc.craContributionLimitAnnual.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-400 text-[11px] font-sans">Remaining Room:</span>
                        <span className="text-emerald-400 font-bold">{currSym}{activeAcc.craContributionRoomRemaining?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      {activeAcc.craLifetimeCap && (
                        <div className="flex items-baseline justify-between text-[10px] text-slate-500 font-sans">
                          <span>Cumulative Room:</span>
                          <span>{currSym}{activeAcc.craLifetimeCap.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 space-y-0.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-400 text-[11px] font-sans">Margin Requirement:</span>
                        <span className="text-white font-bold">30.0% (CIRO Blue-Chip)</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-slate-400 text-[11px] font-sans">Excess Margin:</span>
                        <span className="text-emerald-400 font-bold">{currSym}{(metrics.cashBalance * 1.75).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        Tax deduction on investment borrowing interest
                      </div>
                    </div>
                  )}
                </div>

                {/* Metric Card 2: Options Approval & CRA Derivatives Eligibility */}
                <div className="bg-[#121620] border border-[#21262d] rounded p-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide font-sans flex items-center justify-between">
                    <span>Derivatives & Options Tier</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 font-bold text-[9px] border border-amber-400/20">
                      Tier {activeAcc.optionsLevel}
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    <div className="text-white font-bold text-xs truncate">
                      {activeAcc.optionsDescription}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans line-clamp-2">
                      {activeAcc.craOptionRules[0]}
                    </div>
                  </div>
                </div>

                {/* Metric Card 3: Dual Currency & FX Valuation */}
                <div className="bg-[#121620] border border-[#21262d] rounded p-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide font-sans flex items-center justify-between">
                    <span>Dual-Currency Valuation</span>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">1 USD = {CAD_USD_EXCHANGE_RATE} CAD</span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-400 text-[11px] font-sans">CAD Net Liquidity:</span>
                      <span className="text-white font-bold">
                        C${(activeAcc.currency === 'CAD' ? metrics.nav : metrics.nav * CAD_USD_EXCHANGE_RATE).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-400 text-[11px] font-sans">USD Equivalent:</span>
                      <span className="text-sky-300 font-bold">
                        US${(activeAcc.currency === 'USD' ? metrics.nav : metrics.nav / CAD_USD_EXCHANGE_RATE).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-sans truncate">
                      {activeAcc.category === 'CANADIAN_RRSP' ? '✓ US Dividends 0% Treaty Withholding' : 'Direct TSX/NYSE Multi-Currency Settlement'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* thinkorswim Position Statement Margin & Buying Power Dashboard */}
            <div className="bg-[#121620] border border-[#21262d] rounded-lg p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c2128] pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span className="text-white font-bold text-xs uppercase tracking-wide">
                    Position Statement Margin Requirements & Buying Power
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    {positionsMarginData.isRegistered ? 'CRA 100% CASH ACCOUNT' : currentAccount === 'CA_MARGIN' ? 'CIRO RULE 100 MARGIN' : 'FINRA 4210 / REG-T'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setShowMarginColumns(!showMarginColumns)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      showMarginColumns
                        ? 'bg-[#1c2128] text-sky-400 border-sky-500/50 shadow-sm'
                        : 'bg-transparent text-slate-400 border-[#21262d] hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Margin Columns:</span>
                    <span className={showMarginColumns ? 'text-sky-400 font-extrabold' : 'text-slate-500'}>
                      {showMarginColumns ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
                {/* 1. Initial Margin */}
                <div className="bg-[#0e1217] border border-[#1c2128] p-2.5 rounded">
                  <div className="text-[10px] text-slate-400 uppercase font-sans flex justify-between">
                    <span>Initial Margin Req</span>
                    <span className="text-sky-400 font-bold">{positionsMarginData.isRegistered ? '100% Cash' : '30-50%'}</span>
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {currSym}{positionsMarginData.totalInitialMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    {positionsMarginData.isRegistered ? 'CRA non-leveraged collateral' : 'Equity required to open positions'}
                  </div>
                </div>

                {/* 2. Maintenance Margin */}
                <div className="bg-[#0e1217] border border-[#1c2128] p-2.5 rounded">
                  <div className="text-[10px] text-slate-400 uppercase font-sans flex justify-between">
                    <span>Maint Margin Req</span>
                    <span className="text-sky-400 font-bold">{positionsMarginData.isRegistered ? '100%' : '25-30%'}</span>
                  </div>
                  <div className="text-base font-bold text-sky-400 mt-0.5">
                    {currSym}{positionsMarginData.totalMaintenanceMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    Overnight maintenance baseline
                  </div>
                </div>

                {/* 3. Buying Power */}
                <div className="bg-[#0e1217] border border-[#1c2128] p-2.5 rounded">
                  <div className="text-[10px] text-slate-400 uppercase font-sans flex justify-between">
                    <span>Stock Buying Power</span>
                    <span className="text-emerald-400 font-bold">{positionsMarginData.isRegistered ? '1x Cash' : currentAccount === 'CA_MARGIN' ? '2x CIRO' : '4x Day'}</span>
                  </div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {currSym}{positionsMarginData.stockBuyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans flex justify-between">
                    <span>Options BP:</span>
                    <span className="text-white font-bold">{currSym}{positionsMarginData.optionBuyingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* 4. Margin Cushion & Excess */}
                <div className="bg-[#0e1217] border border-[#1c2128] p-2.5 rounded">
                  <div className="text-[10px] text-slate-400 uppercase font-sans flex justify-between">
                    <span>Margin Cushion</span>
                    <span className="text-[#00c076] font-bold">
                      {positionsMarginData.isMarginCall ? 'DEFICIENT' : 'SAFE'}
                    </span>
                  </div>
                  <div className="text-base font-bold text-[#00c076] mt-0.5">
                    {currSym}{positionsMarginData.maintenanceExcess.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="w-full bg-[#1c2128] h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${positionsMarginData.isMarginCall ? 'bg-rose-500' : 'bg-[#00c076]'}`}
                      style={{ width: `${Math.min(100, Math.max(10, positionsMarginData.marginCushionPct > 300 ? 100 : (positionsMarginData.marginCushionPct / 300) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0e1217] border border-[#21262d] rounded-lg overflow-hidden shadow">
              <div className="bg-[#161b22] px-3 py-2 border-b border-[#21262d] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-xs uppercase tracking-wider">Position Statement</span>
                  <span className="text-slate-500 font-sans text-xs">· Grouped by Asset Class</span>
                  <span className="text-[10px] font-mono text-amber-300 bg-[#21262d] px-1.5 py-0.2 rounded">
                    {currSym} {activeAcc.currency}
                  </span>
                  {showMarginColumns && (
                    <span className="text-[10px] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/30 px-1.5 py-0.2 rounded flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Margin Req Active</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="text-slate-400 font-sans text-[11px]">
                    Drift: <strong className="font-mono text-amber-400">{metrics.driftScore.toFixed(1)}%</strong>
                  </div>
                  <button
                    onClick={onNavigateToRebalance}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Launch Rebalancer</span>
                  </button>
                </div>
              </div>

            {/* Master Position Table */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#12161f] text-[10px] text-slate-400 uppercase font-semibold border-b border-[#21262d]">
                  <tr>
                    <th className="py-1.5 px-3">Instrument</th>
                    <th className="py-1.5 px-2 text-right">Pos Qty</th>
                    <th className="py-1.5 px-2 text-right">Trade Price</th>
                    <th className="py-1.5 px-2 text-right">Mark Price</th>
                    <th className="py-1.5 px-2 text-right">Net Chg</th>
                    <th className="py-1.5 px-2 text-right">P/L Day</th>
                    <th className="py-1.5 px-2 text-right">P/L Open</th>
                    <th className="py-1.5 px-2 text-right">Market Value</th>
                    <th className="py-1.5 px-2 text-right">% Net Liq</th>
                    {showMarginColumns && (
                      <>
                        <th className="py-1.5 px-2 text-right text-sky-400">Margin Req</th>
                        <th className="py-1.5 px-2 text-right text-slate-400">BP Effect</th>
                      </>
                    )}
                    <th className="py-1.5 px-2 text-right">Target / Drift</th>
                    <th className="py-1.5 px-3 text-center">Trade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2128]">
                  {(['equities', 'crypto', 'fixed_income', 'commodities'] as AssetClass[]).map(catKey => {
                    const list = groupedHoldings[catKey];
                    const isCollapsed = collapsedCategories[catKey];
                    const catMarketVal = list.reduce((sum, h) => sum + h.currentValue, 0);
                    const catCostVal = list.reduce((sum, h) => sum + (h.quantity * h.avgBuyPrice), 0);
                    const catOpenPnL = catMarketVal - catCostVal;
                    const catDayPnL = list.reduce((sum, h) => {
                      const asset = assets.find(a => a.id === h.assetId);
                      return sum + (asset ? h.quantity * asset.change24h : 0);
                    }, 0);
                    const catWeight = metrics.nav > 0 ? (catMarketVal / metrics.nav) * 100 : 0;
                    const targetWeight = riskProfile.targetAllocation[catKey] || 0;
                    const catMarginReq = list.reduce((sum, h) => {
                      const item = positionsMarginData.items.find(i => i.assetId === h.assetId);
                      return sum + (item ? item.initialReq : 0);
                    }, 0);

                    return (
                      <React.Fragment key={catKey}>
                        {/* Category Header Row */}
                        <tr
                          onClick={() => toggleCategory(catKey)}
                          className="bg-[#121620] hover:bg-[#161c28] cursor-pointer text-slate-200 font-bold border-t border-[#21262d]"
                        >
                          <td colSpan={5} className="py-1.5 px-3">
                            <div className="flex items-center gap-1.5 font-sans">
                              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                              <span className="text-white text-xs">{categoryTitles[catKey]}</span>
                              <span className="text-slate-500 font-mono text-[10px]">({list.length} positions)</span>
                            </div>
                          </td>
                          <td className={`py-1.5 px-2 text-right ${catDayPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                            {catDayPnL >= 0 ? '+' : ''}${Math.abs(catDayPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`py-1.5 px-2 text-right ${catOpenPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                            {catOpenPnL >= 0 ? '+' : ''}${Math.abs(catOpenPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-1.5 px-2 text-right text-white">
                            ${catMarketVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-1.5 px-2 text-right text-slate-300">
                            {catWeight.toFixed(1)}%
                          </td>
                          {showMarginColumns && (
                            <>
                              <td className="py-1.5 px-2 text-right text-sky-400 font-extrabold">
                                {currSym}{catMarginReq.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-1.5 px-2 text-right text-slate-400 font-mono">
                                -{currSym}{catMarginReq.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </>
                          )}
                          <td className="py-1.5 px-2 text-right">
                            <span className="text-slate-400">{targetWeight}% / </span>
                            <span className={`font-semibold ${catWeight - targetWeight > 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                              {catWeight - targetWeight > 0 ? '+' : ''}{(catWeight - targetWeight).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-center"></td>
                        </tr>

                        {/* Position Items inside category */}
                        {!isCollapsed &&
                          list.map(h => {
                            const asset = assets.find(a => a.id === h.assetId);
                            const isOverweight = h.driftPct > 1.5;
                            const isUnderweight = h.driftPct < -1.5;
                            const dayDelta = asset ? h.quantity * asset.change24h : 0;
                            const itemMargin = positionsMarginData.items.find(i => i.assetId === h.assetId);

                            return (
                              <tr
                                key={h.assetId}
                                className="hover:bg-[#161b22]/70 text-slate-300 transition-colors"
                              >
                                <td className="py-1.5 px-3 pl-8">
                                  <div
                                    onClick={() => onSelectSymbol(h.symbol)}
                                    className="font-bold text-white flex items-center gap-1.5 cursor-pointer hover:text-amber-400"
                                  >
                                    <span className="w-3.5 h-3.5 rounded bg-amber-400 text-black font-black text-[9px] flex items-center justify-center font-mono">
                                      1
                                    </span>
                                    <span>{h.symbol}</span>
                                    <span className="text-slate-500 font-sans font-normal text-[10px] truncate max-w-[110px]">
                                      {h.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-1.5 px-2 text-right text-slate-200">
                                  {h.quantity >= 1 ? h.quantity.toLocaleString('en-US') : h.quantity.toFixed(4)}
                                </td>
                                <td className="py-1.5 px-2 text-right text-slate-400">
                                  ${h.avgBuyPrice >= 1000 ? h.avgBuyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : h.avgBuyPrice.toFixed(2)}
                                </td>
                                <td className="py-1.5 px-2 text-right text-white font-medium">
                                  ${h.currentPrice >= 1000 ? h.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : h.currentPrice.toFixed(2)}
                                </td>
                                <td className={`py-1.5 px-2 text-right ${asset && asset.change24hPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                                  {asset && asset.change24hPct >= 0 ? '+' : ''}{asset ? asset.change24hPct.toFixed(2) : 0}%
                                </td>
                                <td className={`py-1.5 px-2 text-right ${dayDelta >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                                  {dayDelta >= 0 ? '+' : ''}${Math.abs(dayDelta).toFixed(2)}
                                </td>
                                <td className={`py-1.5 px-2 text-right font-medium ${h.unrealizedPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                                  {h.unrealizedPnL >= 0 ? '+' : ''}${Math.abs(h.unrealizedPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-1.5 px-2 text-right font-bold text-white">
                                  ${h.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-1.5 px-2 text-right text-slate-300">
                                  {h.weightPct.toFixed(1)}%
                                </td>
                                {showMarginColumns && (
                                  <>
                                    <td className="py-1.5 px-2 text-right">
                                      <div className="font-bold text-sky-400">
                                        {currSym}{(itemMargin?.initialReq || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </div>
                                      <div className="text-[9px] text-slate-400 font-sans">
                                        {itemMargin?.ruleLabel}
                                      </div>
                                    </td>
                                    <td className="py-1.5 px-2 text-right text-slate-300 font-mono">
                                      -{currSym}{(itemMargin?.bpEffect || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                  </>
                                )}
                                <td className="py-1.5 px-2 text-right">
                                  <span className={`font-semibold ${isOverweight ? 'text-amber-400' : isUnderweight ? 'text-sky-400' : 'text-slate-500'}`}>
                                    {h.driftPct > 0 ? '+' : ''}{h.driftPct.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="py-1.5 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => onPopulateOrder(h.symbol, 'BUY', h.currentPrice)}
                                      className="px-1.5 py-0.5 bg-[#102018] hover:bg-[#142f22] text-[#00c076] border border-[#00c076]/40 rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      BUY
                                    </button>
                                    <button
                                      onClick={() => onPopulateOrder(h.symbol, 'SELL', h.currentPrice)}
                                      className="px-1.5 py-0.5 bg-[#1f1518] hover:bg-[#2e191e] text-[#ff3b57] border border-[#ff3b57]/40 rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      SELL
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot className="bg-[#12161f] text-[11px] font-bold border-t-2 border-[#21262d] text-white">
                  <tr>
                    <td className="py-2.5 px-3 uppercase" colSpan={5}>Portfolio Total</td>
                    <td className={`py-2.5 px-2 text-right ${metrics.dayPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                      {metrics.dayPnL >= 0 ? '+' : ''}{currSym}{Math.abs(metrics.dayPnL).toFixed(2)}
                    </td>
                    <td className={`py-2.5 px-2 text-right ${metrics.totalPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                      {metrics.totalPnL >= 0 ? '+' : ''}{currSym}{Math.abs(metrics.totalPnL).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-white font-extrabold">
                      {currSym}{metrics.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-300">
                      100.0%
                    </td>
                    {showMarginColumns && (
                      <>
                        <td className="py-2.5 px-2 text-right text-sky-400 font-extrabold">
                          {currSym}{positionsMarginData.totalInitialMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-400 font-mono">
                          -{currSym}{positionsMarginData.totalInitialMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </>
                    )}
                    <td className="py-2.5 px-2 text-right text-amber-400">
                      Drift {metrics.driftScore.toFixed(1)}%
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Working Orders Blotter */}
          <div className="bg-[#0e1217] border border-[#21262d] rounded-lg overflow-hidden shadow">
            <div className="bg-[#161b22] px-3 py-2 border-b border-[#21262d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xs uppercase tracking-wider">Working & Filled Orders</span>
                <span className="text-slate-500 font-sans text-xs">· DMA Blotter</span>
              </div>

              <div className="flex items-center bg-[#090d11] rounded border border-[#21262d] p-0.5 text-[10px]">
                {(['ALL', 'FILLED', 'WORKING', 'SIMULATED', 'SPREADS'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      orderFilter === f ? 'bg-[#1c2128] text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#12161f] text-[10px] text-slate-400 uppercase font-semibold border-b border-[#21262d]">
                  <tr>
                    <th className="py-1.5 px-3">Order ID</th>
                    <th className="py-1.5 px-2">Time</th>
                    <th className="py-1.5 px-2">Side</th>
                    <th className="py-1.5 px-2">Symbol</th>
                    <th className="py-1.5 px-2">Type</th>
                    <th className="py-1.5 px-2 text-right">Qty</th>
                    <th className="py-1.5 px-2 text-right">Price / Fill</th>
                    <th className="py-1.5 px-2 text-right">Net Value</th>
                    <th className="py-1.5 px-2">Gateway Route</th>
                    <th className="py-1.5 px-2">Status</th>
                    <th className="py-1.5 px-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2128]">
                  {filteredOrders.slice(0, 8).map(ord => (
                    <tr key={ord.id} className="hover:bg-[#161b22]/70 text-slate-300">
                      <td className="py-1.5 px-3 text-slate-400 text-[11px]">{ord.id}</td>
                      <td className="py-1.5 px-2 text-slate-400 text-[11px]">
                        {new Date(ord.timestamp).toLocaleTimeString([], { hour12: false })}
                      </td>
                      <td className="py-1.5 px-2">
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                          ord.side === 'BUY' ? 'bg-[#00c076]/20 text-[#00c076]' : 'bg-[#ff3b57]/20 text-[#ff3b57]'
                        }`}>
                          {ord.side}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 font-bold text-white">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{ord.symbol}</span>
                          {ord.isSimulated && (
                            <span className="px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold">
                              SIM
                            </span>
                          )}
                          {ord.optionSpreadDetails && (
                            <span className="px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-bold">
                              {ord.optionSpreadDetails.strategyType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-slate-300">{ord.type}</td>
                      <td className="py-1.5 px-2 text-right text-slate-200">{ord.quantity}</td>
                      <td className="py-1.5 px-2 text-right text-white">
                        ${ord.fillPrice ? ord.fillPrice.toFixed(2) : ord.price.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold text-white">
                        ${ord.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-2 capitalize text-slate-300">{ord.brokerageId} DMA</td>
                      <td className="py-1.5 px-2">
                        <span className="text-[#00c076] font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedReceipt(ord)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="View Confirmation Slip"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
      })()}

      {/* ===================================================================== */}
      {/* 5. SUBTAB: BENCHMARK CURVE (Comparative Analytics)                   */}
      {/* ===================================================================== */}
      {monitorSubTab === 'BENCHMARK' && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-xs uppercase tracking-wider">Comparative Portfolio Performance</span>
              <span className="text-slate-500 font-sans text-xs">· Benchmark Normalized Curve</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center bg-[#090d11] rounded border border-[#21262d] p-0.5 text-[10px]">
                <button
                  onClick={() => setBenchmark('SPY')}
                  className={`px-2 py-0.5 rounded font-bold ${benchmark === 'SPY' ? 'bg-[#1c2128] text-sky-400' : 'text-slate-400'}`}
                >
                  vs SPY
                </button>
                <button
                  onClick={() => setBenchmark('QQQ')}
                  className={`px-2 py-0.5 rounded font-bold ${benchmark === 'QQQ' ? 'bg-[#1c2128] text-sky-400' : 'text-slate-400'}`}
                >
                  vs QQQ
                </button>
                <button
                  onClick={() => setBenchmark('BALANCED_60_40')}
                  className={`px-2 py-0.5 rounded font-bold ${benchmark === 'BALANCED_60_40' ? 'bg-[#1c2128] text-sky-400' : 'text-slate-400'}`}
                >
                  vs 60/40
                </button>
              </div>
            </div>
          </div>

          <div className="h-64 w-full bg-[#090d11] rounded border border-[#1c2128] p-3 relative">
            <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="tosPortfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00c076" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00c076" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[0, 50, 100, 150, 200].map(y => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#21262d" strokeDasharray="3 3" />
              ))}

              <path
                d={chartData
                  .map((p, idx) => {
                    const x = (idx / (chartPointsCount - 1)) * 1000;
                    const y = 180 - (p.benchmarkReturnPct / 20) * 120;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              <path
                d={`${chartData
                  .map((p, idx) => {
                    const x = (idx / (chartPointsCount - 1)) * 1000;
                    const y = 190 - ((p.portfolioVal - minVal) / (maxVal - minVal)) * 160;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')} L 1000 200 L 0 200 Z`}
                fill="url(#tosPortfolioGrad)"
              />

              <path
                d={chartData
                  .map((p, idx) => {
                    const x = (idx / (chartPointsCount - 1)) * 1000;
                    const y = 190 - ((p.portfolioVal - minVal) / (maxVal - minVal)) * 160;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#00c076"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-4">
              <span className="text-white flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#00c076]"></span>
                Apex Multi-Asset Portfolio
              </span>
              <span className="text-sky-400 flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 border-t border-dashed border-sky-400"></span>
                {benchmark === 'SPY' ? 'S&P 500 ETF (SPY)' : benchmark === 'QQQ' ? 'Nasdaq-100 (QQQ)' : '60/40 Benchmark'}
              </span>
            </div>
            <span>NAV: ${metrics.nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* Confirmation Slip Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0e1217] border border-[#21262d] rounded-xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
              <span className="text-white font-bold text-xs uppercase">thinkorswim Trade Confirmation</span>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">
                Close
              </button>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans">Execution Mode:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedReceipt.isSimulated
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-emerald-500/20 text-[#00c076] border border-emerald-500/30'
                }`}>
                  {selectedReceipt.isSimulated ? '⚡ SIMULATED (paperMoney)' : 'LIVE DMA'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Order ID:</span>
                <span className="text-white">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Side & Symbol:</span>
                <span className="font-bold text-white">{selectedReceipt.side} {selectedReceipt.quantity}x {selectedReceipt.symbol}</span>
              </div>
              {selectedReceipt.optionSpreadDetails && (
                <div className="pt-2 border-t border-[#1c2128] space-y-1">
                  <div className="text-slate-400 font-bold uppercase text-[10px] flex justify-between">
                    <span>Spread: {selectedReceipt.optionSpreadDetails.strategyName}</span>
                    <span className="text-emerald-400">{selectedReceipt.optionSpreadDetails.netDebitOrCredit}</span>
                  </div>
                  <div className="space-y-1">
                    {selectedReceipt.optionSpreadDetails.legs.map((leg, i) => (
                      <div key={i} className="flex justify-between bg-[#12161f] p-1.5 rounded text-[10px]">
                        <span>{leg.side} {leg.quantity}x {leg.strike} {leg.optionType} ({leg.expiration})</span>
                        <span className="text-white font-mono">${leg.mid.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Fill Price:</span>
                <span className="text-white">${selectedReceipt.fillPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Net Value:</span>
                <span className="text-[#00c076] font-bold">${selectedReceipt.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Route:</span>
                <span className="capitalize">{selectedReceipt.brokerageId} Direct DMA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Account Modal */}
      {onResetAccount && (
        <ResetAccountModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          isPaperTrading={isPaperTrading}
          onConfirmReset={onResetAccount}
        />
      )}
    </div>
  );
};
