import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  TrendingUp,
  TrendingDown,
  Clock,
  Radio,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  DollarSign
} from 'lucide-react';
import { Asset, OrderSide } from '../types';
import {
  CANADIAN_EXCHANGES,
  CanadianExchangeVenue,
  INITIAL_CANADIAN_TAPE,
  CanadianTapePrint,
  CANADIAN_STOCKS,
  CAD_USD_EXCHANGE_RATE
} from '../data/canadianMarketData';

interface TosCanadianLiveDataViewProps {
  assets: Asset[];
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onPopulateOrder: (symbol: string, side: OrderSide, price: number) => void;
}

export const TosCanadianLiveDataView: React.FC<TosCanadianLiveDataViewProps> = ({
  assets,
  activeSymbol,
  onSelectSymbol,
  onPopulateOrder
}) => {
  const [tape, setTape] = useState<CanadianTapePrint[]>(INITIAL_CANADIAN_TAPE);
  const [selectedExchangeId, setSelectedExchangeId] = useState<string>('ALL');
  const [isFeedStreaming, setIsFeedStreaming] = useState<boolean>(true);
  const [lastTickTimestamp, setLastTickTimestamp] = useState<string>('Live Streaming');
  const [simulatedQuotes, setSimulatedQuotes] = useState<Record<string, { last: number; chg: number; pct: number; vol: number }>>(() => {
    const init: Record<string, { last: number; chg: number; pct: number; vol: number }> = {};
    CANADIAN_STOCKS.forEach(s => {
      init[s.symbol] = {
        last: s.price,
        chg: s.change24h,
        pct: s.change24hPct,
        vol: s.volume24h
      };
    });
    return init;
  });

  // Real-time market tick generator for Canadian venues (TSX, TSXV, MX, ALPHA, CHIX)
  useEffect(() => {
    if (!isFeedStreaming) return;

    const interval = setInterval(() => {
      const symbols = ['SHOP.TO', 'RY.TO', 'TD.TO', 'ENB.TO', 'CNQ.TO', 'CNR.TO', 'XIU.TO'];
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const venues: ('TSX' | 'TSXV' | 'MX' | 'ALPHA' | 'CHIX')[] = ['TSX', 'ALPHA', 'CHIX', 'MX', 'TSXV'];
      const randomVenue = venues[Math.floor(Math.random() * venues.length)];
      
      const currentQuote = simulatedQuotes[randomSymbol] || { last: 100, chg: 0.5, pct: 0.5, vol: 1000000 };
      const delta = (Math.random() - 0.48) * (currentQuote.last * 0.0018);
      const newPrice = Number((currentQuote.last + delta).toFixed(2));
      const isUptick = delta >= 0;
      const tradeSize = [100, 200, 300, 500, 1000, 2500][Math.floor(Math.random() * 6)];

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const conditions: ('REGULAR' | 'ODD_LOT' | 'CROSS' | 'OPTION_BLOCK')[] = ['REGULAR', 'REGULAR', 'ODD_LOT', 'CROSS'];
      const condition = randomVenue === 'MX' ? 'OPTION_BLOCK' : conditions[Math.floor(Math.random() * conditions.length)];

      const newPrint: CanadianTapePrint = {
        id: `ca-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        time: timeStr,
        symbol: randomVenue === 'MX' ? `${randomSymbol.replace('.TO', '')} 125C` : randomSymbol,
        venue: randomVenue,
        price: randomVenue === 'MX' ? Number((Math.random() * 4 + 2).toFixed(2)) : newPrice,
        size: randomVenue === 'MX' ? Math.floor(Math.random() * 20 + 5) : tradeSize,
        isUptick,
        condition
      };

      setTape(prev => [newPrint, ...prev.slice(0, 34)]);
      setLastTickTimestamp(timeStr + ' EDT');

      if (randomVenue !== 'MX') {
        setSimulatedQuotes(prev => {
          const prevEntry = prev[randomSymbol] || { last: newPrice, chg: 0, pct: 0, vol: 0 };
          const chg = Number((prevEntry.chg + delta).toFixed(2));
          const pct = Number(((chg / (newPrice - chg || 1)) * 100).toFixed(2));
          return {
            ...prev,
            [randomSymbol]: {
              last: newPrice,
              chg,
              pct,
              vol: prevEntry.vol + tradeSize
            }
          };
        });
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isFeedStreaming, simulatedQuotes]);

  const activeAsset = assets.find(a => a.symbol === activeSymbol) || CANADIAN_STOCKS[0];

  const filteredTape = tape.filter(t => {
    if (selectedExchangeId === 'ALL') return true;
    return t.venue === selectedExchangeId;
  });

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      {/* 1. Header Toolbar */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇨🇦</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">CANADIAN DIRECT EXCHANGE FEEDS</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/15 text-red-300 border border-red-500/30 font-bold">
                  CIRO / CIPF REGULATED
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00c076]/15 text-[#00c076] border border-[#00c076]/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00c076] animate-pulse"></span>
                  LIVE STREAMING
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Low-latency direct market feeds from TMX TSX, TSX Venture, Bourse de Montréal (MX), TSX Alpha, and Cboe Canada.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Feed toggle */}
          <button
            onClick={() => setIsFeedStreaming(!isFeedStreaming)}
            className={`px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isFeedStreaming
                ? 'bg-[#1c2128] text-[#00c076] border-[#00c076]/40'
                : 'bg-[#161b22] text-amber-400 border-amber-400/40'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{isFeedStreaming ? 'Pause Feed' : 'Resume Live'}</span>
          </button>

          {/* FX CAD/USD Rate Badge */}
          <div className="bg-[#161b22] px-2.5 py-1 rounded border border-[#21262d] flex items-center gap-2 text-[11px]">
            <span className="text-slate-400 font-sans">USD/CAD:</span>
            <span className="font-bold text-white">1.3625</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-sans">CAD/USD:</span>
            <span className="font-bold text-amber-400">0.7339</span>
          </div>
        </div>
      </div>

      {/* 2. Canadian Exchange Connectivity Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {CANADIAN_EXCHANGES.map(venue => {
          const isSelected = selectedExchangeId === venue.id;
          return (
            <div
              key={venue.id}
              onClick={() => setSelectedExchangeId(selectedExchangeId === venue.id ? 'ALL' : venue.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#161f2e] border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                  : 'bg-[#0e1217] border-[#21262d] hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs">{venue.shortName}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#21262d] text-slate-300 font-mono">
                      {venue.mic}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">{venue.name}</div>
                </div>

                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00c076]/15 text-[#00c076] border border-[#00c076]/30">
                  {venue.status}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1c2128] flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-sans">Latency:</span>
                <span className="text-emerald-400 font-bold">{venue.latencyMs} ms</span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-sans">Matching Engine:</span>
                <span className="text-slate-300 truncate max-w-[120px]" title={venue.engine}>
                  {venue.feedType}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-sans">Canadian Volume:</span>
                <span className="text-amber-400 font-bold">{venue.marketSharePct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Center Split: TSX Live Equities Depth & Order Book (Left) + Real-Time Canadian Time & Sales Tape (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Canadian TSX / TSXV Equities Grid (7 Columns) */}
        <div className="lg:col-span-7 bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                TSX 60 Benchmark & Blue-Chip Live Board (CAD)
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span>S&P/TSX: <strong className="text-[#00c076]">24,185.40 (+0.59%)</strong></span>
              <span className="text-slate-600">|</span>
              <span>MX Put/Call Ratio: <strong className="text-[#00c076]">0.71</strong></span>
              <span className="px-1.5 py-0.2 rounded font-bold bg-[#00c076]/15 text-[#00c076] border border-[#00c076]/30">
                BULLISH
              </span>
            </div>
          </div>

          {/* Live Table */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#12161f] text-[10px] text-slate-400 uppercase font-semibold border-b border-[#21262d]">
                <tr>
                  <th className="py-2 px-2.5">Symbol</th>
                  <th className="py-2 px-2">Company Name</th>
                  <th className="py-2 px-2 text-right">Last (C$)</th>
                  <th className="py-2 px-2 text-right">Net Chg</th>
                  <th className="py-2 px-2 text-right">%Chg</th>
                  <th className="py-2 px-2 text-right">24h Vol</th>
                  <th className="py-2 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2128]">
                {CANADIAN_STOCKS.map(stock => {
                  const live = simulatedQuotes[stock.symbol] || {
                    last: stock.price,
                    chg: stock.change24h,
                    pct: stock.change24hPct,
                    vol: stock.volume24h
                  };
                  const isSelected = stock.symbol === activeSymbol;
                  const isPositive = live.chg >= 0;

                  return (
                    <tr
                      key={stock.id}
                      onClick={() => onSelectSymbol(stock.symbol)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#1c2128] text-white border-l-2 border-amber-400'
                          : 'hover:bg-[#161b22]/70 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-2.5 font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400">{stock.symbol}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                            {stock.exchange}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2 font-sans text-slate-300 truncate max-w-[140px]">
                        {stock.name}
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-white">
                        C${live.last.toFixed(2)}
                      </td>
                      <td className={`py-2 px-2 text-right font-bold ${isPositive ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                        {isPositive ? '+' : ''}{live.chg.toFixed(2)}
                      </td>
                      <td className={`py-2 px-2 text-right font-bold ${isPositive ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                        {isPositive ? '+' : ''}{live.pct.toFixed(2)}%
                      </td>
                      <td className="py-2 px-2 text-right text-slate-400">
                        {(live.vol / 1000).toFixed(0)}k
                      </td>
                      <td className="py-2 px-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onPopulateOrder(stock.symbol, 'BUY', live.last);
                            }}
                            className="px-1.5 py-0.5 rounded bg-[#00c076]/20 hover:bg-[#00c076] hover:text-black text-[#00c076] font-bold text-[10px] transition-colors"
                          >
                            BUY
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onPopulateOrder(stock.symbol, 'SELL', live.last);
                            }}
                            className="px-1.5 py-0.5 rounded bg-[#ff3b57]/20 hover:bg-[#ff3b57] hover:text-white text-[#ff3b57] font-bold text-[10px] transition-colors"
                          >
                            SELL
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected Canadian Stock Order Book Depth Preview */}
          <div className="pt-3 border-t border-[#21262d]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-200">
                Level 2 Book Depth: <strong className="text-amber-400">{activeAsset.symbol}</strong> ({activeAsset.exchange} / Quantum XA Engine)
              </span>
              <span className="text-[10px] text-slate-400">Spread: C$0.10 (0.08%)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Bids */}
              <div className="bg-[#090d11] p-2 rounded border border-[#1c2128] space-y-1">
                <div className="text-[10px] font-bold text-[#00c076] border-b border-[#1c2128] pb-1 flex justify-between">
                  <span>BID SIZE</span>
                  <span>BID PRICE (CAD)</span>
                </div>
                {activeAsset.orderBook.bids.slice(0, 4).map((b, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{b.amount}</span>
                    <span className="font-bold text-[#00c076]">C${b.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Asks */}
              <div className="bg-[#090d11] p-2 rounded border border-[#1c2128] space-y-1">
                <div className="text-[10px] font-bold text-[#ff3b57] border-b border-[#1c2128] pb-1 flex justify-between">
                  <span>ASK PRICE (CAD)</span>
                  <span>ASK SIZE</span>
                </div>
                {activeAsset.orderBook.asks.slice(0, 4).map((a, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="font-bold text-[#ff3b57]">C${a.price.toFixed(2)}</span>
                    <span className="text-slate-400">{a.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-Time Multi-Exchange Time & Sales Tape (5 Columns) */}
        <div className="lg:col-span-5 bg-[#0e1217] border border-[#21262d] rounded-lg p-3.5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00c076] animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Canadian Time & Sales Tape
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-slate-400">Filter:</span>
                <span className="text-amber-400 font-bold bg-[#161b22] px-1.5 py-0.2 rounded border border-[#21262d]">
                  {selectedExchangeId}
                </span>
              </div>
            </div>

            {/* Tape Stream List */}
            <div className="mt-2 space-y-1 max-h-[460px] overflow-y-auto no-scrollbar font-mono text-[11px]">
              {filteredTape.map(print => {
                const venueBadgeColor =
                  print.venue === 'TSX'
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    : print.venue === 'MX'
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    : print.venue === 'ALPHA'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : print.venue === 'CHIX'
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

                return (
                  <div
                    key={print.id}
                    onClick={() => onSelectSymbol(print.symbol.split(' ')[0] + '.TO')}
                    className="flex items-center justify-between px-2 py-1 rounded bg-[#090d11] hover:bg-[#161b22] transition-colors border border-[#161b22] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{print.time}</span>
                      <span className={`text-[9px] px-1 py-0.1 rounded border font-bold ${venueBadgeColor}`}>
                        {print.venue}
                      </span>
                      <span className="font-bold text-white">{print.symbol}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{print.size.toLocaleString()}</span>
                      <span className={`font-bold flex items-center gap-0.5 ${print.isUptick ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                        {print.isUptick ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        C${print.price.toFixed(2)}
                      </span>
                      {print.condition !== 'REGULAR' && (
                        <span className="text-[8px] px-1 py-0.1 rounded bg-[#21262d] text-slate-400 font-sans">
                          {print.condition}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canadian Market Summary Footer */}
          <div className="pt-2 border-t border-[#21262d] text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00c076]" />
              <span>CIRO Trade Settlement: T+1 Canada Standard</span>
            </span>
            <span>Ticks: <strong className="text-white">{tape.length} buffered</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
