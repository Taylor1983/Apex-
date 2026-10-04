import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Newspaper,
  Edit3,
  Search,
  ExternalLink,
  Zap,
  ArrowRight,
  Layers,
  Activity
} from 'lucide-react';
import { Asset, AssetClass } from '../types';

interface TosLeftSidebarProps {
  assets: Asset[];
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onPopulateOrder: (symbol: string, side: 'BUY' | 'SELL', price: number) => void;
}

export const TosLeftSidebar: React.FC<TosLeftSidebarProps> = ({
  assets,
  activeSymbol,
  onSelectSymbol,
  onPopulateOrder
}) => {
  const [watchlistCategory, setWatchlistCategory] = useState<'all' | 'canadian' | 'equities' | 'crypto' | 'fixed_income' | 'commodities'>('all');
  const [expandedGadgets, setExpandedGadgets] = useState({
    watchlist: true,
    quickQuote: true,
    depth: true,
    news: true,
    scratchpad: false
  });
  const [scratchNotes, setScratchNotes] = useState(
    'Key Resistance Levels:\n- SPY 576.50 ATH\n- NVDA 134.20 breakout zone\n- SHOP.TO 120.00 TSX breakout\n- BTC 66.8k multi-month pivot\n\nCIRO TFSA contribution room remaining.'
  );

  const toggleGadget = (key: keyof typeof expandedGadgets) => {
    setExpandedGadgets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeAsset = assets.find(a => a.symbol === activeSymbol) || assets[0];

  const filteredAssets = assets.filter(a => {
    if (watchlistCategory === 'all') return true;
    if (watchlistCategory === 'canadian') {
      return a.symbol.endsWith('.TO') || a.currency === 'CAD' || a.exchange === 'TSX' || a.exchange === 'TSXV';
    }
    return a.assetClass === watchlistCategory;
  });

  const newsItems = [
    { time: '13:18', source: 'DJ', text: 'Fed Powell signals policy easing path remains data-dependent on labor market trends' },
    { time: '13:02', source: 'RT', text: 'NVIDIA expands high-throughput AI Blackwell server delivery milestones' },
    { time: '12:45', source: 'BW', text: 'TSX rallies led by Shopify & Canadian bank dividend aristocrats' },
    { time: '12:15', source: 'DJ', text: 'Bank of Canada overnight rate path supports Canadian corporate earnings' }
  ];

  return (
    <aside className="w-72 bg-[#0d1117] border-r border-[#21262d] flex flex-col h-full text-slate-300 font-sans select-none shrink-0 overflow-y-auto">
      {/* GADGET 1: WATCHLIST */}
      <div className="border-b border-[#21262d]">
        {/* Gadget Header */}
        <div
          onClick={() => toggleGadget('watchlist')}
          className="bg-[#161b22] px-2.5 py-1.5 flex items-center justify-between text-xs font-semibold text-white cursor-pointer hover:bg-[#1c2128] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            {expandedGadgets.watchlist ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            <span>Watchlist</span>
            {/* TOS Yellow 1 Tag */}
            <span className="w-3.5 h-3.5 rounded bg-amber-400 text-black font-black text-[9px] flex items-center justify-center font-mono">
              1
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{filteredAssets.length}</span>
        </div>

        {expandedGadgets.watchlist && (
          <div className="p-1">
            {/* Category Selector */}
            <div className="px-1.5 py-1">
              <select
                value={watchlistCategory}
                onChange={e => setWatchlistCategory(e.target.value as any)}
                className="w-full bg-[#1c2128] border border-[#30363d] text-[11px] font-mono text-slate-200 rounded px-1.5 py-1 focus:outline-none focus:border-amber-400"
              >
                <option value="all">Default Multi-Asset</option>
                <option value="canadian">🇨🇦 Canadian Equities (TSX / TSXV)</option>
                <option value="equities">US Equities / Stocks</option>
                <option value="crypto">Crypto 24/7</option>
                <option value="fixed_income">Fixed Income / Bonds</option>
                <option value="commodities">Commodities</option>
              </select>
            </div>

            {/* Watchlist Table */}
            <div className="overflow-x-auto max-h-56 overflow-y-auto font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#12161f] text-[10px] text-slate-400 font-semibold border-b border-[#21262d] sticky top-0">
                  <tr>
                    <th className="py-1 px-2">Symbol</th>
                    <th className="py-1 px-1 text-right">Last</th>
                    <th className="py-1 px-1 text-right">Net Chg</th>
                    <th className="py-1 px-2 text-right">%Chg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2128]">
                  {filteredAssets.map(asset => {
                    const isSelected = asset.symbol === activeSymbol;
                    const isPositive = asset.change24hPct >= 0;
                    const isCanadian = asset.symbol.endsWith('.TO') || asset.currency === 'CAD';

                    return (
                      <tr
                        key={asset.id}
                        onClick={() => onSelectSymbol(asset.symbol)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#1c2128] text-white border-l-2 border-amber-400'
                            : 'hover:bg-[#161b22]/70 text-slate-300'
                        }`}
                      >
                        <td className="py-1 px-2 font-bold text-white">
                          <div className="flex items-center gap-1">
                            <span>{asset.symbol}</span>
                            {isCanadian && (
                              <span className="text-[9px] px-1 py-0.1 rounded bg-red-500/15 text-red-300 border border-red-500/30 font-mono">
                                TSX
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1 px-1 text-right text-slate-200">
                          {isCanadian ? 'C$' : '$'}
                          {asset.price >= 1000
                            ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                            : asset.price.toFixed(2)}
                        </td>
                        <td className={`py-1 px-1 text-right ${isPositive ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                          {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}
                        </td>
                        <td className={`py-1 px-2 text-right font-medium ${isPositive ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                          {isPositive ? '+' : ''}{asset.change24hPct.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* GADGET 2: QUICK QUOTE & MINI LEVEL 1 */}
      <div className="border-b border-[#21262d]">
        <div
          onClick={() => toggleGadget('quickQuote')}
          className="bg-[#161b22] px-2.5 py-1.5 flex items-center justify-between text-xs font-semibold text-white cursor-pointer hover:bg-[#1c2128] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            {expandedGadgets.quickQuote ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            <span>Quick Quote</span>
            <span className="w-3.5 h-3.5 rounded bg-amber-400 text-black font-black text-[9px] flex items-center justify-center font-mono">
              1
            </span>
          </div>
          <span className="font-mono text-amber-400 text-xs font-bold">{activeAsset.symbol}</span>
        </div>

        {expandedGadgets.quickQuote && (() => {
          const isCAD = activeAsset.currency === 'CAD' || activeAsset.symbol.endsWith('.TO');
          const currSym = isCAD ? 'C$' : '$';
          return (
            <div className="p-3 space-y-3 font-mono">
              {/* Top quote line */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{activeAsset.symbol}</span>
                    {isCAD && (
                      <span className="text-[9px] px-1 py-0.1 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                        TSX
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans truncate max-w-[120px]">{activeAsset.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{currSym}{activeAsset.price >= 1000 ? activeAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : activeAsset.price.toFixed(2)}</div>
                  <div className={`text-[11px] font-semibold ${activeAsset.change24hPct >= 0 ? 'text-[#00c076]' : 'text-[#ff3b57]'}`}>
                    {activeAsset.change24hPct >= 0 ? '+' : ''}{activeAsset.change24hPct.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Bid / Ask Buttons (Click to populate bottom order bar) */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onPopulateOrder(activeAsset.symbol, 'SELL', activeAsset.orderBook.bids[0]?.price || activeAsset.price)}
                  className="bg-[#1f1518] hover:bg-[#2e191e] border border-[#ff3b57]/40 text-[#ff3b57] rounded p-1.5 text-left transition-colors cursor-pointer"
                >
                  <div className="text-[9px] font-sans text-slate-400">BID (SELL)</div>
                  <div className="text-xs font-bold">{currSym}{(activeAsset.orderBook.bids[0]?.price || activeAsset.price).toFixed(2)}</div>
                  <div className="text-[9px] text-slate-500">{activeAsset.orderBook.bids[0]?.amount || 100} size</div>
                </button>
                <button
                  onClick={() => onPopulateOrder(activeAsset.symbol, 'BUY', activeAsset.orderBook.asks[0]?.price || activeAsset.price)}
                  className="bg-[#102018] hover:bg-[#142f22] border border-[#00c076]/40 text-[#00c076] rounded p-1.5 text-left transition-colors cursor-pointer"
                >
                  <div className="text-[9px] font-sans text-slate-400">ASK (BUY)</div>
                  <div className="text-xs font-bold">{currSym}{(activeAsset.orderBook.asks[0]?.price || activeAsset.price).toFixed(2)}</div>
                  <div className="text-[9px] text-slate-500">{activeAsset.orderBook.asks[0]?.amount || 100} size</div>
                </button>
              </div>

              {/* 24h High Low Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Low: {currSym}{activeAsset.low24h.toFixed(1)}</span>
                  <span>High: {currSym}{activeAsset.high24h.toFixed(1)}</span>
                </div>
                <div className="w-full bg-[#1c2128] h-1.5 rounded-full overflow-hidden relative">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          ((activeAsset.price - activeAsset.low24h) /
                            (activeAsset.high24h - activeAsset.low24h || 1)) *
                            100,
                          5
                        ),
                        95
                      )}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* GADGET: LEVEL 2 MARKET DEPTH */}
      <div className="border-b border-[#21262d]">
        <div
          onClick={() => toggleGadget('depth')}
          className="bg-[#161b22] px-2.5 py-1.5 flex items-center justify-between text-xs font-semibold text-white cursor-pointer hover:bg-[#1c2128] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            {expandedGadgets.depth ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>L2 Market Depth</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400">{activeAsset.symbol}</span>
        </div>

        {expandedGadgets.depth && (() => {
          const isCAD = activeAsset.currency === 'CAD' || activeAsset.symbol.endsWith('.TO');
          const currSym = isCAD ? 'C$' : '$';
          const venues = isCAD ? ['TSX', 'ALPHA', 'CHIX', 'MX'] : ['NSDQ', 'ARCA', 'BATS', 'EDGX'];
          const topBids = (activeAsset.orderBook?.bids || []).slice(0, 4);
          const topAsks = (activeAsset.orderBook?.asks || []).slice(0, 4);

          return (
            <div className="p-2 space-y-2 font-mono text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                {/* Bids */}
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase flex justify-between border-b border-[#21262d] pb-0.5 mb-1">
                    <span>VENUE</span>
                    <span className="text-right text-[#00c076]">BID</span>
                  </div>
                  <div className="space-y-0.5">
                    {topBids.map((b, i) => (
                      <div
                        key={`b-${i}`}
                        onClick={() => onPopulateOrder(activeAsset.symbol, 'BUY', b.price)}
                        className="flex items-center justify-between px-1.5 py-0.5 rounded bg-[#102018]/60 hover:bg-[#142f22] text-[#00c076] cursor-pointer"
                      >
                        <span className="text-[9px] text-slate-400 font-sans">{venues[i % venues.length]}</span>
                        <span className="font-bold">{currSym}{b.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Asks */}
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase flex justify-between border-b border-[#21262d] pb-0.5 mb-1">
                    <span className="text-[#ff3b57]">ASK</span>
                    <span className="text-right">VENUE</span>
                  </div>
                  <div className="space-y-0.5">
                    {topAsks.map((a, i) => (
                      <div
                        key={`a-${i}`}
                        onClick={() => onPopulateOrder(activeAsset.symbol, 'SELL', a.price)}
                        className="flex items-center justify-between px-1.5 py-0.5 rounded bg-[#1f1518]/60 hover:bg-[#2e191e] text-[#ff3b57] cursor-pointer"
                      >
                        <span className="font-bold">{currSym}{a.price.toFixed(2)}</span>
                        <span className="text-[9px] text-slate-400 font-sans">{venues[(i + 1) % venues.length]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* GADGET 3: LIVE NEWS FEED / SQUAWK */}
      <div className="border-b border-[#21262d]">
        <div
          onClick={() => toggleGadget('news')}
          className="bg-[#161b22] px-2.5 py-1.5 flex items-center justify-between text-xs font-semibold text-white cursor-pointer hover:bg-[#1c2128] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            {expandedGadgets.news ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            <span>Live Squawk & News</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#00c076] animate-pulse"></span>
        </div>

        {expandedGadgets.news && (
          <div className="p-2 divide-y divide-[#1c2128] text-xs font-sans">
            {newsItems.map((item, idx) => (
              <div key={idx} className="py-2 first:pt-0 last:pb-0 hover:bg-[#161b22]/40 transition-colors">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mb-0.5">
                  <span className="text-amber-400 font-bold">{item.source}</span>
                  <span>{item.time}</span>
                </div>
                <div className="text-[11px] text-slate-200 leading-tight">
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GADGET 4: CANADIAN EXCHANGE CONNECTIVITY STATUS */}
      <div className="border-b border-[#21262d]">
        <div className="bg-[#161b22] px-2.5 py-1.5 flex items-center justify-between text-xs font-semibold text-white">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🇨🇦</span>
            <span>Canadian Venues</span>
          </div>
          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
            ALL ONLINE
          </span>
        </div>

        <div className="p-2 space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c076]"></span>
              TMX TSX (Quantum XA)
            </span>
            <span className="text-emerald-400 font-bold">8.2ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c076]"></span>
              Bourse MX (SOLA)
            </span>
            <span className="text-emerald-400 font-bold">7.4ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c076]"></span>
              TSX Alpha ATS
            </span>
            <span className="text-emerald-400 font-bold">6.8ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c076]"></span>
              Cboe Canada (Chi-X)
            </span>
            <span className="text-emerald-400 font-bold">6.5ms</span>
          </div>
        </div>
      </div>

      {/* GADGET 4: SCRATCHPAD / TRADER NOTES */}
      <div className="border-b border-[#21262d]">
        <div
          onClick={() => toggleGadget('scratchpad')}
          className="bg-[#161b22] px-2.5 py-1.5 flex items-center justify-between text-xs font-semibold text-white cursor-pointer hover:bg-[#1c2128] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            {expandedGadgets.scratchpad ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            <span>Trader ScratchPad</span>
          </div>
          <Edit3 className="w-3 h-3 text-slate-400" />
        </div>

        {expandedGadgets.scratchpad && (
          <div className="p-2">
            <textarea
              value={scratchNotes}
              onChange={e => setScratchNotes(e.target.value)}
              rows={4}
              placeholder="Notes, targets, trade triggers..."
              className="w-full bg-[#090d11] border border-[#21262d] rounded p-1.5 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
