import React, { useState } from 'react';
import {
  Radio,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { BrokerageGateway as IBrokerageGateway, TradeOrder } from '../types';

interface BrokerageGatewayProps {
  brokerages: IBrokerageGateway[];
  orders: TradeOrder[];
  onToggleBrokerageStatus: (id: string) => void;
  onToggleLiveMode: (id: string) => void;
  onRequestBiometricForSecrets: (brokerageName: string, onVerified: () => void) => void;
}

export const BrokerageGateway: React.FC<BrokerageGatewayProps> = ({
  brokerages,
  orders,
  onToggleBrokerageStatus,
  onToggleLiveMode,
  onRequestBiometricForSecrets
}) => {
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'FILLED' | 'BUY' | 'SELL'>('ALL');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<TradeOrder | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const handleRevealSecret = (brokerage: IBrokerageGateway) => {
    if (revealedSecrets[brokerage.id]) {
      setRevealedSecrets(prev => ({ ...prev, [brokerage.id]: false }));
      return;
    }

    // Require biometric confirmation to reveal secret API credentials
    onRequestBiometricForSecrets(brokerage.displayName, () => {
      setRevealedSecrets(prev => ({ ...prev, [brokerage.id]: true }));
    });
  };

  const simulatePingRefresh = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
    }, 700);
  };

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'FILLED') return o.status === 'FILLED';
    if (orderFilter === 'BUY') return o.side === 'BUY';
    if (orderFilter === 'SELL') return o.side === 'SELL';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Major Brokerage API Gateways</h1>
              <span className="text-xs text-emerald-400 font-mono">Direct Market Access (DMA)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active connections to institutional execution APIs. Orders are automatically routed using low-latency Smart Order Routing (SOR).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={simulatePingRefresh}
              disabled={isPinging}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-lg cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Ping Gateway Latencies</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connected Brokerage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {brokerages.map(b => {
          const isConnected = b.status === 'connected';
          const isRevealed = revealedSecrets[b.id];

          return (
            <div
              key={b.id}
              className={`bg-slate-900 rounded-xl p-5 border transition-all flex flex-col justify-between ${
                isConnected ? 'border-slate-800' : 'border-slate-800/50 opacity-75'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">{b.displayName}</h2>
                    <span className="text-[11px] text-slate-400 capitalize">{b.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                      }`}
                    ></span>
                    <span className="text-xs font-mono font-medium text-slate-300 capitalize">
                      {b.status}
                    </span>
                  </div>
                </div>

                {/* Network & Account Info */}
                <div className="space-y-2 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Execution Mode:</span>
                    <button
                      onClick={() => onToggleLiveMode(b.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                        b.isLive
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {b.isLive ? 'LIVE PRODUCTION' : 'PAPER / SANDBOX'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans">API Ping Latency:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      {b.latencyMs} ms
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Account ID:</span>
                    <span className="text-slate-200">{b.accountNumber}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Available Buying Power:</span>
                    <span className="text-white font-semibold">
                      ${b.buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* API Credentials Management (Protected by Biometrics) */}
                <div className="mt-4 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                    <span>API Authentication Key</span>
                    <button
                      onClick={() => handleRevealSecret(b)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{isRevealed ? 'Hide' : 'Reveal (Bio)'}</span>
                    </button>
                  </div>
                  <div className="text-slate-300 text-[11px] truncate">
                    {isRevealed ? b.apiKeyMasked.replace(/\*/g, '8') : b.apiKeyMasked}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  {b.ordersRoutedToday} orders today
                </span>
                <button
                  onClick={() => onToggleBrokerageStatus(b.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    isConnected
                      ? 'bg-slate-800 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect Gateway'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Order Routing Configuration Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-white mb-2">Smart Order Routing (SOR) Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-white">US Equities & ETFs Routing</div>
            <p className="text-slate-400 mt-1">
              Primary: <strong className="text-blue-400">Alpaca Securities</strong> (14ms latency, Zero-commission SIP feeds).
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-white">Digital Assets Routing</div>
            <p className="text-slate-400 mt-1">
              Primary: <strong className="text-purple-400">Coinbase Advanced</strong> (22ms, Deep institutional liquidity book).
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-white">Sovereign Bonds & Real Assets</div>
            <p className="text-slate-400 mt-1">
              Primary: <strong className="text-emerald-400">Interactive Brokers</strong> (38ms, Direct Treasury exchange access).
            </p>
          </div>
        </div>
      </div>

      {/* Live Order Blotter & Broker Execution History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Direct Brokerage Order Blotter</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Audit trail of transmitted orders, execution timestamps, fill prices, and biometric authorizations.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setOrderFilter('ALL')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                orderFilter === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setOrderFilter('FILLED')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                orderFilter === 'FILLED' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Filled
            </button>
            <button
              onClick={() => setOrderFilter('BUY')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                orderFilter === 'BUY' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Buys
            </button>
            <button
              onClick={() => setOrderFilter('SELL')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                orderFilter === 'SELL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sells
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Side</th>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Price / Fill</th>
                <th className="py-3 px-4 text-right">Total ($)</th>
                <th className="py-3 px-4">Broker Route</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredOrders.map(ord => {
                const isBuy = ord.side === 'BUY';
                return (
                  <tr key={ord.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {ord.id}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">
                      {new Date(ord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        isBuy ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {ord.side}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-white">
                      {ord.symbol}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">
                      {ord.type}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200">
                      {ord.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-white">
                      ${ord.fillPrice ? ord.fillPrice.toFixed(2) : ord.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-white">
                      ${ord.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 font-sans capitalize text-slate-300">
                      {ord.brokerageId}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <button
                        onClick={() => setSelectedReceiptOrder(ord)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="View Trade Confirmation Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Confirmation Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Trade Confirmation Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-sans">Execution Order ID:</span>
                <span className="text-white">{selectedReceiptOrder.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-sans">Asset:</span>
                <span className="text-white font-bold">{selectedReceiptOrder.symbol} ({selectedReceiptOrder.name})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-sans">Side & Type:</span>
                <span className="text-white">{selectedReceiptOrder.side} · {selectedReceiptOrder.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-sans">Executed Quantity:</span>
                <span className="text-white">{selectedReceiptOrder.quantity} units</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-sans">Fill Price:</span>
                <span className="text-white">${selectedReceiptOrder.fillPrice?.toFixed(2) || selectedReceiptOrder.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-sans">Net Consideration:</span>
                <span className="text-emerald-400 font-bold">${selectedReceiptOrder.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-sans">Broker Gateway:</span>
                <span className="capitalize text-white">{selectedReceiptOrder.brokerageId} Direct Routing</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-sans">Biometric Verified:</span>
                <span className="text-emerald-400 font-sans font-semibold">
                  {selectedReceiptOrder.biometricConfirmed ? '✓ WebAuthn Signed' : 'Standard Session'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Executed At:</span>
                <span className="text-slate-300">{new Date(selectedReceiptOrder.timestamp).toISOString()}</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
