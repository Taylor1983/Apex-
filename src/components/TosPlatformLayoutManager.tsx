import React, { useState } from 'react';
import {
  LayoutGrid,
  Columns,
  Square,
  Maximize2,
  Minimize2,
  Sliders,
  BarChart2,
  Layers,
  ArrowLeftRight,
  Activity,
  Table,
  Radio,
  Eye,
  ChevronDown,
  Compass,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Asset, OrderSide, PlatformLayoutVariation, PortfolioMetrics, RiskProfile, TradeOrder, BrokerageGateway, BiometricSettings, AccountType } from '../types';
import { TosChartsView } from './TosChartsView';
import { TosOptionsChain } from './TosOptionsChain';
import { TosVolatilitySurfaceView } from './TosVolatilitySurfaceView';
import { TosStrategyRiskProfiles } from './TosStrategyRiskProfiles';
import { MultiAssetTrading } from './MultiAssetTrading';
import { TosMonitorView } from './TosMonitorView';
import { TosGlobalMacroView } from './TosGlobalMacroView';
import { TosAccountStatementView } from './TosAccountStatementView';
import { TosCanadianLiveDataView } from './TosCanadianLiveDataView';
import { TosMarketDepthView } from './TosMarketDepthView';

export type PaneToolId = 'charts' | 'options' | 'vol_surface' | 'risk_profiles' | 'depth' | 'trade' | 'monitor' | 'macro' | 'canadian_live' | 'statement';

interface TosPlatformLayoutManagerProps {
  layoutVariation: PlatformLayoutVariation;
  onChangeLayoutVariation: (layout: PlatformLayoutVariation) => void;
  activeAsset: Asset;
  assets: Asset[];
  setActiveSymbol: (symbol: string) => void;
  handlePopulateOrder: (symbol: string, side: OrderSide, price: number, optionDetails?: any) => void;
  handlePopulateOptionOrder: (symbol: string, side: OrderSide, strike: number, exp: string, type: 'CALL' | 'PUT', price: number) => void;
  handlePopulateSpreadOrder?: (order: any) => void;
  // Classic Tab State & View props
  currentTab: string;
  onSelectTab: (tab: any) => void;
  portfolioData: any;
  metrics: PortfolioMetrics;
  riskProfile: RiskProfile;
  orders: TradeOrder[];
  cashBalance: number;
  existingPositionQty: number;
  brokerages: BrokerageGateway[];
  biometricSettings: BiometricSettings;
  triggerBiometricPrompt: (title: string, details: string, onSuccess: () => void) => void;
  handleExecuteTrade: (order: TradeOrder) => void;
  setRiskProfile: (profile: RiskProfile) => void;
  setBiometricLogs: React.Dispatch<React.SetStateAction<any[]>>;
  createAuditLog: (action: string, method: any, success: boolean) => any;
  analyzeSubView: string;
  setAnalyzeSubView: (view: any) => void;
  isPaperTrading?: boolean;
  onTogglePaperTrading?: () => void;
  onResetAccount?: (options: { startingCash: number; mode: 'initial_model' | 'all_cash' }) => void;
  currentAccount?: AccountType;
  onSelectAccount?: (account: AccountType) => void;
}

