import React, { useState } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Smartphone,
  Laptop,
  CheckCircle2,
  Clock,
  RotateCw
} from 'lucide-react';
import { BiometricLogEntry, BiometricSettings } from '../types';

interface BiometricSecurityViewProps {
  biometricSettings: BiometricSettings;
  biometricLogs: BiometricLogEntry[];
  onUpdateSettings: (settings: Partial<BiometricSettings>) => void;
  onLockTerminalNow: () => void;
  onTriggerTestBiometric: () => void;
}

export const BiometricSecurityView: React.FC<BiometricSecurityViewProps> = ({
  biometricSettings,
  biometricLogs,
  onUpdateSettings,
  onLockTerminalNow,
  onTriggerTestBiometric
}) => {
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Biometric Security & Enclave Authentication</h1>
              <span className="text-xs text-emerald-400 font-mono">FIDO2 / WebAuthn Level 3</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Hardware cryptographic signatures guard trade execution, portfolio rebalancing batches, and brokerage API credentials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerTestBiometric}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Test Biometric Sensor</span>
            </button>
            <button
              onClick={onLockTerminalNow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Terminal Now</span>
            </button>
          </div>
        </div>

        {successBanner && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}
      </div>

      {/* Hardware & Enclave Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Hardware Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hardware Enclave Status</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Apple TouchID / FaceID</div>
              <div className="text-xs text-slate-400">Platform Authenticator</div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
            Cred ID: <span className="text-slate-300">{biometricSettings.registeredCredentialId}</span>
          </div>
        </div>

        {/* Security Algorithm */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cryptographic Spec</span>
            <span className="text-slate-300 font-mono text-[11px]">ECDSA SECP256R1</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">FIDO2 Passkey Registered</div>
              <div className="text-xs text-slate-400">User Verification Required</div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
            RP ID: <span className="text-slate-300">{window.location.hostname || 'apexportfolio.internal'}</span>
          </div>
        </div>

        {/* Fallback PIN Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Secondary Recovery PIN</span>
            <span className="text-amber-400 font-mono text-[11px]">Configured</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">4-Digit Security PIN</div>
              <div className="text-xs text-slate-400">Fallback when sensor unavailable</div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
            Active PIN: <span className="text-slate-200">•••• (Default: 4829)</span>
          </div>
        </div>
      </div>

      {/* Enforcement Policies */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-white mb-4">Biometric Enforcement Policies</h2>
        <div className="space-y-4">
          {/* Policy 1: Rebalancing */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-lg border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Mandatory Biometrics on Automated Rebalancing</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Requires biometric touch confirmation before transmitting batch rebalancing trades across all brokerages.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={biometricSettings.requireForRebalance}
                onChange={e => {
                  onUpdateSettings({ requireForRebalance: e.target.checked });
                  showNotification('Updated rebalancing security policy.');
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Policy 2: Trade threshold */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 gap-3">
            <div>
              <div className="text-xs font-semibold text-white">Trade Order Biometric Threshold</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Orders with total consideration exceeding this dollar threshold trigger a biometric prompt.
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">$</span>
              <input
                type="number"
                step="500"
                min="0"
                value={biometricSettings.requireForTradesOver}
                onChange={e => {
                  onUpdateSettings({ requireForTradesOver: parseInt(e.target.value) || 0 });
                }}
                className="w-28 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Policy 3: API secrets */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-lg border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Protect Brokerage API Secrets</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Masks Alpaca, Coinbase, and IBKR API secret keys until verified with Touch ID or Face ID.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={biometricSettings.requireForApiKeys}
                onChange={e => {
                  onUpdateSettings({ requireForApiKeys: e.target.checked });
                  showNotification('Updated API credential security policy.');
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Policy 4: Inactivity Lock */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-lg border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Inactivity Session Auto-Lock</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Automatically obfuscates portfolio values and locks trading after idle period.
              </div>
            </div>
            <select
              value={biometricSettings.autoLockMinutes}
              onChange={e => {
                onUpdateSettings({ autoLockMinutes: parseInt(e.target.value) });
                showNotification(`Auto-lock interval set to ${e.target.value} minutes.`);
              }}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value={5}>5 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={0}>Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Biometric Audit Trail Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Biometric Security Audit Log</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographic hardware verification records and session authorizations.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{biometricLogs.length} events logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Authorized</th>
                <th className="py-3 px-4">Auth Method</th>
                <th className="py-3 px-4">Hardware Device</th>
                <th className="py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {biometricLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{log.id}</td>
                  <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-white">{log.action}</td>
                  <td className="py-3 px-4 font-sans text-slate-300 flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{log.method}</span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 truncate max-w-[200px]">{log.device}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
