export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  roc7d: number;
  roc30d: number;
  volume24h: number;
  marketCap: number;
  momentum: 'hot' | 'active' | 'positive' | 'moderate' | 'neutral';
  sparklineData: number[];
  historicalData: HistoricalDataPoint[];
  color: string;
}

export interface HistoricalDataPoint {
  timestamp: Date;
  price: number;
  volume: number;
}

export interface TechnicalIndicator {
  label: string;
  value: string;
  status: 'bullish' | 'bearish' | 'neutral';
}

export interface MarketStats {
  totalMarketCap: number;
  volume24h: number;
  hotMomentum: number;
  inkChainTVL: number;
  marketCapChange: number;
  volumeChange: number;
  momentumChange: number;
  tvlChange: number;
}

export type ViewMode = 'table' | 'cards';
export type SortField = 'name' | 'price' | 'change24h' | 'roc7d' | 'roc30d' | 'volume24h' | 'marketCap' | 'momentum';
export type SortDirection = 'asc' | 'desc';