export const TosPlatformLayoutManager: React.FC<TosPlatformLayoutManagerProps> = ({
  layoutVariation,
  onChangeLayoutVariation,
  activeAsset,
  assets,
  setActiveSymbol,
  handlePopulateOrder,
  handlePopulateOptionOrder,
  handlePopulateSpreadOrder,
  currentTab,
  onSelectTab,
  portfolioData,
  metrics,
  riskProfile,
  orders,
  cashBalance,
  existingPositionQty,
  brokerages,
  biometricSettings,
  triggerBiometricPrompt,
  handleExecuteTrade,
  setRiskProfile,
  setBiometricLogs,
  createAuditLog,
  analyzeSubView,
  setAnalyzeSubView,
  isPaperTrading,
  onTogglePaperTrading,
  onResetAccount,
  currentAccount,
  onSelectAccount
}) => {
  // Dual-Pane Tool Assignments
  const [dualLeftTool, setDualLeftTool] = useState<PaneToolId>('charts');
  const [dualRightTool, setDualRightTool] = useState<PaneToolId>('vol_surface');

  // Quad-Grid Tool Assignments
  const [quadTool1, setQuadTool1] = useState<PaneToolId>('charts');
  const [quadTool2, setQuadTool2] = useState<PaneToolId>('options');
  const [quadTool3, setQuadTool3] = useState<PaneToolId>('vol_surface');
  const [quadTool4, setQuadTool4] = useState<PaneToolId>('trade');

  // Triple-Command Tool Assignments
  const [tripleMainTool, setTripleMainTool] = useState<PaneToolId>('charts');
  const [tripleTopTool, setTripleTopTool] = useState<PaneToolId>('vol_surface');
  const [tripleBottomTool, setTripleBottomTool] = useState<PaneToolId>('options');

  // Maximize single pane temporarily
  const [maximizedPane, setMaximizedPane] = useState<number | null>(null);

  // Render a specific trading tool inside a pane
  const renderToolComponent = (toolId: PaneToolId, isCompact: boolean = false) => {
    switch (toolId) {
      case 'charts':
        return (
          <TosChartsView
            asset={activeAsset}
            assets={assets}
            onSelectSymbol={sym => setActiveSymbol(sym)}
            onPopulateOrder={handlePopulateOrder}
          />
        );
      case 'options':
        return (
          <TosOptionsChain
            asset={activeAsset}
            onPopulateOptionOrder={handlePopulateOptionOrder}
            onPopulateSpreadOrder={handlePopulateSpreadOrder}
          />
        );
      case 'vol_surface':
        return (
          <TosVolatilitySurfaceView
            asset={activeAsset}
            assets={assets}
            onSelectSymbol={sym => setActiveSymbol(sym)}
            onPopulateOrder={handlePopulateOrder}
          />
        );
      case 'risk_profiles':
        return (
          <TosStrategyRiskProfiles
            asset={activeAsset}
            onPopulateStrategyOrder={handlePopulateOrder}
            onPopulateSpreadOrder={handlePopulateSpreadOrder}
            onExecuteTrade={handleExecuteTrade}
          />
        );
      case 'trade':
        return (
          <MultiAssetTrading
            assets={assets}
            selectedAssetId={activeAsset.id}
            onSelectAsset={id => {
              const found = assets.find(a => a.id === id);
              if (found) setActiveSymbol(found.symbol);
            }}
            cashBalance={cashBalance}
            existingHoldingQuantity={existingPositionQty}
            brokerages={brokerages}
            biometricSettings={biometricSettings}
            onRequestBiometricForTrade={(order, onSuccess) => {
              triggerBiometricPrompt(
                `Authorize Trade (${order.symbol})`,
                `Order total consideration of $${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} exceeds the biometric threshold.`,
                onSuccess
              );
            }}
            onExecuteTrade={handleExecuteTrade}
          />
        );
      case 'monitor':
        return (
          <TosMonitorView
            holdings={portfolioData.holdings}
            metrics={metrics}
            riskProfile={riskProfile}
            orders={orders}
            onSelectSymbol={sym => {
              setActiveSymbol(sym);
              onSelectTab('trade');
            }}
            onPopulateOrder={handlePopulateOrder}
            onNavigateToRebalance={() => onSelectTab('rebalance')}
            assets={assets}
            isPaperTrading={isPaperTrading}
            onTogglePaperTrading={onTogglePaperTrading}
            onResetAccount={onResetAccount}
            currentAccount={currentAccount}
            onSelectAccount={onSelectAccount}
          />
        );
      case 'statement':
        return (
          <TosAccountStatementView
            holdings={portfolioData.holdings}
            metrics={metrics}
            riskProfile={riskProfile}
            orders={orders}
            assets={assets}
            isPaperTrading={isPaperTrading}
            onTogglePaperTrading={onTogglePaperTrading}
            onOpenResetModal={() => {
              if (onResetAccount) {
                onResetAccount({ startingCash: 250000, mode: 'initial_model' });
              }
            }}
            onSelectSymbol={sym => setActiveSymbol(sym)}
            onPopulateOrder={handlePopulateOrder}
            currentAccount={currentAccount}
            onSelectAccount={onSelectAccount}
          />
        );
      case 'macro':
        return <TosGlobalMacroView />;
      case 'canadian_live':
        return (
          <TosCanadianLiveDataView
            assets={assets}
            activeSymbol={activeAsset.symbol}
            onSelectSymbol={sym => setActiveSymbol(sym)}
            onPopulateOrder={handlePopulateOrder}
          />
        );
      case 'depth':
        return (
          <TosMarketDepthView
            asset={activeAsset}
            assets={assets}
            onSelectSymbol={sym => setActiveSymbol(sym)}
            onPopulateOrder={handlePopulateOrder}
            cashBalance={cashBalance}
          />
        );
      default:
        return null;
    }
  };

  // Helper Header for Each Multi-Grid Pane
  const renderPaneHeader = (
    title: string,
    currentTool: PaneToolId,
    setTool: (t: PaneToolId) => void,
    paneIndex: number
  ) => {
    const toolOptions: { id: PaneToolId; label: string }[] = [
      { id: 'charts', label: 'Charts & Studies' },
      { id: 'depth', label: '📊 Market Depth & DOM' },
      { id: 'options', label: 'Options Chain' },
      { id: 'vol_surface', label: '3D Vol Surface' },
      { id: 'risk_profiles', label: 'Risk Profiles' },
      { id: 'canadian_live', label: '🇨🇦 Canadian Live Tape' },
      { id: 'trade', label: 'Trade & DOM' },
      { id: 'monitor', label: 'Monitor' },
      { id: 'statement', label: 'Account Statement' },
      { id: 'macro', label: 'Global Macro' }
    ];

    const isMax = maximizedPane === paneIndex;

    return (
      <div className="bg-[#12161f] border-b border-[#21262d] px-2.5 py-1 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-2">
          {/* Symbol Link Badge [1] thinkorswim style */}
          <span className="w-4 h-4 rounded bg-amber-500 text-black font-black text-[10px] flex items-center justify-center">
            1
          </span>
          <span className="font-bold text-white text-xs">{activeAsset.symbol}</span>
          <span className="text-slate-500 text-[10px] hidden sm:inline">
            ${activeAsset.price.toFixed(2)}
          </span>
          <span className="text-slate-600">·</span>
          {/* Tool selector dropdown */}
          <select
            value={currentTool}
            onChange={e => setTool(e.target.value as PaneToolId)}
            className="bg-[#161b22] border border-[#21262d] text-amber-400 text-[11px] font-bold rounded px-1.5 py-0.5 outline-none cursor-pointer"
          >
            {toolOptions.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMaximizedPane(isMax ? null : paneIndex)}
            className={`p-1 rounded text-slate-400 hover:text-white hover:bg-[#1c2128] transition-colors ${
              isMax ? 'text-amber-400 bg-amber-400/10' : ''
            }`}
            title={isMax ? 'Restore Grid View' : 'Maximize Pane'}
          >
            {isMax ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    );
  };

  /* ========================================================================= */
  /* VARIATION 1: SPLIT DUAL-PANE (Side-by-Side 50/50 Workspace)              */
  /* ========================================================================= */
  if (layoutVariation === 'SPLIT_DUAL') {
    return (
      <div className="space-y-2">
        {/* Layout Notification Banner */}
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg px-3 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Columns className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white uppercase text-[11px]">
              Platform Layout: Dual-Pane Side-by-Side Workspace
            </span>
            <span className="text-slate-500 text-[10px] hidden md:inline">
              · Panes synchronized to {activeAsset.symbol}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[10px] hidden sm:inline">Change Layout:</span>
            <button
              onClick={() => onChangeLayoutVariation('CLASSIC_DOCK')}
              className="px-2 py-0.5 rounded bg-[#161b22] hover:bg-[#1c2128] text-slate-300 border border-[#21262d] text-[10px] font-bold"
            >
              Classic 1-Pane
            </button>
            <button
              onClick={() => onChangeLayoutVariation('QUAD_GRID')}
              className="px-2 py-0.5 rounded bg-[#161b22] hover:bg-[#1c2128] text-amber-400 border border-amber-400/30 text-[10px] font-bold"
            >
              4-Grid
            </button>
          </div>
        </div>

        {/* Dual Side-by-Side Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 min-h-[calc(100vh-210px)]">
          {/* Left Pane */}
          {maximizedPane !== 2 && (
            <div className={`bg-[#090d11] border border-[#21262d] rounded-lg overflow-hidden flex flex-col ${
              maximizedPane === 1 ? 'col-span-full' : ''
            }`}>
              {renderPaneHeader('Left Workspace', dualLeftTool, setDualLeftTool, 1)}
              <div className="flex-1 overflow-y-auto p-2.5">
                {renderToolComponent(dualLeftTool)}
              </div>
            </div>
          )}

          {/* Right Pane */}
          {maximizedPane !== 1 && (
            <div className={`bg-[#090d11] border border-[#21262d] rounded-lg overflow-hidden flex flex-col ${
              maximizedPane === 2 ? 'col-span-full' : ''
            }`}>
              {renderPaneHeader('Right Workspace', dualRightTool, setDualRightTool, 2)}
              <div className="flex-1 overflow-y-auto p-2.5">
                {renderToolComponent(dualRightTool)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* VARIATION 2: QUAD GRID (Institutional 4-Pane 2x2 Workspace)               */
  /* ========================================================================= */
  if (layoutVariation === 'QUAD_GRID') {
    return (
      <div className="space-y-2">
        {/* Layout Notification Banner */}
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg px-3 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white uppercase text-[11px]">
              Platform Layout: Institutional 4-Pane Quad Matrix
            </span>
            <span className="text-slate-500 text-[10px] hidden md:inline">
              · 4 Live Synchronized Tools ([1] {activeAsset.symbol})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[10px] hidden sm:inline">Presets:</span>
            <button
              onClick={() => {
                setQuadTool1('charts');
                setQuadTool2('options');
                setQuadTool3('vol_surface');
                setQuadTool4('trade');
                setMaximizedPane(null);
              }}
              className="px-2 py-0.5 rounded bg-[#161b22] hover:bg-[#1c2128] text-slate-300 border border-[#21262d] text-[10px] font-bold"
            >
              Reset 4 Tools
            </button>
            <button
              onClick={() => onChangeLayoutVariation('CLASSIC_DOCK')}
              className="px-2 py-0.5 rounded bg-[#161b22] hover:bg-[#1c2128] text-amber-400 border border-amber-400/30 text-[10px] font-bold"
            >
              Exit to Classic
            </button>
          </div>
        </div>

        {/* 2x2 Quad Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-[calc(100vh-210px)]">
          {/* Pane 1 (Top-Left) */}
          {(maximizedPane === null || maximizedPane === 1) && (
            <div className={`bg-[#090d11] border border-[#21262d] rounded-lg overflow-hidden flex flex-col ${
              maximizedPane === 1 ? 'col-span-full row-span-full' : 'h-[500px]'
            }`}>
              {renderPaneHeader('Pane 1', quadTool1, setQuadTool1, 1)}
              <div className="flex-1 overflow-y-auto p-2">
                {renderToolComponent(quadTool1, true)}
              </div>
            </div>
          )}

          {/* Pane 2 (Top-Right) */}
          {(maximizedPane === null || maximizedPane === 2) && (
            <div className={`bg-[#090d11] border border-[#21262d] rounded-lg overflow-hidden flex flex-col ${
              maximizedPane === 2 ? 'col-span-full row-span-full' : 'h-[500px]'
            }`}>
              {renderPaneHeader('Pane 2', quadTool2, setQuadTool2, 2)}
              <div className="flex-1 overflow-y-auto p-2">
                {renderToolComponent(quadTool2, true)}
              </div>
            </div>
          )}

          {/* Pane 3 (Bottom-Left) */}
          {(maximizedPane === null || maximizedPane === 3) && (
            <div className={`bg-[#090d11] border border-[#21262d] rounded-lg overflow-hidden flex flex-col ${
              maximizedPane === 3 ? 'col-span-full row-span-full' : 'h-[500px]'
            }`}>
              {renderPaneHeader('Pane 3', quadTool3, setQuadTool3, 3)}
              <div className="flex-1 overflow-y-auto p-2">
                {renderToolComponent(quadTool3, true)}
              </div>
            </div>
          )}

          {/* Pane 4 (Bottom-Right) */}
          {(maximizedPane === null || maximizedPane === 4) && (
            <div className={`bg-[#090d11] border border-[#21262d] rounded-lg overflow-hidden flex flex-col ${
              maximizedPane === 4 ? 'col-span-full row-span-full' : 'h-[500px]'
            }`}>
              {renderPaneHeader('Pane 4', quadTool4, setQuadTool4, 4)}
              <div className="flex-1 overflow-y-auto p-2">
                {renderToolComponent(quadTool4, true)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* VARIATION 3: TRIPLE COMMAND (60% Main Left, 40% Split Right)              */
  /* ========================================================================= */
  if (layoutVariation === 'TRIPLE_COMMAND') {
    return (
      <div className="space-y-2">
        {/* Layout Notification Banner */}
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg px-3 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white uppercase text-[11px]">
              Platform Layout: Command Center 3-Split
            </span>
            <span className="text-slate-500 text-[10px] hidden md:inline">
              · Primary Chart + 3D Volatility Surface + Options Flow
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onChangeLayoutVariation('CLASSIC_DOCK')}
              className="px-2 py-0.5 rounded bg-[#161b22] hover:bg-[#1c2128] text-amber-400 border border-amber-400/30 text-[10px] font-bold"
            >
              Classic
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[calc(100vh-210px)]">
          {/* Main Left Pane (7 Cols) */}
          <div className="lg:col-span-7 bg-[#090d11] border border-[#21262d] rounded-lg overflow-hidden flex flex-col">
            {renderPaneHeader('Main Command Pane', tripleMainTool, setTripleMainTool, 1)}
            <div className="flex-1 overflow-y-auto p-2.5">
              {renderToolComponent(tripleMainTool)}
            </div>
          </div>

          {/* Right Side Stacked (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Top Right Tool */}
            <div className="flex-1 bg-[#090d11] border border-[#21262d] rounded-lg overflow-hidden flex flex-col min-h-[380px]">
              {renderPaneHeader('Upper Right Tool', tripleTopTool, setTripleTopTool, 2)}
              <div className="flex-1 overflow-y-auto p-2">
                {renderToolComponent(tripleTopTool, true)}
              </div>
            </div>

            {/* Bottom Right Tool */}
            <div className="flex-1 bg-[#090d11] border border-[#21262d] rounded-lg overflow-hidden flex flex-col min-h-[380px]">
              {renderPaneHeader('Lower Right Tool', tripleBottomTool, setTripleBottomTool, 3)}
              <div className="flex-1 overflow-y-auto p-2">
                {renderToolComponent(tripleBottomTool, true)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* VARIATION 4: CINEMA FULLSCREEN FOCUS                                      */
  /* ========================================================================= */
  if (layoutVariation === 'CINEMA_FOCUS') {
    return (
      <div className="space-y-3">
        {/* Floating Minimalist Top Control Pill */}
        <div className="bg-[#0e1217]/90 backdrop-blur-md border border-[#21262d] rounded-lg p-2 flex items-center justify-between text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white text-[11px] uppercase">
              Cinema Focus Mode
            </span>
            <span className="text-slate-400 text-[10px]">
              · {activeAsset.symbol} (${activeAsset.price.toFixed(2)})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onChangeLayoutVariation('CLASSIC_DOCK')}
              className="px-2.5 py-1 rounded bg-[#161b22] hover:bg-[#1c2128] text-slate-300 hover:text-white border border-[#21262d] text-[10px] font-bold flex items-center gap-1"
            >
              <Minimize2 className="w-3 h-3" />
              <span>Restore Classic Dock</span>
            </button>
          </div>
        </div>

        {/* Full Edge-to-Edge Workspace Render */}
        <div className="bg-[#090d11] border border-[#1b2129] rounded-lg p-3">
          {currentTab === 'charts' && (
            <TosChartsView
              asset={activeAsset}
              assets={assets}
              onSelectSymbol={sym => setActiveSymbol(sym)}
              onPopulateOrder={handlePopulateOrder}
            />
          )}
          {currentTab === 'options' && (
            <TosOptionsChain
              asset={activeAsset}
              onPopulateOptionOrder={handlePopulateOptionOrder}
            />
          )}
          {currentTab === 'analyze' && (
            <TosVolatilitySurfaceView
              asset={activeAsset}
              assets={assets}
              onSelectSymbol={sym => setActiveSymbol(sym)}
              onPopulateOrder={handlePopulateOrder}
            />
          )}
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* VARIATION 0: CLASSIC DOCK (Default thinkorswim Workspace)                 */
  /* ========================================================================= */
  return null; // Signals App.tsx to render default classic tab flow
};
