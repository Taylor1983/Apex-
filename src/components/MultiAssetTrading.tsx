import React, { useState } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Info,
  Sliders,
  BarChart2,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';
import { Asset, AssetClass, BiometricSettings, BrokerageGateway, OrderSide, OrderType, TradeOrder } from '../types';

interface MultiAssetTradingProps {
  assets: Asset[];
  selectedAssetId: string;
  onSelectAsset: (assetId: string) => void;
  cashBalance: number;
  existingHoldingQuantity: number;
  brokerages: BrokerageGateway[];
  biometricSettings: BiometricSettings;
  onRequestBiometricForTrade: (order: TradeOrder, onSuccess: () => void) => void;
  onExecuteTrade: (order: TradeOrder) => void;
}

export const MultiAssetTrading: React.FC<MultiAssetTradingProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
  cashBalance,
  existingHoldingQuantity,
  brokerages,
  biometricSettings,
  onRequestBiometricForTrade,
  onExecuteTrade
}) => {
  const [filterClass, setFilterClass] = useState<AssetClass | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartMode, setChartMode] = useState<'CANDLE' | 'LINE'>('CANDLE');
  const [studySMA, setStudySMA] = useState(true);

  // Active Trader ladder quick amount
  const [atQty, setAtQty] = useState<number>(10);
  
  // Trade ticket form state
  const [side, setSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState<string>('10');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [selectedBrokerageId, setSelectedBrokerageId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastExecutedReceipt, setLastExecutedReceipt] = useState<TradeOrder | null>(null);

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];
  const targetBrokerageId = selectedBrokerageId || selectedAsset.defaultBrokerage;
  const activeBrokerage = brokerages.find(b => b.id === targetBrokerageId) || brokerages[0];

  const parsedQty = parseFloat(quantity) || 0;
  const executionPrice = orderType === 'LIMIT' && parseFloat(limitPrice) > 0 ? parseFloat(limitPrice) : selectedAsset.price;
  const totalAmount = parsedQty * executionPrice;

  const handleOrderSubmit = (e?: React.FormEvent, customSide?: OrderSide, customPrice?: number) => {
    if (e) e.preventDefault();
    const tradeSide = customSide || side;
    const priceToUse = customPrice || executionPrice;
    const qtyToUse = parsedQty > 0 ? parsedQty : atQty;
    const netTotal = qtyToUse * priceToUse;

    if (tradeSide === 'BUY' && netTotal > cashBalance) {
      alert(`Insufficient cash balance ($${cashBalance.toFixed(2)} available).`);
      return;
    }

    if (tradeSide === 'SELL' && qtyToUse > existingHoldingQuantity && existingHoldingQuantity > 0) {
      // Allow selling
    }

    const newOrder: TradeOrder = {
      id: `ord-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      assetClass: selectedAsset.assetClass,
      side: tradeSide,
      type: customPrice ? 'LIMIT' : orderType,
      quantity: qtyToUse,
      price: selectedAsset.price,
      limitPrice: customPrice || (orderType === 'LIMIT' ? parseFloat(limitPrice) : undefined),
      totalAmount: netTotal,
      brokerageId: activeBrokerage.id,
      status: 'QUEUED',
      timestamp: Date.now(),
      biometricConfirmed: false
    };

    const requiresBio = netTotal >= biometricSettings.requireForTradesOver;

    if (requiresBio) {
      onRequestBiometricForTrade(newOrder, () => {
        executeOrderFlow({ ...newOrder, biometricConfirmed: true });
      });
    } else {
      executeOrderFlow(newOrder);
    }
  };

  const executeOrderFlow = (order: TradeOrder) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const filledOrder: TradeOrder = {
        ...order,
        status: 'FILLED',
        fillPrice: order.price,
        fillTimestamp: Date.now(),
        executionLatencyMs: activeBrokerage.latencyMs
      };
      onExecuteTrade(filledOrder);
      setIsSubmitting(false);
      setLastExecutedReceipt(filledOrder);
    }, 450);
  };

  return (
    <div className="space-y-3 font-mono select-none">
      {/* 1. TOS Sub-header: Active Symbol Strip with [1] Link tag & Key Stats */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          {/* Symbol & Link Tag */}
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-400 text-black font-black text-xs flex items-center justify-center font-mono">
              1
            </span>
            <div className="font-sans">
              <span className="text-xl font-bold text-white tracking-tight">{selectedAsset.symbol}</span>
              <span className="text-slate-400 text-xs ml-2">{selectedAsset.name}</span>
            </div>
          </div>

          <span className="text-slate-600">|</span>

          {/* Price & Change */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">
              ${selectedAsset.price >= 1000 ? selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : selectedAsset.price.toFixed(2)}
            </span>
            <span className={`font-semibold text-xs ${selectedAsset.change24hPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
              {selectedAsset.change24hPct >= 0 ? '+' : ''}${Math.abs(selectedAsset.change24h).toFixed(2)} ({selectedAsset.change24hPct >= 0 ? '+' : ''}{selectedAsset.change24hPct.toFixed(2)}%)
            </span>
          </div>

          <span className="text-slate-600 hidden md:inline">|</span>

          {/* Bid / Ask */}
          <div className="hidden md:flex items-center gap-3 text-slate-300">
            <div>
              <span className="text-slate-500 font-sans text-[10px]">BID: </span>
              <span className="text-[#00c076] font-bold">${selectedAsset.orderBook.bids[0]?.price.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 font-sans text-[10px]">ASK: </span>
              <span className="text-[#ff3b57] font-bold">${selectedAsset.orderBook.asks[0]?.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Chart Studies & Quick Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
            <button
              onClick={() => setChartMode('CANDLE')}
              className={`px-2 py-0.5 rounded font-bold ${chartMode === 'CANDLE' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400'}`}
            >
              Candle
            </button>
            <button
              onClick={() => setChartMode('LINE')}
              className={`px-2 py-0.5 rounded font-bold ${chartMode === 'LINE' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400'}`}
            >
              Line
            </button>
          </div>

          <button
            onClick={() => setStudySMA(!studySMA)}
            className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
              studySMA ? 'bg-[#161b22] text-[#00c076] border-[#00c076]/40' : 'bg-transparent text-slate-500 border-[#21262d]'
            }`}
          >
            SMA 20/50
          </button>
        </div>
      </div>

      {/* 2. Main Trading Worksurface: Left Candlestick Chart (7 Cols) & Right Active Trader Ladder (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Interactive Candlestick / Study Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0e1217] border border-[#21262d] rounded-lg p-3 shadow flex flex-col justify-between h-[520px]">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-white font-bold uppercase">{selectedAsset.symbol} · 5M CHART</span>
                <span className="text-slate-500 font-sans">Vol: {(selectedAsset.volume24h / 1000000).toFixed(1)}M</span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                Position: <strong className="text-white font-mono">{existingHoldingQuantity}</strong> shares/units
              </div>
            </div>

            {/* Candlestick Visualization */}
            <div className="h-80 w-full mt-3 relative bg-[#090d11] rounded border border-[#1c2128] p-3 flex flex-col justify-between">
              <svg className="w-full h-full" viewBox="0 0 500 240" preserveAspectRatio="none">
                {/* Horizontal Gridlines */}
                {[40, 90, 140, 190].map(y => (
                  <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#1c2128" strokeDasharray="2 2" />
                ))}

                {/* Simulated Candlesticks */}
                {selectedAsset.sparkline.map((val, idx) => {
                  const min = Math.min(...selectedAsset.sparkline) * 0.99;
                  const max = Math.max(...selectedAsset.sparkline) * 1.01;
                  const x = 20 + idx * 46;
                  const closeY = 200 - ((val - min) / (max - min || 1)) * 160;
                  const prevVal = idx > 0 ? selectedAsset.sparkline[idx - 1] : val * 0.995;
                  const openY = 200 - ((prevVal - min) / (max - min || 1)) * 160;
                  const isGreen = val >= prevVal;
                  const highY = Math.min(openY, closeY) - 8;
                  const lowY = Math.max(openY, closeY) + 8;

                  return (
                    <g key={idx}>
                      {/* Wick */}
                      <line x1={x + 10} y1={highY} x2={x + 10} y2={lowY} stroke={isGreen ? '#00c076' : '#ff3b57'} strokeWidth="1.5" />
                      {/* Candle Body */}
                      <rect
                        x={x + 3}
                        y={Math.min(openY, closeY)}
                        width="14"
                        height={Math.max(Math.abs(closeY - openY), 4)}
                        fill={isGreen ? '#00c076' : '#ff3b57'}
                        stroke={isGreen ? '#00c076' : '#ff3b57'}
                        strokeWidth="1"
                      />
                      {/* Volume bar at bottom */}
                      <rect
                        x={x + 3}
                        y={215 - (idx % 3 === 0 ? 18 : idx % 2 === 0 ? 12 : 24)}
                        width="14"
                        height={idx % 3 === 0 ? 18 : idx % 2 === 0 ? 12 : 24}
                        fill={isGreen ? 'rgba(0,192,118,0.35)' : 'rgba(255,59,87,0.35)'}
                      />
                    </g>
                  );
                })}

                {/* SMA 20 Trendline */}
                {studySMA && (
                  <path
                    d={selectedAsset.sparkline
                      .map((val, idx) => {
                        const min = Math.min(...selectedAsset.sparkline) * 0.99;
                        const max = Math.max(...selectedAsset.sparkline) * 1.01;
                        const x = 30 + idx * 46;
                        const y = 200 - ((val - min) / (max - min || 1)) * 160 + 4;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Bottom Technical Indicators & Fundamentals */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#21262d] text-xs">
            <div className="bg-[#090d11] p-1.5 rounded border border-[#1c2128]">
              <div className="text-slate-500 font-sans text-[10px]">24h High/Low</div>
              <div className="text-white font-bold text-[11px]">${selectedAsset.low24h.toFixed(1)} - ${selectedAsset.high24h.toFixed(1)}</div>
            </div>
            <div className="bg-[#090d11] p-1.5 rounded border border-[#1c2128]">
              <div className="text-slate-500 font-sans text-[10px]">Beta vs SPY</div>
              <div className="text-white font-bold text-[11px]">{selectedAsset.beta.toFixed(2)}</div>
            </div>
            <div className="bg-[#090d11] p-1.5 rounded border border-[#1c2128]">
              <div className="text-slate-500 font-sans text-[10px]">Dividend / Yield</div>
              <div className="text-[#00c076] font-bold text-[11px]">{selectedAsset.yieldPct ? `${selectedAsset.yieldPct.toFixed(2)}%` : '0.00%'}</div>
            </div>
            <div className="bg-[#090d11] p-1.5 rounded border border-[#1c2128]">
              <div className="text-slate-500 font-sans text-[10px]">DMA Gateway</div>
              <div className="text-amber-400 font-bold text-[11px] capitalize">{activeBrokerage.name.split(' ')[0]}</div>
            </div>
          </div>
        </div>

        {/* Right: thinkorswim Active Trader / Level 2 Depth Ladder (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0e1217] border border-[#21262d] rounded-lg p-3 shadow flex flex-col justify-between h-[520px]">
          <div>
            {/* Active Trader Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-xs uppercase tracking-wider">Active Trader</span>
                <span className="text-amber-400 font-mono text-[10px] bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20">
                  LEVEL 2 DEPTH
                </span>
              </div>
              <div className="text-slate-400 text-xs font-mono">
                Spread: <strong className="text-white">${(selectedAsset.orderBook.asks[0].price - selectedAsset.orderBook.bids[0].price).toFixed(2)}</strong>
              </div>
            </div>

            {/* Fast Action Buttons: Buy Mkt, Sell Mkt, Cancel All */}
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              <button
                onClick={() => handleOrderSubmit(undefined, 'BUY')}
                className="bg-[#102018] hover:bg-[#142f22] border border-[#00c076]/40 text-[#00c076] font-bold text-xs py-1.5 rounded uppercase tracking-wider cursor-pointer"
              >
                BUY MKT
              </button>
              <button
                onClick={() => handleOrderSubmit(undefined, 'SELL')}
                className="bg-[#1f1518] hover:bg-[#2e191e] border border-[#ff3b57]/40 text-[#ff3b57] font-bold text-xs py-1.5 rounded uppercase tracking-wider cursor-pointer"
              >
                SELL MKT
              </button>
              <button
                onClick={() => {
                  alert('All working limit orders for ' + selectedAsset.symbol + ' cancelled.');
                }}
                className="bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] text-slate-300 font-bold text-xs py-1.5 rounded uppercase tracking-wider cursor-pointer"
              >
                CANCEL ALL
              </button>
            </div>

            {/* Depth Ladder / Price Matrix */}
            <div className="mt-3 overflow-y-auto max-h-56 border border-[#21262d] rounded bg-[#090d11]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#12161f] text-[10px] text-slate-400 uppercase font-semibold border-b border-[#21262d] sticky top-0">
                  <tr>
                    <th className="py-1 px-2 text-right">Bid Vol</th>
                    <th className="py-1 px-2 text-center text-white">Price ($)</th>
                    <th className="py-1 px-2 text-left">Ask Vol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161b22]">
                  {/* Asks (Red) */}
                  {selectedAsset.orderBook.asks.slice().reverse().map((a, i) => (
                    <tr
                      key={`ask-${i}`}
                      onClick={() => handleOrderSubmit(undefined, 'BUY', a.price)}
                      className="hover:bg-[#1f1518] cursor-pointer text-[#ff3b57]"
                    >
                      <td className="py-0.5 px-2 text-right text-slate-600">-</td>
                      <td className="py-0.5 px-2 text-center font-bold text-white bg-[#121620]">
                        ${a.price.toFixed(2)}
                      </td>
                      <td className="py-0.5 px-2 text-left font-semibold">
                        {a.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {/* Mid / Spread marker */}
                  <tr className="bg-[#1c2128] text-amber-400 text-[10px] font-bold">
                    <td colSpan={3} className="py-0.5 text-center">
                      --- CURRENT SPREAD ${(selectedAsset.orderBook.asks[0].price - selectedAsset.orderBook.bids[0].price).toFixed(2)} ---
                    </td>
                  </tr>

                  {/* Bids (Green) */}
                  {selectedAsset.orderBook.bids.map((b, i) => (
                    <tr
                      key={`bid-${i}`}
                      onClick={() => handleOrderSubmit(undefined, 'SELL', b.price)}
                      className="hover:bg-[#102018] cursor-pointer text-[#00c076]"
                    >
                      <td className="py-0.5 px-2 text-right font-semibold">
                        {b.amount.toLocaleString()}
                      </td>
                      <td className="py-0.5 px-2 text-center font-bold text-white bg-[#121620]">
                        ${b.price.toFixed(2)}
                      </td>
                      <td className="py-0.5 px-2 text-left text-slate-600">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Trade Ticket Summary */}
          <div className="pt-2 border-t border-[#21262d] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-sans">Active Router:</span>
              <span className="text-white font-bold capitalize">{activeBrokerage.displayName} ({activeBrokerage.latencyMs}ms)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-sans">Biometric Policy:</span>
              <span className="text-[#00c076] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Armed for $\ge$ ${biometricSettings.requireForTradesOver.toLocaleString()}
              </span>
            </div>

            {lastExecutedReceipt && (
              <div className="p-2 bg-[#12161f] border border-[#00c076]/40 rounded text-[11px] text-slate-200 animate-in fade-in flex items-center justify-between">
                <span className="text-[#00c076] font-bold">FILLED: {lastExecutedReceipt.side} {lastExecutedReceipt.quantity} @ ${lastExecutedReceipt.fillPrice?.toFixed(2)}</span>
                <span className="text-slate-400 font-sans">{lastExecutedReceipt.brokerageId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
