import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  Sliders,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { AssetClass, RiskProfile, RiskProfileType } from '../types';
import { RISK_PROFILES } from '../data/initialData';

interface RiskProfileManagerProps {
  currentRiskProfile: RiskProfile;
  onUpdateRiskProfile: (profile: RiskProfile) => void;
  portfolioNav: number;
}

export const RiskProfileManager: React.FC<RiskProfileManagerProps> = ({
  currentRiskProfile,
  onUpdateRiskProfile,
  portfolioNav
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'questionnaire' | 'custom' | 'stress'>('profiles');

  // Questionnaire state
  const [answers, setAnswers] = useState<Record<number, number>>({
    1: 2, // 5-10 years
    2: 2, // Stay calm
    3: 2, // Balanced
    4: 1, // 5-10% crypto
    5: 2  // Low liquidity need
  });
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [recommendedProfileId, setRecommendedProfileId] = useState<RiskProfileType>('balanced');

  // Custom allocation state
  const [customAllocation, setCustomAllocation] = useState<Record<AssetClass, number>>({
    equities: currentRiskProfile.targetAllocation.equities,
    crypto: currentRiskProfile.targetAllocation.crypto,
    fixed_income: currentRiskProfile.targetAllocation.fixed_income,
    commodities: currentRiskProfile.targetAllocation.commodities
  });
  const [customCash, setCustomCash] = useState<number>(currentRiskProfile.targetCashPct);

  // Questionnaire questions
  const questions = [
    {
      id: 1,
      title: 'What is your primary investment time horizon?',
      options: [
        { text: 'Short-term (1 - 2 years) - Capital safety critical', score: 10 },
        { text: 'Medium-term (3 - 5 years) - Planned future expenditure', score: 25 },
        { text: 'Long-term (5 - 10 years) - Wealth accumulation', score: 45 },
        { text: 'Multi-decade (10+ years) - Intergenerational growth', score: 60 }
      ]
    },
    {
      id: 2,
      title: 'How would you react if your portfolio dropped 15% during a sharp market correction?',
      options: [
        { text: 'Liquidate all positions to prevent further losses', score: 5 },
        { text: 'Shift capital defensively into government bonds and cash', score: 20 },
        { text: 'Maintain my target asset allocation and wait for recovery', score: 40 },
        { text: 'Opportunistically deploy additional cash to buy discounted assets', score: 65 }
      ]
    },
    {
      id: 3,
      title: 'What is your primary financial objective?',
      options: [
        { text: 'Preserve nominal capital with minimal volatility', score: 10 },
        { text: 'Generate steady coupon income and outpace inflation', score: 25 },
        { text: 'Balanced capital appreciation and shock absorption', score: 45 },
        { text: 'Aggressive capital expansion and asymmetric alpha', score: 65 }
      ]
    },
    {
      id: 4,
      title: 'What is your comfort level with high-volatility digital assets (Bitcoin, Ethereum)?',
      options: [
        { text: 'Strictly zero exposure (unacceptable risk)', score: 0 },
        { text: 'Conservative hedge (1% - 3% allocation)', score: 25 },
        { text: 'Balanced exposure (5% - 10% allocation)', score: 50 },
        { text: 'High conviction technological upside (12% - 20%+ allocation)', score: 75 }
      ]
    },
    {
      id: 5,
      title: 'Do you anticipate needing to withdraw more than 20% of this portfolio in the next 24 months?',
      options: [
        { text: 'Yes, high probability of major cash withdrawal', score: 5 },
        { text: 'Possible, depending on market or personal contingencies', score: 25 },
        { text: 'Unlikely, this portfolio is dedicated long-term capital', score: 50 }
      ]
    }
  ];

  const handleComputeQuestionnaire = () => {
    let totalScore = 0;
    questions.forEach(q => {
      const selectedOptionIdx = answers[q.id] || 0;
      totalScore += q.options[selectedOptionIdx].score;
    });

    let profileKey: RiskProfileType = 'balanced';
    if (totalScore <= 65) profileKey = 'conservative';
    else if (totalScore <= 125) profileKey = 'moderately_conservative';
    else if (totalScore <= 190) profileKey = 'balanced';
    else if (totalScore <= 250) profileKey = 'growth';
    else profileKey = 'aggressive_growth';

    setRecommendedProfileId(profileKey);
    setSurveyCompleted(true);
  };

  const handleApplyCustomAllocation = () => {
    const customProfile: RiskProfile = {
      id: 'custom',
      name: 'Custom Tailored Portfolio',
      description: 'Investor defined custom target allocation across multi-asset classes.',
      targetAllocation: { ...customAllocation },
      targetCashPct: customCash,
      maxDrawdownTolerance: 20,
      expectedReturnAnnual: 10.5,
      expectedVolatilityAnnual: 13.5,
      recommendedTimeHorizonYears: 'Flexible'
    };
    onUpdateRiskProfile(customProfile);
    setActiveTab('profiles');
  };

  const normalizeCustomAllocation = () => {
    const sum = customAllocation.equities + customAllocation.crypto + customAllocation.fixed_income + customAllocation.commodities + customCash;
    if (sum === 0) return;
    const factor = 100 / sum;
    setCustomAllocation({
      equities: Math.round(customAllocation.equities * factor),
      crypto: Math.round(customAllocation.crypto * factor),
      fixed_income: Math.round(customAllocation.fixed_income * factor),
      commodities: Math.round(customAllocation.commodities * factor)
    });
    setCustomCash(Math.max(0, 100 - (Math.round(customAllocation.equities * factor) + Math.round(customAllocation.crypto * factor) + Math.round(customAllocation.fixed_income * factor) + Math.round(customAllocation.commodities * factor))));
  };

  // Stress test scenarios
  const stressScenarios = [
    {
      id: 'covid2020',
      title: 'March 2020 Global Liquidity Shock',
      description: 'Rapid broad-market selloff followed by swift central bank stimulus injection.',
      shocks: { equities: -34, crypto: -48, fixed_income: 14, commodities: -24 }
    },
    {
      id: 'inflation2022',
      title: '2022 Fed Tightening & Inflation Regime',
      description: 'Simultaneous equity & duration bond drawdown triggered by rapid rate hikes.',
      shocks: { equities: -19, crypto: -65, fixed_income: -32, commodities: 22 }
    },
    {
      id: 'techrally',
      title: 'AI Paradigm & Tech Expansion Surge',
      description: 'Strong bull market favoring technology mega-caps and digital assets.',
      shocks: { equities: 42, crypto: 120, fixed_income: -4, commodities: 8 }
    },
    {
      id: 'stagflation',
      title: '1970s Style Geopolitical Stagflation',
      description: 'Sustained energy price shocks, elevated inflation, and equity contraction.',
      shocks: { equities: -16, crypto: -25, fixed_income: -15, commodities: 45 }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight">Investor Risk Profiling & Asset Modeling</h1>
            <span className="text-xs text-emerald-400 font-mono">Modern Portfolio Theory</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Currently targeted at <strong className="text-white">{currentRiskProfile.name}</strong>. Rebalancing tools automatically align holdings to this profile.
          </p>

          {/* Risk-Free Rate Benchmark Bar */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400 font-sans">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Benchmark Risk-Free Rate (r_f):
            </span>
            <span className="text-amber-400 font-bold">4.25%</span>
            <span className="text-slate-500 font-sans text-[11px]">(US 3M Treasury / SOFR Hurdle)</span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="text-slate-400 font-sans">Equity Risk Premium (ERP):</span>
            <span className="text-emerald-400 font-bold">
              +{Number((currentRiskProfile.expectedReturnAnnual - 4.25).toFixed(2))}% / yr
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'profiles' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk Profiles
          </button>
          <button
            onClick={() => setActiveTab('questionnaire')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'questionnaire' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk Questionnaire
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'custom' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Allocator
          </button>
          <button
            onClick={() => setActiveTab('stress')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'stress' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stress Tests
          </button>
        </div>
      </div>

      {/* TAB 1: STANDARD RISK PROFILES */}
      {activeTab === 'profiles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.values(RISK_PROFILES).map(profile => {
            const isActive = currentRiskProfile.id === profile.id;

            return (
              <div
                key={profile.id}
                className={`bg-slate-900 rounded-xl p-5 border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-base font-semibold text-white tracking-tight">{profile.name}</h2>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 min-h-[38px]">{profile.description}</p>

                  {/* Allocation Distribution */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">Equities / Stocks</span>
                      <span className="text-blue-400 font-semibold">{profile.targetAllocation.equities}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">Crypto / Digital Assets</span>
                      <span className="text-purple-400 font-semibold">{profile.targetAllocation.crypto}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">Fixed Income / Bonds</span>
                      <span className="text-emerald-400 font-semibold">{profile.targetAllocation.fixed_income}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">Commodities & Gold</span>
                      <span className="text-amber-400 font-semibold">{profile.targetAllocation.commodities}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans">Target Cash Reserve</span>
                      <span className="text-slate-300 font-semibold">{profile.targetCashPct}%</span>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/60 text-xs font-mono">
                    <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-sans">Expected Return</div>
                      <div className="text-emerald-400 font-semibold">~{profile.expectedReturnAnnual}% / yr</div>
                    </div>
                    <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-sans">Max Drawdown Tol</div>
                      <div className="text-rose-400 font-semibold">-{profile.maxDrawdownTolerance}%</div>
                    </div>
                    <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-sans">Risk-Free Rate (r_f)</div>
                      <div className="text-amber-400 font-semibold">4.25% <span className="text-[9px] text-slate-500 font-sans">US 3M</span></div>
                    </div>
                    <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-sans">Excess Alpha (ERP)</div>
                      <div className="text-sky-400 font-semibold">
                        {profile.expectedReturnAnnual >= 4.25 ? '+' : ''}{Number((profile.expectedReturnAnnual - 4.25).toFixed(2))}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  {isActive ? (
                    <div className="w-full py-2 text-center text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      Target Profile Active
                    </div>
                  ) : (
                    <button
                      onClick={() => onUpdateRiskProfile(profile)}
                      className="w-full py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 hover:text-emerald-400 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                    >
                      Set as Target Profile
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: RISK QUESTIONNAIRE */}
      {activeTab === 'questionnaire' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-semibold text-white">Investor Suitability & Risk Assessment</h2>
            <p className="text-xs text-slate-400 mt-1">
              Answer the following institutional risk questions to calculate your risk tolerance and find your optimal multi-asset target allocation.
            </p>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-2.5">
                <div className="text-xs font-semibold text-slate-200">
                  <span className="text-emerald-400 font-mono mr-1.5">{idx + 1}.</span>
                  {q.title}
                </div>
                <div className="space-y-1.5 pl-4">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    return (
                      <label
                        key={optIdx}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={isSelected}
                          onChange={() => {}}
                          className="accent-emerald-500"
                        />
                        <span>{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleComputeQuestionnaire}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Analyze Risk Score & Suggest Target
            </button>

            {surveyCompleted && (
              <div className="flex items-center gap-3 animate-in fade-in">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Suggested Profile</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    {RISK_PROFILES[recommendedProfileId]?.name}
                  </div>
                </div>
                <button
                  onClick={() => {
                    onUpdateRiskProfile(RISK_PROFILES[recommendedProfileId]);
                    setActiveTab('profiles');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium rounded-lg border border-slate-700 cursor-pointer"
                >
                  Apply Suggestion
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM ALLOCATION BUILDER */}
      {activeTab === 'custom' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Custom Allocation Builder</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust multi-asset class target percentages. The sum must equal 100%.
              </p>
            </div>
            <button
              onClick={normalizeCustomAllocation}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Normalize to 100%
            </button>
          </div>

          <div className="space-y-4 font-mono">
            {/* Equities */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-sans text-slate-200">Equities / Stocks</span>
                <span className="text-blue-400 font-semibold">{customAllocation.equities}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                value={customAllocation.equities}
                onChange={e => setCustomAllocation(prev => ({ ...prev, equities: parseInt(e.target.value) || 0 }))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Crypto */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-sans text-slate-200">Crypto / Digital Assets</span>
                <span className="text-purple-400 font-semibold">{customAllocation.crypto}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={customAllocation.crypto}
                onChange={e => setCustomAllocation(prev => ({ ...prev, crypto: parseInt(e.target.value) || 0 }))}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Fixed Income */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-sans text-slate-200">Fixed Income / Bonds</span>
                <span className="text-emerald-400 font-semibold">{customAllocation.fixed_income}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={customAllocation.fixed_income}
                onChange={e => setCustomAllocation(prev => ({ ...prev, fixed_income: parseInt(e.target.value) || 0 }))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Commodities */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-sans text-slate-200">Commodities / Real Assets</span>
                <span className="text-amber-400 font-semibold">{customAllocation.commodities}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={customAllocation.commodities}
                onChange={e => setCustomAllocation(prev => ({ ...prev, commodities: parseInt(e.target.value) || 0 }))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Cash */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-sans text-slate-200">Cash Reserve</span>
                <span className="text-slate-300 font-semibold">{customCash}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={customCash}
                onChange={e => setCustomCash(parseInt(e.target.value) || 0)}
                className="w-full accent-slate-400"
              />
            </div>
          </div>

          {/* Sum Check */}
          {(() => {
            const sum = customAllocation.equities + customAllocation.crypto + customAllocation.fixed_income + customAllocation.commodities + customCash;
            return (
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-sans">Total Allocation:</span>
                  <span className={`font-semibold ${sum === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {sum}% {sum !== 100 && '(Must equal 100%)'}
                  </span>
                </div>
                <button
                  onClick={handleApplyCustomAllocation}
                  disabled={sum !== 100}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-sans font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Save Custom Risk Profile
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 4: HISTORICAL STRESS TESTS */}
      {activeTab === 'stress' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Simulate how your current multi-asset target allocation would perform under severe historical market stress regimes.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stressScenarios.map(sc => {
              // Calculate estimated portfolio dollar & pct change
              const eqImpact = (currentRiskProfile.targetAllocation.equities / 100) * (sc.shocks.equities / 100);
              const crImpact = (currentRiskProfile.targetAllocation.crypto / 100) * (sc.shocks.crypto / 100);
              const fiImpact = (currentRiskProfile.targetAllocation.fixed_income / 100) * (sc.shocks.fixed_income / 100);
              const coImpact = (currentRiskProfile.targetAllocation.commodities / 100) * (sc.shocks.commodities / 100);

              const totalPct = (eqImpact + crImpact + fiImpact + coImpact) * 100;
              const totalDollar = portfolioNav * (totalPct / 100);

              return (
                <div key={sc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{sc.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{sc.description}</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className={`text-base font-bold ${totalPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {totalPct >= 0 ? '+' : ''}{totalPct.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">
                        {totalDollar >= 0 ? '+' : ''}${Math.abs(totalDollar).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-center">
                    <div className="bg-slate-950 p-1.5 rounded">
                      <div className="text-slate-500 font-sans">Stocks</div>
                      <div className={sc.shocks.equities >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {sc.shocks.equities > 0 ? '+' : ''}{sc.shocks.equities}%
                      </div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded">
                      <div className="text-slate-500 font-sans">Crypto</div>
                      <div className={sc.shocks.crypto >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {sc.shocks.crypto > 0 ? '+' : ''}{sc.shocks.crypto}%
                      </div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded">
                      <div className="text-slate-500 font-sans">Bonds</div>
                      <div className={sc.shocks.fixed_income >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {sc.shocks.fixed_income > 0 ? '+' : ''}{sc.shocks.fixed_income}%
                      </div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded">
                      <div className="text-slate-500 font-sans">Commodities</div>
                      <div className={sc.shocks.commodities >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {sc.shocks.commodities > 0 ? '+' : ''}{sc.shocks.commodities}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
