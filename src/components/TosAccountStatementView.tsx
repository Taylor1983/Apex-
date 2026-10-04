import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Wallet,
  Building,
  Info,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  CreditCard,
  PieChart,
  Percent,
  Sliders,
  Sparkles,
  AlertOctagon,
  Activity
} from 'lucide-react';

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY - radius * Math.sin(angleInRadians)
  };
}

function describeArc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}
import {
  Asset,
  PortfolioHolding,
  PortfolioMetrics,
  RiskProfile,
  TradeOrder,
  OrderSide,
  AccountType
} from '../types';
import { CANADIAN_ACCOUNTS, CAD_USD_EXCHANGE_RATE } from '../data/canadianMarketData';

export interface DividendRecord {
  id: string;
  date: string;
  timestamp: number;
  symbol: string;
  name: string;
  type: 'CASH_DIVIDEND' | 'INTEREST_SWEEP' | 'TREASURY_COUPON' | 'FEE_REBATE';
  ratePerShare?: number;
  sharesHeld?: number;
  amount: number;
  status: 'SETTLED' | 'POSTED';
}

interface TosAccountStatementViewProps {
  holdings: PortfolioHolding[];
  metrics: PortfolioMetrics;
  riskProfile: RiskProfile;
  orders: TradeOrder[];
  assets: Asset[];
  isPaperTrading?: boolean;
  onTogglePaperTrading?: () => void;
  onOpenResetModal?: () => void;
  onSelectSymbol?: (symbol: string) => void;
  onPopulateOrder?: (symbol: string, side: OrderSide, price: number) => void;
  currentAccount?: AccountType;
  onSelectAccount?: (account: AccountType) => void;
}

