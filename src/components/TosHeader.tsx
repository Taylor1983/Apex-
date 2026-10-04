import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  Radio,
  Clock,
  Wifi,
  ChevronDown,
  Layers,
  Shield,
  ArrowLeftRight,
  PieChart,
  Sliders,
  Maximize2,
  Minimize2,
  SidebarClose,
  SidebarOpen,
  BarChart2,
  LayoutGrid,
  Columns,
  Square,
  CheckCircle2,
  Shuffle,
  Layout,
  RotateCcw,
  FileText,
  Check,
  Activity
} from 'lucide-react';
import { Asset, BiometricSettings, PortfolioMetrics, PlatformLayoutVariation, AccountType } from '../types';
import { CANADIAN_ACCOUNTS, CAD_USD_EXCHANGE_RATE } from '../data/canadianMarketData';

interface TosHeaderProps {
  currentTab: 'monitor' | 'statement' | 'trade' | 'charts' | 'depth' | 'options' | 'analyze' | 'macro' | 'canadian_live' | 'rebalance' | 'brokerages' | 'security';
  onSelectTab: (tab: 'monitor' | 'statement' | 'trade' | 'charts' | 'depth' | 'options' | 'analyze' | 'macro' | 'canadian_live' | 'rebalance' | 'brokerages' | 'security') => void;
  metrics: PortfolioMetrics;
  biometricSettings: BiometricSettings;
  onLockTerminal: () => void;
  onUnlockTerminal: () => void;
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  assets: Asset[];
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  bottomBarOpen: boolean;
  onToggleBottomBar: () => void;
  layoutVariation: PlatformLayoutVariation;
  onChangeLayoutVariation: (layout: PlatformLayoutVariation) => void;
  isPaperTrading?: boolean;
  onTogglePaperTrading?: () => void;
  onOpenResetModal?: () => void;
  currentAccount?: AccountType;
  onSelectAccount?: (account: AccountType) => void;
}

