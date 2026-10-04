import React, { useState } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Layers,
  X,
  ShieldAlert,
  Wallet
} from 'lucide-react';

interface ResetAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPaperTrading: boolean;
  onConfirmReset: (options: { startingCash: number; mode: 'initial_model' | 'all_cash' }) => void;
}

export const ResetAccountModal: React.FC<ResetAccountModalProps> = ({
  isOpen,
  onClose,
  isPaperTrading,
  onConfirmReset
}) => {
  const [startingCash, setStartingCash] = useState<number>(100000);
  const [resetMode, setResetMode] = useState<'initial_model' | 'all_cash'>('initial_model');
  const [confirmText, setConfirmText] = useState<string>('');

  if (!isOpen) return null;

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReset({
      startingCash,
      mode: resetMode
    });
    onClose();
  };

  const cashPresets = [25000, 50000, 100000, 250000, 1000000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none font-mono">
      <div className="relative w-full max-w-lg bg-[#0e1217] border-2 border-amber-500/60 rounded-xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Reset Account & Starting Balances
              </h3>
              <span className="text-[11px] text-amber-400 font-sans">
                {isPaperTrading ? 'paperMoney® Simulation Environment' : 'Live Sandbox Session'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1c2128]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Callout */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="space-y-1 font-sans">
            <p className="font-bold">Account Reset Warning</p>
            <p className="text-[11px] text-slate-300">
              Resetting will recalibrate your portfolio balances, clear current trade blotters, and restore your initial cash and position allocation.
            </p>
          </div>
        </div>

        <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
          {/* Starting Cash Preset */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Starting Cash Balance:</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {cashPresets.map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setStartingCash(amt)}
                  className={`py-1.5 px-1 rounded text-center text-xs font-bold border transition-all ${
                    startingCash === amt
                      ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                      : 'bg-[#161b22] text-slate-400 border-[#21262d] hover:text-white'
                  }`}
                >
                  ${amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-slate-500 text-[11px]">Custom Cash ($):</span>
              <input
                type="number"
                min="1000"
                step="1000"
                value={startingCash}
                onChange={e => setStartingCash(Math.max(1000, Number(e.target.value)))}
                className="flex-1 bg-[#161b22] border border-[#21262d] rounded px-2.5 py-1 text-white font-mono text-xs focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Portfolio Reset Mode */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Portfolio Allocation on Reset:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setResetMode('initial_model')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  resetMode === 'initial_model'
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-[#161b22] border-[#21262d] text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>Balanced Model Portfolio</span>
                  {resetMode === 'initial_model' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-1">
                  Resets to default diversified allocation across Equities, Crypto, Treasuries, and Commodities.
                </p>
              </div>

              <div
                onClick={() => setResetMode('all_cash')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  resetMode === 'all_cash'
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-[#161b22] border-[#21262d] text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>100% Liquid Cash Only</span>
                  {resetMode === 'all_cash' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-1">
                  Liquidates all positions to zero. Start with a fresh clean slate of 100% buying power.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#21262d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#161b22] hover:bg-[#1c2128] text-slate-300 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Confirm & Reset Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
