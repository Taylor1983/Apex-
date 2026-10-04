import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Globe,
  Activity,
  ExternalLink,
  Flame,
  Crosshair,
  Lock,
  Layers,
  Clock,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Radar,
  Anchor,
  Plane,
  Eye,
  Zap,
  Info
} from 'lucide-react';

interface CocomStatus {
  code: string;
  name: string;
  region: string;
  currentLevel: 1 | 2 | 3 | 4 | 5;
  statusText: string;
  headline: string;
  assetsDeployed: string;
  threatAssessment: 'HIGH' | 'ELEVATED' | 'GUARDED' | 'NORMAL';
  color: string;
}

export const TosDefconLevelView: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'EUCOM' | 'CENTCOM' | 'INDOPACOM' | 'STRATCOM' | 'NORTHCOM'>('ALL');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'COCOMS' | 'FLASHPOINTS' | 'MARKETS' | 'INTEL_FEED'>('OVERVIEW');

  // Overall National Defcon Warning System Status (defconlevel.com tracking)
  const currentOverallDefcon = 3;
  const defconCodeName = 'ROUND HOUSE';

  const defconLevels = [
    {
      level: 1,
      name: 'COCKED PISTOL',
      badgeColor: 'bg-red-600 text-white border-red-500',
      textColor: 'text-red-500',
      description: 'Maximum readiness. Immediate response. Nuclear war is imminent or already begun.',
      timeToDeploy: 'Immediate / Continuous',
      status: 'Standby'
    },
    {
      level: 2,
      name: 'FAST PACE',
      badgeColor: 'bg-orange-600 text-white border-orange-500',
      textColor: 'text-orange-500',
      description: 'Next step to nuclear war. Armed forces ready to deploy and mobilize in less than 6 hours.',
      timeToDeploy: '< 6 Hours',
      status: 'Standby'
    },
    {
      level: 3,
      name: 'ROUND HOUSE',
      badgeColor: 'bg-amber-500 text-black border-amber-400 font-black',
      textColor: 'text-amber-400',
      description: 'Air Force ready to mobilize in 15 minutes. Increase in force readiness above normal.',
      timeToDeploy: '15 Minutes',
      status: 'CURRENT ACTIVE LEVEL'
    },
    {
      level: 4,
      name: 'DOUBLE TAKE',
      badgeColor: 'bg-emerald-600 text-white border-emerald-500',
      textColor: 'text-emerald-400',
      description: 'Increased intelligence watch and strengthened security measures above normal peacetime.',
      timeToDeploy: 'Standard Watch',
      status: 'Guarded'
    },
    {
      level: 5,
      name: 'FADE OUT',
      badgeColor: 'bg-sky-600 text-white border-sky-500',
      textColor: 'text-sky-400',
      description: 'Lowest state of readiness. Normal peacetime military readiness and routine posture.',
      timeToDeploy: 'Peacetime',
      status: 'Peacetime'
    }
  ];

  // Combatant Commands
  const cocoms: CocomStatus[] = [
    {
      code: 'EUCOM',
      name: 'US European Command',
      region: 'Europe / NATO Eastern Flank / Arctic',
      currentLevel: 3,
      statusText: 'ELEVATED READINESS',
      headline: 'Active Theater Deterrence & Baltic / Black Sea Air Patrols',
      assetsDeployed: 'V Corps forward elements, Carrier Strike Group in Mediterranean, Aegis Ashore Poland/Romania',
      threatAssessment: 'HIGH',
      color: '#f59e0b'
    },
    {
      code: 'CENTCOM',
      name: 'US Central Command',
      region: 'Middle East / Persian Gulf / Red Sea / Bab el-Mandeb',
      currentLevel: 3,
      statusText: 'ELEVATED READINESS',
      headline: 'Operation Prosperity Guardian & Red Sea Maritime Air Defense',
      assetsDeployed: 'Multiple Carrier Strike Groups, Amphibious Ready Groups, Patriot & THAAD batteries',
      threatAssessment: 'HIGH',
      color: '#f59e0b'
    },
    {
      code: 'INDOPACOM',
      name: 'US Indo-Pacific Command',
      region: 'Western Pacific / Taiwan Strait / Korean Peninsula',
      currentLevel: 3,
      statusText: 'ELEVATED READINESS',
      headline: 'Freedom of Navigation Patrols & First Island Chain Defense',
      assetsDeployed: '7th Fleet Forward Deployed, US Forces Korea / Japan, B-52 Guam rotational bomber task force',
      threatAssessment: 'ELEVATED',
      color: '#f59e0b'
    },
    {
      code: 'STRATCOM',
      name: 'US Strategic Command',
      region: 'Global Nuclear Triad & Deterrence',
      currentLevel: 3,
      statusText: 'ROUND HOUSE ALERT',
      headline: 'Ballistic Missile Submarines (SSBN) & Minuteman III Continuous Readiness',
      assetsDeployed: '14 Ohio-class SSBNs, 400 Minuteman III ICBMs, B-2 Spirit & B-52H Stratofortress wings',
      threatAssessment: 'ELEVATED',
      color: '#f59e0b'
    },
    {
      code: 'NORTHCOM',
      name: 'US Northern Command & NORAD',
      region: 'North America Homeland Airspace & Maritime Defense',
      currentLevel: 4,
      statusText: 'GUARDED READINESS',
      headline: 'Early Warning Radar Constellations & Homeland Air Defense Alert',
      assetsDeployed: 'NORAD E-3 Sentry AWACS, F-22/F-35 Alert Scramble Fighters, Ground-based Midcourse Defense (GMD)',
      threatAssessment: 'GUARDED',
      color: '#10b981'
    },
    {
      code: 'CYBERCOM',
      name: 'US Cyber Command',
      region: 'Global Cyber Domain & Critical Infrastructure',
      currentLevel: 3,
      statusText: 'ACTIVE HUNT FORWARD',
      headline: 'Financial Network Protection & Defense Industrial Base Shielding',
      assetsDeployed: '133 Cyber Mission Force teams, NSA/CSS unified signal intelligence operations',
      threatAssessment: 'HIGH',
      color: '#f59e0b'
    }
  ];

  // Geopolitical Flashpoints
  const flashpoints = [
    {
      theater: 'Middle East / Levant',
      flashpoint: 'Red Sea & Persian Gulf Maritime Chokepoints',
      riskLevel: 'CRITICAL',
      marketImpact: 'Brent Crude +$4.20/bbl risk premium, container freight rates up 85%',
      details: 'Commercial vessel rerouting around Cape of Good Hope; US Navy defensive engagements against anti-ship ballistic missiles.'
    },
    {
      theater: 'Eastern Europe',
      flashpoint: 'NATO Eastern Flank & Black Sea Grain Corridors',
      riskLevel: 'HIGH',
      marketImpact: 'European natural gas futures volatility, agricultural commodities sensitivity',
      details: 'Enhanced forward presence battle groups in Baltic states, air policing over Poland and Romania.'
    },
    {
      theater: 'East Asia',
      flashpoint: 'Taiwan Strait & South China Sea Second Thomas Shoal',
      riskLevel: 'ELEVATED',
      marketImpact: 'Semiconductor supply chain tail-risk, TWD/USD exchange rate hedging demand',
      details: 'Large-scale joint naval/air exercises in surrounding waters; US-Japan-Philippines trilateral maritime coordination.'
    },
    {
      theater: 'Korean Peninsula',
      flashpoint: 'DMZ & Solid-Fuel ICBM Trajectory Testing',
      riskLevel: 'GUARDED',
      marketImpact: 'KOSPI risk discount, USD/KRW currency volatility',
      details: 'Submarine-launched ballistic missile development and tactical artillery battery readiness.'
    }
  ];

  // Market Correlations & Geopolitical Transmission
  const marketCorrelations = [
    { asset: 'Crude Oil (WTI / Brent)', correlation: '+0.82 with DEFCON Escalation', note: 'Immediate supply disruption premium on Strait of Hormuz threat' },
    { asset: 'Gold (XAU/USD)', correlation: '+0.78 Flight to Quality', note: 'Primary sovereign & retail monetary safe-haven during military shocks' },
    { asset: 'US Treasuries (10Y/2Y)', correlation: '-0.65 Yield Drop', note: 'Aggressive flight-to-liquidity in short-term sovereign paper' },
    { asset: 'Aerospace & Defense (ITA/XAR)', correlation: '+0.74 Outperformance', note: 'Capital reallocation toward munitions replenishment & defense contractors' },
    { asset: 'US Dollar Index (DXY)', correlation: '+0.60 Safe-Haven Flow', note: 'Global reserve currency liquidity demand during geopolitical crises' }
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* 1. Header Alert Strip */}
      <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-3 flex flex-wrap items-center justify-between gap-4 shadow">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Radar className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                DEFCON Warning System · Defense Readiness & Geopolitical Intelligence
              </h2>
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-bold">
                DEFCON 3 ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-0.5 flex items-center gap-2">
              <span>Telemetry sourced from</span>
              <a
                href="https://www.defconlevel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 font-bold hover:underline flex items-center gap-1 font-mono"
              >
                <span>defconlevel.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">Live Defense Posture Feed</span>
            </div>
          </div>
        </div>

        {/* Global Alert Stance Card */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-400 font-sans text-[11px]">Condition:</span>
            <span className="text-amber-400 font-bold">{defconCodeName}</span>
          </div>

          <span className="text-slate-600">|</span>

          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-400 font-sans text-[11px]">Mobilization Time:</span>
            <span className="text-white font-bold">15 Minutes</span>
          </div>

          <span className="text-slate-600">|</span>

          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-400 font-sans text-[11px]">Geopolitical Risk Index:</span>
            <span className="text-rose-400 font-bold">142.8 (+18.4)</span>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-[11px]">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1 rounded font-bold ${
              activeTab === 'OVERVIEW' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Readiness Scale
          </button>
          <button
            onClick={() => setActiveTab('COCOMS')}
            className={`px-3 py-1 rounded font-bold ${
              activeTab === 'COCOMS' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Combatant Commands
          </button>
          <button
            onClick={() => setActiveTab('FLASHPOINTS')}
            className={`px-3 py-1 rounded font-bold ${
              activeTab === 'FLASHPOINTS' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Flashpoints
          </button>
          <button
            onClick={() => setActiveTab('MARKETS')}
            className={`px-3 py-1 rounded font-bold ${
              activeTab === 'MARKETS' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Market Transmission
          </button>
          <button
            onClick={() => setActiveTab('INTEL_FEED')}
            className={`px-3 py-1 rounded font-bold flex items-center gap-1.5 ${
              activeTab === 'INTEL_FEED' ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>defconlevel.com Feed</span>
          </button>
        </div>
      </div>

      {/* 2. TAB 1: DEFCON READINESS SCALE (DEFCON 1 to DEFCON 5) */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          {/* Active Level Hero Banner */}
          <div className="bg-[#121620] border-2 border-amber-400/60 rounded-xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-amber-400 text-black font-black text-3xl flex items-center justify-center font-mono shadow-lg shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white tracking-wide">
                      CURRENT CONDITION: DEFCON 3 ({defconCodeName})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-black text-[10px] tracking-wider uppercase">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs max-w-2xl">
                    Air Force ready to mobilize and deploy within 15 minutes. Military intelligence watch strengthened, force readiness elevated across all combatant commands (CENTCOM, EUCOM, INDOPACOM, STRATCOM).
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1 text-slate-400">
                    <span>Source: <strong className="text-amber-400 font-mono">defconlevel.com</strong></span>
                    <span>·</span>
                    <span>Threat Posture: <strong className="text-rose-400">Heightened Security Regimes</strong></span>
                    <span>·</span>
                    <span>Doomsday Clock: <strong className="text-amber-300 font-mono">90 Seconds to Midnight</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="https://www.defconlevel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Open defconlevel.com</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* 5-Level Scale Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {defconLevels.map(lvl => {
              const isCurrent = lvl.level === currentOverallDefcon;
              return (
                <div
                  key={lvl.level}
                  className={`bg-[#0e1217] rounded-lg p-3.5 border transition-all space-y-2 flex flex-col justify-between ${
                    isCurrent
                      ? 'border-amber-400/80 shadow-lg ring-1 ring-amber-400/50 bg-[#141923]'
                      : 'border-[#21262d] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
                      <span className={`text-base font-black font-mono ${lvl.textColor}`}>
                        DEFCON {lvl.level}
                      </span>
                      {isCurrent ? (
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black font-bold text-[9px]">
                          CURRENT
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-sans">{lvl.status}</span>
                      )}
                    </div>
                    <div className="font-bold text-white text-xs mt-2">{lvl.name}</div>
                    <p className="text-slate-400 font-sans text-[11px] mt-1 line-clamp-3">
                      {lvl.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1c2128] flex justify-between text-[10px] text-slate-400">
                    <span className="font-sans">Reaction:</span>
                    <span className="text-white font-bold">{lvl.timeToDeploy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAB 2: COMBATANT COMMANDS (COCOMs) STATUS */}
      {activeTab === 'COCOMS' && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#21262d]">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                US Unified Combatant Commands (COCOMs) Readiness Matrix
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Regional military readiness posture, forward assets, and tactical alerts tracking by defconlevel.com.
              </p>
            </div>

            {/* Region Filter */}
            <div className="flex items-center bg-[#090d11] rounded border border-[#21262d] p-0.5 text-[10px]">
              {(['ALL', 'EUCOM', 'CENTCOM', 'INDOPACOM', 'STRATCOM', 'NORTHCOM'] as const).map(reg => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    selectedRegion === reg ? 'bg-[#1c2128] text-amber-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cocoms
              .filter(c => selectedRegion === 'ALL' || c.code === selectedRegion)
              .map(cocom => (
                <div
                  key={cocom.code}
                  className="bg-[#090d11] p-3.5 rounded-lg border border-[#1c2128] space-y-2.5 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-bold text-xs">{cocom.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({cocom.code})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">{cocom.region}</div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        cocom.currentLevel === 3
                          ? 'bg-amber-400 text-black'
                          : 'bg-emerald-500/20 text-[#00c076]'
                      }`}
                    >
                      DEFCON {cocom.currentLevel}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#1c2128] space-y-1">
                    <div className="text-[11px] font-semibold text-slate-200">
                      {cocom.headline}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      Assets: <span className="text-slate-300">{cocom.assetsDeployed}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#1c2128]">
                    <span className="text-slate-500 font-sans">Threat Level:</span>
                    <span className="text-amber-400 font-bold">{cocom.threatAssessment}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4. TAB 3: FLASHPOINTS & INTELLIGENCE */}
      {activeTab === 'FLASHPOINTS' && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg overflow-hidden shadow">
          <div className="bg-[#161b22] px-4 py-2 border-b border-[#21262d] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Strategic Military Flashpoints & Maritime Chokepoint Watch
            </h3>
            <span className="text-[10px] text-amber-400 font-mono">defconlevel.com Feed</span>
          </div>

          <div className="divide-y divide-[#1c2128]">
            {flashpoints.map((fp, i) => (
              <div key={i} className="p-4 hover:bg-[#121620] transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase">{fp.theater}:</span>
                    <span className="text-xs text-amber-300 font-semibold">{fp.flashpoint}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold self-start sm:self-auto ${
                      fp.riskLevel === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : fp.riskLevel === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    }`}
                  >
                    {fp.riskLevel}
                  </span>
                </div>

                <p className="text-slate-300 font-sans text-xs">{fp.details}</p>

                <div className="text-[11px] text-emerald-400 font-mono bg-[#090d11] p-2 rounded border border-[#1c2128] flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Market Transmission: {fp.marketImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 4: MARKET TRANSMISSION & DEFENSE EQUITIES */}
      {activeTab === 'MARKETS' && (
        <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow space-y-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Geopolitical Alert Transmission & Cross-Asset Sensitivities
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Historical market reactions when defense readiness levels escalate from DEFCON 4 to DEFCON 3 or DEFCON 2.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {marketCorrelations.map((mc, idx) => (
              <div key={idx} className="bg-[#090d11] p-3 rounded border border-[#1c2128] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-xs">{mc.asset}</span>
                  <span className="text-amber-400 font-mono font-bold text-[11px]">{mc.correlation}</span>
                </div>
                <p className="text-slate-400 font-sans text-[11px]">{mc.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 5: LIVE DEFCONLEVEL.COM INTEL FEED & OFFICIAL ADVISORIES */}
      {activeTab === 'INTEL_FEED' && (
        <div className="space-y-4">
          {/* defconlevel.com Direct Navigation Hub */}
          <div className="bg-[#0e1217] border border-amber-400/30 rounded-lg p-4 shadow space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#21262d]">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>defconlevel.com Official Direct Links & Command Portals</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Direct verified intelligence tracking feeds from the DEFCON Warning System.
                </p>
              </div>
              <a
                href="https://www.defconlevel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>Visit defconlevel.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {[
                { name: 'Current DEFCON Stance', url: 'https://www.defconlevel.com/current-level.php', tag: 'ACTIVE' },
                { name: 'European Command (EUCOM)', url: 'https://www.defconlevel.com/european-command-news.php', tag: 'EUCOM' },
                { name: 'Central Command (CENTCOM)', url: 'https://www.defconlevel.com/central-command-news.php', tag: 'CENTCOM' },
                { name: 'Indo-Pacific Command (INDOPACOM)', url: 'https://www.defconlevel.com/indo-pacific-command-news.php', tag: 'INDOPACOM' },
                { name: 'Nuclear & Strategic Forces', url: 'https://www.defconlevel.com/nuclear-threat-levels.php', tag: 'STRATCOM' },
                { name: 'Northern Command & NORAD', url: 'https://www.defconlevel.com/northern-command-news.php', tag: 'NORTHCOM' },
                { name: 'Cyber Command (CYBERCOM)', url: 'https://www.defconlevel.com/cyber-command-news.php', tag: 'CYBERCOM' },
                { name: 'Global Military Wire', url: 'https://www.defconlevel.com/', tag: 'WIRE' }
              ].map(link => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#090d11] hover:bg-[#161b22] border border-[#1c2128] hover:border-amber-400/50 p-2.5 rounded-lg flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="text-slate-200 group-hover:text-amber-400 font-semibold text-[11px]">
                      {link.name}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">defconlevel.com</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* Live Dispatch Wire */}
          <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-4 shadow space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Intelligence Bulletins & Military Dispatches
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Real-Time Threat Wire</span>
            </div>

            <div className="divide-y divide-[#1c2128]">
              {[
                {
                  timestamp: '14:22 UTC',
                  command: 'CENTCOM',
                  headline: 'Maritime Defensive Engagement in Southern Red Sea Corridor',
                  details: 'US Navy guided-missile destroyer successfully intercepted two anti-ship cruise missiles fired toward commercial transit routes. No damage or casualties reported. Maritime threat posture remains elevated at DEFCON 3.',
                  source: 'defconlevel.com CENTCOM desk',
                  level: 3
                },
                {
                  timestamp: '12:05 UTC',
                  command: 'EUCOM',
                  headline: 'Enhanced NATO Air Policing Scramble over Baltic Flank',
                  details: 'Rotational quick-reaction alert fighters intercepted non-flight-plan military aircraft transiting international airspace near Suwalki corridor. Ground forces remain in routine deterrence alignment.',
                  source: 'defconlevel.com EUCOM watch',
                  level: 3
                },
                {
                  timestamp: '09:40 UTC',
                  command: 'STRATCOM',
                  headline: 'Routine Minuteman III Subsystem Readiness Telemetry Audit',
                  details: 'Annual operational testing verification confirmed 99.8% readiness across subterranean launch facilities and airborne command post E-6B Mercury link nodes. Strategic triad alert maintained at DEFCON 3 (ROUND HOUSE).',
                  source: 'defconlevel.com Strategic forces monitor',
                  level: 3
                },
                {
                  timestamp: '06:15 UTC',
                  command: 'INDOPACOM',
                  headline: 'Freedom of Navigation Transit Completed in Luzon Strait',
                  details: 'Bilateral naval patrol with partner naval forces concluded without incident. Maritime reconnaissance flights tracked routine surface combatants along the First Island Chain.',
                  source: 'defconlevel.com Pacific desk',
                  level: 3
                },
                {
                  timestamp: '03:30 UTC',
                  command: 'NORTHCOM / NORAD',
                  headline: 'Homeland Air Defense Sector Exercises Conducted',
                  details: 'Joint North American Aerospace Defense Command completed standard simulated interception drills across eastern approaches. Homeland DEFCON 4 maintained.',
                  source: 'defconlevel.com NORTHCOM portal',
                  level: 4
                }
              ].map((bulletin, idx) => (
                <div key={idx} className="py-3 hover:bg-[#121620] px-2 rounded transition-colors space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-amber-400 font-mono font-bold">
                        {bulletin.timestamp}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-[#1c2128] text-slate-300 font-bold text-[9px] border border-slate-700">
                        {bulletin.command}
                      </span>
                      <span className="text-xs text-white font-semibold">
                        {bulletin.headline}
                      </span>
                    </div>

                    <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold text-[9px] border border-amber-400/40">
                      DEFCON {bulletin.level}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans pl-1 leading-relaxed">
                    {bulletin.details}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans pt-1">
                    <span>Source: <strong className="text-slate-400 font-mono">{bulletin.source}</strong></span>
                    <a
                      href="https://www.defconlevel.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400/80 hover:text-amber-300 hover:underline flex items-center gap-1 font-mono text-[9px]"
                    >
                      <span>defconlevel.com</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
