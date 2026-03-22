import type { LocalizedText } from "@openclaw/alpha-agents-core";
import { computeArenaTotalScore } from "@openclaw/alpha-agents-arena-core";

export interface BuiltinPaperState {
  initialCapitalUsd: number;
  cashBalanceUsd: number;
  positionQty: number;
  lastPrice: number;
  peakEquityUsd: number;
  completedRuns: number;
}

export interface BuiltinMarketSnapshot {
  instrument: string;
  lastPrice: number;
  priceChangePercent24h: number;
  highPrice24h: number;
  lowPrice24h: number;
  quoteVolume24h: number;
  venue: "binance_spot" | "binance_futures";
}

export interface BuiltinExecutionResult {
  actionSummary: string[];
  rationaleSummary: LocalizedText;
  state: BuiltinPaperState;
  metrics: {
    netReturnPct: number;
    maxDrawdownPct: number;
    sharpe: number;
    calmar: number;
    consistencyScore: number;
    survivalScore: number;
    executionQualityScore: number;
    disciplineScore: number;
    totalScore: number;
    markPrice: number;
  };
}

export interface BuiltinPaperExecutionInput {
  runtimeImage: string;
  instrument: string;
  initialCapitalUsd?: number;
  priorState?: Partial<BuiltinPaperState> | null;
  riskProfile?: {
    maxLeverage?: number;
    maxOrderNotionalUsd?: number;
    maxDailyLossPct?: number;
    maxDrawdownPct?: number;
  };
}

const BUILTIN_RUNTIME_PREFIX = "builtin://";

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value));
}

function defaultState(initialCapitalUsd = 100000): BuiltinPaperState {
  return {
    initialCapitalUsd,
    cashBalanceUsd: initialCapitalUsd,
    positionQty: 0,
    lastPrice: 0,
    peakEquityUsd: initialCapitalUsd,
    completedRuns: 0,
  };
}

function withDefaults(input?: Partial<BuiltinPaperState> | null, initialCapitalUsd = 100000): BuiltinPaperState {
  const fallback = defaultState(initialCapitalUsd);
  return {
    initialCapitalUsd: input?.initialCapitalUsd ?? fallback.initialCapitalUsd,
    cashBalanceUsd: input?.cashBalanceUsd ?? fallback.cashBalanceUsd,
    positionQty: input?.positionQty ?? fallback.positionQty,
    lastPrice: input?.lastPrice ?? fallback.lastPrice,
    peakEquityUsd: input?.peakEquityUsd ?? fallback.peakEquityUsd,
    completedRuns: input?.completedRuns ?? fallback.completedRuns,
  };
}

export function isBuiltinRuntimeImage(runtimeImage: string) {
  return runtimeImage.startsWith(BUILTIN_RUNTIME_PREFIX);
}

export function listBuiltinRuntimeImages() {
  return ["builtin://trend-scout-15m", "builtin://mean-revert-1h"] as const;
}

function resolveVenue(instrument: string): BuiltinMarketSnapshot["venue"] {
  return instrument.includes("perpetual") || instrument.endsWith("USDT") ? "binance_futures" : "binance_spot";
}

