import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  Zap,
  Lock,
  Download,
  AlertCircle
} from 'lucide-react';
import { Asset, PortfolioHolding, RebalanceProposal, RebalanceTrade, RiskProfile } from '../types';
import { generateRebalanceProposal } from '../services/rebalancer';

interface AutomatedRebalancerProps {
  holdings: PortfolioHolding[];
  assets: Asset[];
  riskProfile: RiskProfile;
  nav: number;
  cashBalance: number;
  onRequestBiometricExecution: (proposal: RebalanceProposal, onVerified: () => void) => void;
  onExecuteRebalanceBatch: (proposal: RebalanceProposal) => void;
}

export const AutomatedRebalancer: React.FC<AutomatedRebalancerProps> = ({
  holdings,
  assets,
  riskProfile,
  nav,
  cashBalance,
  onRequestBiometricExecution,
  onExecuteRebalanceBatch
}) => {
  const [toleranceThreshold, setToleranceThreshold] = useState<number>(1.5);
  const [strategyMode, setStrategyMode] = useState<'standard' | 'tax_optimized' | 'cash_only'>('tax_optimized');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionCompleted, setExecutionCompleted] = useState(false);
  const [completedProposal, setCompletedProposal] = useState<RebalanceProposal | null>(null);

  // Generate real-time proposal based on current holdings and chosen threshold
  const proposal = React.useMemo(() => {
    return generateRebalanceProposal(holdings, assets, riskProfile, nav, cashBalance, toleranceThreshold);
  }, [holdings, assets, riskProfile, nav, cashBalance, toleranceThreshold]);

  const handleTriggerRebalance = () => {
    if (proposal.trades.length === 0) return;

    // Prompt biometric authorization before batch execution
    onRequestBiometricExecution(proposal, () => {
      runBatchExecution();
    });
  };

  const runBatchExecution = () => {
    setIsExecuting(true);
    setExecutionProgress(15);

    const interval = setInterval(() => {
      setExecutionProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExecuting(false);
            setExecutionCompleted(true);
            setCompletedProposal(proposal);
            onExecuteRebalanceBatch(proposal);
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 280);
  };

  return (
    <div className="space-y-6">
      {/* Header & Rebalance Strategy Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Automated Portfolio Drift Rebalancer</h1>
              <span className="text-xs text-emerald-400 font-mono">Tax-Loss Harvesting Engine</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Continuously balances positions back to the <strong className="text-white">{riskProfile.name}</strong> target weights across connected brokerages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Strategy Mode */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setStrategyMode('tax_optimized')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  strategyMode === 'tax_optimized' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tax-Loss Harvesting
              </button>
              <button
                onClick={() => setStrategyMode('standard')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  strategyMode === 'standard' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Strict Risk Parity
              </button>
              <button
                onClick={() => setStrategyMode('cash_only')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  strategyMode === 'cash_only' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cash Inflow Only
              </button>
            </div>

            {/* Tolerance Band Dropdown */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <span className="text-slate-400">Drift Band:</span>
              <select
                value={toleranceThreshold}
                onChange={e => setToleranceThreshold(parseFloat(e.target.value))}
                className="bg-transparent text-white font-mono font-semibold focus:outline-none cursor-pointer"
              >
                <option value={1.0}>$\pm$ 1.0% (Aggressive)</option>
                <option value={1.5}>$\pm$ 1.5% (Recommended)</option>
                <option value={3.0}>$\pm$ 3.0% (Low Turnover)</option>
                <option value={5.0}>$\pm$ 5.0% (Wide Band)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Drift Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs font-mono">
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 font-sans text-[11px]">Maximum Current Drift</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">
              {proposal.maxDriftBefore.toFixed(1)}% Out of Band
            </div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 font-sans text-[11px]">Trades Required</div>
            <div className="text-base font-bold text-white mt-0.5">
              {proposal.trades.length} Batch Orders
            </div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 font-sans text-[11px]">Gross Rebalance Volume</div>
            <div className="text-base font-bold text-white mt-0.5">
              ${(proposal.totalSellAmount + proposal.totalBuyAmount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 font-sans text-[11px]">Harvested Tax Offset</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              +${proposal.estimatedTaxSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Execution Progress Bar (when executing) */}
      {isExecuting && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-medium text-white mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Transmitting Batch Orders across Alpaca, Coinbase, and IBKR...</span>
            </div>
            <span className="font-mono text-emerald-400">{executionProgress}% Fills Complete</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 transition-all duration-300 rounded-full shadow-[0_0_12px_#10b981]"
              style={{ width: `${executionProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Post-Execution Success Audit Certificate */}
      {executionCompleted && completedProposal && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-6 shadow-md animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Rebalancing Complete & Settled</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Batch Execution ID: {completedProposal.id} · Residual Drift: {completedProposal.projectedDriftAfter}%
                </p>
              </div>
            </div>
            <button
              onClick={() => setExecutionCompleted(false)}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs font-mono">
            <div className="bg-slate-950/70 p-3 rounded-lg">
              <div className="text-slate-400 font-sans">Orders Executed</div>
              <div className="text-white font-semibold mt-1">
                {completedProposal.trades.length} Orders Filled (Zero Failed)
              </div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-lg">
              <div className="text-slate-400 font-sans">Effective Slippage</div>
              <div className="text-white font-semibold mt-1">
                ${completedProposal.estimatedSlippage.toFixed(2)} (0.08% Institutional Spread)
              </div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-lg">
              <div className="text-slate-400 font-sans">Tax Loss Harvested</div>
              <div className="text-emerald-400 font-semibold mt-1">
                +${completedProposal.estimatedTaxSavings.toFixed(2)} Capital Deduction
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposed Trades Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Proposed Batch Trade Execution Plan</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Liquidates overweight holdings first to fund purchases of underweight assets with zero margin interest.
            </p>
          </div>

          {/* Action Trigger Button */}
          {proposal.trades.length > 0 ? (
            <button
              onClick={handleTriggerRebalance}
              disabled={isExecuting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Biometric Confirm & Execute ({proposal.trades.length} Orders)</span>
            </button>
          ) : (
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Portfolio perfectly balanced within $\pm${toleranceThreshold}%</span>
            </div>
          )}
        </div>

        {proposal.trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4 text-right">Current Wt</th>
                  <th className="py-3 px-4 text-right">Target Wt</th>
                  <th className="py-3 px-4 text-right">Shares / Units</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                  <th className="py-3 px-4">Route Gateway</th>
                  <th className="py-3 px-4">Tax Optimization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {proposal.trades.map(trade => {
                  const isSell = trade.action === 'SELL';
                  return (
                    <tr key={trade.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            isSell ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {trade.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-white">{trade.symbol}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[130px]">{trade.name}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {trade.currentWeight.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-medium">
                        {trade.targetWeight.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        {trade.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        ${trade.price >= 1000 ? trade.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : trade.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-white">
                        ${trade.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="text-slate-300 capitalize text-xs">
                          {trade.brokerageId} Gateway
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        {trade.isTaxLossHarvesting ? (
                          <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Tax Harvest (${trade.unrealizedLossOffset?.toFixed(0)} loss)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Standard Rebalance</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No trades required at current tolerance band. Holdings are tightly aligned with target risk profile.
          </div>
        )}
      </div>
    </div>
  );
};
