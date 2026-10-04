import { Asset, AssetClass, PortfolioHolding, RebalanceProposal, RebalanceTrade, RiskProfile } from '../types';

export function calculatePortfolioHoldings(
  rawHoldings: { assetId: string; quantity: number; avgBuyPrice: number }[],
  assets: Asset[],
  riskProfile: RiskProfile,
  cashBalance: number
): { holdings: PortfolioHolding[]; nav: number; totalInvested: number; totalPnL: number; totalPnLPct: number; dayPnL: number; dayPnLPct: number } {
  const assetMap = new Map<string, Asset>(assets.map(a => [a.id, a]));

  let totalHoldingsValue = 0;
  let totalCostBasis = 0;
  let dayPnL = 0;

  const holdingsIntermediate = rawHoldings.map(item => {
    const asset = assetMap.get(item.assetId);
    if (!asset) return null;

    const currentPrice = asset.price;
    const currentValue = item.quantity * currentPrice;
    const costBasis = item.quantity * item.avgBuyPrice;
    const unrealizedPnL = currentValue - costBasis;
    const unrealizedPnLPct = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;
    const itemDayPnL = item.quantity * asset.change24h;

    totalHoldingsValue += currentValue;
    totalCostBasis += costBasis;
    dayPnL += itemDayPnL;

    return {
      assetId: item.assetId,
      symbol: asset.symbol,
      name: asset.name,
      assetClass: asset.assetClass,
      quantity: item.quantity,
      avgBuyPrice: item.avgBuyPrice,
      currentPrice,
      currentValue,
      unrealizedPnL,
      unrealizedPnLPct,
      weightPct: 0, // filled below
      targetWeightPct: 0,
      driftPct: 0
    };
  }).filter(Boolean) as (PortfolioHolding)[];

  const nav = totalHoldingsValue + cashBalance;
  const totalPnL = totalHoldingsValue - totalCostBasis;
  const totalPnLPct = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;
  const dayPnLPct = (nav - dayPnL) > 0 ? (dayPnL / (nav - dayPnL)) * 100 : 0;

  // Compute weights and class targets
  const classWeights: Record<AssetClass, number> = {
    equities: 0,
    crypto: 0,
    fixed_income: 0,
    commodities: 0
  };

  holdingsIntermediate.forEach(h => {
    h.weightPct = nav > 0 ? (h.currentValue / nav) * 100 : 0;
    classWeights[h.assetClass] += h.weightPct;
  });

  // Calculate proportional target weight for each asset within its asset class
  // e.g., if Equities target is 50%, and user has AAPL, NVDA, SPY, apportion proportionally
  const classTotals: Record<AssetClass, number> = {
    equities: 0,
    crypto: 0,
    fixed_income: 0,
    commodities: 0
  };
  holdingsIntermediate.forEach(h => {
    classTotals[h.assetClass] += h.currentValue;
  });

  const holdings = holdingsIntermediate.map(h => {
    const classTargetPct = riskProfile.targetAllocation[h.assetClass] || 0;
    const classTotalVal = classTotals[h.assetClass];
    // Ratio of this asset within its class
    const assetClassShare = classTotalVal > 0 ? h.currentValue / classTotalVal : 1;
    const targetWeightPct = classTargetPct * assetClassShare;
    const driftPct = h.weightPct - targetWeightPct;

    return {
      ...h,
      targetWeightPct,
      driftPct
    };
  });

  return {
    holdings,
    nav,
    totalInvested: totalCostBasis,
    totalPnL,
    totalPnLPct,
    dayPnL,
    dayPnLPct
  };
}

