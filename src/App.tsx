import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_ASSETS,
  INITIAL_HOLDINGS_RAW,
  INITIAL_CASH_BALANCE,
  RISK_PROFILES,
  INITIAL_BROKERAGES,
  INITIAL_ORDERS,
  INITIAL_BIOMETRIC_SETTINGS,
  INITIAL_BIOMETRIC_LOGS
} from './data/initialData';
import {
  Asset,
  BiometricLogEntry,
  BiometricSettings,
  BrokerageGateway as IBrokerageGateway,
  OrderSide,
  PortfolioMetrics,
  RebalanceProposal,
  RiskProfile,
  TradeOrder,
  PlatformLayoutVariation,
  AccountType,
  OptionSpreadDetails
} from './types';
import { CANADIAN_ACCOUNTS, ACCOUNT_PORTFOLIOS, CAD_USD_EXCHANGE_RATE } from './data/canadianMarketData';
import { calculatePortfolioHoldings } from './services/rebalancer';
import { createAuditLog } from './services/biometricService';
import { TosHeader } from './components/TosHeader';
import { TosLeftSidebar } from './components/TosLeftSidebar';
import { TosBottomOrderBar } from './components/TosBottomOrderBar';
import { TosMonitorView } from './components/TosMonitorView';
import { TosAccountStatementView } from './components/TosAccountStatementView';
import { MultiAssetTrading } from './components/MultiAssetTrading';
import { TosChartsView } from './components/TosChartsView';
import { TosOptionsChain } from './components/TosOptionsChain';
import { TosVolatilitySkewView } from './components/TosVolatilitySkewView';
import { TosStrategyRiskProfiles } from './components/TosStrategyRiskProfiles';
import { TosProbabilityAnalysisView } from './components/TosProbabilityAnalysisView';
import { TosVolatilitySurfaceView } from './components/TosVolatilitySurfaceView';
import { TosGlobalMacroView } from './components/TosGlobalMacroView';
import { TosCanadianLiveDataView } from './components/TosCanadianLiveDataView';
import { TosMarketDepthView } from './components/TosMarketDepthView';
import { TosPlatformLayoutManager } from './components/TosPlatformLayoutManager';
import { ResetAccountModal } from './components/ResetAccountModal';
import { RiskProfileManager } from './components/RiskProfileManager';
import { AutomatedRebalancer } from './components/AutomatedRebalancer';
import { BrokerageGateway } from './components/BrokerageGateway';
import { BiometricSecurityView } from './components/BiometricSecurityView';
import { BiometricModal } from './components/BiometricModal';
import { Lock, Fingerprint } from 'lucide-react';

