import React, { useState, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Trash2,
  RefreshCw,
  Plus,
  Minus,
  Layers,
  Sparkles,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  Asset,
  BiometricSettings,
  BrokerageGateway,
  OrderSide,
  OrderType,
  TradeOrder,
  AccountType,
  OptionSpreadDetails
} from '../types';
import { CANADIAN_ACCOUNTS } from '../data/canadianMarketData';

interface TosBottomOrderBarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeSymbol: string;
  assets: Asset[];
  brokerages: BrokerageGateway[];
  cashBalance: number;
  biometricSettings: BiometricSettings;
  prefillOrder?: {
    symbol: string;
    side: OrderSide;
    price: number;
    optionDetails?: { strike: number; expiration: string; optionType: 'CALL' | 'PUT' };
    optionSpreadDetails?: OptionSpreadDetails;
    isSimulated?: boolean;
  } | null;
  onExecuteTrade: (order: TradeOrder) => void;
  onRequestBiometricForTrade: (order: TradeOrder, onSuccess: () => void) => void;
  currentAccount?: AccountType;
  isPaperTrading?: boolean;
}

export const TosBottomOrderBar: React.FC<TosBottomOrderBarProps> = ({
  isOpen,
  onToggle,
  activeSymbol,
  assets,
  brokerages,
  cashBalance,
  biometricSettings,
  prefillOrder,
  onExecuteTrade,
  onRequestBiometricForTrade,
  currentAccount = 'CA_MARGIN',
  isPaperTrading = false
}) => {
  const [side, setSide] = useState<OrderSide>('BUY');
  const [symbol, setSymbol] = useState<string>(activeSymbol);
  const [quantity, setQuantity] = useState<number>(1);
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [limitPrice, setLimitPrice] = useState<number>(0);
  const [tif, setTif] = useState<'DAY' | 'GTC'>('DAY');
  const [selectedBrokerageId, setSelectedBrokerageId] = useState<string>('alpaca');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSimulatedMode, setIsSimulatedMode] = useState<boolean>(isPaperTrading);
  const [showLegsDetail, setShowLegsDetail] = useState<boolean>(true);

  const [activeOptionDetails, setActiveOptionDetails] = useState<{
    strike: number;
    expiration: string;
    optionType: 'CALL' | 'PUT';
  } | null>(null);

  const [activeSpreadDetails, setActiveSpreadDetails] = useState<OptionSpreadDetails | null>(null);

  // Sync with active symbol, paper trading mode, or prefill
  useEffect(() => {
    if (isPaperTrading) {
      setIsSimulatedMode(true);
    }
  }, [isPaperTrading]);

  useEffect(() => {
    if (prefillOrder) {
      setSymbol(prefillOrder.symbol);
      setSide(prefillOrder.side);
      setLimitPrice(prefillOrder.price);

      if (prefillOrder.isSimulated !== undefined) {
        setIsSimulatedMode(prefillOrder.isSimulated);
      }

      if (prefillOrder.optionSpreadDetails) {
        setActiveSpreadDetails(prefillOrder.optionSpreadDetails);
        setActiveOptionDetails(null);
        setQuantity(1);
        setOrderType('LIMIT');
        setLimitPrice(prefillOrder.optionSpreadDetails.netPrice);
      } else if (prefillOrder.optionDetails) {
        setActiveOptionDetails(prefillOrder.optionDetails);
        setActiveSpreadDetails(null);
        setQuantity(1);
        setOrderType('LIMIT');
      } else {
        setActiveOptionDetails(null);
        setActiveSpreadDetails(null);
        setQuantity(10);
      }
    } else if (activeSymbol) {
      setSymbol(activeSymbol);
      const currentAsset = assets.find(a => a.symbol === activeSymbol);
      if (currentAsset) {
        setLimitPrice(currentAsset.price);
        setSelectedBrokerageId(currentAsset.defaultBrokerage);
      }
      setActiveOptionDetails(null);
      setActiveSpreadDetails(null);
    }
  }, [activeSymbol, prefillOrder, assets]);

  const activeAsset = assets.find(a => a.symbol === symbol) || assets[0];
  const activeAcc = CANADIAN_ACCOUNTS[currentAccount] || CANADIAN_ACCOUNTS.CA_MARGIN;
  const isCanadianOrder = symbol.endsWith('.TO') || activeAsset?.currency === 'CAD' || activeAcc.country === 'CA';
  const currSym = isCanadianOrder ? 'C$' : '$';

  // Pricing calculations
  const effectivePrice =
    orderType === 'LIMIT' && limitPrice > 0
      ? limitPrice
      : activeSpreadDetails
      ? activeSpreadDetails.netPrice
      : activeAsset?.price || 100;

  // Options multiplier (1 contract = 100 shares)
  const multiplier = activeSpreadDetails || activeOptionDetails ? 100 : 1;
  const totalConsideration = quantity * effectivePrice * multiplier;

  const handleClear = () => {
    setQuantity(1);
    setOrderType('MARKET');
    setActiveOptionDetails(null);
    setActiveSpreadDetails(null);
    setLimitPrice(activeAsset?.price || 100);
  };

  const submitOrder = (asSimulated: boolean) => {
    if (quantity <= 0 || !activeAsset) return;

    if (!asSimulated && side === 'BUY' && totalConsideration > cashBalance) {
      alert(`Insufficient cash balance (${currSym}${cashBalance.toFixed(2)} available).`);
      return;
    }

    const orderId = asSimulated
      ? `sim-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
      : `ord-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    let orderSymbol = activeAsset.symbol;
    let orderName = activeAsset.name;

    if (activeSpreadDetails) {
      orderSymbol = `${activeAsset.symbol} ${activeSpreadDetails.strategyName.toUpperCase()}`;
      orderName = `${activeAsset.name} · ${activeSpreadDetails.strategyName}`;
    } else if (activeOptionDetails) {
      orderSymbol = `${activeAsset.symbol} ${activeOptionDetails.expiration} ${activeOptionDetails.strike} ${activeOptionDetails.optionType}`;
      orderName = `${activeAsset.name} ${activeOptionDetails.optionType} Option`;
    }

    const order: TradeOrder = {
      id: orderId,
      symbol: orderSymbol,
      name: orderName,
      assetClass: activeSpreadDetails || activeOptionDetails ? 'options' : activeAsset.assetClass,
      side,
      type: orderType,
      quantity,
      price: effectivePrice,
      limitPrice: orderType === 'LIMIT' ? limitPrice : undefined,
      totalAmount: totalConsideration,
      brokerageId: (selectedBrokerageId as any) || activeAsset.defaultBrokerage,
      status: 'QUEUED',
      timestamp: Date.now(),
      biometricConfirmed: asSimulated ? true : false,
      isSimulated: asSimulated,
      optionDetails: activeOptionDetails
        ? {
            strike: activeOptionDetails.strike,
            expiration: activeOptionDetails.expiration,
            optionType: activeOptionDetails.optionType,
            contractMultiplier: 100
          }
        : undefined,
      optionSpreadDetails: activeSpreadDetails || undefined
    };

    const requiresBio = !asSimulated && totalConsideration >= biometricSettings.requireForTradesOver;

    if (requiresBio) {
      onRequestBiometricForTrade(order, () => {
        executeFlow({ ...order, biometricConfirmed: true }, asSimulated);
      });
    } else {
      executeFlow(order, asSimulated);
    }
  };

  const executeFlow = (order: TradeOrder, asSimulated: boolean) => {
    setIsSubmitting(true);
    const latency = asSimulated ? 5 : 18;

    setTimeout(() => {
      const filledOrder: TradeOrder = {
        ...order,
        status: 'FILLED',
        fillPrice: order.price,
        fillTimestamp: Date.now(),
        executionLatencyMs: latency
      };
      onExecuteTrade(filledOrder);
      setIsSubmitting(false);
    }, asSimulated ? 120 : 380);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 select-none font-mono">
      {/* 1. Header Tab bar to collapse or expand */}
      <div
        className={`border-t px-3 py-1 flex items-center justify-between text-xs cursor-pointer shadow-lg transition-colors ${
          isSimulatedMode
            ? 'bg-[#18150f] border-amber-500/40 text-amber-200'
            : 'bg-[#12161f] border-[#21262d] text-slate-300'
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-white text-xs uppercase tracking-wider">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-amber-400" /> : <ChevronUp className="w-3.5 h-3.5 text-amber-400" />}
            <span>Order Entry Tools</span>
          </div>

          {/* Mode Pill: Simulated vs Live */}
          <span
            onClick={e => {
              e.stopPropagation();
              setIsSimulatedMode(prev => !prev);
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
              isSimulatedMode
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm'
                : 'bg-emerald-500/15 text-[#00c076] border-emerald-500/30'
            }`}
            title="Click to toggle paperMoney simulation vs live routing"
          >
            {isSimulatedMode ? <Zap className="w-3 h-3 text-amber-400" /> : <ShieldCheck className="w-3 h-3" />}
            <span>{isSimulatedMode ? 'SIMULATED (paperMoney)' : 'LIVE DMA'}</span>
          </span>

          <span className="text-slate-600">|</span>

          {/* Quick Summary Preview */}
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span
              className={`px-1.5 py-0.2 rounded font-bold ${
                side === 'BUY' ? 'bg-[#00c076]/20 text-[#00c076]' : 'bg-[#ff3b57]/20 text-[#ff3b57]'
              }`}
            >
              {side}
            </span>
            <span className="font-bold text-white">{quantity}x</span>

            {activeSpreadDetails ? (
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-sky-400" />
                <span>{symbol} {activeSpreadDetails.strategyName}</span>
                <span className="text-[10px] text-slate-400">({activeSpreadDetails.legs.length} legs)</span>
              </span>
            ) : (
              <span className="font-bold text-amber-400">{symbol}</span>
            )}

            <span className="text-slate-400">@</span>
            <span>{currSym}{effectivePrice.toFixed(2)}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-sans">Total:</span>
            <span className="text-white font-bold">
              {currSym}{totalConsideration.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400 hidden sm:inline">
            Cash: <strong className="text-slate-200">{currSym}{cashBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className={isSimulatedMode ? 'text-amber-400 font-bold flex items-center gap-1' : 'text-[#00c076] flex items-center gap-1'}>
            {isSimulatedMode ? <Sparkles className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
            <span className="hidden sm:inline">{isSimulatedMode ? 'Simulated Execution Engine' : 'Biometric Guard Active'}</span>
          </span>
        </div>
      </div>

      {/* 2. Expanded Order Entry Dock */}
      {isOpen && (
        <div className="bg-[#0e1217] border-t border-[#1c2128] p-3 shadow-2xl space-y-2.5">
          {/* Active Option Spread Legs Strip (When Spread is Populated) */}
          {activeSpreadDetails && (
            <div className="bg-[#121620] border border-[#21262d] rounded-lg p-2.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c2128] pb-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-white uppercase tracking-wider">
                    Option Spread Strategy: {activeSpreadDetails.strategyName}
                  </span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                    activeSpreadDetails.netDebitOrCredit === 'DEBIT'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-[#00c076] border border-emerald-500/30'
                  }`}>
                    NET {activeSpreadDetails.netDebitOrCredit}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  {activeSpreadDetails.maxProfit !== undefined && (
                    <span className="text-slate-300">
                      Max Profit: <strong className="text-[#00c076]">${activeSpreadDetails.maxProfit}</strong>
                    </span>
                  )}
                  {activeSpreadDetails.maxLoss !== undefined && (
                    <span className="text-slate-300">
                      Max Risk: <strong className="text-rose-400">${activeSpreadDetails.maxLoss}</strong>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowLegsDetail(!showLegsDetail)}
                    className="text-slate-400 hover:text-white text-[11px] underline"
                  >
                    {showLegsDetail ? 'Hide Legs' : `Show ${activeSpreadDetails.legs.length} Legs`}
                  </button>
                </div>
              </div>

              {/* Legs Table */}
              {showLegsDetail && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                  {activeSpreadDetails.legs.map((leg, idx) => (
                    <div
                      key={leg.id || idx}
                      className="bg-[#090d11] border border-[#1c2128] rounded p-2 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            leg.side === 'BUY'
                              ? 'bg-[#00c076]/20 text-[#00c076]'
                              : 'bg-[#ff3b57]/20 text-[#ff3b57]'
                          }`}
                        >
                          {leg.side}
                        </span>
                        <span className="text-white font-bold">{leg.quantity}x</span>
                        <span className="text-amber-400 font-mono">${leg.strike}</span>
                        <span className={`text-[10px] font-bold ${leg.optionType === 'CALL' ? 'text-sky-400' : 'text-purple-400'}`}>
                          {leg.optionType}
                        </span>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-slate-400">@ ${leg.mid.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Controls Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              submitOrder(isSimulatedMode);
            }}
            className="flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Simulation Mode Toggle Button */}
              <button
                type="button"
                onClick={() => setIsSimulatedMode(!isSimulatedMode)}
                className={`px-2.5 py-1 rounded font-bold text-xs border transition-all flex items-center gap-1.5 ${
                  isSimulatedMode
                    ? 'bg-amber-400 text-black border-amber-400 shadow-md font-black'
                    : 'bg-[#1c2128] text-slate-400 border-[#30363d] hover:text-white'
                }`}
                title="Toggle simulated trade / paperMoney execution"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isSimulatedMode ? 'PAPER MONEY (ON)' : 'PAPER MONEY (OFF)'}</span>
              </button>

              {/* Side: BUY / SELL */}
              <div className="flex items-center bg-[#1c2128] rounded border border-[#30363d] p-0.5">
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`px-3 py-1 font-bold text-xs rounded transition-colors ${
                    side === 'BUY' ? 'bg-[#00c076] text-black shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`px-3 py-1 font-bold text-xs rounded transition-colors ${
                    side === 'SELL' ? 'bg-[#ff3b57] text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Quantity with Steppers */}
              <div className="flex items-center bg-[#1c2128] rounded border border-[#30363d] px-2 py-1">
                <span className="text-slate-500 font-sans text-[10px] mr-1.5">
                  {activeSpreadDetails || activeOptionDetails ? 'CONTRACTS' : 'QTY'}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 bg-transparent text-center font-bold text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Symbol Box */}
              <div className="flex items-center bg-[#1c2128] rounded border border-[#30363d] px-2 py-1">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 text-black font-black text-[9px] flex items-center justify-center mr-1.5 font-sans">
                  1
                </span>
                <input
                  type="text"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value.toUpperCase())}
                  className="w-20 bg-transparent font-bold text-white uppercase focus:outline-none"
                />
              </div>

              {/* Order Type */}
              <div className="flex items-center bg-[#1c2128] rounded border border-[#30363d] px-2 py-1">
                <span className="text-slate-500 font-sans text-[10px] mr-1.5">ORDER</span>
                <select
                  value={orderType}
                  onChange={e => setOrderType(e.target.value as any)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value="MARKET" className="bg-[#161b22]">MKT</option>
                  <option value="LIMIT" className="bg-[#161b22]">LMT</option>
                  <option value="STOP_LOSS" className="bg-[#161b22]">STP</option>
                </select>
              </div>

              {/* Price */}
              {orderType === 'LIMIT' && (
                <div className="flex items-center bg-[#1c2128] rounded border border-[#30363d] px-2 py-1">
                  <span className="text-slate-500 font-sans text-[10px] mr-1.5">
                    {activeSpreadDetails ? 'NET PREM $' : 'PRICE $'}
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    value={limitPrice}
                    onChange={e => setLimitPrice(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-transparent text-center font-bold text-white focus:outline-none"
                  />
                </div>
              )}

              {/* Time-in-Force (TIF) */}
              <div className="flex items-center bg-[#1c2128] rounded border border-[#30363d] px-2 py-1">
                <span className="text-slate-500 font-sans text-[10px] mr-1.5">TIF</span>
                <select
                  value={tif}
                  onChange={e => setTif(e.target.value as any)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value="DAY" className="bg-[#161b22]">DAY</option>
                  <option value="GTC" className="bg-[#161b22]">GTC</option>
                </select>
              </div>

              {/* Smart Routing Destination */}
              <div className="hidden xl:flex items-center bg-[#1c2128] rounded border border-[#30363d] px-2 py-1">
                <span className="text-slate-500 font-sans text-[10px] mr-1.5">ROUTING</span>
                <select
                  value={selectedBrokerageId}
                  onChange={e => setSelectedBrokerageId(e.target.value)}
                  className="bg-transparent text-slate-200 capitalize font-medium focus:outline-none cursor-pointer"
                >
                  {brokerages.filter(b => b.status === 'connected').map(b => (
                    <option key={b.id} value={b.id} className="bg-[#161b22]">
                      {b.name} ({b.latencyMs}ms)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 bg-[#1c2128] hover:bg-[#21262d] text-slate-400 hover:text-white rounded border border-[#30363d] font-bold text-xs cursor-pointer"
                title="Reset order form"
              >
                CLEAR
              </button>

              {/* Quick Simulated Trade Button (Executes paper trade immediately) */}
              <button
                type="button"
                onClick={() => submitOrder(true)}
                disabled={isSubmitting || quantity <= 0}
                className="px-3.5 py-1.5 rounded font-bold text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow"
                title="Execute immediately as simulated paper trade"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>SIMULATE TRADE</span>
              </button>

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || quantity <= 0}
                className={`px-4 py-1.5 rounded font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                  isSimulatedMode
                    ? 'bg-amber-400 hover:bg-amber-300 text-black'
                    : side === 'BUY'
                    ? 'bg-[#00c076] hover:bg-[#00d885] text-black disabled:opacity-50'
                    : 'bg-[#ff3b57] hover:bg-[#ff4f6a] text-white disabled:opacity-50'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isSimulatedMode ? 'SIMULATING...' : 'TRANSMITTING...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isSimulatedMode ? 'CONFIRM SIMULATED TRADE' : 'CONFIRM AND SEND'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