export const TosAccountStatementView: React.FC<TosAccountStatementViewProps> = ({
  holdings,
  metrics,
  riskProfile,
  orders,
  assets,
  isPaperTrading = true,
  onTogglePaperTrading,
  onOpenResetModal,
  onSelectSymbol,
  onPopulateOrder,
  currentAccount = 'CA_MARGIN',
  onSelectAccount
}) => {
  // Statement filters
  const [timeframe, setTimeframe] = useState<'TODAY' | '7D' | '30D' | '90D' | 'YTD' | '1Y' | 'ALL'>('30D');
  const [taxLotMethod, setTaxLotMethod] = useState<'FIFO' | 'LIFO' | 'MINTAX' | 'SPECIFIC'>('FIFO');
  const [activeSection, setActiveSection] = useState<'ALL' | 'BALANCES' | 'ORDERS' | 'TRADES' | 'PNL' | 'DIVIDENDS' | 'MARGIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'FILLED' | 'WORKING' | 'CANCELLED'>('ALL');

  // Modals & Feedback
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<TradeOrder | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [stressScenario, setStressScenario] = useState<number>(0); // 0%, 10%, 20%, 35% stress test
  const [gaugeLayoutStyle, setGaugeLayoutStyle] = useState<'SPLIT_COCKPIT' | 'PANORAMIC_DIAL' | 'LINEAR_BAR' | 'CIRCULAR_270'>('SPLIT_COCKPIT');

  // Timeframe date range calculations
  const dateRangeLabel = useMemo(() => {
    const now = new Date();
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = formatDate(now);

    let start = new Date();
    if (timeframe === 'TODAY') {
      return `${formatDate(now)} (Market Session)`;
    } else if (timeframe === '7D') {
      start.setDate(now.getDate() - 7);
    } else if (timeframe === '30D') {
      start.setDate(now.getDate() - 30);
    } else if (timeframe === '90D') {
      start.setDate(now.getDate() - 90);
    } else if (timeframe === 'YTD') {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (timeframe === '1Y') {
      start.setFullYear(now.getFullYear() - 1);
    } else {
      start = new Date(now.getFullYear() - 2, 0, 1);
    }
    return `${formatDate(start)} — ${endStr}`;
  }, [timeframe]);

  const activeCanadianAccount = CANADIAN_ACCOUNTS[currentAccount] || CANADIAN_ACCOUNTS.CA_MARGIN;
  const isCanadian = activeCanadianAccount.country === 'CA';
  const currSym = activeCanadianAccount.currency === 'CAD' ? 'C$' : '$';

  // Account metadata
  const accountInfo = useMemo(() => ({
    accountNumber: activeCanadianAccount.accountNumber,
    accountName: activeCanadianAccount.name,
    accountType: activeCanadianAccount.typeLabel,
    clearingFirm: isCanadian ? 'CDS Clearing & Depository Services / CDCC' : 'Apex Clearing Corporation (CRD #13071 / DTC #0158)',
    baseCurrency: activeCanadianAccount.currency,
    regulator: activeCanadianAccount.regulator,
    investorProtection: activeCanadianAccount.investorProtection,
    taxTreatment: activeCanadianAccount.taxTreatment,
    interestRateAPY: 5.15, // 5.15% APY cash sweep
    marginBorrowRate: 6.75, // 6.75% margin rate
    taxId: isCanadian ? 'SIN: ***-***-892' : 'SSN: ***-**-4912',
    registeredRep: isCanadian ? 'TD Direct Investing / thinkorswim Canada CIRO Gateway' : 'TD Ameritrade / Schwab Thinkorswim DMA Gateway',
    statementDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }), [activeCanadianAccount, isCanadian]);

  // Realistic Corporate Actions & Dividends Records
  const dividendRecords: DividendRecord[] = useMemo(() => [
    {
      id: 'div-01',
      date: 'Sep 28, 2026',
      timestamp: Date.now() - 3600000 * 48,
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      type: 'CASH_DIVIDEND',
      ratePerShare: 1.78,
      sharesHeld: 85,
      amount: 151.30,
      status: 'SETTLED'
    },
    {
      id: 'div-02',
      date: 'Sep 24, 2026',
      timestamp: Date.now() - 3600000 * 144,
      symbol: 'TLT',
      name: 'iShares 20+ Year Treasury Bond ETF',
      type: 'TREASURY_COUPON',
      ratePerShare: 0.32,
      sharesHeld: 240,
      amount: 76.80,
      status: 'SETTLED'
    },
    {
      id: 'div-03',
      date: 'Sep 15, 2026',
      timestamp: Date.now() - 3600000 * 360,
      symbol: 'SWEEP',
      name: 'Bank Deposit Sweep Program',
      type: 'INTEREST_SWEEP',
      amount: 142.15,
      status: 'SETTLED'
    },
    {
      id: 'div-04',
      date: 'Aug 29, 2026',
      timestamp: Date.now() - 3600000 * 750,
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'CASH_DIVIDEND',
      ratePerShare: 0.25,
      sharesHeld: 150,
      amount: 37.50,
      status: 'SETTLED'
    },
    {
      id: 'div-05',
      date: 'Aug 15, 2026',
      timestamp: Date.now() - 3600000 * 1100,
      symbol: 'SWEEP',
      name: 'Bank Deposit Sweep Program',
      type: 'INTEREST_SWEEP',
      amount: 138.90,
      status: 'SETTLED'
    }
  ], []);

  const totalDividendsPeriod = useMemo(() => {
    return dividendRecords.reduce((sum, d) => sum + d.amount, 0);
  }, [dividendRecords]);

  // Filtered orders for statement blotter
  const statementOrders = useMemo(() => {
    return orders
      .filter(o => {
        if (orderStatusFilter === 'ALL') return true;
        if (orderStatusFilter === 'FILLED') return o.status === 'FILLED';
        if (orderStatusFilter === 'WORKING') return o.status === 'WORKING' || o.status === 'QUEUED';
        if (orderStatusFilter === 'CANCELLED') return o.status === 'CANCELLED';
        return true;
      })
      .filter(o => {
        if (!searchQuery) return true;
        const q = searchQuery.toUpperCase().trim();
        return (
          o.symbol.toUpperCase().includes(q) ||
          o.id.toUpperCase().includes(q) ||
          o.name.toUpperCase().includes(q)
        );
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [orders, orderStatusFilter, searchQuery]);

  // Filtered trades (executions)
  const statementTrades = useMemo(() => {
    return statementOrders.filter(o => o.status === 'FILLED');
  }, [statementOrders]);

  // PnL by Symbol Table Data
  const instrumentPnLData = useMemo(() => {
    return holdings.map(h => {
      const asset = assets.find(a => a.id === h.assetId);
      const dayDelta = asset ? h.quantity * asset.change24h : 0;
      const dayPct = asset ? asset.change24hPct : 0;
      const totalPct = h.avgBuyPrice > 0 ? ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100 : 0;
      const costBasis = h.quantity * h.avgBuyPrice;

      // Account-aware Margin requirement per asset class:
      const isRegistered = currentAccount === 'CA_TFSA' || currentAccount === 'CA_RRSP' || currentAccount === 'CA_RESP';
      let marginReqPct = 0.50;
      let marginRuleLabel = '50% Reg-T';

      if (isRegistered) {
        marginReqPct = 1.00;
        marginRuleLabel = '100% CRA Cash';
      } else if (currentAccount === 'CA_MARGIN') {
        if (h.assetClass === 'crypto') {
          marginReqPct = 1.00;
          marginRuleLabel = '100% Cash';
        } else if (h.assetClass === 'fixed_income') {
          marginReqPct = 0.15;
          marginRuleLabel = '15% CIRO Gov';
        } else if (h.assetClass === 'commodities') {
          marginReqPct = 0.25;
          marginRuleLabel = '25% CIRO';
        } else {
          const isBlueChip = h.symbol.endsWith('.TO') || ['SHOP.TO', 'RY.TO', 'TD.TO', 'CNR.TO', 'ENB.TO', 'AAPL', 'MSFT', 'NVDA', 'SPY'].includes(h.symbol);
          marginReqPct = isBlueChip ? 0.30 : 0.50;
          marginRuleLabel = isBlueChip ? '30% CIRO Blue-Chip' : '50% CIRO Std';
        }
      } else {
        if (h.assetClass === 'crypto') {
          marginReqPct = 1.00;
          marginRuleLabel = '100% Cash';
        } else if (h.assetClass === 'fixed_income') {
          marginReqPct = 0.15;
          marginRuleLabel = '15% Reg-T';
        } else if (h.assetClass === 'commodities') {
          marginReqPct = 0.25;
          marginRuleLabel = '25% Margin';
        } else {
          marginReqPct = 0.50;
          marginRuleLabel = '50% Reg-T';
        }
      }

      const marginReq = h.currentValue * marginReqPct;
      const bpEffect = marginReq;

      return {
        ...h,
        asset,
        dayDelta,
        dayPct,
        totalPct,
        costBasis,
        marginReq,
        marginReqPct,
        marginRuleLabel,
        bpEffect,
        realizedPnL: Number((h.unrealizedPnL * 0.18).toFixed(2)) // Simulated realized booked PnL
      };
    }).sort((a, b) => b.currentValue - a.currentValue);
  }, [holdings, assets, currentAccount]);

  // Margin Requirements Summary
  const marginSummary = useMemo(() => {
    const totalMaintenanceMargin = instrumentPnLData.reduce((acc, i) => acc + i.marginReq, 0);
    const stockBuyingPower = Math.max(0, metrics.cashBalance * 2 + (metrics.nav - totalMaintenanceMargin));
    const dayTradingBuyingPower = Math.max(0, stockBuyingPower * 2);
    const maintenanceExcess = Math.max(0, metrics.nav - totalMaintenanceMargin);
    const smaBalance = metrics.nav * 0.5; // Special Memorandum Account

    return {
      totalMaintenanceMargin,
      stockBuyingPower,
      dayTradingBuyingPower,
      maintenanceExcess,
      smaBalance,
      isMarginCall: maintenanceExcess <= 0
    };
  }, [instrumentPnLData, metrics.cashBalance, metrics.nav]);

  // Margin Health Gauge Calculations & Stress Testing
  const simulatedNav = useMemo(() => {
    return Math.max(0, metrics.nav * (1 - stressScenario / 100));
  }, [metrics.nav, stressScenario]);

  const simulatedMaintenanceMargin = useMemo(() => {
    // As portfolio drops, position market values drop, reducing required maintenance margin proportionally
    return Math.max(0, marginSummary.totalMaintenanceMargin * (1 - (stressScenario / 100) * 0.9));
  }, [marginSummary.totalMaintenanceMargin, stressScenario]);

  const simulatedExcess = useMemo(() => {
    return Math.max(0, simulatedNav - simulatedMaintenanceMargin);
  }, [simulatedNav, simulatedMaintenanceMargin]);

  const marginUtilization = useMemo(() => {
    if (simulatedNav <= 0) return 100;
    return Math.min(100, Math.max(0, (simulatedMaintenanceMargin / simulatedNav) * 100));
  }, [simulatedNav, simulatedMaintenanceMargin]);

  const isSimulatedCall = simulatedNav <= simulatedMaintenanceMargin || marginUtilization >= 95;

  const marginStatus = useMemo<'HEALTHY' | 'WARNING' | 'MARGIN_CALL'>(() => {
    if (isSimulatedCall || marginUtilization >= 90) return 'MARGIN_CALL';
    if (marginUtilization >= 70) return 'WARNING';
    return 'HEALTHY';
  }, [isSimulatedCall, marginUtilization]);

  // Buffer before actual margin call (allowable drawdown until equity equals maintenance margin)
  const bufferToMarginCallPct = useMemo(() => {
    if (metrics.nav <= marginSummary.totalMaintenanceMargin) return 0;
    return ((metrics.nav - marginSummary.totalMaintenanceMargin) / metrics.nav) * 100;
  }, [metrics.nav, marginSummary.totalMaintenanceMargin]);

  // Export full Statement CSV
  const handleExportCSV = () => {
    const lines: string[] = [];

    // Header info
    lines.push('=== THINKORSWIM OFFICIAL ACCOUNT STATEMENT ===');
    lines.push(`Account Number: ${accountInfo.accountNumber} (${accountInfo.accountName})`);
    lines.push(`Statement Period: ${dateRangeLabel}`);
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Clearing: ${accountInfo.clearingFirm}`);
    lines.push('');

    // Summary Section
    lines.push('--- ACCOUNT FINANCIALS SUMMARY ---');
    lines.push(`Net Liquidating Value: $${metrics.nav.toFixed(2)}`);
    lines.push(`Cash Balance: $${metrics.cashBalance.toFixed(2)}`);
    lines.push(`Total Portfolio Value: $${metrics.totalInvested.toFixed(2)}`);
    lines.push(`Open Unrealized P/L: $${metrics.totalPnL.toFixed(2)} (${metrics.totalPnLPct.toFixed(2)}%)`);
    lines.push(`Day P/L: $${metrics.dayPnL.toFixed(2)} (${metrics.dayPnLPct.toFixed(2)}%)`);
    lines.push(`Stock Buying Power: $${marginSummary.stockBuyingPower.toFixed(2)}`);
    lines.push(`Option Buying Power: $${metrics.cashBalance.toFixed(2)}`);
    lines.push(`Commissions & Fees: $0.00`);
    lines.push('');

    // Positions Schedule
    lines.push('--- PORTFOLIO POSITIONS & PROFIT/LOSS ---');
    lines.push(['Symbol', 'Name', 'Class', 'Quantity', 'Cost Basis', 'Mark Price', 'Market Value', 'Day P/L ($)', 'Day P/L (%)', 'Unrealized P/L ($)', 'Unrealized P/L (%)', 'Margin Req ($)'].join(','));
    instrumentPnLData.forEach(p => {
      lines.push([
        p.symbol,
        `"${p.name}"`,
        p.assetClass,
        p.quantity,
        p.avgBuyPrice.toFixed(2),
        p.currentPrice.toFixed(2),
        p.currentValue.toFixed(2),
        p.dayDelta.toFixed(2),
        `${p.dayPct.toFixed(2)}%`,
        p.unrealizedPnL.toFixed(2),
        `${p.totalPct.toFixed(2)}%`,
        p.marginReq.toFixed(2)
      ].join(','));
    });
    lines.push('');

    // Executed Trades Blotter
    lines.push('--- TRADE EXECUTIONS & BLOTTER ---');
    lines.push(['Execution Time', 'Order ID', 'Symbol', 'Side', 'Type', 'Quantity', 'Fill Price', 'Total Consideration', 'Commission', 'Gateway Route', 'Status'].join(','));
    statementTrades.forEach(t => {
      lines.push([
        new Date(t.timestamp).toISOString(),
        t.id,
        t.symbol,
        t.side,
        t.type,
        t.quantity,
        (t.fillPrice || t.price).toFixed(2),
        t.totalAmount.toFixed(2),
        '0.00',
        `${t.brokerageId.toUpperCase()} DMA`,
        t.status
      ].join(','));
    });
    lines.push('');

    // Dividends
    lines.push('--- DIVIDENDS & CASH FLOWS ---');
    lines.push(['Date', 'Symbol', 'Description', 'Type', 'Amount ($)', 'Status'].join(','));
    dividendRecords.forEach(d => {
      lines.push([
        d.date,
        d.symbol,
        `"${d.name}"`,
        d.type,
        d.amount.toFixed(2),
        d.status
      ].join(','));
    });

    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TOS_Statement_${accountInfo.accountNumber}_${timeframe}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. TOP STATEMENT BANNER & CONTROL TOOLBAR */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title & Account Identification */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">{isCanadian ? '🇨🇦' : '🇺🇸'}</span>
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                  thinkorswim Account Statement
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  activeCanadianAccount.category === 'CANADIAN_TFSA'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : activeCanadianAccount.category === 'CANADIAN_RRSP'
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    : activeCanadianAccount.category === 'CANADIAN_RESP'
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    : isPaperTrading
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  {accountInfo.accountType} ({accountInfo.baseCurrency})
                </span>
                <span className="hidden sm:inline text-[10px] text-slate-500 font-sans">
                  {accountInfo.investorProtection}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans flex flex-wrap items-center gap-2 mt-0.5">
                <span>Account: <strong className="text-white font-mono">{accountInfo.accountNumber}</strong></span>
                <span className="text-slate-600">·</span>
                <span>Regulator: <span className="text-amber-300 font-bold">{accountInfo.regulator}</span></span>
                <span className="text-slate-600">·</span>
                <span>Clearing: <span className="text-slate-300">{accountInfo.clearingFirm}</span></span>
                <span className="text-slate-600">·</span>
                <span>Tax: <span className="text-emerald-400 font-semibold">{accountInfo.taxTreatment}</span></span>
              </div>
            </div>
          </div>

          {/* Quick Toolbar Actions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Paper Trading Mode Toggle */}
            {onTogglePaperTrading && (
              <button
                onClick={onTogglePaperTrading}
                className="px-2.5 py-1 bg-[#161b22] hover:bg-[#1c2128] text-slate-300 hover:text-white border border-[#21262d] rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                title="Toggle between paperMoney® and Live DMA"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isPaperTrading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span>{isPaperTrading ? 'Switch to Live DMA' : 'Switch to paperMoney'}</span>
              </button>
            )}

            {/* Reset Paper Account Button */}
            {onOpenResetModal && (
              <button
                onClick={onOpenResetModal}
                className="px-2.5 py-1 bg-[#161b22] hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Reset Starting Portfolio & Balances"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Account</span>
              </button>
            )}

            {/* Print Statement Preview */}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-1 bg-[#161b22] hover:bg-[#1c2128] text-slate-200 hover:text-white border border-[#21262d] rounded font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Open Print-Formatted Statement (PDF)"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Print Statement</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border ${
                exportSuccess
                  ? 'bg-emerald-600/30 text-[#00c076] border-emerald-500/60'
                  : 'bg-[#1c2128] hover:bg-[#252b35] text-amber-400 hover:text-amber-300 border-amber-400/40'
              }`}
            >
              {exportSuccess ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{exportSuccess ? 'CSV Downloaded' : 'Export to CSV'}</span>
            </button>
          </div>
        </div>

        {/* Filters Bar: Timeframe, Tax Lot Method, Section Tabs, Search */}
        <div className="pt-2 border-t border-[#21262d] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe Pills */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                Period:
              </span>
              <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5">
                {(['TODAY', '7D', '30D', '90D', 'YTD', '1Y', 'ALL'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      timeframe === tf
                        ? 'bg-amber-400 text-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Tax Lot Accounting Selector */}
            <div className="flex items-center gap-1 text-[11px] pl-2 border-l border-[#21262d]">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Tax Lot:</span>
              <select
                value={taxLotMethod}
                onChange={e => setTaxLotMethod(e.target.value as any)}
                className="bg-[#161b22] border border-[#21262d] text-white rounded px-2 py-0.5 outline-none cursor-pointer text-[11px]"
              >
                <option value="FIFO">FIFO (First-In, First-Out)</option>
                <option value="LIFO">LIFO (Last-In, First-Out)</option>
                <option value="MINTAX">MinTax (Tax-Loss Harvest)</option>
                <option value="SPECIFIC">Specific Lot Match</option>
              </select>
            </div>
          </div>

          {/* Date range display & search */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-amber-300 font-medium">
              {dateRangeLabel}
            </span>

            <div className="relative">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search symbol / ID..."
                className="bg-[#161b22] border border-[#21262d] rounded pl-7 pr-2 py-1 text-white text-[11px] outline-none w-36 focus:border-amber-400 placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1.5 top-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 text-xs">
          {[
            { id: 'ALL', label: 'All Statement Sections', count: null },
            { id: 'BALANCES', label: 'Cash & Sweep Vehicle', count: '$' },
            { id: 'ORDERS', label: 'Order History', count: statementOrders.length },
            { id: 'TRADES', label: 'Trade Executions', count: statementTrades.length },
            { id: 'PNL', label: 'P/L by Instrument', count: instrumentPnLData.length },
            { id: 'DIVIDENDS', label: 'Dividends & Cash Flows', count: dividendRecords.length },
            { id: 'MARGIN', label: isCanadian ? 'CIRO / Margin Health' : 'FINRA Margin Health', count: `${marginUtilization.toFixed(0)}%` }
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-3 py-1 rounded font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer text-[11px] ${
                activeSection === sec.id
                  ? 'bg-[#1c2128] text-amber-400 border border-amber-400/40 shadow-sm'
                  : 'bg-[#161b22] text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span>{sec.label}</span>
              {sec.count !== null && (
                <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                  activeSection === sec.id ? 'bg-amber-400 text-black' : 'bg-[#21262d] text-slate-300'
                }`}>
                  {sec.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CASH BALANCE & BUYING POWER SUMMARY CARDS */}
      {(activeSection === 'ALL' || activeSection === 'BALANCES') && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 shadow-md space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b border-[#21262d] pb-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wide">
                Cash & Sweep Vehicle / Margin Financials
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <Building className="w-3 h-3 text-slate-500" />
              <span>{isCanadian ? 'Canadian CDCC / CDS Clearing Gateway' : 'FDIC Bank Sweep Program Yield: 5.15% APY'}</span>
              <span className="text-slate-600">·</span>
              <span>Status: <strong className="text-[#00c076]">{isCanadian ? 'CIRO / CIPF PROTECTED' : 'REG-T IN GOOD STANDING'}</strong></span>
            </div>
          </div>

          {/* Canadian Registered Account & CRA Rules Banner */}
          {isCanadian && (
            <div className="bg-[#12161f] border border-[#21262d] rounded-lg p-3 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c2128] pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🇨🇦</span>
                  <span className="font-bold text-amber-300 uppercase text-xs">
                    {activeCanadianAccount.name} · CRA Compliance & Tax Rules
                  </span>
                </div>
                <span className="text-slate-400 text-[10px]">
                  CIRO / CIPF Protection up to $1,000,000 CAD per category
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* Room / Grants */}
                <div className="bg-[#0e1217] p-2.5 rounded border border-[#1c2128]">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    {activeCanadianAccount.category === 'CANADIAN_RESP' ? 'Federal CESG Grants' : 'CRA Contribution Room'}
                  </span>
                  {activeCanadianAccount.craContributionLimitAnnual && (
                    <div className="text-white font-bold text-sm mt-0.5">
                      {currSym}{activeCanadianAccount.craContributionRoomRemaining?.toLocaleString()}
                      <span className="text-[10px] text-slate-400 font-normal"> remaining of {currSym}{activeCanadianAccount.craContributionLimitAnnual.toLocaleString()}</span>
                    </div>
                  )}
                  {activeCanadianAccount.cesgGrantMatchingPct && (
                    <div className="text-emerald-400 font-bold text-sm mt-0.5">
                      {currSym}{activeCanadianAccount.cesgGrantReceivedYTD} YTD Grant
                      <span className="text-[10px] text-slate-400 font-normal"> (20% matching)</span>
                    </div>
                  )}
                  <span className="text-slate-500 text-[10px] mt-1 block">
                    {activeCanadianAccount.category === 'CANADIAN_TFSA'
                      ? 'Cumulative Lifetime Room: $95,000 CAD'
                      : activeCanadianAccount.category === 'CANADIAN_RESP'
                      ? 'Beneficiary: Liam Taylor (Target: 2035)'
                      : activeCanadianAccount.category === 'CANADIAN_RRSP'
                      ? 'Deductible against gross earned income'
                      : 'Dual Currency CAD & USD Sub-Accounts'}
                  </span>
                </div>

                {/* Option Permissions */}
                <div className="bg-[#0e1217] p-2.5 rounded border border-[#1c2128]">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Derivative & Option Permissions</span>
                  <div className="text-sky-400 font-bold text-xs mt-0.5">
                    {activeCanadianAccount.optionsDescription}
                  </div>
                  <span className="text-slate-500 text-[10px] mt-1 block">
                    Cleared by CDCC (Canadian Derivatives Clearing Corp)
                  </span>
                </div>

                {/* Tax Treatment & Withholding */}
                <div className="bg-[#0e1217] p-2.5 rounded border border-[#1c2128]">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Tax Treatment & Treaty Status</span>
                  <div className="text-emerald-400 font-bold text-xs mt-0.5">
                    {activeCanadianAccount.taxTreatment}
                  </div>
                  <span className="text-slate-500 text-[10px] mt-1 block">
                    {activeCanadianAccount.category === 'CANADIAN_RRSP'
                      ? '0% US Withholding Tax on US Dividends (Treaty Art. XXI)'
                      : activeCanadianAccount.category === 'CANADIAN_TFSA'
                      ? '100% Tax-Free Capital Gains and Canadian Dividends'
                      : activeCanadianAccount.category === 'CANADIAN_RESP'
                      ? 'Tax-sheltered growth; taxed in student hands upon withdrawal'
                      : '50% capital gains inclusion rate; interest deductible'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
            <div className="bg-[#12161f] border border-[#1c2128] p-2.5 rounded-lg">
              <span className="text-slate-400 font-sans text-[10px] uppercase">Net Liquidating Value</span>
              <div className="text-white font-bold text-sm mt-0.5">
                {currSym}{metrics.nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className={`text-[10px] font-bold ${metrics.dayPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                {metrics.dayPnL >= 0 ? '+' : ''}{currSym}{metrics.dayPnL.toFixed(2)} ({metrics.dayPnLPct >= 0 ? '+' : ''}{metrics.dayPnLPct.toFixed(2)}%)
              </span>
            </div>

            <div className="bg-[#12161f] border border-[#1c2128] p-2.5 rounded-lg">
              <span className="text-slate-400 font-sans text-[10px] uppercase">Cash & Sweep Vehicle</span>
              <div className="text-white font-bold text-sm mt-0.5">
                {currSym}{metrics.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-slate-500 text-[10px]">Settled & Insured</span>
            </div>

            <div className="bg-[#12161f] border border-[#1c2128] p-2.5 rounded-lg">
              <span className="text-slate-400 font-sans text-[10px] uppercase">Stock Buying Power</span>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">
                {currSym}{marginSummary.stockBuyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-slate-500 text-[10px]">2x Equity Margin</span>
            </div>

            <div className="bg-[#12161f] border border-[#1c2128] p-2.5 rounded-lg">
              <span className="text-slate-400 font-sans text-[10px] uppercase">Option Buying Power</span>
              <div className="text-sky-400 font-bold text-sm mt-0.5">
                {currSym}{metrics.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-slate-500 text-[10px]">Non-Marginable</span>
            </div>

            <div className="bg-[#12161f] border border-[#1c2128] p-2.5 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans text-[10px] uppercase">Maintenance Excess</span>
                  <span className={`w-2 h-2 rounded-full ${
                    marginStatus === 'HEALTHY' ? 'bg-[#00c076]' : marginStatus === 'WARNING' ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
                  }`} />
                </div>
                <div className={`font-bold text-sm mt-0.5 ${
                  marginStatus === 'HEALTHY' ? 'text-[#00c076]' : marginStatus === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {currSym}{marginSummary.maintenanceExcess.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-[#1c2128]">
                <span className={`font-bold ${
                  marginStatus === 'HEALTHY' ? 'text-[#00c076]' : marginStatus === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {marginStatus === 'HEALTHY' ? '● Healthy' : marginStatus === 'WARNING' ? '▲ Warning' : '✖ Call'}
                </span>
                <span className="text-slate-400 font-mono">{marginUtilization.toFixed(0)}% Used</span>
              </div>
            </div>

            <div className="bg-[#12161f] border border-[#1c2128] p-2.5 rounded-lg">
              <span className="text-slate-400 font-sans text-[10px] uppercase">Commissions & Fees</span>
              <div className="text-[#00c076] font-bold text-sm mt-0.5">{currSym}0.00</div>
              <span className="text-slate-500 text-[10px]">Zero Commission DMA</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECTION: PROFITS AND LOSSES BY INSTRUMENT */}
      {(activeSection === 'ALL' || activeSection === 'PNL') && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg overflow-hidden shadow-md">
          <div className="bg-[#161b22] px-3.5 py-2.5 border-b border-[#21262d] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-white font-bold text-xs uppercase tracking-wider">
                Profits and Losses by Instrument (Floating & Realized)
              </span>
              <span className="text-slate-500 font-sans text-xs">
                · {instrumentPnLData.length} Position Lots
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">Unrealized Portfolio P/L:</span>
              <span className={`font-bold ${metrics.totalPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                {metrics.totalPnL >= 0 ? '+' : ''}{currSym}{metrics.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {' '}({metrics.totalPnLPct >= 0 ? '+' : ''}{metrics.totalPnLPct.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#12161f] text-[10px] text-slate-400 uppercase font-semibold border-b border-[#21262d]">
                <tr>
                  <th className="py-2.5 px-3">Symbol / Name</th>
                  <th className="py-2.5 px-2">Asset Class</th>
                  <th className="py-2.5 px-2 text-right">Position Size</th>
                  <th className="py-2.5 px-2 text-right">Cost Basis</th>
                  <th className="py-2.5 px-2 text-right">Current Mark</th>
                  <th className="py-2.5 px-2 text-right">Total Invested</th>
                  <th className="py-2.5 px-2 text-right">Market Value</th>
                  <th className="py-2.5 px-2 text-right">Day P/L ({currSym})</th>
                  <th className="py-2.5 px-2 text-right">Day P/L (%)</th>
                  <th className="py-2.5 px-2 text-right">Open P/L ({currSym})</th>
                  <th className="py-2.5 px-2 text-right">Total Return (%)</th>
                  <th className="py-2.5 px-2 text-right text-sky-400">Margin Req ({currSym})</th>
                  <th className="py-2.5 px-2 text-right text-slate-400">BP Effect ({currSym})</th>
                  <th className="py-2.5 px-3 text-center">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2128] font-mono text-[11px]">
                {instrumentPnLData.map(h => (
                  <tr key={h.assetId} className="hover:bg-[#161b22]/70 text-slate-300">
                    <td className="py-2 px-3">
                      <div
                        onClick={() => onSelectSymbol && onSelectSymbol(h.symbol)}
                        className="font-bold text-white flex items-center gap-1.5 cursor-pointer hover:text-amber-400 group"
                      >
                        <span className="w-3.5 h-3.5 rounded bg-amber-400 text-black font-black text-[9px] flex items-center justify-center font-mono">
                          1
                        </span>
                        <span className="group-hover:underline">{h.symbol}</span>
                        <span className="text-slate-500 font-sans font-normal text-[10px] truncate max-w-[120px]">
                          {h.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 uppercase text-[10px] text-slate-400">{h.assetClass}</td>
                    <td className="py-2 px-2 text-right text-slate-200">
                      {h.quantity >= 1 ? h.quantity.toLocaleString('en-US') : h.quantity.toFixed(4)}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400">{currSym}{h.avgBuyPrice.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right text-white font-medium">{currSym}{h.currentPrice.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right text-slate-300">
                      {currSym}{h.costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-white">
                      {currSym}{h.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-2 px-2 text-right ${h.dayDelta >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                      {h.dayDelta >= 0 ? '+' : ''}{currSym}{Math.abs(h.dayDelta).toFixed(2)}
                    </td>
                    <td className={`py-2 px-2 text-right font-bold ${h.dayPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                      {h.dayPct >= 0 ? '+' : ''}{h.dayPct.toFixed(2)}%
                    </td>
                    <td className={`py-2 px-2 text-right font-bold ${h.unrealizedPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                      {h.unrealizedPnL >= 0 ? '+' : ''}{currSym}{Math.abs(h.unrealizedPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-2 px-2 text-right font-bold ${h.totalPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                      {h.totalPct >= 0 ? '+' : ''}{h.totalPct.toFixed(2)}%
                    </td>
                    <td className="py-2 px-2 text-right">
                      <div className="font-bold text-sky-400">
                        {currSym}{h.marginReq.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[9px] text-slate-400 font-sans">
                        {h.marginRuleLabel}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400 font-mono">
                      -{currSym}{h.bpEffect.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {onPopulateOrder && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onPopulateOrder(h.symbol, 'BUY', h.currentPrice)}
                            className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] cursor-pointer"
                          >
                            BUY
                          </button>
                          <button
                            onClick={() => onPopulateOrder(h.symbol, 'SELL', h.currentPrice)}
                            className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] cursor-pointer"
                          >
                            SELL
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#12161f] text-[11px] font-bold border-t-2 border-[#21262d] text-white">
                <tr>
                  <td className="py-2.5 px-3 uppercase" colSpan={5}>Portfolio Total</td>
                  <td className="py-2.5 px-2 text-right text-slate-300">
                    {currSym}{metrics.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-2 text-right text-amber-400">
                    {currSym}{(metrics.totalInvested + metrics.totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`py-2.5 px-2 text-right ${metrics.dayPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {metrics.dayPnL >= 0 ? '+' : ''}{currSym}{Math.abs(metrics.dayPnL).toFixed(2)}
                  </td>
                  <td className={`py-2.5 px-2 text-right ${metrics.dayPnLPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {metrics.dayPnLPct >= 0 ? '+' : ''}{metrics.dayPnLPct.toFixed(2)}%
                  </td>
                  <td className={`py-2.5 px-2 text-right ${metrics.totalPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {metrics.totalPnL >= 0 ? '+' : ''}{currSym}{Math.abs(metrics.totalPnL).toFixed(2)}
                  </td>
                  <td className={`py-2.5 px-2 text-right ${metrics.totalPnLPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {metrics.totalPnLPct >= 0 ? '+' : ''}{metrics.totalPnLPct.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-2 text-right text-sky-400 font-extrabold">
                    {currSym}{marginSummary.totalMaintenanceMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-400 font-mono">
                    -{currSym}{marginSummary.totalMaintenanceMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 4. SECTION: ORDER HISTORY BLOTTER */}
      {(activeSection === 'ALL' || activeSection === 'ORDERS') && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg overflow-hidden shadow-md">
          <div className="bg-[#161b22] px-3.5 py-2.5 border-b border-[#21262d] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span className="text-white font-bold text-xs uppercase tracking-wider">
                Order History & Blotter Transmissions
              </span>
              <span className="text-slate-500 font-sans text-xs">
                · {statementOrders.length} Records
              </span>
            </div>

            {/* Filter by status */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-400 uppercase text-[10px]">Filter:</span>
              {(['ALL', 'FILLED', 'WORKING', 'CANCELLED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    orderStatusFilter === st
                      ? 'bg-amber-400 text-black'
                      : 'bg-[#12161f] text-slate-400 hover:text-white border border-[#21262d]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#12161f] text-[10px] text-slate-400 uppercase font-semibold border-b border-[#21262d]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp (UTC-4)</th>
                  <th className="py-2.5 px-2">Order ID</th>
                  <th className="py-2.5 px-2">Pos Effect</th>
                  <th className="py-2.5 px-2">Side</th>
                  <th className="py-2.5 px-2">Symbol</th>
                  <th className="py-2.5 px-2">Type</th>
                  <th className="py-2.5 px-2 text-right">Order Qty</th>
                  <th className="py-2.5 px-2 text-right">Order Price</th>
                  <th className="py-2.5 px-2 text-right">Fill Price</th>
                  <th className="py-2.5 px-2 text-right">Total Principal</th>
                  <th className="py-2.5 px-2">Route Gateway</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-3 text-center">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2128] font-mono text-[11px]">
                {statementOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-[#161b22]/70 text-slate-300">
                    <td className="py-2 px-3 text-slate-400 text-[10px]">
                      {new Date(ord.timestamp).toLocaleDateString()} {new Date(ord.timestamp).toLocaleTimeString([], { hour12: false })}
                    </td>
                    <td className="py-2 px-2 text-slate-400 font-mono text-[10px]">{ord.id}</td>
                    <td className="py-2 px-2 text-[10px] font-bold text-slate-400">
                      {ord.side === 'BUY' ? 'TO OPEN' : 'TO CLOSE'}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        ord.side === 'BUY' ? 'bg-[#00c076]/20 text-[#00c076]' : 'bg-[#ff3b57]/20 text-[#ff3b57]'
                      }`}>
                        {ord.side}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-bold text-white flex items-center gap-1">
                      <span>{ord.symbol}</span>
                      <span className="text-[9px] text-slate-500 font-normal uppercase">({ord.assetClass})</span>
                    </td>
                    <td className="py-2 px-2 text-slate-300">{ord.type}</td>
                    <td className="py-2 px-2 text-right text-slate-200">{ord.quantity}</td>
                    <td className="py-2 px-2 text-right text-slate-400">${ord.price.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right text-white font-medium">
                      {ord.fillPrice ? `$${ord.fillPrice.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-white">
                      ${ord.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2 capitalize text-slate-300 text-[10px]">
                      {ord.brokerageId} Direct DMA
                    </td>
                    <td className="py-2 px-2">
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${
                        ord.status === 'FILLED' ? 'text-[#00c076]' : ord.status === 'WORKING' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => setSelectedOrderReceipt(ord)}
                        className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                        title="View Official Trade Confirmation Slip"
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
      )}

      {/* 5. SECTION: TRADE EXECUTIONS (FILLS) */}
      {(activeSection === 'ALL' || activeSection === 'TRADES') && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg overflow-hidden shadow-md">
          <div className="bg-[#161b22] px-3.5 py-2.5 border-b border-[#21262d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00c076]" />
              <span className="text-white font-bold text-xs uppercase tracking-wider">
                Trade History (Confirmed Fills & Electronic Records)
              </span>
              <span className="text-slate-500 font-sans text-xs">
                · Apex Clearing DMA Direct
              </span>
            </div>
            <span className="text-slate-400 text-xs">
              Total Fills: <strong className="text-white">{statementTrades.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#12161f] text-[10px] text-slate-400 uppercase font-semibold border-b border-[#21262d]">
                <tr>
                  <th className="py-2.5 px-3">Execution Time</th>
                  <th className="py-2.5 px-2">Exec ID</th>
                  <th className="py-2.5 px-2">Action</th>
                  <th className="py-2.5 px-2">Pos Effect</th>
                  <th className="py-2.5 px-2">Symbol</th>
                  <th className="py-2.5 px-2 text-right">Exec Qty</th>
                  <th className="py-2.5 px-2 text-right">Exec Price</th>
                  <th className="py-2.5 px-2 text-right">Gross Amount</th>
                  <th className="py-2.5 px-2 text-right">Commission</th>
                  <th className="py-2.5 px-2 text-right">Regulatory Fees</th>
                  <th className="py-2.5 px-2 text-right">Net Consideration</th>
                  <th className="py-2.5 px-3 text-center">Trade Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2128] font-mono text-[11px]">
                {statementTrades.map((ord, idx) => (
                  <tr key={ord.id} className="hover:bg-[#161b22]/70 text-slate-300">
                    <td className="py-2 px-3 text-slate-400 text-[10px]">
                      {new Date(ord.fillTimestamp || ord.timestamp).toLocaleDateString()} {new Date(ord.fillTimestamp || ord.timestamp).toLocaleTimeString([], { hour12: false })}
                    </td>
                    <td className="py-2 px-2 text-slate-400 text-[10px]">
                      EX-{ord.id.replace('ord-', '')}-{idx + 101}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        ord.side === 'BUY' ? 'bg-[#00c076]/20 text-[#00c076]' : 'bg-[#ff3b57]/20 text-[#ff3b57]'
                      }`}>
                        {ord.side === 'BUY' ? 'BOT' : 'SLD'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-400 text-[10px]">
                      {ord.side === 'BUY' ? 'TO OPEN' : 'TO CLOSE'}
                    </td>
                    <td className="py-2 px-2 font-bold text-white">{ord.symbol}</td>
                    <td className="py-2 px-2 text-right text-slate-200">{ord.quantity}</td>
                    <td className="py-2 px-2 text-right text-white font-medium">
                      ${(ord.fillPrice || ord.price).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-300">
                      ${ord.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2 text-right text-[#00c076] font-bold">$0.00</td>
                    <td className="py-2 px-2 text-right text-slate-400">$0.02</td>
                    <td className="py-2 px-2 text-right font-bold text-white">
                      ${(ord.totalAmount + (ord.side === 'BUY' ? 0.02 : -0.02)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => setSelectedOrderReceipt(ord)}
                        className="px-2 py-0.5 rounded bg-[#161b22] hover:bg-amber-400 hover:text-black text-amber-400 border border-amber-400/40 text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SECTION: DIVIDENDS, INTEREST & CASH FLOWS */}
      {(activeSection === 'ALL' || activeSection === 'DIVIDENDS') && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg overflow-hidden shadow-md">
          <div className="bg-[#161b22] px-3.5 py-2.5 border-b border-[#21262d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-bold text-xs uppercase tracking-wider">
                Corporate Actions, Dividends & Cash Sweep Yields
              </span>
            </div>
            <div className="text-xs">
              <span className="text-slate-400">Total Yield Credited: </span>
              <strong className="text-emerald-400 font-bold">${totalDividendsPeriod.toFixed(2)}</strong>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#12161f] text-[10px] text-slate-400 uppercase font-semibold border-b border-[#21262d]">
                <tr>
                  <th className="py-2.5 px-3">Settlement Date</th>
                  <th className="py-2.5 px-2">Symbol</th>
                  <th className="py-2.5 px-2">Distribution Description</th>
                  <th className="py-2.5 px-2">Event Type</th>
                  <th className="py-2.5 px-2 text-right">Shares / Par Held</th>
                  <th className="py-2.5 px-2 text-right">Distribution Rate</th>
                  <th className="py-2.5 px-2 text-right">Amount Credited</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2128] font-mono text-[11px]">
                {dividendRecords.map(d => (
                  <tr key={d.id} className="hover:bg-[#161b22]/70 text-slate-300">
                    <td className="py-2 px-3 text-slate-400">{d.date}</td>
                    <td className="py-2 px-2 font-bold text-amber-300">{d.symbol}</td>
                    <td className="py-2 px-2 text-slate-200">{d.name}</td>
                    <td className="py-2 px-2">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-bold">
                        {d.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right text-slate-300">
                      {d.sharesHeld ? d.sharesHeld.toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400">
                      {d.ratePerShare ? `$${d.ratePerShare.toFixed(2)}` : '5.15% APY'}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-[#00c076]">
                      +${d.amount.toFixed(2)}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[#00c076] text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. SECTION: FINRA & CIRO MARGIN HEALTH GAUGE & RISK SCHEDULE */}
      {(activeSection === 'ALL' || activeSection === 'MARGIN') && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-xl p-4 shadow-xl space-y-4">
          {/* Section Header with Multi-Layout Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#21262d] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{isCanadian ? '🇨🇦' : '🇺🇸'}</span>
                  <span className="font-bold text-white text-xs uppercase tracking-wide">
                    {isCanadian ? 'CIRO Rule 100 & FINRA Rule 4210 Margin Health Telemetry' : 'FINRA Rule 4210 Margin Health Telemetry'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#161b22] text-slate-300 border border-[#30363d]">
                    {accountInfo.accountNumber}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                  Real-time maintenance excess monitoring, buying power leverage & stress shock testing
                </div>
              </div>
            </div>

            {/* Layout Switcher & Status Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Layout Switcher Pill Group */}
              <div className="flex items-center bg-[#12161f] border border-[#21262d] rounded-lg p-0.5 text-[11px] font-sans shadow-inner">
                <span className="text-slate-500 px-2 text-[10px] uppercase font-bold hidden md:inline">Layout:</span>
                {[
                  { id: 'SPLIT_COCKPIT', label: '◓ Cockpit Pro' },
                  { id: 'PANORAMIC_DIAL', label: '⬭ Panoramic' },
                  { id: 'LINEAR_BAR', label: '━ Horizon' },
                  { id: 'CIRCULAR_270', label: '◎ 270° HUD' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setGaugeLayoutStyle(opt.id as any)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      gaugeLayoutStyle === opt.id
                        ? 'bg-amber-400 text-black shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-[#1c2128]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Status Badge */}
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shadow-md transition-all ${
                marginStatus === 'HEALTHY'
                  ? 'bg-emerald-500/15 text-[#00c076] border-emerald-500/40 shadow-[0_0_14px_rgba(0,192,118,0.25)]'
                  : marginStatus === 'WARNING'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_14px_rgba(245,158,11,0.3)]'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_16px_rgba(255,59,87,0.4)] animate-pulse'
              }`}>
                {marginStatus === 'HEALTHY' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#00c076] shadow-[0_0_8px_#00c076]" />
                    <span>HEALTHY ({marginUtilization.toFixed(1)}%)</span>
                  </>
                ) : marginStatus === 'WARNING' ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>WARNING ({marginUtilization.toFixed(1)}%)</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    <span>MARGIN CALL ({marginUtilization.toFixed(1)}%)</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* ================================================================= */}
          {/* COMMON SVG GRADIENT DEFINITIONS                                   */}
          {/* ================================================================= */}
          <svg className="hidden">
            <defs>
              <filter id="gaugeGlowGreen" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00c076" floodOpacity="0.75" />
              </filter>
              <filter id="gaugeGlowAmber" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.75" />
              </filter>
              <filter id="gaugeGlowRed" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ff3b57" floodOpacity="0.85" />
              </filter>
              <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e2633" />
                <stop offset="50%" stopColor="#0c1017" />
                <stop offset="100%" stopColor="#161e29" />
              </linearGradient>
            </defs>
          </svg>

          {/* ================================================================= */}
          {/* LAYOUT OPTION 1: COCKPIT PRO (Split Radial Tachometer + Telemetry) */}
          {/* ================================================================= */}
          {gaugeLayoutStyle === 'SPLIT_COCKPIT' && (
            <div className="bg-[#10141d] border border-[#21262d] rounded-xl p-4 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* Left Column: Precision SVG Radial Tachometer */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-[#0a0d14] rounded-xl border border-[#1a212d] relative shadow-inner">
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-wider mb-1 flex items-center justify-between w-full px-2">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      <span>Avionics Margin Tachometer</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">CIRO / FINRA 4210</span>
                  </div>

                  {/* SVG Tachometer Dial */}
                  <div className="relative w-full max-w-[300px] aspect-[300/170]">
                    <svg viewBox="0 0 300 170" className="w-full h-full overflow-visible">
                      <defs>
                        <filter id="cockpitGlowGreen" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00c076" floodOpacity="0.8" />
                        </filter>
                        <filter id="cockpitGlowYellow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.8" />
                        </filter>
                        <filter id="cockpitGlowRed" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ff3b57" floodOpacity="0.9" />
                        </filter>
                      </defs>

                      {/* Outer Metallic Bezel Ring */}
                      <path
                        d={describeArc(150, 142, 108, 0, 180)}
                        fill="none"
                        stroke="#1a2230"
                        strokeWidth="2"
                        strokeDasharray="2 3"
                        opacity="0.6"
                      />

                      {/* Background Bezel Track */}
                      <path
                        d={describeArc(150, 142, 98, 0, 180)}
                        fill="none"
                        stroke="#141a24"
                        strokeWidth="18"
                        strokeLinecap="round"
                      />

                      {/* Zone 1: Safe Operating Zone (0% - 70%) */}
                      <path
                        d={describeArc(150, 142, 98, 54, 180)}
                        fill="none"
                        stroke="#00c076"
                        strokeWidth="14"
                        strokeOpacity="0.25"
                        strokeLinecap="round"
                      />

                      {/* Zone 2: Warning Alert Zone (70% - 90%) */}
                      <path
                        d={describeArc(150, 142, 98, 18, 54)}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="14"
                        strokeOpacity="0.32"
                      />

                      {/* Zone 3: Margin Call Danger Zone (90% - 100%) */}
                      <path
                        d={describeArc(150, 142, 98, 0, 18)}
                        fill="none"
                        stroke="#ff3b57"
                        strokeWidth="14"
                        strokeOpacity="0.35"
                        strokeLinecap="round"
                      />

                      {/* Active Dynamic Utilization Glowing Arc */}
                      {marginUtilization > 0 && (() => {
                        const clamped = Math.min(100, Math.max(0.5, marginUtilization));
                        const fillAngle = 180 - (clamped / 100) * 180;
                        const strokeColor =
                          marginStatus === 'HEALTHY'
                            ? '#00c076'
                            : marginStatus === 'WARNING'
                            ? '#f59e0b'
                            : '#ff3b57';
                        const filterId =
                          marginStatus === 'HEALTHY'
                            ? 'url(#cockpitGlowGreen)'
                            : marginStatus === 'WARNING'
                            ? 'url(#cockpitGlowYellow)'
                            : 'url(#cockpitGlowRed)';

                        return (
                          <path
                            d={describeArc(150, 142, 98, fillAngle, 180)}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="14"
                            strokeLinecap="round"
                            filter={filterId}
                          />
                        );
                      })()}

                      {/* Minor Micro Ticks (every 5%) */}
                      {Array.from({ length: 21 }).map((_, i) => {
                        const pct = i * 5;
                        const angle = 180 - (pct / 100) * 180;
                        const inner = polarToCartesian(150, 142, 86, angle);
                        const outer = polarToCartesian(150, 142, 90, angle);
                        return (
                          <line
                            key={`micro-${pct}`}
                            x1={inner.x}
                            y1={inner.y}
                            x2={outer.x}
                            y2={outer.y}
                            stroke="#334155"
                            strokeWidth="0.8"
                            opacity="0.6"
                          />
                        );
                      })}

                      {/* Major Scale Tick Marks and Glowing Labels */}
                      {[
                        { pct: 0, label: '0%', color: '#00c076' },
                        { pct: 25, label: '25%', color: '#00c076' },
                        { pct: 50, label: '50%', color: '#38bdf8' },
                        { pct: 70, label: '70%', color: '#f59e0b' },
                        { pct: 90, label: '90%', color: '#ff3b57' },
                        { pct: 100, label: '100%', color: '#ff3b57' }
                      ].map(tick => {
                        const angle = 180 - (tick.pct / 100) * 180;
                        const inner = polarToCartesian(150, 142, 85, angle);
                        const outer = polarToCartesian(150, 142, 109, angle);
                        const labelPos = polarToCartesian(150, 142, 122, angle);

                        return (
                          <g key={tick.pct}>
                            <line
                              x1={inner.x}
                              y1={inner.y}
                              x2={outer.x}
                              y2={outer.y}
                              stroke={tick.color}
                              strokeWidth={tick.pct === 70 || tick.pct === 90 ? '2' : '1.2'}
                              opacity={tick.pct === 70 || tick.pct === 90 ? '1' : '0.7'}
                            />
                            <text
                              x={labelPos.x}
                              y={labelPos.y}
                              fill={tick.color}
                              fontSize="8.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              opacity="0.95"
                            >
                              {tick.label}
                            </text>
                          </g>
                        );
                      })}

                      {/* Illuminated Tapered Cyber Needle Pointer */}
                      {(() => {
                        const clamped = Math.min(100, Math.max(0, marginUtilization));
                        const needleAngle = 180 - (clamped / 100) * 180;
                        const needleTip = polarToCartesian(150, 142, 84, needleAngle);
                        const needleBack = polarToCartesian(150, 142, 16, needleAngle + 180);
                        const needleColor =
                          marginStatus === 'HEALTHY'
                            ? '#00c076'
                            : marginStatus === 'WARNING'
                            ? '#f59e0b'
                            : '#ff3b57';

                        return (
                          <g className="transition-all duration-300">
                            {/* Needle Body */}
                            <line
                              x1={needleBack.x}
                              y1={needleBack.y}
                              x2={needleTip.x}
                              y2={needleTip.y}
                              stroke={needleColor}
                              strokeWidth="4.5"
                              strokeLinecap="round"
                            />
                            {/* Needle Spine Reflection */}
                            <line
                              x1={needleBack.x}
                              y1={needleBack.y}
                              x2={needleTip.x}
                              y2={needleTip.y}
                              stroke="#ffffff"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                            {/* Outer Hub Bezel */}
                            <circle cx="150" cy="142" r="11" fill="#121824" stroke="#334155" strokeWidth="2.5" />
                            {/* Inner Chrome Hub Ring */}
                            <circle cx="150" cy="142" r="6" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                            {/* Center Status LED Gem */}
                            <circle cx="150" cy="142" r="3.5" fill={needleColor} />
                          </g>
                        );
                      })()}

                      {/* Center Digital Telemetry Readout */}
                      <text
                        x="150"
                        y="108"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={
                          marginStatus === 'HEALTHY'
                            ? '#00c076'
                            : marginStatus === 'WARNING'
                            ? '#f59e0b'
                            : '#ff3b57'
                        }
                        fontSize="24"
                        fontWeight="extrabold"
                        fontFamily="monospace"
                        className="tracking-tight"
                      >
                        {marginUtilization.toFixed(1)}%
                      </text>
                      <text
                        x="150"
                        y="126"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#94a3b8"
                        fontSize="8"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                      >
                        MARGIN UTILIZATION
                      </text>
                    </svg>
                  </div>

                  {/* Micro Zone Bar under Dial */}
                  <div className="flex items-center justify-between w-full text-[9px] pt-2 text-slate-400 font-mono border-t border-[#1a212d] mt-1">
                    <span className="flex items-center gap-1 text-[#00c076] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00c076]" />
                      <span>0-70% Safe</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>70-90% Warning</span>
                    </span>
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <span>≥90% Margin Call</span>
                    </span>
                  </div>
                </div>

                {/* Right Column: Status Banner, Horizon Bar & 4 Metrics */}
                <div className="lg:col-span-7 space-y-3">
                  {/* Status Banner */}
                  <div className={`p-3 rounded-xl border flex items-start gap-3 transition-all shadow-sm ${
                    marginStatus === 'HEALTHY'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : marginStatus === 'WARNING'
                      ? 'bg-amber-950/25 border-amber-500/35 text-amber-100'
                      : 'bg-rose-950/30 border-rose-500/50 text-rose-100 animate-pulse'
                  }`}>
                    {marginStatus === 'HEALTHY' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#00c076] shrink-0 mt-0.5" />
                    ) : marginStatus === 'WARNING' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-0.5 text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <span className={`font-extrabold uppercase tracking-wide text-xs ${
                          marginStatus === 'HEALTHY' ? 'text-[#00c076]' : marginStatus === 'WARNING' ? 'text-amber-300' : 'text-rose-400'
                        }`}>
                          {marginStatus === 'HEALTHY'
                            ? 'STATUS: HEALTHY (AMPLE HOUSE CUSHION)'
                            : marginStatus === 'WARNING'
                            ? 'STATUS: WARNING (ELEVATED MARGIN LEVERAGE)'
                            : 'STATUS: MARGIN CALL DEFICIENT ACCOUNT'}
                        </span>
                        {stressScenario > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">
                            [-{stressScenario}% Stress Test]
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {marginStatus === 'HEALTHY'
                          ? `Account equity ($${simulatedNav.toLocaleString('en-US', { minimumFractionDigits: 2 })}) comfortably exceeds total maintenance margin requirements. House surplus cushion of $${simulatedExcess.toLocaleString('en-US', { minimumFractionDigits: 2 })} provides protection against sudden market drops.`
                          : marginStatus === 'WARNING'
                          ? `Margin utilization (${marginUtilization.toFixed(1)}%) is approaching FINRA / CIRO maintenance limits. Excess margin cushion has narrowed to $${simulatedExcess.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Consider taking profits or hedging open risk.`
                          : `CRITICAL DEFICIENCY: Account equity ($${simulatedNav.toLocaleString('en-US', { minimumFractionDigits: 2 })}) is below the required maintenance margin threshold ($${simulatedMaintenanceMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}). Maintenance margin excess is negative ($${simulatedExcess.toLocaleString('en-US', { minimumFractionDigits: 2 })}). Immediate collateral deposit required to avoid forced liquidation.`}
                      </p>
                    </div>
                  </div>

                  {/* Linear Risk Horizon Segmented Bar */}
                  <div className="bg-[#0a0d14] border border-[#1a212d] rounded-lg p-2.5 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>LINEAR RISK HORIZON:</span>
                      <span className={`font-bold ${
                        marginStatus === 'HEALTHY' ? 'text-[#00c076]' : marginStatus === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        Current Position: {marginUtilization.toFixed(1)}% / 100%
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="relative h-3 w-full bg-[#161e29] rounded-full overflow-hidden flex shadow-inner">
                      {/* Zone 1: Safe 0 - 70% */}
                      <div className="h-full bg-[#00c076]/30 border-r border-[#00c076]/60 w-[70%]" />
                      {/* Zone 2: Warning 70 - 90% */}
                      <div className="h-full bg-amber-500/35 border-r border-amber-500/70 w-[20%]" />
                      {/* Zone 3: Danger 90 - 100% */}
                      <div className="h-full bg-rose-500/40 w-[10%]" />

                      {/* Moving Indicator Pin */}
                      <div
                        className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_#ffffff] transition-all duration-300"
                        style={{ left: `${Math.min(99, Math.max(1, marginUtilization))}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-0.5">
                      <span>0% (Cash Baseline)</span>
                      <span className="text-[#00c076]">70% (House Caution)</span>
                      <span className="text-amber-400">90% (FINRA Threshold)</span>
                      <span className="text-rose-400">100% (Deficit)</span>
                    </div>
                  </div>

                  {/* 4 Core Comparative Figures Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="bg-[#0a0d14] border border-[#1a212d] p-2.5 rounded-lg hover:border-sky-500/40 transition-colors">
                      <span className="text-slate-400 text-[10px] uppercase font-sans block">Maintenance Margin</span>
                      <div className="text-sky-400 font-bold text-sm mt-0.5">
                        {currSym}{simulatedMaintenanceMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className="text-slate-500 text-[10px]">Overnight baseline</span>
                    </div>

                    <div className="bg-[#0a0d14] border border-[#1a212d] p-2.5 rounded-lg hover:border-white/40 transition-colors">
                      <span className="text-slate-400 text-[10px] uppercase font-sans block">Net Equity (NAV)</span>
                      <div className="text-white font-bold text-sm mt-0.5">
                        {currSym}{simulatedNav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className="text-slate-500 text-[10px]">Collateral backing</span>
                    </div>

                    <div className="bg-[#0a0d14] border border-[#1a212d] p-2.5 rounded-lg hover:border-emerald-500/40 transition-colors">
                      <span className="text-slate-400 text-[10px] uppercase font-sans block">Maintenance Excess</span>
                      <div className={`font-bold text-sm mt-0.5 ${
                        marginStatus === 'HEALTHY' ? 'text-[#00c076]' : marginStatus === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {currSym}{simulatedExcess.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className="text-slate-500 text-[10px]">Safety surplus buffer</span>
                    </div>

                    <div className="bg-[#0a0d14] border border-[#1a212d] p-2.5 rounded-lg hover:border-amber-500/40 transition-colors">
                      <span className="text-slate-400 text-[10px] uppercase font-sans block">Buffer to Margin Call</span>
                      <div className={`font-bold text-sm mt-0.5 ${
                        bufferToMarginCallPct > 30 ? 'text-[#00c076]' : bufferToMarginCallPct > 10 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {bufferToMarginCallPct > 0 ? `-${bufferToMarginCallPct.toFixed(1)}%` : 'CALL TRIGGERED'}
                      </div>
                      <span className="text-slate-500 text-[10px]">Allowable drop</span>
                    </div>
                  </div>

                  {/* Interactive Stress Test Simulator Bar & Slider */}
                  <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-slate-300 font-bold text-[11px] font-sans">
                          Interactive Market Shock Simulator:
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        {[
                          { drop: 0, label: 'Live (0%)' },
                          { drop: 10, label: '-10% Dip' },
                          { drop: 20, label: '-20% Pullback' },
                          { drop: 35, label: '-35% Shock (Call)' }
                        ].map(sc => (
                          <button
                            key={sc.drop}
                            onClick={() => setStressScenario(sc.drop)}
                            className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                              stressScenario === sc.drop
                                ? sc.drop === 0
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : sc.drop < 25
                                  ? 'bg-amber-500 text-black shadow-sm'
                                  : 'bg-rose-600 text-white shadow-sm animate-pulse'
                                : 'bg-[#161b22] text-slate-400 hover:text-white border border-[#21262d]'
                            }`}
                          >
                            {sc.label}
                          </button>
                        ))}
                        {stressScenario > 0 && (
                          <button
                            onClick={() => setStressScenario(0)}
                            className="ml-1 text-[10px] text-amber-400 hover:text-white underline cursor-pointer font-sans"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Continuous Interactive Range Slider */}
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] text-slate-400 font-sans w-20 shrink-0">Market Drop:</span>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={stressScenario}
                        onChange={e => setStressScenario(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#161e29] rounded-lg"
                      />
                      <span className="font-mono font-bold text-amber-400 text-xs w-12 text-right shrink-0">
                        -{stressScenario}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* LAYOUT OPTION 2: PANORAMIC DIAL (Expansive Centered Sweeping Dial) */}
          {/* ================================================================= */}
          {gaugeLayoutStyle === 'PANORAMIC_DIAL' && (
            <div className="bg-[#10141d] border border-[#21262d] rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col items-center justify-center bg-[#0a0d14] rounded-xl border border-[#1a212d] p-5 relative shadow-inner">
                <div className="text-center space-y-1 mb-2">
                  <span className="text-xs uppercase font-extrabold text-white tracking-wider flex items-center justify-center gap-1.5">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span>Panoramic Margin Health Telemetry Console</span>
                  </span>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Real-time FINRA Rule 4210 & CIRO Rule 100 Margin Utilization Engine
                  </div>
                </div>

                {/* Big Center SVG Tachometer */}
                <div className="relative w-full max-w-[360px] aspect-[360/190]">
                  <svg viewBox="0 0 360 190" className="w-full h-full overflow-visible">
                    <defs>
                      <filter id="panoGlowGreen" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00c076" floodOpacity="0.8" />
                      </filter>
                      <filter id="panoGlowYellow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#f59e0b" floodOpacity="0.8" />
                      </filter>
                      <filter id="panoGlowRed" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ff3b57" floodOpacity="0.9" />
                      </filter>
                    </defs>

                    {/* Outer Bezel Decorative Dash */}
                    <path
                      d={describeArc(180, 160, 130, 0, 180)}
                      fill="none"
                      stroke="#1e2633"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />

                    {/* Track Background */}
                    <path
                      d={describeArc(180, 160, 118, 0, 180)}
                      fill="none"
                      stroke="#141a24"
                      strokeWidth="22"
                      strokeLinecap="round"
                    />

                    {/* Zone 1: Safe 0 - 70% */}
                    <path
                      d={describeArc(180, 160, 118, 54, 180)}
                      fill="none"
                      stroke="#00c076"
                      strokeWidth="18"
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                    />
                    {/* Zone 2: Warning 70 - 90% */}
                    <path
                      d={describeArc(180, 160, 118, 18, 54)}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="18"
                      strokeOpacity="0.32"
                    />
                    {/* Zone 3: Danger 90 - 100% */}
                    <path
                      d={describeArc(180, 160, 118, 0, 18)}
                      fill="none"
                      stroke="#ff3b57"
                      strokeWidth="18"
                      strokeOpacity="0.35"
                      strokeLinecap="round"
                    />

                    {/* Active Fill Glow Arc */}
                    {marginUtilization > 0 && (() => {
                      const clamped = Math.min(100, Math.max(0.5, marginUtilization));
                      const fillAngle = 180 - (clamped / 100) * 180;
                      const strokeColor =
                        marginStatus === 'HEALTHY'
                          ? '#00c076'
                          : marginStatus === 'WARNING'
                          ? '#f59e0b'
                          : '#ff3b57';
                      const filterId =
                        marginStatus === 'HEALTHY'
                          ? 'url(#panoGlowGreen)'
                          : marginStatus === 'WARNING'
                          ? 'url(#panoGlowYellow)'
                          : 'url(#panoGlowRed)';

                      return (
                        <path
                          d={describeArc(180, 160, 118, fillAngle, 180)}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="18"
                          strokeLinecap="round"
                          filter={filterId}
                        />
                      );
                    })()}

                    {/* Radial Ticks */}
                    {[
                      { pct: 0, label: '0%', color: '#00c076' },
                      { pct: 25, label: '25%', color: '#00c076' },
                      { pct: 50, label: '50%', color: '#38bdf8' },
                      { pct: 70, label: '70%', color: '#f59e0b' },
                      { pct: 90, label: '90%', color: '#ff3b57' },
                      { pct: 100, label: '100%', color: '#ff3b57' }
                    ].map(tick => {
                      const angle = 180 - (tick.pct / 100) * 180;
                      const inner = polarToCartesian(180, 160, 102, angle);
                      const outer = polarToCartesian(180, 160, 134, angle);
                      const labelPos = polarToCartesian(180, 160, 148, angle);

                      return (
                        <g key={tick.pct}>
                          <line
                            x1={inner.x}
                            y1={inner.y}
                            x2={outer.x}
                            y2={outer.y}
                            stroke={tick.color}
                            strokeWidth={tick.pct === 70 || tick.pct === 90 ? '2' : '1.2'}
                            opacity={tick.pct === 70 || tick.pct === 90 ? '1' : '0.6'}
                          />
                          <text
                            x={labelPos.x}
                            y={labelPos.y}
                            fill={tick.color}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            opacity="0.95"
                          >
                            {tick.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Panoramic Needle */}
                    {(() => {
                      const clamped = Math.min(100, Math.max(0, marginUtilization));
                      const needleAngle = 180 - (clamped / 100) * 180;
                      const needleTip = polarToCartesian(180, 160, 100, needleAngle);
                      const needleBack = polarToCartesian(180, 160, 18, needleAngle + 180);
                      const needleColor =
                        marginStatus === 'HEALTHY'
                          ? '#00c076'
                          : marginStatus === 'WARNING'
                          ? '#f59e0b'
                          : '#ff3b57';

                      return (
                        <g>
                          <line
                            x1={needleBack.x}
                            y1={needleBack.y}
                            x2={needleTip.x}
                            y2={needleTip.y}
                            stroke={needleColor}
                            strokeWidth="5"
                            strokeLinecap="round"
                          />
                          <line
                            x1={needleBack.x}
                            y1={needleBack.y}
                            x2={needleTip.x}
                            y2={needleTip.y}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <circle cx="180" cy="160" r="12" fill="#161b22" stroke="#334155" strokeWidth="2.5" />
                          <circle cx="180" cy="160" r="5" fill={needleColor} />
                        </g>
                      );
                    })()}

                    {/* Center Text Readout */}
                    <text
                      x="180"
                      y="120"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={
                        marginStatus === 'HEALTHY'
                          ? '#00c076'
                          : marginStatus === 'WARNING'
                          ? '#f59e0b'
                          : '#ff3b57'
                      }
                      fontSize="28"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {marginUtilization.toFixed(1)}%
                    </text>
                    <text
                      x="180"
                      y="140"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#8b949e"
                      fontSize="8.5"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      letterSpacing="0.08em"
                    >
                      MARGIN UTILIZATION
                    </text>
                  </svg>
                </div>

                {/* Sub-bar */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-3 text-xs font-mono">
                  <span className="text-[#00c076] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00c076]" />
                    <span>0% - 70% Safe Operating Zone</span>
                  </span>
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>70% - 90% Caution / Warning</span>
                  </span>
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>≥90% Regulatory Margin Call</span>
                  </span>
                </div>
              </div>

              {/* 4 Cards Grid underneath */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Maintenance Margin</span>
                  <div className="text-sky-400 font-bold text-base mt-0.5">
                    {currSym}{simulatedMaintenanceMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-slate-500 text-[10px]">Overnight requirement</span>
                </div>
                <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Portfolio Equity</span>
                  <div className="text-white font-bold text-base mt-0.5">
                    {currSym}{simulatedNav.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-slate-500 text-[10px]">Liquidating collateral</span>
                </div>
                <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Maintenance Excess</span>
                  <div className={`font-bold text-base mt-0.5 ${
                    marginStatus === 'HEALTHY' ? 'text-[#00c076]' : marginStatus === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {currSym}{simulatedExcess.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-slate-500 text-[10px]">House safety surplus</span>
                </div>
                <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg text-center">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Buffer to Margin Call</span>
                  <div className={`font-bold text-base mt-0.5 ${
                    bufferToMarginCallPct > 30 ? 'text-[#00c076]' : bufferToMarginCallPct > 10 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {bufferToMarginCallPct > 0 ? `-${bufferToMarginCallPct.toFixed(1)}%` : 'CALL TRIGGERED'}
                  </div>
                  <span className="text-slate-500 text-[10px]">Allowable drop</span>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* LAYOUT OPTION 3: LINEAR HORIZON MATRIX (Executive Bar View)       */}
          {/* ================================================================= */}
          {gaugeLayoutStyle === 'LINEAR_BAR' && (
            <div className="bg-[#10141d] border border-[#21262d] rounded-xl p-4 shadow-xl space-y-4">
              <div className="bg-[#0a0d14] border border-[#1a212d] rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c2128] pb-2">
                  <span className="text-xs uppercase font-extrabold text-white tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Executive Risk Horizon Linear Matrix</span>
                  </span>
                  <div className="text-xs font-mono">
                    <span className="text-slate-400">Current Margin Utilization: </span>
                    <strong className={`font-bold text-sm ${
                      marginStatus === 'HEALTHY' ? 'text-[#00c076]' : marginStatus === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {marginUtilization.toFixed(1)}%
                    </strong>
                  </div>
                </div>

                {/* Big Linear Horizon Track */}
                <div className="py-2">
                  <div className="relative h-6 w-full bg-[#161e29] rounded-full overflow-hidden flex shadow-inner border border-[#21262d]">
                    <div className="h-full bg-gradient-to-r from-emerald-600/30 to-emerald-500/40 border-r border-emerald-400/50 w-[70%]" />
                    <div className="h-full bg-gradient-to-r from-amber-500/30 to-amber-500/50 border-r border-amber-400/50 w-[20%]" />
                    <div className="h-full bg-gradient-to-r from-rose-600/40 to-rose-500/60 w-[10%]" />

                    <div
                      className="absolute top-0 bottom-0 w-2.5 bg-white shadow-[0_0_12px_#ffffff] transition-all duration-300 rounded"
                      style={{ left: `${Math.min(99, Math.max(1, marginUtilization))}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2">
                    <span className="text-[#00c076] font-bold">0% (Cash Baseline)</span>
                    <span className="text-sky-400 font-bold">50% (Reg-T Initial Target)</span>
                    <span className="text-amber-400 font-bold">70% (House Warning Line)</span>
                    <span className="text-rose-400 font-bold">90% (FINRA Rule 4210 Call)</span>
                  </div>
                </div>
              </div>

              {/* 4 Cards Grid underneath */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg">
                  <span className="text-slate-400 text-[10px] uppercase font-sans block">Maintenance Requirement</span>
                  <div className="text-sky-400 font-bold text-sm mt-0.5">
                    {currSym}{simulatedMaintenanceMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg">
                  <span className="text-slate-400 text-[10px] uppercase font-sans block">Net Equity (NAV)</span>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {currSym}{simulatedNav.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg">
                  <span className="text-slate-400 text-[10px] uppercase font-sans block">Maintenance Excess</span>
                  <div className={`font-bold text-sm mt-0.5 ${
                    marginStatus === 'HEALTHY' ? 'text-[#00c076]' : marginStatus === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {currSym}{simulatedExcess.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg">
                  <span className="text-slate-400 text-[10px] uppercase font-sans block">Drawdown Buffer</span>
                  <div className={`font-bold text-sm mt-0.5 ${
                    bufferToMarginCallPct > 30 ? 'text-[#00c076]' : bufferToMarginCallPct > 10 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {bufferToMarginCallPct > 0 ? `-${bufferToMarginCallPct.toFixed(1)}%` : 'TRIGGERED'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* LAYOUT OPTION 4: 270° TACTICAL HUD DIAL (Concentric Dual Rings)   */}
          {/* ================================================================= */}
          {gaugeLayoutStyle === 'CIRCULAR_270' && (
            <div className="bg-[#10141d] border border-[#21262d] rounded-xl p-5 shadow-xl space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* 270° Circular Radial SVG Gauge */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-[#0a0d14] rounded-xl border border-[#1a212d] relative shadow-inner">
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-wider mb-1 flex items-center justify-between w-full px-2">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      <span>270° Tactical Telemetry Core</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">APEX ENGINE</span>
                  </div>

                  <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
                    <svg viewBox="0 0 280 280" className="w-full h-full overflow-visible">
                      {/* Outer Bezel Dash Circle */}
                      <circle cx="140" cy="140" r="118" fill="none" stroke="#1e2633" strokeWidth="2" strokeDasharray="3 4" />

                      {/* 270° Base Track (Sweeping from 225° down through 0 to -45° / 315°) */}
                      <path
                        d={describeArc(140, 140, 102, -45, 225)}
                        fill="none"
                        stroke="#141a24"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />

                      {/* Zone 1: Safe (0 - 70% of 270 deg) */}
                      <path
                        d={describeArc(140, 140, 102, 36, 225)}
                        fill="none"
                        stroke="#00c076"
                        strokeWidth="12"
                        strokeOpacity="0.25"
                        strokeLinecap="round"
                      />
                      {/* Zone 2: Warning (70 - 90% of 270 deg) */}
                      <path
                        d={describeArc(140, 140, 102, -18, 36)}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="12"
                        strokeOpacity="0.3"
                      />
                      {/* Zone 3: Danger (90 - 100% of 270 deg) */}
                      <path
                        d={describeArc(140, 140, 102, -45, -18)}
                        fill="none"
                        stroke="#ff3b57"
                        strokeWidth="12"
                        strokeOpacity="0.35"
                        strokeLinecap="round"
                      />

                      {/* Active Fill Arc */}
                      {marginUtilization > 0 && (() => {
                        const clamped = Math.min(100, Math.max(0.5, marginUtilization));
                        const sweepAngle = 225 - (clamped / 100) * 270;
                        const strokeColor =
                          marginStatus === 'HEALTHY'
                            ? '#00c076'
                            : marginStatus === 'WARNING'
                            ? '#f59e0b'
                            : '#ff3b57';
                        const filterId =
                          marginStatus === 'HEALTHY'
                            ? 'url(#gaugeGlowGreen)'
                            : marginStatus === 'WARNING'
                            ? 'url(#gaugeGlowAmber)'
                            : 'url(#gaugeGlowRed)';

                        return (
                          <path
                            d={describeArc(140, 140, 102, sweepAngle, 225)}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="14"
                            strokeLinecap="round"
                            filter={filterId}
                          />
                        );
                      })()}

                      {/* Dial Needle */}
                      {(() => {
                        const clamped = Math.min(100, Math.max(0, marginUtilization));
                        const angle = 225 - (clamped / 100) * 270;
                        const tip = polarToCartesian(140, 140, 86, angle);
                        const back = polarToCartesian(140, 140, 15, angle + 180);
                        const needleColor =
                          marginStatus === 'HEALTHY'
                            ? '#00c076'
                            : marginStatus === 'WARNING'
                            ? '#f59e0b'
                            : '#ff3b57';

                        return (
                          <g>
                            <line x1={back.x} y1={back.y} x2={tip.x} y2={tip.y} stroke={needleColor} strokeWidth="4.5" strokeLinecap="round" />
                            <line x1={back.x} y1={back.y} x2={tip.x} y2={tip.y} stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                            <circle cx="140" cy="140" r="14" fill="#0d1117" stroke="#334155" strokeWidth="2.5" />
                            <circle cx="140" cy="140" r="6" fill={needleColor} />
                          </g>
                        );
                      })()}

                      {/* Center Text in 270° Dial */}
                      <text
                        x="140"
                        y="172"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={
                          marginStatus === 'HEALTHY'
                            ? '#00c076'
                            : marginStatus === 'WARNING'
                            ? '#f59e0b'
                            : '#ff3b57'
                        }
                        fontSize="22"
                        fontWeight="extrabold"
                        fontFamily="monospace"
                      >
                        {marginUtilization.toFixed(1)}%
                      </text>
                      <text
                        x="140"
                        y="188"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#94a3b8"
                        fontSize="7.5"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                      >
                        UTILIZATION
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Right Column: Comparative Metrics */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase font-sans">Maintenance Req</span>
                      <div className="text-sky-400 font-bold text-base mt-0.5">
                        {currSym}{simulatedMaintenanceMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-slate-500 text-[10px]">Threshold limit</span>
                    </div>

                    <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase font-sans">Portfolio Equity</span>
                      <div className="text-white font-bold text-base mt-0.5">
                        {currSym}{simulatedNav.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-slate-500 text-[10px]">Net Liquidating Value</span>
                    </div>

                    <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase font-sans">Maintenance Excess</span>
                      <div className={`font-bold text-base mt-0.5 ${
                        marginStatus === 'HEALTHY' ? 'text-[#00c076]' : marginStatus === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {currSym}{simulatedExcess.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-slate-500 text-[10px]">Surplus headroom</span>
                    </div>

                    <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase font-sans">Drawdown Buffer</span>
                      <div className={`font-bold text-base mt-0.5 ${
                        bufferToMarginCallPct > 30 ? 'text-[#00c076]' : bufferToMarginCallPct > 10 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {bufferToMarginCallPct > 0 ? `-${bufferToMarginCallPct.toFixed(1)}%` : 'TRIGGERED'}
                      </div>
                      <span className="text-slate-500 text-[10px]">Max allowable drop</span>
                    </div>
                  </div>

                  {/* Stress Test Bar */}
                  <div className="bg-[#0a0d14] border border-[#1a212d] p-3 rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold text-[11px] font-sans flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>Stress Simulation:</span>
                      </span>
                      <span className="font-mono text-amber-400 font-bold">-{stressScenario}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={stressScenario}
                      onChange={e => setStressScenario(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#161e29] rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 3 DETAILED REGULATORY CARDS                                       */}
          {/* ================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Card 1: Margin Balances */}
            <div className="bg-[#12161f] border border-[#1c2128] p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold text-xs uppercase block">Margin Balances & Rules</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {isCanadian ? 'CIRO / CRA' : 'Reg-T'}
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isCanadian ? 'CIRO Initial Requirement:' : 'Regulation T Initial Margin:'}</span>
                  <span className="text-white font-bold">{isCanadian ? '30.0% - 50.0%' : '50.00%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isCanadian ? 'CIRO Maintenance Requirement:' : 'FINRA Maintenance Requirement:'}</span>
                  <span className="text-white font-bold">{isCanadian ? '25.0% - 30.0%' : '25.00%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Maintenance Margin:</span>
                  <span className="text-sky-400 font-bold">
                    {currSym}{marginSummary.totalMaintenanceMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Special Memorandum Account (SMA):</span>
                  <span className="text-slate-200">
                    {currSym}{marginSummary.smaBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Excess & Buying Power */}
            <div className="bg-[#12161f] border border-[#1c2128] p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#00c076] font-bold text-xs uppercase block">Excess & House Cushion</span>
                <span className={`text-[10px] font-bold ${
                  marginStatus === 'HEALTHY' ? 'text-[#00c076]' : marginStatus === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {marginStatus === 'HEALTHY' ? 'GOOD STANDING' : marginStatus === 'WARNING' ? 'BORDERLINE' : 'DEFICIENT'}
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Maintenance Margin Excess:</span>
                  <span className="text-[#00c076] font-bold">
                    {currSym}{marginSummary.maintenanceExcess.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stock Buying Power (2x):</span>
                  <span className="text-emerald-400 font-bold">
                    {currSym}{marginSummary.stockBuyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Day Trading Buying Power (4x):</span>
                  <span className="text-emerald-400 font-bold">
                    {currSym}{marginSummary.dayTradingBuyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fed Call (Reg-T):</span>
                  <span className="text-[#00c076] font-bold">$0.00 (Satisfied)</span>
                </div>
              </div>
            </div>

            {/* Card 3: Regulatory Disclosures */}
            <div className="bg-[#12161f] border border-[#1c2128] p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold text-xs uppercase block">Regulatory Disclosures</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {isCanadian ? 'CIRO / CIPF' : 'FINRA / SIPC'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                {isCanadian
                  ? 'Securities held in Canadian margin accounts are governed by CIRO Rule 100 and cleared through CDCC / CDS. CIPF protects customer assets up to $1,000,000 CAD per separate account category. Margin borrowing interest is tax-deductible against investment income.'
                  : 'Securities held in margin accounts are subject to FINRA Rule 4210 and Regulation T. Apex Clearing Corporation acts as carrying broker-dealer (Member SIPC). FDIC cash sweep yield: 5.15% APY. Day trading accounts require $25,000 minimum equity.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. TRADE CONFIRMATION SLIP MODAL                                      */}
      {/* ===================================================================== */}
      {selectedOrderReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1217] border border-[#30363d] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 font-mono">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#21262d] pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Electronic Trade Confirmation Slip</span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">
                  Apex Clearing Corporation · Order Confirmation #{selectedOrderReceipt.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderReceipt(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slip Details Grid */}
            <div className="bg-[#12161f] border border-[#1c2128] p-3.5 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#1c2128] pb-1.5">
                <span className="text-slate-400">Account:</span>
                <span className="text-white font-bold">{accountInfo.accountNumber} ({accountInfo.accountName})</span>
              </div>
              <div className="flex justify-between border-b border-[#1c2128] pb-1.5">
                <span className="text-slate-400">Action:</span>
                <span className={`font-bold ${selectedOrderReceipt.side === 'BUY' ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                  {selectedOrderReceipt.side === 'BUY' ? 'BOT / BUY TO OPEN' : 'SLD / SELL TO CLOSE'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1c2128] pb-1.5">
                <span className="text-slate-400">Symbol / Description:</span>
                <span className="text-white font-bold">{selectedOrderReceipt.symbol} ({selectedOrderReceipt.name})</span>
              </div>
              <div className="flex justify-between border-b border-[#1c2128] pb-1.5">
                <span className="text-slate-400">Executed Quantity:</span>
                <span className="text-white font-bold">{selectedOrderReceipt.quantity}</span>
              </div>
              <div className="flex justify-between border-b border-[#1c2128] pb-1.5">
                <span className="text-slate-400">Execution Price:</span>
                <span className="text-white font-bold">${(selectedOrderReceipt.fillPrice || selectedOrderReceipt.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-[#1c2128] pb-1.5">
                <span className="text-slate-400">Gross Consideration:</span>
                <span className="text-white font-bold">${selectedOrderReceipt.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-[#1c2128] pb-1.5">
                <span className="text-slate-400">Commission / DMA Fee:</span>
                <span className="text-[#00c076] font-bold">$0.00 (Zero Commission)</span>
              </div>
              <div className="flex justify-between border-b border-[#1c2128] pb-1.5">
                <span className="text-slate-400">SEC / Regulatory Fee:</span>
                <span className="text-slate-300 font-bold">$0.02</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-amber-400 font-bold">Net Settlement Amount:</span>
                <span className="text-amber-400 font-bold text-sm">
                  ${(selectedOrderReceipt.totalAmount + (selectedOrderReceipt.side === 'BUY' ? 0.02 : -0.02)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Execution Stamps */}
            <div className="text-[10px] text-slate-500 font-mono space-y-1">
              <div>Routing Venue: {selectedOrderReceipt.brokerageId.toUpperCase()} High-Frequency DMA</div>
              <div>Execution Latency: {selectedOrderReceipt.executionLatencyMs || 14}ms</div>
              <div>Settlement Cycle: T+1 Regular Way</div>
              <div>Biometric Security: {selectedOrderReceipt.biometricConfirmed ? 'Enclave Hardware Verified' : 'Standard Session'}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#21262d]">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-[#161b22] hover:bg-[#1c2128] text-white border border-[#21262d] rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setSelectedOrderReceipt(null)}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 9. PRINTABLE OFFICIAL ACCOUNT STATEMENT MODAL                         */}
      {/* ===================================================================== */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0e14] border border-[#30363d] rounded-xl max-w-4xl w-full p-6 text-slate-200 shadow-2xl space-y-6 my-8 font-sans">
            {/* Modal Controls */}
            <div className="flex items-center justify-between border-b border-[#21262d] pb-3 font-mono">
              <span className="text-xs text-amber-400 font-bold flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Official Statement Print Preview (Schwab / thinkorswim DMA)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-1 bg-[#161b22] hover:bg-[#21262d] text-white text-xs rounded cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Document Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-700 pb-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">thinkorswim®</h1>
                <p className="text-xs text-slate-400">Charles Schwab & Co., Inc. / Apex Clearing Corporation</p>
                <p className="text-xs text-slate-400">Member FINRA / SIPC</p>
              </div>
              <div className="text-right text-xs font-mono">
                <div className="text-sm font-bold text-white">ACCOUNT STATEMENT</div>
                <div className="text-slate-400">Period: {dateRangeLabel}</div>
                <div className="text-slate-400">Date Generated: {accountInfo.statementDate}</div>
              </div>
            </div>

            {/* Account Information Block */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#12161f] p-4 rounded-lg border border-[#21262d]">
              <div>
                <span className="text-slate-400 uppercase text-[10px] block">Account Title & Address</span>
                <span className="font-bold text-white text-sm block mt-0.5">{accountInfo.accountName}</span>
                <span className="text-slate-400 block">Account Number: <strong className="text-white">{accountInfo.accountNumber}</strong></span>
                <span className="text-slate-400 block">Account Classification: {accountInfo.accountType}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase text-[10px] block">Financial Summary</span>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  ${metrics.nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </div>
                <span className="text-slate-400 block">Cash Balance: ${metrics.cashBalance.toFixed(2)}</span>
                <span className="text-slate-400 block">Period P/L: ${metrics.dayPnL.toFixed(2)} ({metrics.dayPnLPct.toFixed(2)}%)</span>
              </div>
            </div>

            {/* Schedule of Holdings Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Schedule of Investments & Security Positions
              </h3>
              <table className="w-full text-left text-xs font-mono border border-[#21262d] divide-y divide-[#21262d]">
                <thead className="bg-[#161b22] text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-2">Symbol</th>
                    <th className="py-2 px-2">Description</th>
                    <th className="py-2 px-2 text-right">Quantity</th>
                    <th className="py-2 px-2 text-right">Price</th>
                    <th className="py-2 px-2 text-right">Market Value</th>
                    <th className="py-2 px-2 text-right">Unrealized P/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2128]">
                  {instrumentPnLData.map(p => (
                    <tr key={p.assetId} className="hover:bg-[#161b22]/50">
                      <td className="py-1.5 px-2 font-bold text-white">{p.symbol}</td>
                      <td className="py-1.5 px-2 text-slate-300">{p.name}</td>
                      <td className="py-1.5 px-2 text-right text-slate-300">{p.quantity}</td>
                      <td className="py-1.5 px-2 text-right text-slate-300">${p.currentPrice.toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-white">${p.currentValue.toFixed(2)}</td>
                      <td className={`py-1.5 px-2 text-right font-bold ${p.unrealizedPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                        {p.unrealizedPnL >= 0 ? '+' : ''}${p.unrealizedPnL.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legal Disclosures */}
            <div className="text-[10px] text-slate-500 font-sans border-t border-[#21262d] pt-3 leading-relaxed">
              <p>
                <strong>SIPC Protection:</strong> Account securities and cash held in brokerage accounts are protected by the Securities Investor Protection Corporation (SIPC) up to $500,000, including a maximum of $250,000 for cash claims. Explanatory brochure available upon request at www.sipc.org.
              </p>
              <p className="mt-1">
                <strong>Tax Notice:</strong> This statement is for informational and reporting purposes. Please retain for your permanent records and tax return preparation. Charles Schwab & Co., Inc. and thinkorswim are registered trademarks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