export default function App() {
  // thinkorswim Workspace Navigation Tabs
  const [currentTab, setCurrentTab] = useState<'monitor' | 'statement' | 'trade' | 'charts' | 'depth' | 'options' | 'analyze' | 'macro' | 'canadian_live' | 'rebalance' | 'brokerages' | 'security'>('charts');
  
  // Active Symbol Linking System (thinkorswim [1] Tag)
  const [activeSymbol, setActiveSymbol] = useState<string>('SHOP.TO');

  // Layout Docks Toggle
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [bottomBarOpen, setBottomBarOpen] = useState<boolean>(true);

  // Platform Layout Variation (Classic Dock, Split Dual, Quad Grid, Triple Command, Cinema Focus)
  const [layoutVariation, setLayoutVariation] = useState<PlatformLayoutVariation>('CLASSIC_DOCK');

  // Active Canadian / US Account Switcher (Canadian Margin, TFSA, RRSP, RESP & US Accounts)
  const [currentAccount, setCurrentAccount] = useState<AccountType>('CA_MARGIN');

  // paperMoney vs Live Trading Mode & Reset Account State
  const [isPaperTrading, setIsPaperTrading] = useState<boolean>(false);
  const [isResetAccountModalOpen, setIsResetAccountModalOpen] = useState<boolean>(false);

  // Analyze sub-view toggle
  const [analyzeSubView, setAnalyzeSubView] = useState<'STRATEGY_RISK_PROFILES' | 'PROBABILITY_CONES' | 'VOL_SURFACE' | 'VOL_SKEW' | 'PROFILES'>('STRATEGY_RISK_PROFILES');

  // Quick prefill for bottom order bar
  const [prefillOrder, setPrefillOrder] = useState<{
    symbol: string;
    side: OrderSide;
    price: number;
    optionDetails?: { strike: number; expiration: string; optionType: 'CALL' | 'PUT' };
    optionSpreadDetails?: OptionSpreadDetails;
    isSimulated?: boolean;
  } | null>(null);

  // Multi-Account Portfolio Data Storage (Preserves holdings, cash, and orders per account)
  const [accountStorage, setAccountStorage] = useState<Record<AccountType, {
    cashBalance: number;
    rawHoldings: { assetId: string; quantity: number; avgBuyPrice: number }[];
    orders: TradeOrder[];
  }>>(() => ({
    CA_MARGIN: {
      cashBalance: ACCOUNT_PORTFOLIOS.CA_MARGIN.cashBalance,
      rawHoldings: ACCOUNT_PORTFOLIOS.CA_MARGIN.holdings,
      orders: [
        {
          id: 'ord-camrg-01',
          symbol: 'SHOP.TO',
          name: 'Shopify Inc.',
          assetClass: 'equities',
          side: 'BUY',
          type: 'LIMIT',
          quantity: 150,
          price: 98.40,
          totalAmount: 14760.00,
          brokerageId: 'ibkr',
          status: 'FILLED',
          timestamp: Date.now() - 3600000 * 24 * 3,
          fillPrice: 98.40,
          fillTimestamp: Date.now() - 3600000 * 24 * 3,
          executionLatencyMs: 14,
          biometricConfirmed: true
        },
        {
          id: 'ord-camrg-02',
          symbol: 'RY.TO',
          name: 'Royal Bank of Canada',
          assetClass: 'equities',
          side: 'BUY',
          type: 'LIMIT',
          quantity: 100,
          price: 152.00,
          totalAmount: 15200.00,
          brokerageId: 'ibkr',
          status: 'FILLED',
          timestamp: Date.now() - 3600000 * 24 * 5,
          fillPrice: 152.00,
          fillTimestamp: Date.now() - 3600000 * 24 * 5,
          executionLatencyMs: 12,
          biometricConfirmed: true
        },
        {
          id: 'ord-camrg-03',
          symbol: 'SHOP.TO 23 OCT 26 120 CALL',
          name: 'Shopify Inc. CALL Option',
          assetClass: 'options',
          side: 'BUY',
          type: 'LIMIT',
          quantity: 5,
          price: 4.80,
          totalAmount: 2400.00,
          brokerageId: 'ibkr',
          status: 'FILLED',
          timestamp: Date.now() - 3600000 * 4,
          fillPrice: 4.80,
          fillTimestamp: Date.now() - 3600000 * 4,
          executionLatencyMs: 15,
          biometricConfirmed: true
        }
      ]
    },
    CA_TFSA: {
      cashBalance: ACCOUNT_PORTFOLIOS.CA_TFSA.cashBalance,
      rawHoldings: ACCOUNT_PORTFOLIOS.CA_TFSA.holdings,
      orders: [
        {
          id: 'ord-tfsa-01',
          symbol: 'SHOP.TO',
          name: 'Shopify Inc.',
          assetClass: 'equities',
          side: 'BUY',
          type: 'LIMIT',
          quantity: 120,
          price: 94.20,
          totalAmount: 11304.00,
          brokerageId: 'ibkr',
          status: 'FILLED',
          timestamp: Date.now() - 3600000 * 24 * 8,
          fillPrice: 94.20,
          fillTimestamp: Date.now() - 3600000 * 24 * 8,
          executionLatencyMs: 11,
          biometricConfirmed: true
        },
        {
          id: 'ord-tfsa-02',
          symbol: 'XIU.TO',
          name: 'iShares S&P/TSX 60 ETF',
          assetClass: 'equities',
          side: 'BUY',
          type: 'MARKET',
          quantity: 500,
          price: 35.10,
          totalAmount: 17550.00,
          brokerageId: 'ibkr',
          status: 'FILLED',
          timestamp: Date.now() - 3600000 * 24 * 14,
          fillPrice: 35.10,
          fillTimestamp: Date.now() - 3600000 * 24 * 14,
          executionLatencyMs: 16,
          biometricConfirmed: true
        }
      ]
    },
    CA_RRSP: {
      cashBalance: ACCOUNT_PORTFOLIOS.CA_RRSP.cashBalance,
      rawHoldings: ACCOUNT_PORTFOLIOS.CA_RRSP.holdings,
      orders: [
        {
          id: 'ord-rrsp-01',
          symbol: 'RY.TO',
          name: 'Royal Bank of Canada',
          assetClass: 'equities',
          side: 'BUY',
          type: 'LIMIT',
          quantity: 140,
          price: 148.50,
          totalAmount: 20790.00,
          brokerageId: 'ibkr',
          status: 'FILLED',
          timestamp: Date.now() - 3600000 * 24 * 6,
          fillPrice: 148.50,
          fillTimestamp: Date.now() - 3600000 * 24 * 6,
          executionLatencyMs: 10,
          biometricConfirmed: true
        },
        {
          id: 'ord-rrsp-02',
          symbol: 'TD.TO',
          name: 'Toronto-Dominion Bank',
          assetClass: 'equities',
          side: 'BUY',
          type: 'LIMIT',
          quantity: 200,
          price: 79.20,
          totalAmount: 15840.00,
          brokerageId: 'ibkr',
          status: 'FILLED',
          timestamp: Date.now() - 3600000 * 24 * 10,
          fillPrice: 79.20,
          fillTimestamp: Date.now() - 3600000 * 24 * 10,
          executionLatencyMs: 13,
          biometricConfirmed: true
        }
      ]
    },
    CA_RESP: {
      cashBalance: ACCOUNT_PORTFOLIOS.CA_RESP.cashBalance,
      rawHoldings: ACCOUNT_PORTFOLIOS.CA_RESP.holdings,
      orders: [
        {
          id: 'ord-resp-01',
          symbol: 'XIU.TO',
          name: 'iShares S&P/TSX 60 ETF',
          assetClass: 'equities',
          side: 'BUY',
          type: 'MARKET',
          quantity: 400,
          price: 34.50,
          totalAmount: 13800.00,
          brokerageId: 'ibkr',
          status: 'FILLED',
          timestamp: Date.now() - 3600000 * 24 * 4,
          fillPrice: 34.50,
          fillTimestamp: Date.now() - 3600000 * 24 * 4,
          executionLatencyMs: 12,
          biometricConfirmed: true
        }
      ]
    },
    US_MARGIN_PAPER: {
      cashBalance: ACCOUNT_PORTFOLIOS.US_MARGIN_PAPER.cashBalance,
      rawHoldings: ACCOUNT_PORTFOLIOS.US_MARGIN_PAPER.holdings,
      orders: INITIAL_ORDERS
    },
    US_MARGIN_LIVE: {
      cashBalance: ACCOUNT_PORTFOLIOS.US_MARGIN_LIVE.cashBalance,
      rawHoldings: ACCOUNT_PORTFOLIOS.US_MARGIN_LIVE.holdings,
      orders: [INITIAL_ORDERS[0], INITIAL_ORDERS[1]]
    }
  }));

  // Core Market & Portfolio State for Active Account
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [rawHoldings, setRawHoldings] = useState(ACCOUNT_PORTFOLIOS.CA_MARGIN.holdings);
  const [cashBalance, setCashBalance] = useState<number>(ACCOUNT_PORTFOLIOS.CA_MARGIN.cashBalance);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>(RISK_PROFILES.balanced);
  const [brokerages, setBrokerages] = useState<IBrokerageGateway[]>(INITIAL_BROKERAGES);
  const [orders, setOrders] = useState<TradeOrder[]>(() => [
    {
      id: 'ord-camrg-01',
      symbol: 'SHOP.TO',
      name: 'Shopify Inc.',
      assetClass: 'equities',
      side: 'BUY',
      type: 'LIMIT',
      quantity: 150,
      price: 98.40,
      totalAmount: 14760.00,
      brokerageId: 'ibkr',
      status: 'FILLED',
      timestamp: Date.now() - 3600000 * 24 * 3,
      fillPrice: 98.40,
      fillTimestamp: Date.now() - 3600000 * 24 * 3,
      executionLatencyMs: 14,
      biometricConfirmed: true
    },
    {
      id: 'ord-camrg-02',
      symbol: 'RY.TO',
      name: 'Royal Bank of Canada',
      assetClass: 'equities',
      side: 'BUY',
      type: 'LIMIT',
      quantity: 100,
      price: 152.00,
      totalAmount: 15200.00,
      brokerageId: 'ibkr',
      status: 'FILLED',
      timestamp: Date.now() - 3600000 * 24 * 5,
      fillPrice: 152.00,
      fillTimestamp: Date.now() - 3600000 * 24 * 5,
      executionLatencyMs: 12,
      biometricConfirmed: true
    }
  ]);

  // Biometric & Security State
  const [biometricSettings, setBiometricSettings] = useState<BiometricSettings>(INITIAL_BIOMETRIC_SETTINGS);
  const [biometricLogs, setBiometricLogs] = useState<BiometricLogEntry[]>(INITIAL_BIOMETRIC_LOGS);

  // Biometric Modal Control
  const [biometricModal, setBiometricModal] = useState<{
    isOpen: boolean;
    actionTitle: string;
    actionDetails?: string;
    onSuccessCallback: (log: BiometricLogEntry) => void;
  }>({
    isOpen: false,
    actionTitle: '',
    onSuccessCallback: () => {}
  });

  // Simulated Live Price Ticking (Every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prevAssets =>
        prevAssets.map(asset => {
          const volatilityFactor =
            asset.assetClass === 'crypto'
              ? 0.003
              : asset.assetClass === 'equities'
              ? 0.0012
              : 0.0005;

          const randomDelta = (Math.random() - 0.49) * volatilityFactor;
          const newPrice = Math.max(0.1, asset.price * (1 + randomDelta));
          const priceDiff = newPrice - (asset.price - asset.change24h);
          const pctDiff = (priceDiff / (asset.price - asset.change24h)) * 100;

          const newSparkline = [...asset.sparkline.slice(1), newPrice];

          const newBids = [...asset.orderBook.bids];
          const newAsks = [...asset.orderBook.asks];
          if (newBids[0]) newBids[0].price = Number((newPrice - 0.05).toFixed(2));
          if (newAsks[0]) newAsks[0].price = Number((newPrice + 0.05).toFixed(2));

          return {
            ...asset,
            price: Number(newPrice.toFixed(newPrice < 10 ? 4 : 2)),
            change24h: Number(priceDiff.toFixed(2)),
            change24hPct: Number(pctDiff.toFixed(2)),
            sparkline: newSparkline,
            orderBook: {
              bids: newBids,
              asks: newAsks
            }
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Compute live portfolio holdings, NAV, and quantitative metrics
  const portfolioData = useMemo(() => {
    return calculatePortfolioHoldings(rawHoldings, assets, riskProfile, cashBalance);
  }, [rawHoldings, assets, riskProfile, cashBalance]);

  // Compute quantitative metrics
  const metrics: PortfolioMetrics = useMemo(() => {
    const { holdings, nav, totalInvested, totalPnL, totalPnLPct, dayPnL, dayPnLPct } = portfolioData;

    let maxDrift = 0;
    holdings.forEach(h => {
      const absDrift = Math.abs(h.driftPct);
      if (absDrift > maxDrift) maxDrift = absDrift;
    });

    const driftStatus: 'aligned' | 'moderate_drift' | 'critical_drift' =
      maxDrift > 5.0 ? 'critical_drift' : maxDrift > 2.0 ? 'moderate_drift' : 'aligned';

    const weightedBeta = holdings.reduce((acc, h) => {
      const asset = assets.find(a => a.id === h.assetId);
      const beta = asset ? asset.beta : 1.0;
      return acc + (beta * (h.weightPct / 100));
    }, 0);

    return {
      nav,
      cashBalance,
      totalInvested,
      totalPnL,
      totalPnLPct,
      dayPnL,
      dayPnLPct,
      sharpeRatio: 1.84,
      betaVsSPY: weightedBeta || 0.92,
      valueAtRisk95_1D: nav * 0.0165,
      maxDrawdownPeakToTrough: 11.2,
      annualizedVolatility: 13.8,
      driftScore: maxDrift,
      driftStatus
    };
  }, [portfolioData, assets, cashBalance]);

  // Selected asset ID resolved from activeSymbol
  const selectedAssetId = useMemo(() => {
    const asset = assets.find(a => a.symbol === activeSymbol);
    return asset ? asset.id : 'shop_to';
  }, [assets, activeSymbol]);

  // Handle Account Selection (Canadian Margin, TFSA, RRSP, RESP, US Paper, US Live)
  const handleSelectAccount = useCallback((newAccount: AccountType) => {
    // 1. Save current active account's state to accountStorage
    setAccountStorage(prev => ({
      ...prev,
      [currentAccount]: {
        cashBalance,
        rawHoldings,
        orders
      }
    }));

    // 2. Set active account ID
    setCurrentAccount(newAccount);

    // 3. Restore state for new account
    const target = accountStorage[newAccount] || {
      cashBalance: ACCOUNT_PORTFOLIOS[newAccount]?.cashBalance || 50000,
      rawHoldings: ACCOUNT_PORTFOLIOS[newAccount]?.holdings || [],
      orders: []
    };

    setCashBalance(target.cashBalance);
    setRawHoldings(target.rawHoldings);
    setOrders(target.orders);

    // 4. Sync paperMoney vs live mode
    if (newAccount === 'US_MARGIN_PAPER') {
      setIsPaperTrading(true);
    } else {
      setIsPaperTrading(false);
    }

    // 5. Default symbol to TSX or US stock appropriately
    const accMeta = CANADIAN_ACCOUNTS[newAccount];
    if (accMeta && accMeta.country === 'CA' && !activeSymbol.endsWith('.TO')) {
      setActiveSymbol('SHOP.TO');
    } else if (accMeta && accMeta.country === 'US' && activeSymbol.endsWith('.TO')) {
      setActiveSymbol('NVDA');
    }

    const log = createAuditLog(
      `Switched Active Account to ${accMeta ? accMeta.name : newAccount} (${accMeta ? accMeta.accountNumber : ''})`,
      'WebAuthn FaceID',
      true
    );
    setBiometricLogs(prev => [log, ...prev]);
  }, [currentAccount, cashBalance, rawHoldings, orders, accountStorage, activeSymbol]);

  // Execute single trade order
  const handleExecuteTrade = useCallback((order: TradeOrder) => {
    // Resolve target assetId (e.g. SHOP.TO -> shop_to, AAPL -> aapl)
    const targetAssetId = order.symbol.toLowerCase().replace('-usd', '').replace('.to', '_to');

    setOrders(prev => [order, ...prev]);

    if (order.side === 'BUY') {
      setCashBalance(prev => Math.max(0, prev - order.totalAmount));

      setRawHoldings(prev => {
        const existingIdx = prev.findIndex(h => h.assetId === targetAssetId);
        if (existingIdx >= 0) {
          const item = prev[existingIdx];
          const newQty = item.quantity + order.quantity;
          const newAvgPrice = ((item.quantity * item.avgBuyPrice) + order.totalAmount) / newQty;
          const updated = [...prev];
          updated[existingIdx] = { ...item, quantity: newQty, avgBuyPrice: newAvgPrice };
          return updated;
        } else {
          return [
            ...prev,
            {
              assetId: targetAssetId,
              quantity: order.quantity,
              avgBuyPrice: order.price
            }
          ];
        }
      });
    } else {
      setCashBalance(prev => prev + order.totalAmount);

      setRawHoldings(prev => {
        return prev
          .map(item => {
            if (item.assetId === targetAssetId) {
              const remainingQty = item.quantity - order.quantity;
              return { ...item, quantity: Math.max(0, remainingQty) };
            }
            return item;
          })
          .filter(item => item.quantity > 0.0001);
      });
    }

    setBrokerages(prev =>
      prev.map(b => (b.id === order.brokerageId ? { ...b, ordersRoutedToday: b.ordersRoutedToday + 1 } : b))
    );
  }, []);

  // Handle Reset Account functionality
  const handleResetAccount = useCallback((options: { startingCash: number; mode: 'initial_model' | 'all_cash' }) => {
    setCashBalance(options.startingCash);
    let newHoldings: typeof rawHoldings = [];
    if (options.mode === 'all_cash') {
      newHoldings = [];
    } else {
      const template = ACCOUNT_PORTFOLIOS[currentAccount];
      newHoldings = template ? template.holdings : INITIAL_HOLDINGS_RAW;
    }
    setRawHoldings(newHoldings);
    setOrders([]);

    setAccountStorage(prev => ({
      ...prev,
      [currentAccount]: {
        cashBalance: options.startingCash,
        rawHoldings: newHoldings,
        orders: []
      }
    }));

    const accInfo = CANADIAN_ACCOUNTS[currentAccount];
    const log = createAuditLog(
      `Account Reset (${accInfo?.name || currentAccount}): ${accInfo?.currency === 'CAD' ? 'C$' : '$'}${options.startingCash.toLocaleString()} Starting Cash - Mode: ${options.mode === 'all_cash' ? '100% Cash' : 'Default Model'}`,
      'WebAuthn FaceID',
      true
    );
    setBiometricLogs(prev => [log, ...prev]);
  }, [currentAccount]);

  // Execute batch rebalance
  const handleExecuteRebalanceBatch = useCallback((proposal: RebalanceProposal) => {
    let currentCash = cashBalance;
    const workingHoldingsMap = new Map(rawHoldings.map(h => [h.assetId, { ...h }]));
    const newOrdersList: TradeOrder[] = [];

    // SELLs first
    proposal.trades
      .filter(t => t.action === 'SELL')
      .forEach(t => {
        currentCash += t.totalAmount;
        const currentItem = workingHoldingsMap.get(t.assetId);
        if (currentItem) {
          currentItem.quantity = Math.max(0, currentItem.quantity - t.quantity);
        }
        newOrdersList.push({
          id: `ord-reb-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          symbol: t.symbol,
          name: t.name,
          assetClass: t.assetClass,
          side: 'SELL',
          type: 'MARKET',
          quantity: t.quantity,
          price: t.price,
          totalAmount: t.totalAmount,
          brokerageId: t.brokerageId,
          status: 'FILLED',
          timestamp: Date.now(),
          fillPrice: t.price,
          fillTimestamp: Date.now(),
          executionLatencyMs: 14,
          biometricConfirmed: true
        });
      });

    // BUYs second
    proposal.trades
      .filter(t => t.action === 'BUY')
      .forEach(t => {
        currentCash -= t.totalAmount;
        const currentItem = workingHoldingsMap.get(t.assetId);
        if (currentItem) {
          const newQty = currentItem.quantity + t.quantity;
          const newAvgPrice = ((currentItem.quantity * currentItem.avgBuyPrice) + t.totalAmount) / newQty;
          currentItem.quantity = newQty;
          currentItem.avgBuyPrice = newAvgPrice;
        } else {
          workingHoldingsMap.set(t.assetId, {
            assetId: t.assetId,
            quantity: t.quantity,
            avgBuyPrice: t.price
          });
        }
        newOrdersList.push({
          id: `ord-reb-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          symbol: t.symbol,
          name: t.name,
          assetClass: t.assetClass,
          side: 'BUY',
          type: 'MARKET',
          quantity: t.quantity,
          price: t.price,
          totalAmount: t.totalAmount,
          brokerageId: t.brokerageId,
          status: 'FILLED',
          timestamp: Date.now(),
          fillPrice: t.price,
          fillTimestamp: Date.now(),
          executionLatencyMs: 18,
          biometricConfirmed: true
        });
      });

    setCashBalance(currentCash);
    setRawHoldings(Array.from(workingHoldingsMap.values()).filter(h => h.quantity > 0.0001));
    setOrders(prev => [...newOrdersList, ...prev]);

    const log = createAuditLog(
      `thinkorswim Rebalancing Settled (${proposal.trades.length} Orders)`,
      'WebAuthn FaceID',
      true
    );
    setBiometricLogs(prev => [log, ...prev]);
  }, [cashBalance, rawHoldings]);

  // Biometric helper prompts
  const triggerBiometricPrompt = (
    title: string,
    details: string,
    onSuccess: () => void
  ) => {
    setBiometricModal({
      isOpen: true,
      actionTitle: title,
      actionDetails: details,
      onSuccessCallback: (log: BiometricLogEntry) => {
        setBiometricLogs(prev => [log, ...prev]);
        setBiometricModal(prev => ({ ...prev, isOpen: false }));
        onSuccess();
      }
    });
  };

  const handlePopulateOrder = (symbol: string, side: OrderSide, price: number) => {
    setActiveSymbol(symbol);
    setPrefillOrder({ symbol, side, price });
    setBottomBarOpen(true);
  };

  const handlePopulateOptionOrder = (
    symbol: string,
    side: OrderSide,
    strike: number,
    expiration: string,
    optionType: 'CALL' | 'PUT',
    price: number
  ) => {
    setActiveSymbol(symbol);
    setPrefillOrder({
      symbol,
      side,
      price,
      optionDetails: { strike, expiration, optionType }
    });
    setBottomBarOpen(true);
  };

  const handlePopulateSpreadOrder = (spreadOrder: {
    symbol: string;
    side: OrderSide;
    price: number;
    optionSpreadDetails: OptionSpreadDetails;
    isSimulated?: boolean;
  }) => {
    setActiveSymbol(spreadOrder.symbol);
    setPrefillOrder({
      symbol: spreadOrder.symbol,
      side: spreadOrder.side,
      price: spreadOrder.price,
      optionSpreadDetails: spreadOrder.optionSpreadDetails,
      isSimulated: spreadOrder.isSimulated
    });
    setBottomBarOpen(true);
  };

  const existingPositionQty = useMemo(() => {
    const holding = rawHoldings.find(h => h.assetId === selectedAssetId);
    return holding ? holding.quantity : 0;
  }, [rawHoldings, selectedAssetId]);

  const activeAsset = useMemo(() => {
    return assets.find(a => a.symbol === activeSymbol) || assets[0];
  }, [assets, activeSymbol]);

  return (
    <div className="min-h-screen bg-[#090d11] text-slate-100 flex flex-col font-mono selection:bg-[#00c076]/30 selection:text-[#00c076]">
      {/* 1. thinkorswim Header (Meta Bar, Account Ribbon, and Sub-Tabs) */}
      <TosHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        metrics={metrics}
        biometricSettings={biometricSettings}
        onLockTerminal={() => setBiometricSettings(prev => ({ ...prev, isLocked: true }))}
        onUnlockTerminal={() => {
          triggerBiometricPrompt('Unlock Terminal Session', 'Touch ID / Face ID verification required to restore trading terminal access.', () => {
            setBiometricSettings(prev => ({ ...prev, isLocked: false }));
          });
        }}
        activeSymbol={activeSymbol}
        onSelectSymbol={sym => setActiveSymbol(sym)}
        assets={assets}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        bottomBarOpen={bottomBarOpen}
        onToggleBottomBar={() => setBottomBarOpen(prev => !prev)}
        layoutVariation={layoutVariation}
        onChangeLayoutVariation={setLayoutVariation}
        isPaperTrading={isPaperTrading}
        onTogglePaperTrading={() => setIsPaperTrading(prev => !prev)}
        onOpenResetModal={() => setIsResetAccountModalOpen(true)}
        currentAccount={currentAccount}
        onSelectAccount={handleSelectAccount}
      />

      {/* 2. Main thinkorswim Body: Left Gadget Sidebar + Workspace Content */}
      <div className="flex-1 flex overflow-hidden pb-12">
        {/* Left Gadget Sidebar (TOS Watchlist, Quick Quote, News, Scratchpad) */}
        {sidebarOpen && (
          <TosLeftSidebar
            assets={assets}
            activeSymbol={activeSymbol}
            onSelectSymbol={sym => setActiveSymbol(sym)}
            onPopulateOrder={handlePopulateOrder}
          />
        )}

        {/* Center / Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#090d11]">
          {biometricSettings.isLocked ? (
            /* Terminal Locked Shield Screen */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">thinkorswim Terminal Locked</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-sm font-sans">
                Portfolio figures, DMA routing engines, and active order ladders are shielded by Biometric Secure Enclave.
              </p>
              <button
                onClick={() => {
                  triggerBiometricPrompt('Unlock Terminal Session', 'Touch ID / Face ID verification required to restore trading terminal access.', () => {
                    setBiometricSettings(prev => ({ ...prev, isLocked: false }));
                  });
                }}
                className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00c076] hover:bg-[#00d885] text-black font-bold text-xs transition-all shadow-lg shadow-[#00c076]/20 cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" />
                <span>UNLOCK WITH BIOMETRICS (TOUCH ID / FACE ID)</span>
              </button>
            </div>
          ) : layoutVariation !== 'CLASSIC_DOCK' ? (
            <TosPlatformLayoutManager
              layoutVariation={layoutVariation}
              onChangeLayoutVariation={setLayoutVariation}
              activeAsset={activeAsset}
              assets={assets}
              setActiveSymbol={setActiveSymbol}
              handlePopulateOrder={handlePopulateOrder}
              handlePopulateOptionOrder={handlePopulateOptionOrder}
              handlePopulateSpreadOrder={handlePopulateSpreadOrder}
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              portfolioData={portfolioData}
              metrics={metrics}
              riskProfile={riskProfile}
              orders={orders}
              cashBalance={cashBalance}
              existingPositionQty={existingPositionQty}
              brokerages={brokerages}
              biometricSettings={biometricSettings}
              triggerBiometricPrompt={triggerBiometricPrompt}
              handleExecuteTrade={handleExecuteTrade}
              setRiskProfile={setRiskProfile}
              setBiometricLogs={setBiometricLogs}
              createAuditLog={createAuditLog}
              analyzeSubView={analyzeSubView}
              setAnalyzeSubView={setAnalyzeSubView}
              isPaperTrading={isPaperTrading}
              onTogglePaperTrading={() => setIsPaperTrading(prev => !prev)}
              onResetAccount={handleResetAccount}
              currentAccount={currentAccount}
              onSelectAccount={handleSelectAccount}
            />
          ) : (
            /* thinkorswim Workspace Tabs */
            <>
              {currentTab === 'monitor' && (
                <TosMonitorView
                  holdings={portfolioData.holdings}
                  metrics={metrics}
                  riskProfile={riskProfile}
                  orders={orders}
                  onSelectSymbol={sym => {
                    setActiveSymbol(sym);
                    setCurrentTab('trade');
                  }}
                  onPopulateOrder={handlePopulateOrder}
                  onNavigateToRebalance={() => setCurrentTab('rebalance')}
                  assets={assets}
                  isPaperTrading={isPaperTrading}
                  onTogglePaperTrading={() => setIsPaperTrading(prev => !prev)}
                  onResetAccount={handleResetAccount}
                  currentAccount={currentAccount}
                  onSelectAccount={handleSelectAccount}
                />
              )}

              {currentTab === 'statement' && (
                <TosAccountStatementView
                  holdings={portfolioData.holdings}
                  metrics={metrics}
                  riskProfile={riskProfile}
                  orders={orders}
                  assets={assets}
                  isPaperTrading={isPaperTrading}
                  onTogglePaperTrading={() => setIsPaperTrading(prev => !prev)}
                  onOpenResetModal={() => setIsResetAccountModalOpen(true)}
                  onSelectSymbol={sym => {
                    setActiveSymbol(sym);
                    setCurrentTab('trade');
                  }}
                  onPopulateOrder={handlePopulateOrder}
                  currentAccount={currentAccount}
                  onSelectAccount={handleSelectAccount}
                />
              )}

              {currentTab === 'trade' && (
                <MultiAssetTrading
                  assets={assets}
                  selectedAssetId={selectedAssetId}
                  onSelectAsset={id => {
                    const found = assets.find(a => a.id === id);
                    if (found) setActiveSymbol(found.symbol);
                  }}
                  cashBalance={cashBalance}
                  existingHoldingQuantity={existingPositionQty}
                  brokerages={brokerages}
                  biometricSettings={biometricSettings}
                  onRequestBiometricForTrade={(order, onSuccess) => {
                    triggerBiometricPrompt(
                      `Authorize Trade (${order.symbol})`,
                      `Order total consideration of $${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} exceeds the biometric threshold.`,
                      onSuccess
                    );
                  }}
                  onExecuteTrade={handleExecuteTrade}
                />
              )}

              {currentTab === 'charts' && (
                <TosChartsView
                  asset={activeAsset}
                  assets={assets}
                  onSelectSymbol={sym => setActiveSymbol(sym)}
                  onPopulateOrder={handlePopulateOrder}
                />
              )}

              {currentTab === 'depth' && (
                <TosMarketDepthView
                  asset={activeAsset}
                  assets={assets}
                  onSelectSymbol={sym => setActiveSymbol(sym)}
                  onPopulateOrder={handlePopulateOrder}
                  cashBalance={cashBalance}
                />
              )}

              {currentTab === 'options' && (
                <TosOptionsChain
                  asset={activeAsset}
                  onPopulateOptionOrder={handlePopulateOptionOrder}
                  onPopulateSpreadOrder={handlePopulateSpreadOrder}
                />
              )}

              {currentTab === 'analyze' && (
                <div className="space-y-4">
                  {/* Top Sub-Switcher for Analyze */}
                  <div className="bg-[#0e1217] border border-[#21262d] rounded-lg p-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-white font-bold text-xs uppercase pl-2">
                      thinkorswim Analyze Workspace
                    </span>
                    <div className="flex items-center bg-[#161b22] border border-[#21262d] rounded p-0.5 text-xs font-mono">
                      <button
                        onClick={() => setAnalyzeSubView('STRATEGY_RISK_PROFILES')}
                        className={`px-3 py-1 rounded font-bold ${
                          analyzeSubView === 'STRATEGY_RISK_PROFILES'
                            ? 'bg-[#1c2128] text-amber-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All Strategies Risk Profiles ({activeAsset.symbol})
                      </button>
                      <button
                        onClick={() => setAnalyzeSubView('PROBABILITY_CONES')}
                        className={`px-3 py-1 rounded font-bold flex items-center gap-1.5 ${
                          analyzeSubView === 'PROBABILITY_CONES'
                            ? 'bg-[#1c2128] text-amber-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00c076]"></span>
                        <span>Probability Cones (All Expirations)</span>
                      </button>
                      <button
                        onClick={() => setAnalyzeSubView('VOL_SURFACE')}
                        className={`px-3 py-1 rounded font-bold flex items-center gap-1.5 ${
                          analyzeSubView === 'VOL_SURFACE'
                            ? 'bg-[#1c2128] text-amber-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>3D Volatility Surface</span>
                      </button>
                      <button
                        onClick={() => setAnalyzeSubView('VOL_SKEW')}
                        className={`px-3 py-1 rounded font-bold ${
                          analyzeSubView === 'VOL_SKEW'
                            ? 'bg-[#1c2128] text-amber-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Volatility Skew & Term Structure
                      </button>
                      <button
                        onClick={() => setAnalyzeSubView('PROFILES')}
                        className={`px-3 py-1 rounded font-bold ${
                          analyzeSubView === 'PROFILES'
                            ? 'bg-[#1c2128] text-amber-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Investor Suitability & Risk Profiles
                      </button>
                    </div>
                  </div>

                  {analyzeSubView === 'STRATEGY_RISK_PROFILES' && (
                    <TosStrategyRiskProfiles
                      asset={activeAsset}
                      onPopulateStrategyOrder={handlePopulateOrder}
                      onPopulateSpreadOrder={handlePopulateSpreadOrder}
                      onExecuteTrade={handleExecuteTrade}
                    />
                  )}

                  {analyzeSubView === 'PROBABILITY_CONES' && (
                    <TosProbabilityAnalysisView
                      asset={activeAsset}
                      assets={assets}
                      onSelectSymbol={sym => setActiveSymbol(sym)}
                      onPopulateOrder={handlePopulateOrder}
                    />
                  )}

                  {analyzeSubView === 'VOL_SURFACE' && (
                    <TosVolatilitySurfaceView
                      asset={activeAsset}
                      assets={assets}
                      onSelectSymbol={sym => setActiveSymbol(sym)}
                      onPopulateOrder={handlePopulateOrder}
                    />
                  )}

                  {analyzeSubView === 'VOL_SKEW' && (
                    <TosVolatilitySkewView
                      asset={activeAsset}
                      assets={assets}
                      onSelectSymbol={sym => setActiveSymbol(sym)}
                      onPopulateOrder={handlePopulateOrder}
                    />
                  )}

                  {analyzeSubView === 'PROFILES' && (
                    <RiskProfileManager
                      currentRiskProfile={riskProfile}
                      onUpdateRiskProfile={newProfile => {
                        setRiskProfile(newProfile);
                        const log = createAuditLog(`Updated Risk Target: ${newProfile.name}`, 'WebAuthn FaceID', true);
                        setBiometricLogs(prev => [log, ...prev]);
                      }}
                      portfolioNav={metrics.nav}
                    />
                  )}
                </div>
              )}

              {currentTab === 'macro' && (
                <TosGlobalMacroView />
              )}

              {currentTab === 'canadian_live' && (
                <TosCanadianLiveDataView
                  assets={assets}
                  activeSymbol={activeSymbol}
                  onSelectSymbol={sym => setActiveSymbol(sym)}
                  onPopulateOrder={handlePopulateOrder}
                />
              )}

              {currentTab === 'rebalance' && (
                <AutomatedRebalancer
                  holdings={portfolioData.holdings}
                  assets={assets}
                  riskProfile={riskProfile}
                  nav={metrics.nav}
                  cashBalance={cashBalance}
                  onRequestBiometricExecution={(proposal, onVerified) => {
                    triggerBiometricPrompt(
                      'Authorize Batch Rebalancing',
                      `Confirm transmission of ${proposal.trades.length} rebalance orders ($${(proposal.totalBuyAmount + proposal.totalSellAmount).toLocaleString('en-US', { maximumFractionDigits: 0 })} gross volume) across Alpaca, Coinbase, and IBKR.`,
                      onVerified
                    );
                  }}
                  onExecuteRebalanceBatch={handleExecuteRebalanceBatch}
                />
              )}

              {currentTab === 'brokerages' && (
                <BrokerageGateway
                  brokerages={brokerages}
                  orders={orders}
                  onToggleBrokerageStatus={id => {
                    setBrokerages(prev =>
                      prev.map(b =>
                        b.id === id
                          ? { ...b, status: b.status === 'connected' ? 'disconnected' : 'connected' }
                          : b
                      )
                    );
                  }}
                  onToggleLiveMode={id => {
                    setBrokerages(prev =>
                      prev.map(b => (b.id === id ? { ...b, isLive: !b.isLive } : b))
                    );
                  }}
                  onRequestBiometricForSecrets={(brokerageName, onVerified) => {
                    triggerBiometricPrompt(
                      `Decrypt API Credentials (${brokerageName})`,
                      'Biometric touch verification required to decrypt and view live brokerage API credentials.',
                      onVerified
                    );
                  }}
                />
              )}

              {currentTab === 'security' && (
                <BiometricSecurityView
                  biometricSettings={biometricSettings}
                  biometricLogs={biometricLogs}
                  onUpdateSettings={updates => {
                    setBiometricSettings(prev => ({ ...prev, ...updates }));
                  }}
                  onLockTerminalNow={() => {
                    setBiometricSettings(prev => ({ ...prev, isLocked: true }));
                  }}
                  onTriggerTestBiometric={() => {
                    triggerBiometricPrompt('Biometric Hardware Verification', 'Validating hardware biometric sensor and Enclave challenge...', () => {});
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* 3. Persistent thinkorswim Bottom Order Entry Tools Bar */}
      <TosBottomOrderBar
        isOpen={bottomBarOpen}
        onToggle={() => setBottomBarOpen(prev => !prev)}
        activeSymbol={activeSymbol}
        assets={assets}
        brokerages={brokerages}
        cashBalance={cashBalance}
        biometricSettings={biometricSettings}
        prefillOrder={prefillOrder}
        onExecuteTrade={handleExecuteTrade}
        onRequestBiometricForTrade={(order, onSuccess) => {
          triggerBiometricPrompt(
            `Authorize Order (${order.symbol})`,
            `Order consideration of $${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} triggers biometric authorization.`,
            onSuccess
          );
        }}
        currentAccount={currentAccount}
        isPaperTrading={isPaperTrading}
      />

      {/* 4. Global Biometric Verification Modal */}
      <BiometricModal
        isOpen={biometricModal.isOpen}
        actionTitle={biometricModal.actionTitle}
        actionDetails={biometricModal.actionDetails}
        fallbackPin={biometricSettings.fallbackPin}
        onSuccess={biometricModal.onSuccessCallback}
        onCancel={() => setBiometricModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