export const TosHeader: React.FC<TosHeaderProps> = ({
  currentTab,
  onSelectTab,
  metrics,
  biometricSettings,
  onLockTerminal,
  onUnlockTerminal,
  activeSymbol,
  onSelectSymbol,
  assets,
  sidebarOpen,
  onToggleSidebar,
  bottomBarOpen,
  onToggleBottomBar,
  layoutVariation,
  onChangeLayoutVariation,
  isPaperTrading = true,
  onTogglePaperTrading,
  onOpenResetModal,
  currentAccount = 'CA_MARGIN',
  onSelectAccount
}) => {
  const [timeString, setTimeString] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const layoutMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layoutMenuRef.current && !layoutMenuRef.current.contains(event.target as Node)) {
        setIsLayoutMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const layoutOptions: { id: PlatformLayoutVariation; name: string; tag: string; desc: string; icon: any }[] = [
    {
      id: 'CLASSIC_DOCK',
      name: 'Classic thinkorswim',
      tag: 'Default',
      desc: 'Single workspace view with Left Gadgets Sidebar & Bottom Order Bar.',
      icon: Square
    },
    {
      id: 'SPLIT_DUAL',
      name: 'Dual-Pane Side-by-Side',
      tag: '50/50 Split',
      desc: 'Two independent synchronized trading tools side-by-side (e.g. Chart + Vol Surface).',
      icon: Columns
    },
    {
      id: 'QUAD_GRID',
      name: 'Trader Quad Matrix',
      tag: '4-Grid Pro',
      desc: '4 Live tools simultaneously: Charts, Options Chain, 3D Vol Surface & DOM.',
      icon: LayoutGrid
    },
    {
      id: 'TRIPLE_COMMAND',
      name: 'Triple Command Center',
      tag: '60/40 Split',
      desc: 'Large primary chart on the left with stacked Vol Surface and Options on the right.',
      icon: Layout
    },
    {
      id: 'CINEMA_FOCUS',
      name: 'Cinema Fullscreen Focus',
      tag: 'Max Canvas',
      desc: 'Edge-to-edge trading workspace with sidebars and docks auto-collapsed.',
      icon: Maximize2
    }
  ];

  const handleCycleLayout = () => {
    const layouts: PlatformLayoutVariation[] = [
      'CLASSIC_DOCK',
      'SPLIT_DUAL',
      'QUAD_GRID',
      'TRIPLE_COMMAND',
      'CINEMA_FOCUS'
    ];
    const currIdx = layouts.indexOf(layoutVariation);
    const nextIdx = (currIdx + 1) % layouts.length;
    onChangeLayoutVariation(layouts[nextIdx]);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' EDT'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const found = assets.find(
      a => a.symbol.toUpperCase() === searchQuery.toUpperCase().trim()
    );
    if (found) {
      onSelectSymbol(found.symbol);
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0e1217] border-b border-[#21262d] select-none text-slate-200">
      {/* 1. TOS Top Application Meta Bar */}
      <div className="bg-[#090d11] border-b border-[#1c2128] px-3 py-1 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-3">
          {/* Brand Logo thinkorswim style */}
          <div className="flex items-center gap-1.5 font-sans font-bold tracking-tight">
            <span className="text-[#00c076] font-mono text-xs font-black">tos</span>
            <span className="text-white text-xs">thinkorswim</span>
            <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20">
              APEX DMA
            </span>
          </div>

          <span className="text-slate-600">|</span>

          {/* Institutional Multi-Account Switcher (Canadian Margin, TFSA, RRSP, RESP & US Accounts) */}
          <div className="relative" ref={accountMenuRef}>
            {(() => {
              const activeAcc = CANADIAN_ACCOUNTS[currentAccount] || CANADIAN_ACCOUNTS.CA_MARGIN;
              const isCanadian = activeAcc.country === 'CA';
              return (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-sans hidden sm:inline text-[11px]">Account:</span>
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] text-white text-xs font-mono transition-all cursor-pointer shadow-sm"
                    title="Switch Account (Canadian Margin, TFSA, RRSP, RESP, US Paper, US Live)"
                  >
                    <span className="text-xs">{isCanadian ? '🇨🇦' : '🇺🇸'}</span>
                    <span className="font-bold text-amber-300">{activeAcc.accountNumber}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                      activeAcc.category === 'CANADIAN_TFSA'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : activeAcc.category === 'CANADIAN_RRSP'
                        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                        : activeAcc.category === 'CANADIAN_RESP'
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : isPaperTrading
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {activeAcc.typeLabel}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-[#21262d] px-1 py-0.2 rounded">
                      {activeAcc.currency}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Reset Account Button */}
                  {onOpenResetModal && (
                    <button
                      onClick={onOpenResetModal}
                      className="px-1.5 py-0.5 rounded bg-[#161b22] hover:bg-amber-500 hover:text-black text-amber-400 border border-[#21262d] text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="Reset Account Portfolio & Starting Cash"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Account Switcher Dropdown Menu */}
            {isAccountMenuOpen && (
              <div className="absolute left-0 top-full mt-1 w-96 bg-[#0e1217] border border-[#30363d] rounded-lg shadow-2xl z-50 overflow-hidden font-mono text-xs">
                {/* FX Rate Banner */}
                <div className="bg-[#12161f] border-b border-[#21262d] px-3 py-1.5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300 font-sans">
                    <span>🇨🇦 ⇄ 🇺🇸</span>
                    <span className="font-bold text-white">CAD/USD FX Rate:</span>
                    <span className="text-amber-400 font-mono font-bold">1 USD = {CAD_USD_EXCHANGE_RATE} CAD</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    CIRO / FINRA
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-[#1c2128]">
                  {/* GROUP 1: CANADIAN ACCOUNTS */}
                  <div className="p-2 bg-[#090d11]">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between font-sans">
                      <span className="flex items-center gap-1">
                        <span>🇨🇦</span>
                        <span>Canadian Registered & Margin Accounts (CIRO / CIPF)</span>
                      </span>
                      <span className="text-[9px] text-slate-500">CIPF $1M Cap</span>
                    </div>

                    {(['CA_MARGIN', 'CA_TFSA', 'CA_RRSP', 'CA_RESP'] as const).map(accKey => {
                      const acc = CANADIAN_ACCOUNTS[accKey];
                      const isSelected = currentAccount === accKey;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => {
                            if (onSelectAccount) onSelectAccount(accKey);
                            setIsAccountMenuOpen(false);
                          }}
                          className={`p-2 rounded cursor-pointer transition-all my-0.5 border ${
                            isSelected
                              ? 'bg-[#1c2128] border-amber-400/50 text-white'
                              : 'hover:bg-[#161b22] border-transparent text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-500">
                                  ·
                                </span>
                              )}
                              <span className="font-bold text-xs">{acc.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-amber-300 font-bold">{acc.accountNumber}</span>
                              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-[#21262d] text-slate-300">
                                {acc.currency}
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 font-sans mt-1 ml-5 flex flex-wrap items-center gap-2">
                            <span className="text-emerald-400 font-semibold">{acc.taxTreatment}</span>
                            <span className="text-slate-600">·</span>
                            <span>{acc.optionsDescription}</span>
                          </div>

                          {acc.craContributionLimitAnnual && (
                            <div className="text-[10px] text-sky-400 font-sans ml-5 mt-0.5">
                              2026 CRA Limit: ${acc.craContributionLimitAnnual.toLocaleString()} · Room Remaining: ${acc.craContributionRoomRemaining?.toLocaleString()}
                            </div>
                          )}
                          {acc.cesgGrantMatchingPct && (
                            <div className="text-[10px] text-purple-400 font-sans ml-5 mt-0.5">
                              Federal CESG 20% Matching: ${acc.cesgGrantReceivedYTD} YTD received (${acc.cesgGrantLifetimeReceived} / $7,200 lifetime)
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* GROUP 2: US ACCOUNTS */}
                  <div className="p-2 bg-[#090d11]">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between font-sans">
                      <span className="flex items-center gap-1">
                        <span>🇺🇸</span>
                        <span>United States Accounts (FINRA / SIPC)</span>
                      </span>
                      <span className="text-[9px] text-slate-500">SIPC $500k Cap</span>
                    </div>

                    {(['US_MARGIN_PAPER', 'US_MARGIN_LIVE'] as const).map(accKey => {
                      const acc = CANADIAN_ACCOUNTS[accKey];
                      const isSelected = currentAccount === accKey;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => {
                            if (onSelectAccount) onSelectAccount(accKey);
                            setIsAccountMenuOpen(false);
                          }}
                          className={`p-2 rounded cursor-pointer transition-all my-0.5 border ${
                            isSelected
                              ? 'bg-[#1c2128] border-amber-400/50 text-white'
                              : 'hover:bg-[#161b22] border-transparent text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-500">
                                  ·
                                </span>
                              )}
                              <span className="font-bold text-xs">{acc.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-amber-300 font-bold">{acc.accountNumber}</span>
                              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-[#21262d] text-slate-300">
                                {acc.currency}
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 font-sans mt-1 ml-5">
                            {acc.optionsDescription} · {acc.investorProtection}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{timeString}</span>
          </div>

          <span className="text-slate-600 hidden md:inline">|</span>

          {/* Real-time market status */}
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c076] animate-pulse"></span>
              <span className="text-slate-300">NYSE/NASDAQ OPEN</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-red-300 font-bold">
              <span className="text-xs">🇨🇦</span>
              <span>TSX/MX LIVE</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">8.2ms DMA Latency</span>
          </div>
        </div>

        {/* Right meta controls */}
        <div className="flex items-center gap-2">
          {/* PLATFORM LAYOUT VARIATION SELECTOR */}
          <div className="relative" ref={layoutMenuRef}>
            <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5">
              <button
                onClick={() => setIsLayoutMenuOpen(!isLayoutMenuOpen)}
                className="px-2 py-0.5 rounded text-[11px] font-bold text-amber-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Change Platform Layout Variation"
              >
                <LayoutGrid className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">
                  {layoutOptions.find(o => o.id === layoutVariation)?.name || 'Layout'}
                </span>
                <span className="sm:hidden">Layout</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLayoutMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={handleCycleLayout}
                className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-[#1c2128] transition-colors border-l border-[#21262d]"
                title="Cycle to Next Layout Variation"
              >
                <Shuffle className="w-3 h-3" />
              </button>
            </div>

            {/* Layout Variation Menu Popover */}
            {isLayoutMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-[#0e1217] border-2 border-amber-500/50 rounded-lg p-2.5 shadow-2xl z-50 font-mono text-xs space-y-1 animate-in fade-in duration-100">
                <div className="flex items-center justify-between border-b border-[#21262d] pb-1.5 mb-1 px-1">
                  <span className="font-bold text-white text-[11px] uppercase flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                    Platform Layout Variations
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">thinkorswim Pro</span>
                </div>

                <div className="space-y-1">
                  {layoutOptions.map(opt => {
                    const IconComp = opt.icon;
                    const isActive = layoutVariation === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          onChangeLayoutVariation(opt.id);
                          setIsLayoutMenuOpen(false);
                        }}
                        className={`p-2 rounded cursor-pointer border transition-all ${
                          isActive
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                            : 'bg-[#161b22] border-[#21262d] text-slate-400 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs">
                          <div className="flex items-center gap-2">
                            <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                            <span className={isActive ? 'text-amber-300' : 'text-slate-200'}>
                              {opt.name}
                            </span>
                          </div>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[#21262d] text-slate-400 font-normal">
                            {opt.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5 ml-5">
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar & Bottom Bar Toggles */}
          <button
            onClick={onToggleSidebar}
            className={`p-1 rounded transition-colors text-[10px] flex items-center gap-1 border ${
              sidebarOpen ? 'bg-[#1c2128] text-amber-400 border-amber-400/30' : 'bg-transparent text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Left Gadget Sidebar"
          >
            {sidebarOpen ? <SidebarClose className="w-3.5 h-3.5" /> : <SidebarOpen className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">Gadgets</span>
          </button>

          <button
            onClick={onToggleBottomBar}
            className={`p-1 rounded transition-colors text-[10px] flex items-center gap-1 border ${
              bottomBarOpen ? 'bg-[#1c2128] text-amber-400 border-amber-400/30' : 'bg-transparent text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Order Entry Tools Bar"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Order Bar</span>
          </button>

          {/* Biometric Enclave Status / Lock */}
          <div className="pl-1 border-l border-slate-800">
            {biometricSettings.isLocked ? (
              <button
                onClick={onUnlockTerminal}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>TERMINAL LOCKED</span>
              </button>
            ) : (
              <button
                onClick={onLockTerminal}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-slate-800 transition-all cursor-pointer group"
                title="Secure Enclave Armed. Click to Lock"
              >
                <Unlock className="w-3 h-3 group-hover:hidden" />
                <Lock className="w-3 h-3 hidden group-hover:inline text-slate-300" />
                <span className="hidden sm:inline">ENCLAVE SECURED</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Authentic thinkorswim Account Financials Ribbon (Always Visible) */}
      <div className="bg-[#12161f] border-b border-[#21262d] px-3 py-1.5 flex items-center justify-between text-xs font-mono overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {(() => {
            const activeAcc = CANADIAN_ACCOUNTS[currentAccount] || CANADIAN_ACCOUNTS.CA_MARGIN;
            const currSym = activeAcc.currency === 'CAD' ? 'C$' : '$';
            return (
              <>
                {/* Net Liq */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-slate-400 font-sans text-[11px]">Net Liq:</span>
                  <span className="text-white font-bold text-sm tracking-tight">
                    {currSym}{metrics.nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* P/L Day */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-slate-400 font-sans text-[11px]">P/L Day:</span>
                  <span className={`font-semibold flex items-center gap-0.5 ${metrics.dayPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {metrics.dayPnL >= 0 ? '+' : ''}{currSym}{Math.abs(metrics.dayPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-[11px]">({metrics.dayPnLPct >= 0 ? '+' : ''}{metrics.dayPnLPct.toFixed(2)}%)</span>
                  </span>
                </div>

                {/* P/L Open / Total */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-slate-400 font-sans text-[11px]">P/L Open:</span>
                  <span className={`font-semibold ${metrics.totalPnL >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {metrics.totalPnL >= 0 ? '+' : ''}{currSym}{Math.abs(metrics.totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-[11px]"> ({metrics.totalPnLPct >= 0 ? '+' : ''}{metrics.totalPnLPct.toFixed(2)}%)</span>
                  </span>
                </div>

                {/* Option / Stock Buying Power */}
                <div className="hidden md:flex items-baseline gap-1.5">
                  <span className="text-slate-400 font-sans text-[11px]">Stock BP:</span>
                  <span className="text-slate-200 font-semibold">{currSym}{(metrics.cashBalance * 2 + 140000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {/* Cash & Sweep Vehicle */}
                <div className="hidden lg:flex items-baseline gap-1.5">
                  <span className="text-slate-400 font-sans text-[11px]">Cash & Sweep:</span>
                  <span className="text-slate-200 font-semibold">
                    {currSym}{metrics.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            );
          })()}

          {/* Beta vs SPY */}
          <div className="hidden xl:flex items-baseline gap-1.5">
            <span className="text-slate-400 font-sans text-[11px]">Beta-Weighted (SPY):</span>
            <span className="text-sky-400 font-semibold">{metrics.betaVsSPY.toFixed(2)}</span>
          </div>

          {/* Market Put/Call Ratio */}
          <div className="hidden 2xl:flex items-baseline gap-1.5">
            <span className="text-slate-400 font-sans text-[11px]">P/C Ratio:</span>
            <span className="text-[#00c076] font-semibold font-mono">0.82</span>
            <span className="text-[10px] text-slate-500 font-sans">(Equity)</span>
          </div>
        </div>

        {/* Symbol Quick-Link Box (thinkorswim [1] Tag) */}
        <div className="flex items-center gap-2 pl-4 border-l border-[#21262d] shrink-0">
          <div className="flex items-center bg-[#1c2128] rounded border border-[#30363d] px-2 py-0.5 text-xs font-mono">
            {/* TOS Yellow link box */}
            <span className="w-4 h-4 rounded bg-amber-400 text-black font-black text-[10px] flex items-center justify-center mr-1.5 font-sans" title="Symbol Link 1">
              1
            </span>
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                value={isSearching ? searchQuery : activeSymbol}
                onFocus={() => {
                  setIsSearching(true);
                  setSearchQuery(activeSymbol);
                }}
                onBlur={() => {
                  setTimeout(() => setIsSearching(false), 200);
                }}
                onChange={e => setSearchQuery(e.target.value.toUpperCase())}
                placeholder="SYMBOL"
                className="w-16 bg-transparent text-white font-bold uppercase focus:outline-none placeholder-slate-500"
              />
            </form>
          </div>
        </div>
      </div>

      {/* 3. Authentic thinkorswim Workspace Navigation Tabs */}
      <nav className="bg-[#0e1217] px-3 flex items-center justify-between border-b border-[#21262d] overflow-x-auto no-scrollbar">
        <div className="flex items-center">
          <button
            onClick={() => onSelectTab('monitor')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'monitor'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Monitor</span>
          </button>

          <button
            onClick={() => onSelectTab('statement')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'statement'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Account Statement</span>
          </button>

          <button
            onClick={() => onSelectTab('trade')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'trade'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Trade</span>
          </button>

          <button
            onClick={() => onSelectTab('charts')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'charts'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Charts</span>
          </button>

          <button
            onClick={() => onSelectTab('depth')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'depth'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Market Depth & DOM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c076] animate-pulse"></span>
          </button>

          <button
            onClick={() => onSelectTab('options')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'options'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Options Chain</span>
          </button>

          <button
            onClick={() => onSelectTab('analyze')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'analyze'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Analyze & Vol Skew</span>
          </button>

          <button
            onClick={() => onSelectTab('macro')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'macro'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Global Macro</span>
          </button>

          <button
            onClick={() => onSelectTab('canadian_live')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'canadian_live'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <span className="text-xs">🇨🇦</span>
            <span className="text-red-300 font-bold">Canadian Live Data</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c076] animate-pulse"></span>
          </button>

          <button
            onClick={() => onSelectTab('rebalance')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'rebalance'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rebalance</span>
            {metrics.driftStatus !== 'aligned' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('brokerages')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'brokerages'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Brokerage DMA</span>
          </button>

          <button
            onClick={() => onSelectTab('security')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              currentTab === 'security'
                ? 'border-[#00c076] text-white bg-[#161b22]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12161f]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security & Enclave</span>
          </button>
        </div>

        {/* Active Sub-Status / Quick info */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-400 pr-2">
          <span>Drift Index: <strong className="text-amber-400">{metrics.driftScore.toFixed(1)}%</strong></span>
          <span>·</span>
          <span>Sharpe: <strong className="text-[#00c076]">{metrics.sharpeRatio.toFixed(2)}</strong></span>
        </div>
      </nav>
    </header>
  );
};
