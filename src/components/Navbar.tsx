import React from 'react';
import {
  TrendingUp,
  PieChart,
  ArrowLeftRight,
  Shield,
  Layers,
  Lock,
  Unlock,
  Radio,
  Server
} from 'lucide-react';
import { Asset, BiometricSettings, PortfolioMetrics } from '../types';

interface NavbarProps {
  currentTab: 'portfolio' | 'trading' | 'risk' | 'rebalance' | 'brokerages' | 'security';
  onSelectTab: (tab: 'portfolio' | 'trading' | 'risk' | 'rebalance' | 'brokerages' | 'security') => void;
  metrics: PortfolioMetrics;
  biometricSettings: BiometricSettings;
  onLockTerminal: () => void;
  onUnlockTerminal: () => void;
  assets: Asset[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  metrics,
  biometricSettings,
  onLockTerminal,
  onUnlockTerminal,
  assets
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Real-Time Market Ticker Ribbon */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 overflow-hidden text-xs">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Status indicators */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              NYSE/NASDAQ LIVE
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 hidden sm:inline">24/7 Global Crypto Feed</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Server className="w-3 h-3 text-emerald-400" />
              4 Brokerage APIs Connected
            </span>
          </div>

          {/* Scrolling Quotes Stream */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar font-mono pl-4">
            {assets.slice(0, 6).map(a => {
              const isPositive = a.change24hPct >= 0;
              return (
                <div key={a.id} className="flex items-center gap-1.5 shrink-0">
                  <span className="text-slate-300 font-medium">{a.symbol}</span>
                  <span className="text-slate-200">
                    ${a.price >= 1000 ? a.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : a.price.toFixed(2)}
                  </span>
                  <span className={isPositive ? 'text-emerald-400 text-[11px]' : 'text-rose-400 text-[11px]'}>
                    {isPositive ? '+' : ''}{a.change24hPct.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand Logo & NAV Summary */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onSelectTab('portfolio')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-400/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-base tracking-tight text-white flex items-center gap-1.5">
                ApexPortfolio
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  QUANT
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Multi-Asset Trading & Rebalancer
              </div>
            </div>
          </div>

          {/* Quick Real-Time NAV Summary (Institutional View) */}
          <div className="hidden lg:flex items-center pl-4 border-l border-slate-800 gap-4">
            <div>
              <div className="text-[11px] text-slate-400">Total Portfolio NAV</div>
              <div className="font-mono text-sm font-semibold text-white">
                ${metrics.nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Day Return</div>
              <div className={`font-mono text-xs font-medium flex items-center gap-0.5 ${metrics.dayPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.dayPnL >= 0 ? '+' : ''}${Math.abs(metrics.dayPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span>({metrics.dayPnLPct >= 0 ? '+' : ''}{metrics.dayPnLPct.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => onSelectTab('portfolio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentTab === 'portfolio'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Analytics</span>
          </button>

          <button
            onClick={() => onSelectTab('trading')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentTab === 'trading'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Trade</span>
          </button>

          <button
            onClick={() => onSelectTab('risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentTab === 'risk'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Risk Profiles</span>
          </button>

          <button
            onClick={() => onSelectTab('rebalance')}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentTab === 'rebalance'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Rebalance</span>
            {metrics.driftStatus !== 'aligned' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('brokerages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentTab === 'brokerages'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Brokerages</span>
          </button>

          <button
            onClick={() => onSelectTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentTab === 'security'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Security</span>
          </button>

          {/* Biometric Quick Lock/Unlock Status */}
          <div className="pl-2 border-l border-slate-800 ml-1">
            {biometricSettings.isLocked ? (
              <button
                onClick={onUnlockTerminal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all cursor-pointer"
                title="Terminal Locked. Click to unlock with Biometrics"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Locked</span>
              </button>
            ) : (
              <button
                onClick={onLockTerminal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-slate-800 transition-all cursor-pointer group"
                title="Terminal Enclave Active. Click to lock session"
              >
                <Unlock className="w-3.5 h-3.5 group-hover:hidden" />
                <Lock className="w-3.5 h-3.5 hidden group-hover:inline text-slate-300" />
                <span className="hidden sm:inline">Secured</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