export async function fetchBinanceMarketSnapshot(instrument: string): Promise<BuiltinMarketSnapshot> {
  const normalizedSymbol = instrument.replace(/\s+perpetual$/i, "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const venue = resolveVenue(instrument);
  const endpoint =
    venue === "binance_futures"
      ? `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${normalizedSymbol}`
      : `https://api.binance.com/api/v3/ticker/24hr?symbol=${normalizedSymbol}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      signal: controller.signal,
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Market snapshot request failed with ${response.status}.`);
    }

    const json = (await response.json()) as {
      lastPrice: string;
      priceChangePercent: string;
      highPrice: string;
      lowPrice: string;
      quoteVolume: string;
    };

    return {
      instrument: normalizedSymbol,
      lastPrice: Number(json.lastPrice),
      priceChangePercent24h: Number(json.priceChangePercent),
      highPrice24h: Number(json.highPrice),
      lowPrice24h: Number(json.lowPrice),
      quoteVolume24h: Number(json.quoteVolume),
      venue,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function desiredExposureRatio(runtimeImage: string, market: BuiltinMarketSnapshot) {
  if (runtimeImage === "builtin://mean-revert-1h") {
    return market.priceChangePercent24h > 4 ? -0.18 : market.priceChangePercent24h < -4 ? 0.18 : 0;
  }
  return market.priceChangePercent24h >= 0 ? 0.32 : -0.32;
}

function buildRationale(runtimeImage: string, market: BuiltinMarketSnapshot): LocalizedText {
  if (runtimeImage === "builtin://mean-revert-1h") {
    return {
      en: `Mean-revert mode observed a ${market.priceChangePercent24h.toFixed(2)}% 24h move on ${market.instrument} and reduced directional exposure accordingly.`,
      "zh-CN": `均值回归模式观察到 ${market.instrument} 过去 24 小时波动 ${market.priceChangePercent24h.toFixed(2)}%，并相应调整方向性敞口。`,
    };
  }
  return {
    en: `Trend-scout mode observed a ${market.priceChangePercent24h.toFixed(2)}% 24h move on ${market.instrument} and aligned exposure with the dominant direction.`,
    "zh-CN": `趋势侦察模式观察到 ${market.instrument} 过去 24 小时波动 ${market.priceChangePercent24h.toFixed(2)}%，并让敞口与主方向对齐。`,
  };
}

export async function executeBuiltinPaperRun(input: BuiltinPaperExecutionInput): Promise<BuiltinExecutionResult> {
  if (!isBuiltinRuntimeImage(input.runtimeImage)) {
    throw new Error("Runtime image is not a built-in arena runtime.");
  }

  const market = await fetchBinanceMarketSnapshot(input.instrument);
  const previous = withDefaults(input.priorState, input.initialCapitalUsd);
  const priorMarkPrice = previous.lastPrice || market.lastPrice;
  const priorEquity = previous.cashBalanceUsd + previous.positionQty * market.lastPrice;
  const maxLeverage = Math.max(1, input.riskProfile?.maxLeverage ?? 2);
  const desiredRatio = desiredExposureRatio(input.runtimeImage, market);
  const targetNotionalUsd = clamp(Math.abs(desiredRatio) * priorEquity, 0, input.riskProfile?.maxOrderNotionalUsd ?? priorEquity * maxLeverage);
  const signedNotionalUsd = desiredRatio < 0 ? -targetNotionalUsd : targetNotionalUsd;
  const targetQty = market.lastPrice > 0 ? signedNotionalUsd / market.lastPrice : 0;
  const deltaQty = targetQty - previous.positionQty;
  const feesUsd = Math.abs(deltaQty) * market.lastPrice * 0.0005;
  const nextCash = previous.cashBalanceUsd - deltaQty * market.lastPrice - feesUsd;
  const nextEquity = nextCash + targetQty * market.lastPrice;
  const peakEquityUsd = Math.max(previous.peakEquityUsd, nextEquity);
  const drawdownPct = peakEquityUsd > 0 ? ((peakEquityUsd - nextEquity) / peakEquityUsd) * 100 : 0;
  const returnPct = previous.initialCapitalUsd > 0 ? ((nextEquity - previous.initialCapitalUsd) / previous.initialCapitalUsd) * 100 : 0;
  const  volatilityBase = Math.max(1, Math.abs(market.priceChangePercent24h));
  const sharpe = Math.max(0, returnPct / volatilityBase);
  const calmar = drawdownPct > 0 ? returnPct / drawdownPct : returnPct;
  const consistencyScore = clamp(70 + (market.priceChangePercent24h >= 0 ? 10 : 0) - drawdownPct * 1.5);
  const survivalScore = clamp(100 - drawdownPct * 3);
  const executionQualityScore = clamp(88 - feesUsd / 10);
  const disciplineScore = clamp(100 - Math.max(0, Math.abs(targetQty) * market.lastPrice - (input.riskProfile?.maxOrderNotionalUsd ?? Infinity)) / 1000);
  const totalScore = computeArenaTotalScore({
    netReturnPct: returnPct,
    maxDrawdownPct: drawdownPct,
    sharpe,
    calmar,
    consistencyScore,
    survivalScore,
    executionQualityScore,
    disciplineScore,
  });

  return {
    actionSummary: [
      `${deltaQty >= 0 ? "buy" : "sell"} ${market.instrument} ${Math.abs(deltaQty).toFixed(4)}`,
      `fees ${feesUsd.toFixed(2)} USD`,
      `equity ${nextEquity.toFixed(2)} USD`,
    ],
    rationaleSummary: buildRationale(input.runtimeImage, market),
    state: {
      initialCapitalUsd: previous.initialCapitalUsd,
      cashBalanceUsd: Math.round(nextCash * 100) / 100,
      positionQty: Math.round(targetQty * 100000) / 100000,
      lastPrice: market.lastPrice,
      peakEquityUsd: Math.round(peakEquityUsd * 100) / 100,
      completedRuns: previous.completedRuns + 1,
    },
    metrics: {
      netReturnPct: Math.round(returnPct * 100) / 100,
      maxDrawdownPct: Math.round(drawdownPct * 100) / 100,
      sharpe: Math.round(sharpe * 100) / 100,
      calmar: Math.round(calmar * 100) / 100,
      consistencyScore: Math.round(consistencyScore),
      survivalScore: Math.round(survivalScore),
      executionQualityScore: Math.round(executionQualityScore),
      disciplineScore: Math.round(disciplineScore),
      totalScore,
      markPrice: market.lastPrice,
    },
  };
}