export function generateRebalanceProposal(
  holdings: PortfolioHolding[],
  assets: Asset[],
  riskProfile: RiskProfile,
  nav: number,
  cashBalance: number,
  driftToleranceThreshold: number = 1.5 // 1.5% minimum drift to trigger trade
): RebalanceProposal {
  const assetMap = new Map<string, Asset>(assets.map(a => [a.id, a]));
  const trades: RebalanceTrade[] = [];

  let totalBuyAmount = 0;
  let totalSellAmount = 0;
  let estimatedTaxSavings = 0;
  let maxDriftBefore = 0;

  // Determine target value for each holding based on targetAllocation
  // Group holdings by class
  const classHoldingsMap: Record<AssetClass, PortfolioHolding[]> = {
    equities: [],
    crypto: [],
    fixed_income: [],
    commodities: []
  };

  holdings.forEach(h => {
    classHoldingsMap[h.assetClass].push(h);
    const absDrift = Math.abs(h.driftPct);
    if (absDrift > maxDriftBefore) {
      maxDriftBefore = absDrift;
    }
  });

  // For each class, allocate according to riskProfile.targetAllocation
  const classes: AssetClass[] = ['equities', 'crypto', 'fixed_income', 'commodities'];

  for (const c of classes) {
    const targetClassValue = (riskProfile.targetAllocation[c] / 100) * nav;
    const classList = classHoldingsMap[c];

    if (classList.length === 0) continue;

    // Distribute class target proportionally among existing holdings in that class
    const currentClassVal = classList.reduce((sum, item) => sum + item.currentValue, 0);

    for (const h of classList) {
      const asset = assetMap.get(h.assetId);
      if (!asset) continue;

      const proportion = currentClassVal > 0 ? h.currentValue / currentClassVal : 1 / classList.length;
      const targetVal = targetClassValue * proportion;
      const dollarDiff = targetVal - h.currentValue;
      const weightDiffPct = (dollarDiff / nav) * 100;

      // Only trade if drift exceeds threshold
      if (Math.abs(weightDiffPct) >= driftToleranceThreshold) {
        const action: 'BUY' | 'SELL' = dollarDiff > 0 ? 'BUY' : 'SELL';
        const absAmount = Math.abs(dollarDiff);
        const qty = absAmount / h.currentPrice;

        // Check if selling at a loss (Tax Loss Harvesting)
        const isTaxLossHarvesting = action === 'SELL' && h.currentPrice < h.avgBuyPrice;
        let taxOffset = 0;
        if (isTaxLossHarvesting) {
          const perShareLoss = h.avgBuyPrice - h.currentPrice;
          taxOffset = perShareLoss * Math.min(qty, h.quantity);
          // Assuming ~25% effective tax rate offset
          estimatedTaxSavings += taxOffset * 0.25;
        }

        if (action === 'BUY') {
          totalBuyAmount += absAmount;
        } else {
          totalSellAmount += absAmount;
        }

        trades.push({
          id: `reb-${h.symbol}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          assetId: h.assetId,
          symbol: h.symbol,
          name: h.name,
          assetClass: h.assetClass,
          action,
          currentWeight: h.weightPct,
          targetWeight: (targetVal / nav) * 100,
          currentValue: h.currentValue,
          targetValue: targetVal,
          quantity: Number(qty.toFixed(qty < 1 ? 4 : 2)),
          price: h.currentPrice,
          totalAmount: Number(absAmount.toFixed(2)),
          brokerageId: asset.defaultBrokerage,
          isTaxLossHarvesting,
          unrealizedLossOffset: isTaxLossHarvesting ? taxOffset : undefined
        });
      }
    }
  }

  // Sort trades: SELL first to generate capital, then BUY
  trades.sort((a, b) => {
    if (a.action === 'SELL' && b.action === 'BUY') return -1;
    if (a.action === 'BUY' && b.action === 'SELL') return 1;
    return b.totalAmount - a.totalAmount;
  });

  const netCashFlow = totalSellAmount - totalBuyAmount;
  const estimatedSlippage = (totalBuyAmount + totalSellAmount) * 0.0008; // 8 bps estimated slippage
  const estimatedBrokerageFees = trades.length * 0.50; // $0.50 avg exchange/routing fee per order

  return {
    id: `prop-${Date.now()}`,
    timestamp: Date.now(),
    riskProfileId: riskProfile.id,
    trades,
    totalBuyAmount,
    totalSellAmount,
    netCashFlow,
    estimatedSlippage,
    estimatedBrokerageFees,
    estimatedTaxSavings,
    maxDriftBefore,
    projectedDriftAfter: 0.18 // Post-rebalance expected residual drift
  };
}
